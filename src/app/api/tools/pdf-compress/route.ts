import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { checkToolAccess, incrementTrialUsage } from "@/lib/trial-guard";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    let tempDir: string | null = null;

    try {
        const guard = await checkToolAccess();
        if (!guard.allowed) return guard.response;

        const isSubscribed = !guard.incrementTrial;
        const maxFileBytes = isSubscribed ? 100 * 1024 * 1024 : 20 * 1024 * 1024;

        const formData = await req.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof File) || file.size === 0) {
            return NextResponse.json({ error: "Lütfen bir PDF dosyası yükleyin." }, { status: 400 });
        }

        const isPdf =
            file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        if (!isPdf) {
            return NextResponse.json({ error: `"${file.name}" PDF formatında değil.` }, { status: 400 });
        }

        if (file.size > maxFileBytes) {
            return NextResponse.json(
                { error: `Dosya çok büyük (maks. ${isSubscribed ? 100 : 20} MB).` },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "zygsoft-pdfcmp-"));
        const inPath = path.join(tempDir, "input.pdf");
        const outPath = path.join(tempDir, "compressed.pdf");
        await fs.writeFile(inPath, buffer);

        const script = path.join(process.cwd(), "tools", "pdf-compress", "compress.py");

        const pyResult = await new Promise<{
            code: number | null;
            stderr: string;
            spawnErr?: string;
        }>((resolve) => {
            const proc = spawn("python3", [script, inPath, outPath], {
                cwd: process.cwd(),
                stdio: ["ignore", "pipe", "pipe"],
            });
            let stderr = "";
            proc.stderr?.on("data", (d) => {
                stderr += d.toString();
            });
            proc.on("error", (err) => {
                resolve({ code: null, stderr, spawnErr: err.message });
            });
            proc.on("close", (code) => resolve({ code: code ?? 1, stderr }));
        });

        if (pyResult.code !== 0) {
            const errLower = pyResult.stderr.toLowerCase();
            if (pyResult.spawnErr) {
                console.error("[pdf-compress] spawn failed:", pyResult.spawnErr);
                return NextResponse.json(
                    {
                        error:
                            "Sunucuda Python (python3) bulunamadı veya çalıştırılamadı. Yerelde: pip install pymupdf ve python3 yolunu kontrol edin.",
                    },
                    { status: 503 }
                );
            }
            if (pyResult.code === 2 || errLower.includes("pymupdf not installed")) {
                return NextResponse.json(
                    {
                        error:
                            "Sunucuda PyMuPDF kurulu değil. Kurulum: pip install pymupdf (veya tools/requirements-legal.txt)",
                    },
                    { status: 503 }
                );
            }
            if (errLower.includes("password protected")) {
                return NextResponse.json(
                    { error: "Bu PDF şifre korumalı. Şifreyi kaldırıp tekrar deneyin." },
                    { status: 422 }
                );
            }
            console.error("[pdf-compress] exit", pyResult.code, pyResult.stderr.trim());
            return NextResponse.json(
                {
                    error:
                        "Sıkıştırma başarısız. PDF bozuk, uyumsuz veya şifreli olabilir. Farklı bir PDF ile deneyin veya dosyayı yeniden kaydedin.",
                },
                { status: 422 }
            );
        }

        let outBuffer: Buffer;
        try {
            outBuffer = await fs.readFile(outPath);
        } catch {
            return NextResponse.json({ error: "Çıktı dosyası oluşturulamadı." }, { status: 500 });
        }

        if (outBuffer.length === 0) {
            return NextResponse.json({ error: "Sıkıştırılmış dosya boş." }, { status: 500 });
        }

        if (guard.incrementTrial) {
            incrementTrialUsage(guard.userId).catch(() => {});
        }

        return new NextResponse(new Uint8Array(outBuffer), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": 'attachment; filename="zygsoft_compressed.pdf"',
                "Cache-Control": "no-store",
            },
        });
    } catch (err) {
        console.error("[pdf-compress]", err);
        return NextResponse.json({ error: "Sıkıştırma sırasında beklenmeyen bir hata oluştu." }, { status: 500 });
    } finally {
        if (tempDir) {
            fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        }
    }
}
