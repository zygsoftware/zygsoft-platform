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
        const format = (formData.get("format") as string)?.toLowerCase() || "png";
        const pageRange = (formData.get("pageRange") as string) || "";

        if (!file || !(file instanceof File) || file.size === 0) {
            return NextResponse.json({ error: "Lütfen bir PDF dosyası yükleyin." }, { status: 400 });
        }

        if (format !== "png" && format !== "jpg" && format !== "jpeg") {
            return NextResponse.json({ error: "Çıktı formatı png veya jpg olmalıdır." }, { status: 400 });
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

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "zygsoft-pdf2img-"));
        const pdfPath = path.join(tempDir, "input.pdf");
        const outDir = path.join(tempDir, "out");
        await fs.writeFile(pdfPath, buffer);

        const convertScript = path.join(process.cwd(), "tools", "pdf-to-image", "convert.py");
        const formatArg = format === "jpeg" ? "jpg" : format;
        const pageRangeArg = pageRange.trim();

        const zipPath = await new Promise<string>((resolve, reject) => {
            const args = [convertScript, pdfPath, outDir, formatArg];
            if (pageRangeArg) args.push(pageRangeArg);

            const proc = spawn("python3", args, {
                cwd: process.cwd(),
                stdio: ["ignore", "pipe", "pipe"],
            });

            let stdout = "";
            let stderr = "";
            proc.stdout?.on("data", (d) => { stdout += d.toString(); });
            proc.stderr?.on("data", (d) => { stderr += d.toString(); });

            proc.on("close", (code) => {
                if (code === 0) {
                    const zip = stdout.trim();
                    resolve(zip || path.join(outDir, "images.zip"));
                } else {
                    const errMsg = stderr.match(/ERROR:(.+)/)?.[1]?.trim() || stderr || "Dönüştürme başarısız.";
                    reject(new Error(errMsg));
                }
            });
            proc.on("error", (err) => {
                reject(new Error("Python PDF dönüştürücü başlatılamadı. pymupdf ve Pillow kurulu olmalı: pip install pymupdf Pillow"));
            });
        });

        let zipBuffer: Buffer;
        try {
            zipBuffer = await fs.readFile(zipPath);
        } catch {
            return NextResponse.json({ error: "ZIP dosyası oluşturulamadı." }, { status: 500 });
        }

        prisma.toolUsage.create({ data: { userId: session.user.id, toolSlug: "pdf-to-image" } }).catch(() => {});

        return new NextResponse(new Uint8Array(zipBuffer), {
            status: 200,
            headers: {
                "Content-Type":        "application/zip",
                "Content-Disposition": 'attachment; filename="zygsoft_pdf_images.zip"',
                "Cache-Control":       "no-store",
            },
        });
    } catch (err: any) {
        console.error("[pdf-to-image] Error", err);
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
