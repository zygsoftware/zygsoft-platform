import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
        }

        const activeSlugs = (session.user as any).activeProductSlugs || [];
        const isAdmin = (session.user as any).role === "admin";

        if (!activeSlugs.includes("udf-toolkit") && !isAdmin) {
            return NextResponse.json({
                error: "Dönüştürme aracını kullanmak için 'Hukuk UDF Dönüştürücü' aboneliğinizin aktif olması gerekmektedir."
            }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const targetFormat = (formData.get("format") as string) || "udf";

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

        let response: Response;
        try {
            response = await fetch(apiEndpoint, {
                method: "POST",
                body: proxyFormData,
                signal: AbortSignal.timeout(60000), // 60s timeout
            });
        } catch (fetchErr: any) {
            if (fetchErr?.name === "AbortError") {
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
        const safeName = file.name.replace(/[^a-zA-Z0-9_\-\u00C0-\u024F\u1E00-\u1EFF\.]/g, "_");
        const baseName = safeName.replace(/\.[^/.]+$/, "") || "document";
        const outputName = `${baseName}.udf`;

        const headers = new Headers();
        headers.set("Content-Type", response.headers.get("Content-Type") || "application/octet-stream");
        headers.set("Content-Disposition", `attachment; filename="${outputName}"`);
        headers.set("Access-Control-Expose-Headers", "Content-Disposition");

        return new NextResponse(arrayBuffer, { status: 200, headers });
    } catch (error) {
        console.error("UDF Conversion API proxy error:", error);
        return NextResponse.json({ error: "Sunucu hatası veya Python servisine erişilemiyor." }, { status: 500 });
    }
}
