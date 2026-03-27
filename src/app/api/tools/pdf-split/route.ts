import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { prisma } from "@/lib/prisma";
import { checkToolAccess, incrementTrialUsage } from "@/lib/trial-guard";
import { formatMbLimit, getToolMaxFileBytes } from "@/lib/tool-policy";

export const dynamic = "force-dynamic";

type SplitMode = "range" | "chunks";

/* ── Limits ─────────────────────────────────────────────────────── */
// Limits will be determined dynamically

/**
 * Parse page range string into 0-based page indices.
 * Supports: 1-3, 5, 1,3,5-7
 * Returns sorted array of unique 0-based indices, or null if invalid.
 */
function parsePageRange(
    input: string,
    pageCount: number
): { indices: number[] } | { error: string } {
    const trimmed = input.trim();
    if (!trimmed) {
        return { error: "Sayfa aralığı boş bırakılamaz." };
    }

    const indices: number[] = [];
    const tokens = trimmed.split(",").map((t) => t.trim()).filter(Boolean);

    for (const token of tokens) {
        if (token.includes("-")) {
            const parts = token.split("-").map((p) => p.trim());
            if (parts.length !== 2) {
                return { error: `Geçersiz aralık: "${token}". Örnek: 1-5` };
            }
            const start = parseInt(parts[0], 10);
            const end = parseInt(parts[1], 10);
            if (isNaN(start) || isNaN(end)) {
                return { error: `Geçersiz sayfa numarası: "${token}"` };
            }
            if (start < 1 || end < 1) {
                return { error: "Sayfa numaraları 1'den küçük olamaz." };
            }
            if (start > end) {
                return { error: `Aralık başlangıcı bitişten büyük olamaz: "${token}"` };
            }
            if (start > pageCount || end > pageCount) {
                return { error: `PDF'de ${pageCount} sayfa var. "${token}" aralığı sınırı aşıyor.` };
            }
            for (let p = start; p <= end; p++) {
                indices.push(p - 1); // 0-based
            }
        } else {
            const num = parseInt(token, 10);
            if (isNaN(num)) {
                return { error: `Geçersiz sayfa numarası: "${token}"` };
            }
            if (num < 1) {
                return { error: "Sayfa numaraları 1'den küçük olamaz." };
            }
            if (num > pageCount) {
                return { error: `PDF'de ${pageCount} sayfa var. Sayfa ${num} mevcut değil.` };
            }
            indices.push(num - 1); // 0-based
        }
    }

    if (indices.length === 0) {
        return { error: "En az bir sayfa seçilmelidir." };
    }

    // Preserve order, remove duplicates
    const seen = new Set<number>();
    const unique: number[] = [];
    for (const i of indices) {
        if (!seen.has(i)) {
            seen.add(i);
            unique.push(i);
        }
    }

    return { indices: unique };
}

function parseChunkSize(input: string): { chunkSize: number } | { error: string } {
    const trimmed = input.trim();
    if (!trimmed) {
        return { error: "Parça sayfa adedi boş bırakılamaz." };
    }

    const chunkSize = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(chunkSize) || Number.isNaN(chunkSize)) {
        return { error: "Parça sayfa adedi bir tam sayı olmalıdır." };
    }
    if (chunkSize < 1) {
        return { error: "Parça sayfa adedi 1'den küçük olamaz." };
    }

    return { chunkSize };
}

function getSafeBaseName(filename: string) {
    const withoutExt = filename.replace(/\.pdf$/i, "");
    return withoutExt.replace(/[^a-z0-9-_]+/gi, "_").replace(/^_+|_+$/g, "") || "split";
}

