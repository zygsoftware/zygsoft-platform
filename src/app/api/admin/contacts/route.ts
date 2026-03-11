import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") return null;
    return session;
}

export async function GET() {
    try {
        if (!(await requireAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const messages = await prisma.contactMessage.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ messages, total: messages.length });
    } catch (error) {
        return NextResponse.json({ error: "İletişim talepleri getirilirken hata oluştu." }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        if (!(await requireAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const { id, status, adminNote } = await req.json();
        if (!id) {
            return NextResponse.json({ error: "Mesaj ID'si gerekli." }, { status: 400 });
        }

        const ALLOWED_STATUSES = ["new", "contacted", "qualified", "closed"];
        if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
            return NextResponse.json({ error: "Geçersiz durum değeri." }, { status: 400 });
        }

        const updated = await prisma.contactMessage.update({
            where: { id },
            data: {
                ...(status !== undefined && { status }),
                ...(adminNote !== undefined && { adminNote }),
            },
        });

        return NextResponse.json({ message: updated });
    } catch (error) {
        return NextResponse.json({ error: "Güncelleme sırasında hata oluştu." }, { status: 500 });
    }
}
