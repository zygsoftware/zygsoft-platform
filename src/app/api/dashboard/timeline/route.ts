import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import type { TimelineItem } from "@/types/dashboard-timeline";

export const dynamic = "force-dynamic";

export type {
    TimelineItem,
    TimelinePaymentItem,
    TimelineTicketItem,
    TimelineToolItem,
} from "@/types/dashboard-timeline";

/**
 * Unified activity timeline for customer dashboard.
 * Merges payments, support tickets, tool usage. Max 15 items.
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        const [payments, tickets, toolUsages] = await Promise.all([
            prisma.payment.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 8,
                include: { product: { select: { name: true } } },
            }),
            prisma.supportTicket.findMany({
                where: { userId },
                orderBy: { updatedAt: "desc" },
                take: 8,
            }),
            prisma.toolUsage.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 6,
            }),
        ]);

        const items: TimelineItem[] = [];

        for (const p of payments) {
            const productName = p.product?.name ?? null;
            if (p.status === "approved") {
                items.push({
                    kind: "payment",
                    id: `payment-approved-${p.id}`,
                    status: "approved",
                    productName,
                    amount: p.amount,
                    date: p.updatedAt.toISOString(),
                });
            } else if (p.status === "rejected") {
                items.push({
                    kind: "payment",
                    id: `payment-rejected-${p.id}`,
                    status: "rejected",
                    productName,
                    amount: p.amount,
                    date: p.updatedAt.toISOString(),
                });
            } else {
                items.push({
                    kind: "payment",
                    id: `payment-submitted-${p.id}`,
                    status: "pending",
                    productName,
                    amount: p.amount,
                    date: p.createdAt.toISOString(),
                });
            }
        }

        for (const t of tickets) {
            const isUpdated = t.updatedAt.getTime() - t.createdAt.getTime() > 60000;
            const status =
                t.status === "open"
                    ? "open"
                    : t.status === "in_progress"
                      ? "in_progress"
                      : t.status === "answered"
                        ? "answered"
                        : "closed";

            if (isUpdated) {
                items.push({
                    kind: "ticket",
                    id: `ticket-updated-${t.id}`,
                    variant: "updated",
                    subject: t.subject,
                    status,
                    date: t.updatedAt.toISOString(),
                });
            } else {
                items.push({
                    kind: "ticket",
                    id: `ticket-created-${t.id}`,
                    variant: "created",
                    subject: t.subject,
                    status,
                    date: t.createdAt.toISOString(),
                });
            }
        }

        for (const u of toolUsages) {
            items.push({
                kind: "tool",
                id: `tool-${u.id}`,
                toolSlug: u.toolSlug,
                date: u.createdAt.toISOString(),
            });
        }

        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const timeline = items.slice(0, 15);

        return NextResponse.json({ timeline });
    } catch (error) {
        console.error("[dashboard/timeline] GET error", error);
        return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
}
