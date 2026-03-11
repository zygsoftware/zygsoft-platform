import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Dashboard summary: real counts + recent activity for account center.
 * Single endpoint to avoid multiple round-trips.
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Oturum açmanız gerekiyor." },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const now = new Date();

        // Parallel fetches
        const [payments, tickets, subscriptions, pendingCount, openTicketCount] = await Promise.all([
            prisma.payment.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 8,
                include: {
                    product: { select: { name: true, slug: true } },
                },
            }),
            prisma.supportTicket.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 8,
            }),
            prisma.subscription.findMany({
                where: { userId },
                include: {
                    product: { select: { name: true, slug: true } },
                },
            }),
            prisma.payment.count({
                where: { userId, status: "pending" },
            }),
            prisma.supportTicket.count({
                where: {
                    userId,
                    status: { in: ["open", "in_progress"] },
                },
            }),
        ]);

        // Summary counts
        const pendingPayments = pendingCount;
        const openTickets = openTicketCount;
        const activeServices = subscriptions.filter((s) => {
            if (s.status !== "active") return false;
            return !s.endsAt || new Date(s.endsAt) > now;
        }).length;
        const activeProducts = activeServices; // 1:1 for this schema

        // Recent activity: merge payments + tickets, sort by date desc
        type ActivityItem = {
            id: string;
            type: "payment" | "ticket";
            title: string;
            description: string;
            status: string;
            date: string;
            href?: string;
        };

        const activities: ActivityItem[] = [];

        for (const p of payments.slice(0, 5)) {
            const productName = p.product?.name ?? "Ürün";
            const statusLabel =
                p.status === "approved"
                    ? "Onaylandı"
                    : p.status === "rejected"
                      ? "Reddedildi"
                      : "İncelemede";
            activities.push({
                id: `payment-${p.id}`,
                type: "payment",
                title: productName,
                description: `₺${p.amount.toLocaleString("tr-TR", { minimumFractionDigits: 0 })} · ${statusLabel}`,
                status: p.status,
                date: p.createdAt.toISOString(),
                href: "/dashboard/billing",
            });
        }

        for (const t of tickets.slice(0, 5)) {
            const statusLabel =
                t.status === "open"
                    ? "Açık"
                    : t.status === "in_progress"
                      ? "İnceleniyor"
                      : t.status === "answered"
                        ? "Yanıtlandı"
                        : "Kapalı";
            activities.push({
                id: `ticket-${t.id}`,
                type: "ticket",
                title: t.subject,
                description: statusLabel,
                status: t.status,
                date: t.createdAt.toISOString(),
                href: "/dashboard/support",
            });
        }

        // Sort by date desc and take top 8
        activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const recentActivity = activities.slice(0, 8);

        return NextResponse.json({
            summary: {
                activeProducts,
                activeServices,
                pendingPayments,
                openTickets,
            },
            recentActivity,
        });
    } catch (error) {
        console.error("[dashboard/summary] GET error", error);
        return NextResponse.json(
            { error: "Özet alınırken bir hata oluştu." },
            { status: 500 }
        );
    }
}