/* ── Route handler ──────────────────────────────────────────────── */
export async function POST(req: Request) {
    try {
        const guard = await checkToolAccess();
        if (!guard.allowed) return guard.response;

        const hasPaidAccess = !guard.incrementTrial;

        /* Parse multipart */
        let formData: FormData;
        try {
            formData = await req.formData();
        } catch {
            return NextResponse.json({ error: "Form verisi okunamadı." }, { status: 400 });
        }

        const file = formData.get("file");
        const splitModeValue = formData.get("splitMode");
        const pageRange = formData.get("pageRange");
        const chunkSizeValue = formData.get("chunkSize");

        if (!file || !(file instanceof File) || file.size === 0) {
            return NextResponse.json({ error: "Lütfen bir PDF dosyası yükleyin." }, { status: 400 });
        }

        const splitMode: SplitMode = splitModeValue === "chunks" ? "chunks" : "range";

        if (splitMode === "range" && (!pageRange || typeof pageRange !== "string")) {
            return NextResponse.json({ error: "Sayfa aralığı belirtilmedi." }, { status: 400 });
        }

        if (splitMode === "chunks" && (!chunkSizeValue || typeof chunkSizeValue !== "string")) {
            return NextResponse.json({ error: "Parça sayfa adedi belirtilmedi." }, { status: 400 });
        }

        const isPdf =
            file.type === "application/pdf" ||
            file.name.toLowerCase().endsWith(".pdf");
        if (!isPdf) {
            return NextResponse.json(
                { error: `"${file.name}" PDF formatında değil.` },
                { status: 400 }
            );
        }

        const maxFileBytes = getToolMaxFileBytes("pdf-split", hasPaidAccess, file);
        if (maxFileBytes !== null && file.size > maxFileBytes) {
            return NextResponse.json(
                { error: `"${file.name}" dosyası çok büyük (maks. ${formatMbLimit(maxFileBytes)}).` },
                { status: 400 }
            );
        }

        const bytes = new Uint8Array(await file.arrayBuffer());

        let srcDoc: PDFDocument;
        try {
            srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        } catch {
            return NextResponse.json(
                { error: `"${file.name}" okunamadı. Dosya şifreli veya bozuk olabilir.` },
                { status: 422 }
            );
        }

        const pageCount = srcDoc.getPageCount();
        if (pageCount === 0) {
            return NextResponse.json(
                { error: `"${file.name}" içinde sayfa bulunamadı.` },
                { status: 422 }
            );
        }

        if (splitMode === "chunks") {
            const parsedChunk = parseChunkSize(chunkSizeValue);
            if ("error" in parsedChunk) {
                return NextResponse.json({ error: parsedChunk.error }, { status: 400 });
            }

            const { chunkSize } = parsedChunk;
            const zip = new JSZip();
            const baseName = getSafeBaseName(file.name);
            let fileCount = 0;

            for (let start = 0; start < pageCount; start += chunkSize) {
                const end = Math.min(start + chunkSize, pageCount);
                const indices = Array.from({ length: end - start }, (_, i) => start + i);
                const outDoc = await PDFDocument.create();
                const copiedPages = await outDoc.copyPages(srcDoc, indices);
                copiedPages.forEach((page) => outDoc.addPage(page));

                const chunkBytes = await outDoc.save();
                fileCount += 1;
                const partLabel = String(fileCount).padStart(3, "0");
                zip.file(`${baseName}_part_${partLabel}.pdf`, chunkBytes, { binary: true });
            }

            const zipBytes = await zip.generateAsync({
                type: "uint8array",
                compression: "STORE",
            });

            const userId = guard.userId;
            prisma.toolUsage.create({ data: { userId, toolSlug: "pdf-split" } }).catch(() => {});
            if (guard.incrementTrial && guard.userId) {
                incrementTrialUsage(guard.userId).catch(() => {});
            }

            return new NextResponse(Buffer.from(zipBytes), {
                status: 200,
                headers: {
                    "Content-Type": "application/zip",
                    "Content-Disposition": `attachment; filename="${getSafeBaseName(file.name)}_split.zip"`,
                    "Cache-Control": "no-store",
                    "X-Zygsoft-File-Count": String(fileCount),
                    "X-Zygsoft-Page-Count": String(pageCount),
                },
            });
        }

        const parsed = parsePageRange(pageRange, pageCount);
        if ("error" in parsed) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const { indices } = parsed;

        const outDoc = await PDFDocument.create();
        const copiedPages = await outDoc.copyPages(srcDoc, indices);
        copiedPages.forEach((page) => outDoc.addPage(page));

        const pdfBytes = await outDoc.save();

        /* Log usage */
        const userId = guard.userId;
        prisma.toolUsage.create({ data: { userId, toolSlug: "pdf-split" } }).catch(() => {});
        if (guard.incrementTrial && guard.userId) {
            incrementTrialUsage(guard.userId).catch(() => {});
        }

        return new NextResponse(Buffer.from(pdfBytes), {
            status: 200,
            headers: {
                "Content-Type":        "application/pdf",
                "Content-Disposition": 'attachment; filename="zygsoft_split.pdf"',
                "Cache-Control":       "no-store",
                "X-Zygsoft-File-Count": "1",
                "X-Zygsoft-Page-Count": String(indices.length),
            },
        });
    } catch (err) {
        console.error("[pdf-split] Unexpected error", err);
        return NextResponse.json({ error: "Bölme sırasında beklenmeyen bir hata oluştu." }, { status: 500 });
    }
}
