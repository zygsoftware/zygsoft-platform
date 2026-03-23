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

        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "zygsoft-pdf2docx-"));
        const inPath = path.join(tempDir, "input.pdf");
        const outPath = path.join(tempDir, "output.docx");
        await fs.writeFile(inPath, buffer);

        const script = path.join(process.cwd(), "tools", "pdf-to-word", "convert.py");

        const exitCode = await new Promise<number>((resolve) => {
            const proc = spawn("python3", [script, inPath, outPath], {
                cwd: process.cwd(),
                stdio: ["ignore", "pipe", "pipe"],
            });
            proc.stderr?.on("data", () => {});
            proc.on("close", (code) => resolve(code ?? 1));
            proc.on("error", () => resolve(1));
        });

        if (exitCode !== 0) {
            return NextResponse.json(
                {
                    error:
                        "PDF → Word dönüşümü başarısız. Dosya şifreli, bozuk olabilir veya sunucuda pdf2docx kurulu olmayabilir (pip install pdf2docx).",
                },
                { status: 422 }
            );
        }

        let outBuffer: Buffer;
        try {
            outBuffer = await fs.readFile(outPath);
        } catch {
            return NextResponse.json({ error: "DOCX dosyası oluşturulamadı." }, { status: 500 });
        }

        if (outBuffer.length === 0) {
            return NextResponse.json({ error: "Oluşturulan DOCX boş." }, { status: 500 });
        }

        if (guard.incrementTrial) {
            incrementTrialUsage(guard.userId).catch(() => {});
        }

        return new NextResponse(new Uint8Array(outBuffer), {
            status: 200,
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Disposition": 'attachment; filename="zygsoft_document.docx"',
                "Cache-Control": "no-store",
            },
        });
    } catch (err) {
        console.error("[pdf-to-word]", err);
        return NextResponse.json({ error: "Dönüşüm sırasında beklenmeyen bir hata oluştu." }, { status: 500 });
    } finally {
        if (tempDir) {
            fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        }
    }
}
