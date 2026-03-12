import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { checkToolAccess, incrementTrialUsage } from "@/lib/trial-guard";
import { spawn } from "child_process";
import path from "path";
import os from "os";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

const MAX_FILES = 10;
const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15 MB per file

const ALLOWED_EXT = [".tif", ".tiff"];

function isTiff(file: File): boolean {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    return ext === "tif" || ext === "tiff";
}

export async function POST(req: Request) {
    let tempDir: string | null = null;

    try {
        const guard = await checkToolAccess();
        if (!guard.allowed) return guard.response;

        const formData = await req.formData();
        const raw = formData.getAll("files");
        const files = raw.filter((f): f is File => f instanceof File && f.size > 0);

        if (files.length === 0) {
            return NextResponse.json({ error: "En az bir TIFF dosyası yükleyin." }, { status: 400 });
        }
        if (files.length > MAX_FILES) {
            return NextResponse.json(
                { error: `En fazla ${MAX_FILES} dosya yükleyebilirsiniz.` },
                { status: 400 }
            );
        }

        for (const file of files) {
            if (!isTiff(file)) {
                return NextResponse.json(
                    { error: `"${file.name}" TIFF formatında değil. Sadece .tif ve .tiff kabul edilir.` },
                    { status: 400 }
                );
            }
            if (file.size > MAX_FILE_BYTES) {
                return NextResponse.json(
                    { error: `"${file.name}" dosyası çok büyük (maks. 15 MB).` },
                    { status: 400 }
                );
            }
        }

        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "zygsoft-tiff2pdf-"));
        const outputPdf = path.join(tempDir, "output.pdf");
        const tiffPaths: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const buf = Buffer.from(await files[i].arrayBuffer());
            const ext = files[i].name.split(".").pop()?.toLowerCase() || "tiff";
            const safeName = `input_${i}.${ext}`;
            const p = path.join(tempDir, safeName);
            await fs.writeFile(p, buf);
            tiffPaths.push(p);
        }

        const convertScript = path.join(process.cwd(), "tools", "tiff-to-pdf", "convert.py");

        await new Promise<void>((resolve, reject) => {
            const args = [convertScript, outputPdf, ...tiffPaths];
            const proc = spawn("python3", args, {
                cwd: process.cwd(),
                stdio: ["ignore", "pipe", "pipe"],
            });

            let stderr = "";
            proc.stderr?.on("data", (d) => { stderr += d.toString(); });

            proc.on("close", (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    const errMsg = stderr.match(/ERROR:(.+)/)?.[1]?.trim() || stderr || "Dönüştürme başarısız.";
                    reject(new Error(errMsg));
                }
            });
            proc.on("error", (err) => {
                reject(new Error("Python TIFF dönüştürücü başlatılamadı. Pillow kurulu olmalı: pip install Pillow"));
            });
        });

        let pdfBuffer: Buffer;
        try {
            pdfBuffer = await fs.readFile(outputPdf);
        } catch {
            return NextResponse.json({ error: "PDF dosyası oluşturulamadı." }, { status: 500 });
        }

        const isBatch = req.headers.get("X-Batch-Mode") === "1";
        if (!isBatch) {
            prisma.toolUsage.create({ data: { userId: guard.userId, toolSlug: "tiff-to-pdf" } }).catch(() => {});
            if (guard.incrementTrial) {
                incrementTrialUsage(guard.userId).catch(() => {});
            }
        }

        return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                "Content-Type":        "application/pdf",
                "Content-Disposition": 'attachment; filename="zygsoft_tiff_merged.pdf"',
                "Cache-Control":       "no-store",
            },
        });
    } catch (err: any) {
        console.error("[tiff-to-pdf] Error", err);
        return NextResponse.json(
            { error: err.message || "Dönüştürme sırasında beklenmeyen bir hata oluştu." },
            { status: 500 }
        );
    } finally {
        if (tempDir) {
            fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        }
    }
}
