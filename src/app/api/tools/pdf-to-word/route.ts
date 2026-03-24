import { NextResponse } from "next/server";
import { checkToolAccess, incrementTrialUsage } from "@/lib/trial-guard";
import { formatMbLimit, getToolMaxFileBytes } from "@/lib/tool-policy";

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

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const guard = await checkToolAccess();
        if (!guard.allowed) return guard.response;

        const hasPaidAccess = !guard.incrementTrial;
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof File) || file.size === 0) {
            return NextResponse.json({ error: "Lütfen bir PDF dosyası yükleyin." }, { status: 400 });
        }

        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        if (!isPdf) {
            return NextResponse.json({ error: `"${file.name}" PDF formatında değil.` }, { status: 400 });
        }

        const maxFileBytes = getToolMaxFileBytes("pdf-to-word", hasPaidAccess, file);
        if (maxFileBytes !== null && file.size > maxFileBytes) {
            return NextResponse.json({ error: `Dosya çok büyük (maks. ${formatMbLimit(maxFileBytes)}).` }, { status: 400 });
        }

        const microserviceUrl = process.env.UDF_MICROSERVICE_URL || "http://127.0.0.1:8000";
        const proxyFormData = new FormData();
        proxyFormData.append("file", file);

        let response: Response;
        try {
            response = await fetch(`${microserviceUrl}/api/convert/pdf-to-word`, {
                method: "POST",
                body: proxyFormData,
                signal: AbortSignal.timeout(90000),
            });
        } catch (fetchErr: unknown) {
            const err = fetchErr as { name?: string };
            if (err?.name === "AbortError") {
                return NextResponse.json({ error: "İşlem zaman aşımına uğradı." }, { status: 504 });
            }
            return NextResponse.json({ error: "Dönüştürme servisine bağlanılamadı. Lütfen daha sonra tekrar deneyin." }, { status: 503 });
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

        const outBuffer = await response.arrayBuffer();
        if (guard.incrementTrial) {
            incrementTrialUsage(guard.userId).catch(() => {});
        }

        return new NextResponse(outBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Disposition": 'attachment; filename="zygsoft_document.docx"',
                "Cache-Control": "no-store",
            },
        });
    } catch (err) {
        console.error("[pdf-to-word]", err);
        return NextResponse.json({ error: "Dönüşüm sırasında beklenmeyen bir hata oluştu." }, { status: 500 });
    }
}
