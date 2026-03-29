import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkToolAccess, incrementTrialUsage } from "@/lib/trial-guard";
import { formatMbLimit, getToolMaxFileBytes } from "@/lib/tool-policy";

const execFileAsync = promisify(execFile);
const pdfToImageToolDir = path.join(process.cwd(), "tools", "pdf-to-image");
const pdfToImageScript = path.join(pdfToImageToolDir, "convert.py");

function parseErrorDetail(body: unknown): string {
    if (!body || typeof body !== "object") return "Dönüştürme başarısız.";
    const obj = body as { detail?: string | { msg?: string }[] };
    if (!obj.detail) return "Dönüştürme başarısız.";
    if (typeof obj.detail === "string") return obj.detail;
    if (Array.isArray(obj.detail)) {
        const first = obj.detail[0];
        return (typeof first === "object" && first?.msg) ? first.msg : String(first || "Dönüştürme başarısız.");
    }
    return "Dönüştürme başarısız.";
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getPythonCandidates(): string[] {
    const candidates = [
        process.env.UDF_PYTHON_BIN,
        process.env.PYTHON_EXECUTABLE,
        "python3",
        "python",
    ].filter((value): value is string => Boolean(value && value.trim()));

    return [...new Set(candidates)];
}

function parseExecError(error: unknown): string {
    if (!error || typeof error !== "object") return "Yerel PDF dönüştürücü çalıştırılamadı.";
    const err = error as { stderr?: string | Buffer; stdout?: string | Buffer; message?: string };
    const raw = [
        typeof err.stderr === "string" ? err.stderr : err.stderr?.toString(),
        typeof err.stdout === "string" ? err.stdout : err.stdout?.toString(),
        err.message,
    ]
        .filter(Boolean)
        .join("\n")
        .trim();

    if (!raw) return "Yerel PDF dönüştürücü çalıştırılamadı.";
    return raw.split("\n").slice(-8).join("\n");
}

function fileNameOrDefault(name: string | undefined, fallback: string): string {
    const normalized = (name || "").trim();
    return normalized ? normalized.normalize("NFC") : fallback;
}

async function runLocalPdfToImage(params: {
    file: File;
    format: "png" | "jpg";
    pageRange: string;
}): Promise<Buffer> {
    const tempDir = await mkdtemp(path.join(tmpdir(), "zyg-pdf-images-"));

    try {
        const inputPath = path.join(tempDir, fileNameOrDefault(params.file.name, "document.pdf"));
        const outputDir = path.join(tempDir, "out");
        await writeFile(inputPath, Buffer.from(await params.file.arrayBuffer()));

        const args = [pdfToImageScript, inputPath, outputDir, params.format];
        if (params.pageRange.trim()) {
            args.push(params.pageRange.trim());
        }

        let lastError: unknown = null;
        for (const pythonBin of getPythonCandidates()) {
            try {
                await execFileAsync(pythonBin, args, {
                    cwd: pdfToImageToolDir,
                    timeout: 90000,
                    maxBuffer: 10 * 1024 * 1024,
                });
                return await readFile(path.join(outputDir, "images.zip"));
            } catch (error) {
                lastError = error;
            }
        }

        throw new Error(parseExecError(lastError));
    } finally {
        await rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
}

export async function POST(req: Request) {
    try {
        const guard = await checkToolAccess();
        if (!guard.allowed) return guard.response;

        const hasPaidAccess = !guard.incrementTrial;

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

        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        if (!isPdf) {
            return NextResponse.json({ error: `"${file.name}" PDF formatında değil.` }, { status: 400 });
        }

        const maxFileBytes = getToolMaxFileBytes("pdf-to-image", hasPaidAccess, file);
        if (maxFileBytes !== null && file.size > maxFileBytes) {
            return NextResponse.json(
                { error: `"${file.name}" dosyası çok büyük (maks. ${formatMbLimit(maxFileBytes)}).` },
                { status: 400 }
            );
        }

        const microserviceUrl = process.env.UDF_MICROSERVICE_URL || "http://127.0.0.1:8000";
        const apiEndpoint = `${microserviceUrl}/api/convert/pdf-to-image`;

        const proxyFormData = new FormData();
        proxyFormData.append("file", file);
        proxyFormData.append("format", format === "jpeg" ? "jpg" : format);
        if (pageRange.trim()) {
            proxyFormData.append("page_range", pageRange.trim());
        }

        let response: Response;
        try {
            response = await fetch(apiEndpoint, {
                method: "POST",
                body: proxyFormData,
                signal: AbortSignal.timeout(90000),
            });
        } catch (fetchErr: unknown) {
            const err = fetchErr as { name?: string };
            if (err?.name === "AbortError") {
                return NextResponse.json({ error: "İşlem zaman aşımına uğradı." }, { status: 504 });
            }
            try {
                const localZip = await runLocalPdfToImage({
                    file,
                    format: format === "jpeg" ? "jpg" : format,
                    pageRange,
                });

                response = new Response(new Uint8Array(localZip), {
                    status: 200,
                    headers: {
                        "Content-Type": "application/zip",
                        "X-PDF-TO-IMAGE-Fallback": "local-python",
                    },
                });
            } catch (localErr) {
                console.error("[pdf-to-image] Local fallback error", localErr);
                return NextResponse.json(
                    { error: "Dönüştürme servisine bağlanılamadı ve yerel dönüştürücü de çalıştırılamadı. Lütfen daha sonra tekrar deneyin." },
                    { status: 503 }
                );
            }
        }

        if (!response.ok) {
            let errBody: unknown;
            try {
                errBody = await response.json();
            } catch {
                errBody = { detail: "Dönüştürme başarısız." };
            }
            return NextResponse.json({ error: parseErrorDetail(errBody) }, { status: response.status });
        }

        const zipBuffer = await response.arrayBuffer();

        prisma.toolUsage.create({ data: { userId: guard.userId, toolSlug: "pdf-to-image" } }).catch(() => {});
        if (guard.incrementTrial) {
            incrementTrialUsage(guard.userId).catch(() => {});
        }

        return new NextResponse(zipBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": 'attachment; filename="zygsoft_pdf_images.zip"',
                "Cache-Control": "no-store",
            },
        });
    } catch (err: unknown) {
        console.error("[pdf-to-image] Error", err);
        return NextResponse.json(
            { error: "Dönüştürme sırasında beklenmeyen bir hata oluştu." },
            { status: 500 }
        );
    }
}
