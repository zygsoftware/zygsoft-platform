import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkToolAccess, incrementTrialUsage } from "@/lib/trial-guard";
import { formatMbLimit, getToolMaxFileBytes, getToolMaxFiles } from "@/lib/tool-policy";

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

function isTiff(file: File): boolean {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    return ext === "tif" || ext === "tiff";
}

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const guard = await checkToolAccess();
        if (!guard.allowed) return guard.response;

        const hasPaidAccess = !guard.incrementTrial;
        const maxFiles = getToolMaxFiles("tiff-to-pdf", hasPaidAccess);
        const formData = await req.formData();
        const raw = formData.getAll("files");
        const files = raw.filter((f): f is File => f instanceof File && f.size > 0);

        if (files.length === 0) {
            return NextResponse.json({ error: "En az bir TIFF dosyası yükleyin." }, { status: 400 });
        }
        if (maxFiles !== null && files.length > maxFiles) {
            return NextResponse.json({ error: `En fazla ${maxFiles} dosya yükleyebilirsiniz.` }, { status: 400 });
        }

        const proxyFormData = new FormData();
        for (const file of files) {
            if (!isTiff(file)) {
                return NextResponse.json({ error: `"${file.name}" TIFF formatında değil. Sadece .tif ve .tiff kabul edilir.` }, { status: 400 });
            }
            const maxFileBytes = getToolMaxFileBytes("tiff-to-pdf", hasPaidAccess, file);
            if (maxFileBytes !== null && file.size > maxFileBytes) {
                return NextResponse.json({ error: `"${file.name}" dosyası çok büyük (maks. ${formatMbLimit(maxFileBytes)}).` }, { status: 400 });
            }
            proxyFormData.append("files", file);
        }

        const microserviceUrl = process.env.UDF_MICROSERVICE_URL || "http://127.0.0.1:8000";
        let response: Response;
        try {
            response = await fetch(`${microserviceUrl}/api/convert/tiff-to-pdf`, {
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

        const pdfBuffer = await response.arrayBuffer();
        const isBatch = req.headers.get("X-Batch-Mode") === "1";
        if (!isBatch) {
            prisma.toolUsage.create({ data: { userId: guard.userId, toolSlug: "tiff-to-pdf" } }).catch(() => {});
            if (guard.incrementTrial) {
                incrementTrialUsage(guard.userId).catch(() => {});
            }
        }

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": 'attachment; filename="zygsoft_tiff_merged.pdf"',
                "Cache-Control": "no-store",
            },
        });
    } catch (err) {
        console.error("[tiff-to-pdf] Error", err);
        return NextResponse.json({ error: "Dönüştürme sırasında beklenmeyen bir hata oluştu." }, { status: 500 });
    }
}
