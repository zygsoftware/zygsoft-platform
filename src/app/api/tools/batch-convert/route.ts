import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { checkToolAccess, incrementTrialUsage } from "@/lib/trial-guard";
import archiver from "archiver";
import { Readable } from "stream";

export const dynamic = "force-dynamic";

const MAX_FILES = 20;
const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB per file

export type BatchToolType = "doc-to-udf" | "image-to-pdf" | "tiff-to-pdf" | "ocr-text";

const TOOL_CONFIG: Record<BatchToolType, { ext: string[]; api: string; outputExt: string }> = {
    "doc-to-udf":     { ext: [".docx"], api: "/api/tools/udf-convert", outputExt: ".udf" },
    "image-to-pdf":   { ext: [".jpg", ".jpeg", ".png"], api: "/api/tools/image-to-pdf", outputExt: ".pdf" },
    "tiff-to-pdf":    { ext: [".tif", ".tiff"], api: "/api/tools/tiff-to-pdf", outputExt: ".pdf" },
    "ocr-text":       { ext: [".pdf", ".png", ".jpg", ".jpeg", ".tif", ".tiff"], api: "/api/tools/ocr-text", outputExt: ".txt" },
};

function getExt(file: File): string {
    return "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
}

function isValidForTool(file: File, tool: BatchToolType): boolean {
    const ext = getExt(file);
    return TOOL_CONFIG[tool].ext.includes(ext);
}

function safeZipName(name: string): string {
    return name.replace(/[^a-zA-Z0-9_\-\u00C0-\u024F\u1E00-\u1EFF\.]/g, "_");
}

function baseName(file: File): string {
    return file.name.replace(/\.[^/.]+$/, "") || "document";
}

function getBaseUrl(req: Request): string {
    try {
        const url = new URL(req.url);
        return `${url.protocol}//${url.host}`;
    } catch {
        return process.env.NEXTAUTH_URL || process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000";
    }
}

export async function POST(req: Request) {
    try {
        const guard = await checkToolAccess();
        if (!guard.allowed) return guard.response;

        const session = await getServerSession(authOptions);
        const formData = await req.formData();
        const toolType = (formData.get("toolType") as BatchToolType) || "";
        const language = (formData.get("language") as string) || "tr";

        if (!TOOL_CONFIG[toolType]) {
            return NextResponse.json(
                { error: "Geçersiz dönüşüm türü. doc-to-udf, image-to-pdf, tiff-to-pdf veya ocr-text seçin." },
                { status: 400 }
            );
        }

        const raw = formData.getAll("files");
        const files = raw.filter((f): f is File => f instanceof File && f.size > 0);

        if (files.length === 0) {
            return NextResponse.json({ error: "En az bir dosya yükleyin." }, { status: 400 });
        }
        if (files.length > MAX_FILES) {
            return NextResponse.json(
                { error: `En fazla ${MAX_FILES} dosya yükleyebilirsiniz.` },
                { status: 400 }
            );
        }

        for (const file of files) {
            if (!isValidForTool(file, toolType)) {
                return NextResponse.json(
                    { error: `"${file.name}" bu dönüşüm türü için desteklenmiyor.` },
                    { status: 400 }
                );
            }
            if (file.size > MAX_FILE_BYTES) {
                return NextResponse.json(
                    { error: `"${file.name}" çok büyük (maks. 20 MB).` },
                    { status: 400 }
                );
            }
        }

        const baseUrl = getBaseUrl(req);
        const cookie = req.headers.get("cookie") || "";
        const batchHeaders = new Headers();
        if (cookie) batchHeaders.set("Cookie", cookie);
        batchHeaders.set("X-Batch-Mode", "1");

        const results: { name: string; data: Buffer; index: number }[] = [];
        const usedNames = new Set<string>();

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fd = new FormData();

            if (toolType === "doc-to-udf") {
                fd.append("file", file);
                fd.append("format", "udf");
                fd.append("useLetterhead", "false");
            } else if (toolType === "image-to-pdf" || toolType === "tiff-to-pdf") {
                fd.append("files", file);
            } else if (toolType === "ocr-text") {
                fd.append("file", file);
                fd.append("language", language);
            }

            const res = await fetch(`${baseUrl}${TOOL_CONFIG[toolType].api}`, {
                method: "POST",
                body: fd,
                headers: batchHeaders,
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `"${file.name}" dönüştürülemedi.`);
            }

            let outputData: Buffer;
            let outputName: string;

            if (toolType === "ocr-text") {
                const json = await res.json();
                const text = json.text ?? "";
                outputData = Buffer.from(text, "utf-8");
                outputName = `${safeZipName(baseName(file))}.txt`;
            } else {
                const arrBuf = await res.arrayBuffer();
                outputData = Buffer.from(arrBuf);
                const disp = res.headers.get("Content-Disposition");
                const utf8Match = disp?.match(/filename\*=UTF-8''([^;]+)/i);
                if (utf8Match) {
                    try {
                        outputName = decodeURIComponent(utf8Match[1].trim());
                    } catch {
                        outputName = `${safeZipName(baseName(file))}${TOOL_CONFIG[toolType].outputExt}`;
                    }
                } else {
                    const match = disp?.match(/filename="?([^";]+)"?/);
                    outputName = match?.[1]?.trim() || `${safeZipName(baseName(file))}${TOOL_CONFIG[toolType].outputExt}`;
                }
            }

            let finalName = outputName;
            let suffix = 0;
            while (usedNames.has(finalName)) {
                suffix++;
                const ext = outputName.includes(".") ? outputName.substring(outputName.lastIndexOf(".")) : "";
                const base = outputName.replace(/\.[^/.]+$/, "");
                finalName = `${base}_${suffix}${ext}`;
            }
            usedNames.add(finalName);
            results.push({ name: finalName, data: outputData, index: i });
        }

        prisma.toolUsage.create({ data: { userId: guard.userId, toolSlug: "batch-convert" } }).catch(() => {});
        if (guard.incrementTrial) {
            incrementTrialUsage(guard.userId).catch(() => {});
        }

        const archive = archiver("zip", { zlib: { level: 9 } });
        const chunks: Buffer[] = [];
        archive.on("data", (chunk: Buffer) => chunks.push(chunk));

        const zipReady = new Promise<void>((resolve, reject) => {
            archive.on("end", resolve);
            archive.on("error", reject);
        });

        for (const r of results) {
            archive.append(Readable.from(r.data), { name: r.name });
        }
        archive.finalize();
        await zipReady;

        const zipBuffer = Buffer.concat(chunks);

        return new NextResponse(zipBuffer, {
            status: 200,
            headers: {
                "Content-Type":        "application/zip",
                "Content-Disposition": 'attachment; filename="zygsoft_batch_converted.zip"',
                "Cache-Control":       "no-store",
            },
        });
    } catch (err: any) {
        console.error("[batch-convert] Error", err);
        return NextResponse.json(
            { error: err.message || "Toplu dönüştürme sırasında beklenmeyen bir hata oluştu." },
            { status: 500 }
        );
    }
}
