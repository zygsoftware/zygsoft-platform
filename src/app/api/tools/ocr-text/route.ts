import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { spawn } from "child_process";
import path from "path";
import os from "os";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB

const ALLOWED_EXT = [".pdf", ".png", ".jpg", ".jpeg", ".tif", ".tiff"];

function isValidFile(file: File): boolean {
    const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
    return ALLOWED_EXT.includes(ext);
}

export async function POST(req: Request) {
    let tempDir: string | null = null;

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
        }
        const activeSlugs = (session.user as any).activeProductSlugs || [];
        const isAdmin = (session.user as any).role === "admin";
        if (!activeSlugs.includes("legal-toolkit") && !isAdmin) {
            return NextResponse.json({ error: "Bu araç için Hukuk Araçları Paketi aboneliği gereklidir." }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get("file");
        const langRaw = (formData.get("language") as string) || "tr";
        const lang = (langRaw === "en" ? "en" : "tr").toLowerCase();

        if (!file || !(file instanceof File) || file.size === 0) {
            return NextResponse.json({ error: "Lütfen bir dosya yükleyin." }, { status: 400 });
        }

        if (!isValidFile(file)) {
            return NextResponse.json(
                { error: "Geçersiz dosya türü. PDF, PNG, JPG, JPEG, TIF veya TIFF kabul edilir." },
                { status: 400 }
            );
        }

        if (file.size > MAX_FILE_BYTES) {
            return NextResponse.json(
                { error: `Dosya çok büyük (maks. 20 MB).` },
                { status: 400 }
            );
        }

        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "zygsoft-ocr-"));
        const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
        const inputPath = path.join(tempDir, `input.${ext}`);
        const buf = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(inputPath, buf);

        const ocrScript = path.join(process.cwd(), "tools", "ocr-text", "ocr.py");

        const result = await new Promise<{ text?: string; error?: string }>((resolve, reject) => {
            const proc = spawn("python3", [ocrScript, inputPath, lang], {
                cwd: process.cwd(),
                stdio: ["ignore", "pipe", "pipe"],
            });

            let stdout = "";
            let stderr = "";
            proc.stdout?.on("data", (d) => { stdout += d.toString(); });
            proc.stderr?.on("data", (d) => { stderr += d.toString(); });

            proc.on("close", (code) => {
                try {
                    const parsed = JSON.parse(stdout || "{}");
                    if (parsed.error) {
                        resolve({ error: parsed.error });
                    } else {
                        resolve({ text: parsed.text ?? "" });
                    }
                } catch {
                    const errMsg = stderr.match(/ERROR:(.+)/)?.[1]?.trim() || stderr || "OCR işlemi başarısız.";
                    resolve({ error: errMsg });
                }
            });
            proc.on("error", (err) => {
                reject(new Error("OCR servisi başlatılamadı. Tesseract ve Python bağımlılıkları kurulu olmalı."));
            });
        });

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        const isBatch = req.headers.get("X-Batch-Mode") === "1";
        if (!isBatch) {
            prisma.toolUsage.create({ data: { userId: session.user.id, toolSlug: "ocr-text" } }).catch(() => {});
        }

        return NextResponse.json({
            text: result.text ?? "",
        });
    } catch (err: any) {
        console.error("[ocr-text] Error", err);
        return NextResponse.json(
            { error: err.message || "OCR sırasında beklenmeyen bir hata oluştu." },
            { status: 500 }
        );
    } finally {
        if (tempDir) {
            fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        }
    }
}
