import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { existsSync } from "fs";
import path from "path";

const LETTERHEAD_DIR = path.join(process.cwd(), "uploads", "letterheads");
const ALLOWED_EXT = [".udf", ".xml"];

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

function getLetterheadPath(userId: string): string {
    return path.join(LETTERHEAD_DIR, userId, "letterhead");
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
        }

        const activeSlugs = (session.user as any).activeProductSlugs || [];
        const isAdmin = (session.user as any).role === "admin";

        if (!activeSlugs.includes("legal-toolkit") && !isAdmin) {
            return NextResponse.json({
                error: "Dönüştürme aracını kullanmak için 'Hukuk UDF Dönüştürücü' aboneliğinizin aktif olması gerekmektedir."
            }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const targetFormat = (formData.get("format") as string) || "udf";
        const useLetterhead = (formData.get("useLetterhead") as string) || "false";

        if (!file || !(file instanceof Blob) || file.size === 0) {
            return NextResponse.json({ error: "Dosya eksik veya geçersiz. Lütfen bir DOCX dosyası seçin." }, { status: 400 });
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

        if (useLetterhead === "true" || useLetterhead === "1") {
            const basePath = getLetterheadPath(session.user.id);
            let letterheadPath: string | null = null;
            for (const e of ALLOWED_EXT) {
                const p = basePath + e;
                if (existsSync(p)) {
                    letterheadPath = p;
                    break;
                }
            }
            if (!letterheadPath) {
                return NextResponse.json({
                    error: "Antet kullanımı seçildi ancak kayıtlı antet bulunamadı. Lütfen önce antet yükleyin."
                }, { status: 400 });
            }
            const { readFile } = await import("fs/promises");
            const letterheadBuffer = await readFile(letterheadPath);
            const letterheadBlob = new Blob([letterheadBuffer]);
            const letterheadName = path.basename(letterheadPath);
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
            return NextResponse.json({
                error: "Dönüşüm servisine bağlanılamadı. Lütfen daha sonra tekrar deneyin."
            }, { status: 503 });
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
            const userId = session.user.id;
            prisma.toolUsage.create({ data: { userId, toolSlug: "doc-to-udf" } }).catch(() => {});
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
