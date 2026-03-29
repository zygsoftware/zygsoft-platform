import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { checkToolAccess, incrementTrialUsage } from "@/lib/trial-guard";
import { downloadFromStorage, storageBuckets } from "@/lib/supabase-storage";
import { formatMbLimit, getToolMaxFileBytes } from "@/lib/tool-policy";

const execFileAsync = promisify(execFile);
const udfToolDir = path.join(process.cwd(), "tools", "udf-converter");
const localConverterScript = path.join(udfToolDir, "local_docx_to_udf.py");
const blankTemplatePath = path.join(udfToolDir, "blank_udf_template.xml");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseErrorDetail(body: unknown): string {
    if (!body || typeof body !== "object") return "Dönüşüm başarısız.";
    const obj = body as { detail?: string | { msg?: string }[] };
    if (!obj.detail) return "Dönüşüm başarısız.";
    if (typeof obj.detail === "string") return obj.detail;
    if (Array.isArray(obj.detail)) {
        const first = obj.detail[0];
        return (typeof first === "object" && first?.msg) ? first.msg : String(first || "Dönüşüm başarısız.");
    }
    return "Dönüşüm başarısız.";
}

/** Normalize Unicode to NFC for consistent filename handling. */
function normalizeFilename(name: string): string {
    return name.normalize("NFC");
}

/** Build Content-Disposition with RFC 5987 for non-ASCII filenames. */
function contentDisposition(filename: string): string {
    const safe = filename.replace(/"/g, '\\"');
    if (!/[^\x00-\x7F]/.test(filename)) {
        return `attachment; filename="${safe}"`;
    }
    const encoded = encodeURIComponent(filename);
    return `attachment; filename="document.udf"; filename*=UTF-8''${encoded}`;
}

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
    if (!error || typeof error !== "object") return "Yerel dönüştürücü çalıştırılamadı.";
    const err = error as { stderr?: string | Buffer; stdout?: string | Buffer; message?: string; code?: string | number };
    const raw = [
        typeof err.stderr === "string" ? err.stderr : err.stderr?.toString(),
        typeof err.stdout === "string" ? err.stdout : err.stdout?.toString(),
        err.message,
    ]
        .filter(Boolean)
        .join("\n")
        .trim();

    if (!raw) return "Yerel dönüştürücü çalıştırılamadı.";
    return raw.split("\n").slice(-8).join("\n");
}

