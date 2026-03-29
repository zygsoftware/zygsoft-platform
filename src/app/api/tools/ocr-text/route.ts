import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkToolAccess, incrementTrialUsage } from "@/lib/trial-guard";
import { formatMbLimit, getToolMaxFileBytes } from "@/lib/tool-policy";

const execFileAsync = promisify(execFile);
const ocrToolDir = path.join(process.cwd(), "tools", "ocr-text");
const ocrScript = path.join(ocrToolDir, "ocr.py");

function parseErrorDetail(body: unknown): string {
    if (!body || typeof body !== "object") return "OCR işlemi başarısız.";
    const obj = body as { detail?: string | { msg?: string }[] };
    if (!obj.detail) return "OCR işlemi başarısız.";
    if (typeof obj.detail === "string") return obj.detail;
    if (Array.isArray(obj.detail)) {
        const first = obj.detail[0];
        return (typeof first === "object" && first?.msg) ? first.msg : String(first || "OCR işlemi başarısız.");
    }
    return "OCR işlemi başarısız.";
}

const ALLOWED_EXT = [".pdf", ".png", ".jpg", ".jpeg", ".tif", ".tiff"];

function isValidFile(file: File): boolean {
    const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
    return ALLOWED_EXT.includes(ext);
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
    if (!error || typeof error !== "object") return "Yerel OCR çalıştırılamadı.";
    const err = error as { stderr?: string | Buffer; stdout?: string | Buffer; message?: string };
    const raw = [
        typeof err.stderr === "string" ? err.stderr : err.stderr?.toString(),
        typeof err.stdout === "string" ? err.stdout : err.stdout?.toString(),
        err.message,
    ]
        .filter(Boolean)
        .join("\n")
        .trim();

    if (!raw) return "Yerel OCR çalıştırılamadı.";
    return raw.split("\n").slice(-8).join("\n");
}

async function runLocalOcr(file: File, language: "tr" | "en"): Promise<string> {
    const tempDir = await mkdtemp(path.join(tmpdir(), "zyg-ocr-"));
    try {
        const inputName = (file.name || "input").normalize("NFC");
        const inputPath = path.join(tempDir, inputName);
        await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

        let lastError: unknown = null;
        for (const pythonBin of getPythonCandidates()) {
            try {
                const { stdout } = await execFileAsync(pythonBin, [ocrScript, inputPath, language], {
                    cwd: ocrToolDir,
                    timeout: 120000,
                    maxBuffer: 20 * 1024 * 1024,
                });

                const payload = JSON.parse(stdout || "{}") as { text?: string; error?: string };
                if (payload.error) {
                    throw new Error(payload.error);
                }
                return payload.text ?? "";
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
        const langRaw = (formData.get("language") as string) || "tr";
        const language = (langRaw === "en" ? "en" : "tr").toLowerCase();

        if (!file || !(file instanceof File) || file.size === 0) {
            return NextResponse.json({ error: "Lütfen bir dosya yükleyin." }, { status: 400 });
        }
        if (!isValidFile(file)) {
            return NextResponse.json({ error: "Geçersiz dosya türü. PDF, PNG, JPG, JPEG, TIF veya TIFF kabul edilir." }, { status: 400 });
        }

        const maxFileBytes = getToolMaxFileBytes("ocr-text", hasPaidAccess, file);
        if (maxFileBytes !== null && file.size > maxFileBytes) {
            return NextResponse.json({ error: `Dosya çok büyük (maks. ${formatMbLimit(maxFileBytes)}).` }, { status: 400 });
        }

        const microserviceUrl = process.env.UDF_MICROSERVICE_URL || "http://127.0.0.1:8000";
        const proxyFormData = new FormData();
        proxyFormData.append("file", file);
        proxyFormData.append("language", language);

        let response: Response;
        try {
            response = await fetch(`${microserviceUrl}/api/convert/ocr-text`, {
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
                const text = await runLocalOcr(file, language as "tr" | "en");
                response = new Response(JSON.stringify({ text }), {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                        "X-OCR-Fallback": "local-python",
                    },
                });
            } catch (localErr) {
                console.error("[ocr-text] Local fallback error", localErr);
                return NextResponse.json({ error: "OCR servisine bağlanılamadı ve yerel OCR de çalıştırılamadı. Lütfen daha sonra tekrar deneyin." }, { status: 503 });
            }
        }

        if (!response.ok) {
            let errBody: unknown;
            try {
                errBody = await response.json();
            } catch {
                errBody = { detail: "OCR işlemi başarısız." };
            }
            return NextResponse.json({ error: parseErrorDetail(errBody) }, { status: response.status });
        }

        const result = await response.json();
        const isBatch = req.headers.get("X-Batch-Mode") === "1";
        if (!isBatch) {
            prisma.toolUsage.create({ data: { userId: guard.userId, toolSlug: "ocr-text" } }).catch(() => {});
            if (guard.incrementTrial) {
                incrementTrialUsage(guard.userId).catch(() => {});
            }
        }

        return NextResponse.json({ text: result.text ?? "" });
    } catch (err) {
        console.error("[ocr-text] Error", err);
        return NextResponse.json({ error: "OCR sırasında beklenmeyen bir hata oluştu." }, { status: 500 });
    }
}
