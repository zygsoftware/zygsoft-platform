import { NextResponse } from "next/server";
import JSZip from "jszip";
import { checkToolAccess, incrementTrialUsage } from "@/lib/trial-guard";
import { formatMbLimit, getToolMaxFileBytes, getToolMaxFiles } from "@/lib/tool-policy";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const MB = 1024 * 1024;

type AppendixPayload = {
    id: string;
    label: string;
    fileIds: string[];
};

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

async function createZipBuffer(entries: Array<{ name: string; data: Uint8Array | Buffer | string }>): Promise<Uint8Array> {
    const zip = new JSZip();
    for (const entry of entries) {
        zip.file(entry.name, entry.data);
    }
    return zip.generateAsync({
        type: "uint8array",
        compression: "DEFLATE",
        compressionOptions: { level: 9 },
    });
}

export async function POST(req: Request) {
    try {
        const guard = await checkToolAccess();
        if (!guard.allowed) return guard.response;

        const hasPaidAccess = !guard.incrementTrial;
        const maxFiles = getToolMaxFiles("appendix-packager", hasPaidAccess);

        const formData = await req.formData();
        const appendicesJson = (formData.get("appendices") as string | null) ?? "[]";
        const maxZipSizeMbRaw = Number(formData.get("maxZipSizeMb") ?? "5");

        const maxZipSizeMb = Number.isFinite(maxZipSizeMbRaw) ? maxZipSizeMbRaw : 5;
        if (maxZipSizeMb < 1 || maxZipSizeMb > 50) {
            return NextResponse.json({ error: "Geçersiz maksimum ZIP boyutu seçildi." }, { status: 400 });
        }
        const maxZipBytes = maxZipSizeMb * MB;

        let appendices: AppendixPayload[] = [];
        try {
            const parsed = JSON.parse(appendicesJson);
            appendices = Array.isArray(parsed) ? parsed : [];
        } catch {
            return NextResponse.json({ error: "Ek yapısı okunamadı." }, { status: 400 });
        }

        if (appendices.length === 0) {
            return NextResponse.json({ error: "En az bir ek oluşturun." }, { status: 400 });
        }

        let totalFiles = 0;
        const manifestLines = [
            "ZYGSOFT Ek Klasoru",
            "==================",
            `Hedef ek ZIP boyutu: ${maxZipSizeMb} MB`,
            "",
        ];

        const parentEntries: Array<{ name: string; data: Uint8Array | string }> = [];

        for (let appendixIndex = 0; appendixIndex < appendices.length; appendixIndex++) {
            const appendix = appendices[appendixIndex];
            const numberedPrefix = `Ek-${appendixIndex + 1}`;
            const appendixLabel = sanitizeSegment(appendix.label) || `${numberedPrefix}_Belge`;

            if (!Array.isArray(appendix.fileIds) || appendix.fileIds.length === 0) {
                return NextResponse.json({ error: `${numberedPrefix} içinde en az bir dosya olmalıdır.` }, { status: 400 });
            }

            totalFiles += appendix.fileIds.length;
            const appendixEntries: Array<{ name: string; data: Uint8Array }> = [];
            const appendixFileNames: string[] = [];

            for (const fileId of appendix.fileIds) {
                const formEntry = formData.get(`file:${fileId}`);
                if (!(formEntry instanceof File) || formEntry.size === 0) {
                    return NextResponse.json({ error: `${numberedPrefix} içindeki dosyalardan biri okunamadı.` }, { status: 400 });
                }

                const maxFileBytes = getToolMaxFileBytes("appendix-packager", hasPaidAccess, formEntry);
                if (maxFileBytes !== null && formEntry.size > maxFileBytes) {
                    return NextResponse.json(
                        { error: `"${formEntry.name}" çok büyük (maks. ${formatMbLimit(maxFileBytes)}).` },
                        { status: 400 }
                    );
                }

                const ext = getExtension(formEntry.name);
                const baseName = sanitizeSegment(getBaseName(formEntry.name));
                const finalName = safeZipFilename(`${baseName}${ext}`);
                appendixEntries.push({
                    name: finalName,
                    data: new Uint8Array(await formEntry.arrayBuffer()),
                });
                appendixFileNames.push(finalName);
            }

            const childZipName = safeZipFilename(`${numberedPrefix}_${appendixLabel}.zip`);
            const childZipBuffer = await createZipBuffer(appendixEntries);

            if (childZipBuffer.byteLength > maxZipBytes) {
                return NextResponse.json(
                    {
                        error: `${numberedPrefix} için üretilen ZIP ${formatMbLimit(childZipBuffer.byteLength)} oldu. Seçtiğiniz sınır ${maxZipSizeMb} MB. Daha yüksek bir boyut seçin veya bu ek içindeki dosyaları azaltın.`,
                    },
                    { status: 400 }
                );
            }

            parentEntries.push({ name: childZipName, data: childZipBuffer });
            manifestLines.push(`${numberedPrefix}: ${appendixLabel} -> ${childZipName} (${(childZipBuffer.byteLength / MB).toFixed(2)} MB)`);
            for (const fileName of appendixFileNames) {
                manifestLines.push(`  - ${fileName}`);
            }
            manifestLines.push("");
        }

        if (maxFiles !== null && totalFiles > maxFiles) {
            return NextResponse.json({ error: `En fazla ${maxFiles} dosya paketleyebilirsiniz.` }, { status: 400 });
        }

        parentEntries.unshift({
            name: "00_ek_listesi.txt",
            data: manifestLines.join("\n"),
        });

        const finalZip = await createZipBuffer(parentEntries);

        prisma.toolUsage.create({
            data: { userId: guard.userId, toolSlug: "appendix-packager" },
        }).catch(() => {});

        if (guard.incrementTrial) {
            incrementTrialUsage(guard.userId).catch(() => {});
        }

        const responseBytes = Uint8Array.from(finalZip);
        const responseBody = responseBytes.buffer;

        return new NextResponse(responseBody, {
            status: 200,
            headers: {
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
