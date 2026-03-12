import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getDisplayTicketCode } from "@/lib/support-ticket";
import { sendSupportTicketReplyEmail } from "@/lib/mail";

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

/* ── PUT — update ticket status and/or admin reply ── */
export async function PUT(req: Request) {
    try {
        if (!(await requireAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const { id, status, reply } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Talep ID'si gerekli." }, { status: 400 });
        }
        if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
            return NextResponse.json({ error: "Geçersiz durum değeri." }, { status: 400 });
        }

        const replyText = typeof reply === "string" ? reply.trim() : null;
        const updateData: { status?: string; adminReply?: string; lastRepliedAt?: Date } = {};
        if (status !== undefined) updateData.status = status;
        if (replyText) {
            updateData.adminReply = replyText;
            updateData.lastRepliedAt = new Date();
        }

        const updated = await prisma.supportTicket.update({
            where: { id },
            data:  updateData,
            include: { user: { select: { id: true, name: true, email: true, locale: true } } },
        });

        if (replyText && updated.user?.email) {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
            const locale = (updated.user.locale === "en" ? "en" : "tr") as "tr" | "en";
            const pathPrefix = locale === "en" ? "/en" : "";
            const panelLink = `${siteUrl}${pathPrefix}/dashboard/support`;
            const ticketCode = getDisplayTicketCode(updated);

            sendSupportTicketReplyEmail({
                toEmail:   updated.user.email,
                ticketCode,
                subject:   updated.subject,
                adminReply: replyText,
                panelLink,
                locale,
            }).catch((err) => console.error("[admin/support] Reply mail failed:", err));
        }

        return NextResponse.json({ ticket: updated });
    } catch (error) {
        console.error("[admin/support] PUT error", error);
        return NextResponse.json({ error: "Güncelleme sırasında hata oluştu." }, { status: 500 });
    }
}