async function runLocalDocxConversion(params: {
    file: File;
    letterheadBuffer?: Buffer | null;
    letterheadName?: string | null;
}): Promise<Buffer> {
    const tempDir = await mkdtemp(path.join(tmpdir(), "zyg-udf-"));

    try {
        const inputName = normalizeFilename(params.file.name || "document.docx");
        const inputPath = path.join(tempDir, inputName);
        const outputPath = path.join(tempDir, `${path.parse(inputName).name}.udf`);

        await writeFile(inputPath, Buffer.from(await params.file.arrayBuffer()));

        let letterheadPath = "";
        if (params.letterheadBuffer && params.letterheadName) {
            letterheadPath = path.join(tempDir, normalizeFilename(params.letterheadName));
            await writeFile(letterheadPath, params.letterheadBuffer);
        }

        let lastError: unknown = null;
        for (const pythonBin of getPythonCandidates()) {
            try {
                await execFileAsync(
                    pythonBin,
                    [
                        localConverterScript,
                        inputPath,
                        outputPath,
                        blankTemplatePath,
                        letterheadPath,
                    ],
                    {
                        cwd: udfToolDir,
                        timeout: 90000,
                        maxBuffer: 10 * 1024 * 1024,
                    }
                );

                return await readFile(outputPath);
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

        const session = await getServerSession(authOptions);
        const sessionUserId = session?.user?.id;
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const targetFormat = (formData.get("format") as string) || "udf";
        const useLetterhead = (formData.get("useLetterhead") as string) || "false";

        if (!file || !(file instanceof Blob) || file.size === 0) {
            return NextResponse.json({ error: "Dosya eksik veya geçersiz. Lütfen bir DOCX dosyası seçin." }, { status: 400 });
        }

        const hasPaidAccess = !guard.incrementTrial;
        const maxFileBytes = getToolMaxFileBytes("doc-to-udf", hasPaidAccess, file);

        if (maxFileBytes !== null && file.size > maxFileBytes) {
            return NextResponse.json({ error: `Dosya çok büyük (maks. ${formatMbLimit(maxFileBytes)}).` }, { status: 400 });
        }

        const ext = (file.name || "").split(".").pop()?.toLowerCase();
        if (ext !== "docx") {
            return NextResponse.json({ error: "Sadece .docx dosyaları desteklenmektedir." }, { status: 400 });
        }

        if (targetFormat !== "udf") {
            return NextResponse.json({ error: "Şu an için yalnızca DOCX → UDF dönüşümü desteklenmektedir." }, { status: 400 });
        }

        const microserviceUrl = process.env.UDF_MICROSERVICE_URL || "http://127.0.0.1:8000";
        const apiEndpoint = `${microserviceUrl}/api/convert/doc-to-udf`;

        const proxyFormData = new FormData();
        proxyFormData.append("file", file);
        proxyFormData.append("use_letterhead", useLetterhead === "true" || useLetterhead === "1" ? "true" : "false");

        let letterheadBuffer: Buffer | null = null;
        let letterheadName: string | null = null;

        if (useLetterhead === "true" || useLetterhead === "1") {
            if (!sessionUserId) {
                return NextResponse.json({ error: "Oturum bilgisi bulunamadı." }, { status: 401 });
            }
            const letterhead = await prisma.userLetterhead.findUnique({
                where: { userId: sessionUserId },
            });
            if (!letterhead?.filePath) {
                return NextResponse.json({
                    error: "Antet kullanımı seçildi ancak kayıtlı antet bulunamadı. Lütfen önce antet yükleyin."
                }, { status: 400 });
            }
            letterheadBuffer = Buffer.from(await downloadFromStorage(storageBuckets.letterheads, letterhead.filePath));
            const letterheadBlob = new Blob([new Uint8Array(letterheadBuffer)]);
            letterheadName = letterhead.filePath.split("/").pop() || "letterhead.udf";
            proxyFormData.append("letterhead_file", letterheadBlob, letterheadName);
        }

        let response: Response;
        try {
            response = await fetch(apiEndpoint, {
                method: "POST",
                body: proxyFormData,
                signal: AbortSignal.timeout(60000), // 60s timeout
            });
        } catch (fetchErr: unknown) {
            const err = fetchErr as { name?: string };
            if (err?.name === "AbortError") {
                return NextResponse.json({ error: "İşlem zaman aşımına uğradı." }, { status: 504 });
            }

            try {
                const localOutput = await runLocalDocxConversion({
                    file,
                    letterheadBuffer,
                    letterheadName,
                });
                response = new Response(new Uint8Array(localOutput), {
                    status: 200,
                    headers: {
                        "Content-Type": "application/octet-stream",
                        "X-UDF-Fallback": "local-python",
                    },
                });
            } catch (localErr) {
                console.error("UDF local fallback error:", localErr);
                return NextResponse.json({
                    error: "Dönüşüm servisine bağlanılamadı ve yerel dönüştürücü de çalıştırılamadı. Lütfen daha sonra tekrar deneyin."
                }, { status: 503 });
            }
        }

        if (!response.ok) {
            let errBody: unknown;
            try {
                errBody = await response.json();
            } catch {
                errBody = { detail: "Dönüşüm başarısız." };
            }
            const msg = parseErrorDetail(errBody);
            return NextResponse.json({ error: msg }, { status: response.status });
        }

        const arrayBuffer = await response.arrayBuffer();
        const originalName = normalizeFilename(file.name || "document.docx");
        const baseName = originalName.replace(/\.[^/.]+$/, "") || "document";
        const outputName = `${baseName}.udf`;

        const isBatch = req.headers.get("X-Batch-Mode") === "1";
        if (!isBatch) {
            const userId = session!.user!.id;
            prisma.toolUsage.create({ data: { userId, toolSlug: "doc-to-udf" } }).catch(() => {});
            if (guard.incrementTrial) {
                incrementTrialUsage(userId).catch(() => {});
            }
        }

        const headers = new Headers();
        headers.set("Content-Type", response.headers.get("Content-Type") || "application/octet-stream");
        headers.set("Content-Disposition", contentDisposition(outputName));
        headers.set("Access-Control-Expose-Headers", "Content-Disposition");

        return new NextResponse(arrayBuffer, { status: 200, headers });
    } catch (error) {
        console.error("UDF Conversion API proxy error:", error);
        return NextResponse.json({ error: "Sunucu hatası veya Python servisine erişilemiyor." }, { status: 500 });
    }
}
