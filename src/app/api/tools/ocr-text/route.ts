import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkToolAccess, incrementTrialUsage } from "@/lib/trial-guard";
import { formatMbLimit, getToolMaxFileBytes } from "@/lib/tool-policy";

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
            return NextResponse.json({ error: "OCR servisine bağlanılamadı. Lütfen daha sonra tekrar deneyin." }, { status: 503 });
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
