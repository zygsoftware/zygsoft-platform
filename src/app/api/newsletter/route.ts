import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
    const rl = contactRateLimit(req);
    if (rl.limited) {
        return NextResponse.json(
            { error: "Çok fazla istek. Lütfen birkaç dakika sonra tekrar deneyin." },
            { status: 429 }
        );
    }
    try {
        const body = await req.json();
        const email = body.email?.trim()?.toLowerCase();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: "Geçerli bir e-posta adresi girin." }, { status: 400 });
        }
        await prisma.contactMessage.create({
            data: {
                name: "Blog Bülteni",
                email,
                subject: "Blog Bülteni Aboneliği",
                message: "Blog bültenine abone olundu.",
            },
        });
        return NextResponse.json({ message: "Başarıyla abone oldunuz. Teşekkürler!" }, { status: 201 });
    } catch (error) {
        console.error("Newsletter API error:", error);
        return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
    }
}
