import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PDFDocument } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { checkToolAccess, incrementTrialUsage } from "@/lib/trial-guard";

export const dynamic = "force-dynamic";

/* ── Limits ─────────────────────────────────────────────────────── */
const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB

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

/* ── Route handler ──────────────────────────────────────────────── */
export async function POST(req: Request) {
    try {
        const guard = await checkToolAccess();
        if (!guard.allowed) return guard.response;

        const session = await getServerSession(authOptions);

        /* Parse multipart */
        let formData: FormData;
        try {
            formData = await req.formData();
        } catch {
            return NextResponse.json({ error: "Form verisi okunamadı." }, { status: 400 });
        }

        const file = formData.get("file");
        const pageRange = formData.get("pageRange");

        if (!file || !(file instanceof File) || file.size === 0) {
            return NextResponse.json({ error: "Lütfen bir PDF dosyası yükleyin." }, { status: 400 });
        }

        if (!pageRange || typeof pageRange !== "string") {
            return NextResponse.json({ error: "Sayfa aralığı belirtilmedi." }, { status: 400 });
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

        if (file.size > MAX_FILE_BYTES) {
            return NextResponse.json(
                { error: `"${file.name}" dosyası çok büyük (maks. 20 MB).` },
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
        const userId = session!.user!.id as string;
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
            },
        });
    } catch (err) {
        console.error("[pdf-split] Unexpected error", err);
        return NextResponse.json({ error: "Bölme sırasında beklenmeyen bir hata oluştu." }, { status: 500 });
    }
}
