import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
        }

        // Check if user has active "udf-toolkit" subscription
        const activeSlugs = (session.user as any).activeProductSlugs || [];
        const isAdmin = (session.user as any).role === "admin";

        if (!activeSlugs.includes("udf-toolkit") && !isAdmin) {
            return NextResponse.json({
                error: "Dönüştürme aracını kullanmak için 'Hukuk UDF Dönüştürücü' aboneliğinizin aktif olması gerekmektedir."
            }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const targetFormat = formData.get("format") as string; // 'docx' | 'pdf' | 'udf'

        if (!file) {
            return NextResponse.json({ error: "Bilinmeyen veya eksik dosya." }, { status: 400 });
        }

        const microserviceUrl = process.env.UDF_MICROSERVICE_URL || "http://127.0.0.1:8000";
        let apiEndpoint = "";

        // Build the request corresponding to the format.
        // For phase 1 we support DOCX to UDF
        if (targetFormat === "udf" && file.name.toLowerCase().endsWith(".docx")) {
            apiEndpoint = `${microserviceUrl}/api/convert/doc-to-udf`;
        } else {
            return NextResponse.json({ error: "Şu an için yalnızca DOCX -> UDF çevirisi desteklenmektedir." }, { status: 400 });
        }

        // Setup new formdata to proxy to FastAPI
        const proxyFormData = new FormData();
        proxyFormData.append("file", file);

        const response = await fetch(apiEndpoint, {
            method: "POST",
            body: proxyFormData as any,
        });

        if (!response.ok) {
            const err = await response.json();
            return NextResponse.json({ error: err.detail || "Dönüşüm başarısız." }, { status: response.status });
        }

        const arrayBuffer = await response.arrayBuffer();

        const ext = targetFormat;
        const safeName = file.name.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
        const outputName = safeName.substring(0, safeName.lastIndexOf(".")) + "." + ext;

        const headers = new Headers();
        headers.set("Content-Type", response.headers.get("Content-Type") || "application/octet-stream");
        headers.set("Content-Disposition", `attachment; filename="${outputName}"`);
        headers.set("Access-Control-Expose-Headers", "Content-Disposition");

        return new NextResponse(arrayBuffer, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error("UDF Conversion API proxy error:", error);
        return NextResponse.json({ error: "Sunucu hatası veya Python servisine erişilemiyor." }, { status: 500 });
    }
}
