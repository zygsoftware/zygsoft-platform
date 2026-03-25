import { NextResponse } from "next/server";
import archiver from "archiver";
import { Readable } from "stream";
import { checkToolAccess, incrementTrialUsage } from "@/lib/trial-guard";
import { formatMbLimit, getToolMaxFileBytes, getToolMaxFiles } from "@/lib/tool-policy";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const MB = 1024 * 1024;

function sanitizeSegment(value: string): string {
    return value
        .normalize("NFC")
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 80);
}

function safeZipFilename(name: string): string {
    return sanitizeSegment(name).replace(/\s/g, "_") || "dosya";
}

function getExtension(name: string): string {
    const match = name.match(/(\.[^./\\]+)$/);
    return match?.[1] ?? "";
}

function getBaseName(name: string): string {
    return name.replace(/\.[^./\\]+$/, "") || "dosya";
}

async function createZipBuffer(entries: Array<{ name: string; data: Buffer }>): Promise<Buffer> {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    archive.on("data", (chunk: Buffer) => chunks.push(chunk));

    const zipReady = new Promise<void>((resolve, reject) => {
        archive.on("end", resolve);
        archive.on("error", reject);
    });

    for (const entry of entries) {
        archive.append(Readable.from(entry.data), { name: entry.name });
    }

    archive.finalize();
    await zipReady;
    return Buffer.concat(chunks);
}

export async function POST(req: Request) {
    try {
        const guard = await checkToolAccess();
        if (!guard.allowed) return guard.response;

        const hasPaidAccess = !guard.incrementTrial;
        const maxFiles = getToolMaxFiles("appendix-packager", hasPaidAccess);

        const formData = await req.formData();
        const rawFiles = formData.getAll("files");
        const labelJson = (formData.get("labels") as string | null) ?? "[]";
        const maxZipSizeMbRaw = Number(formData.get("maxZipSizeMb") ?? "5");
        const files = rawFiles.filter((entry): entry is File => entry instanceof File && entry.size > 0);

        const maxZipSizeMb = Number.isFinite(maxZipSizeMbRaw) ? maxZipSizeMbRaw : 5;
        if (maxZipSizeMb < 1 || maxZipSizeMb > 50) {
            return NextResponse.json({ error: "Geçersiz maksimum ZIP boyutu seçildi." }, { status: 400 });
        }
        const maxZipBytes = maxZipSizeMb * MB;

        if (files.length === 0) {
            return NextResponse.json({ error: "En az bir dosya yükleyin." }, { status: 400 });
        }

        if (maxFiles !== null && files.length > maxFiles) {
            return NextResponse.json({ error: `En fazla ${maxFiles} dosya paketleyebilirsiniz.` }, { status: 400 });
        }

        let labels: string[] = [];
        try {
            const parsed = JSON.parse(labelJson);
            labels = Array.isArray(parsed) ? parsed.map((item) => String(item ?? "")) : [];
        } catch {
            return NextResponse.json({ error: "Ek başlıkları okunamadı." }, { status: 400 });
        }

        const manifestLines = [
            "ZYGSOFT Ek Klasoru",
            "==================",
            `Hedef ek ZIP boyutu: ${maxZipSizeMb} MB`,
            "",
        ];
        const packagedEntries: Array<{ name: string; data: Buffer }> = [];

        for (let index = 0; index < files.length; index++) {
            const file = files[index];
            const maxFileBytes = getToolMaxFileBytes("appendix-packager", hasPaidAccess, file);

            if (maxFileBytes !== null && file.size > maxFileBytes) {
                return NextResponse.json(
                    { error: `"${file.name}" çok büyük (maks. ${formatMbLimit(maxFileBytes)}).` },
                    { status: 400 }
                );
            }

            const customLabel = sanitizeSegment(labels[index] ?? "");
            const ext = getExtension(file.name);
            const baseName = sanitizeSegment(getBaseName(file.name));
            const numberedPrefix = `Ek-${index + 1}`;
            const finalStem = customLabel || baseName || `Belge-${index + 1}`;
            const finalName = safeZipFilename(`${numberedPrefix}_${finalStem}${ext}`);
            const childZipName = safeZipFilename(`${numberedPrefix}_${finalStem}.zip`);
            const buffer = Buffer.from(await file.arrayBuffer());
            const childZipBuffer = await createZipBuffer([{ name: finalName, data: buffer }]);

            if (childZipBuffer.byteLength > maxZipBytes) {
                return NextResponse.json(
                    {
                        error: `"${file.name}" için üretilen ZIP ${formatMbLimit(childZipBuffer.byteLength)} oldu. Seçtiğiniz sınır ${maxZipSizeMb} MB. Daha yüksek bir ZIP boyutu seçin veya dosyayı küçültün.`,
                    },
                    { status: 400 }
                );
            }

            packagedEntries.push({ name: childZipName, data: childZipBuffer });
            manifestLines.push(`${numberedPrefix}: ${customLabel || baseName}${ext} -> ${childZipName} (${(childZipBuffer.byteLength / MB).toFixed(2)} MB)`);
        }

        packagedEntries.unshift({
            name: "00_ek_listesi.txt",
            data: Buffer.from(manifestLines.join("\n"), "utf-8"),
        });

        const zipBuffer = await createZipBuffer(packagedEntries);

        prisma.toolUsage.create({
            data: { userId: guard.userId, toolSlug: "appendix-packager" },
        }).catch(() => {});

        if (guard.incrementTrial) {
            incrementTrialUsage(guard.userId).catch(() => {});
        }

        return new NextResponse(new Uint8Array(zipBuffer), {
            status: 200,
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": 'attachment; filename="zygsoft_ek_klasoru.zip"',
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error("[appendix-packager] Error", error);
        return NextResponse.json(
            { error: "Ek klasörü hazırlanırken beklenmeyen bir hata oluştu." },
            { status: 500 }
        );
    }
}
