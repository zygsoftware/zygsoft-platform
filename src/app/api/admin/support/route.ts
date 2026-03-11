import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = ["open", "in_progress", "answered", "closed"];

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") return null;
    return session;
}

/* ── GET — all tickets, newest first, with user info ── */
export async function GET() {
    try {
        if (!(await requireAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const tickets = await prisma.supportTicket.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });

        return NextResponse.json({ tickets, total: tickets.length });
    } catch (error) {
        console.error("[admin/support] GET error", error);
        return NextResponse.json({ error: "Destek talepleri alınırken hata oluştu." }, { status: 500 });
    }
}

/* ── PUT — update ticket status ── */
export async function PUT(req: Request) {
    try {
        if (!(await requireAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const { id, status } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Talep ID'si gerekli." }, { status: 400 });
        }
        if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
            return NextResponse.json({ error: "Geçersiz durum değeri." }, { status: 400 });
        }

        const updated = await prisma.supportTicket.update({
            where: { id },
            data:  { ...(status !== undefined && { status }) },
        });

        return NextResponse.json({ ticket: updated });
    } catch (error) {
        console.error("[admin/support] PUT error", error);
        return NextResponse.json({ error: "Güncelleme sırasında hata oluştu." }, { status: 500 });
    }
}
