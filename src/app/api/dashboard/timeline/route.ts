import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export type TimelineEventType =
    | "payment_submitted"
    | "payment_approved"
    | "payment_rejected"
    | "ticket_created"
    | "ticket_updated"
    | "tool_used";

export type TimelineEvent = {
    id: string;
    type: TimelineEventType;
    title: string;
    description: string;
    date: string;
    href?: string;
};

/**
 * Unified activity timeline for customer dashboard.
 * Merges payments, support tickets, tool usage. Max 15 items.
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

        // Parallel fetches - each limited for performance
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

        const events: TimelineEvent[] = [];

        for (const p of payments) {
            const productName = p.product?.name ?? "Ürün";
            const amountStr = `₺${p.amount.toLocaleString("tr-TR", { minimumFractionDigits: 0 })}`;

            if (p.status === "approved") {
                events.push({
                    id: `payment-approved-${p.id}`,
                    type: "payment_approved",
                    title: productName,
                    description: `${amountStr} · Onaylandı`,
                    date: p.updatedAt.toISOString(),
                    href: "/dashboard/billing",
                });
            } else if (p.status === "rejected") {
                events.push({
                    id: `payment-rejected-${p.id}`,
                    type: "payment_rejected",
                    title: productName,
                    description: `${amountStr} · Reddedildi`,
                    date: p.updatedAt.toISOString(),
                    href: "/dashboard/billing",
                });
            } else {
                events.push({
                    id: `payment-submitted-${p.id}`,
                    type: "payment_submitted",
                    title: productName,
                    description: `${amountStr} · İncelemede`,
                    date: p.createdAt.toISOString(),
                    href: "/dashboard/billing",
                });
            }
        }

        for (const t of tickets) {
            const isUpdated = t.updatedAt.getTime() - t.createdAt.getTime() > 60000;
            const statusLabel =
                t.status === "open"
                    ? "Açık"
                    : t.status === "in_progress"
                      ? "İnceleniyor"
                      : t.status === "answered"
                        ? "Yanıtlandı"
                        : "Kapalı";

            if (isUpdated) {
                events.push({
                    id: `ticket-updated-${t.id}`,
                    type: "ticket_updated",
                    title: t.subject,
                    description: statusLabel,
                    date: t.updatedAt.toISOString(),
                    href: "/dashboard/support",
                });
            } else {
                events.push({
                    id: `ticket-created-${t.id}`,
                    type: "ticket_created",
                    title: t.subject,
                    description: statusLabel,
                    date: t.createdAt.toISOString(),
                    href: "/dashboard/support",
                });
            }
        }

        const TOOL_META: Record<string, { label: string; desc: string; href: string }> = {
            "doc-to-udf":     { label: "DOCX → UDF dönüştürüldü", desc: "Hukuk UDF Dönüştürücü", href: "/dashboard/tools/doc-to-udf" },
            "pdf-split":      { label: "PDF bölündü", desc: "PDF Bölme Aracı", href: "/dashboard/tools/pdf-split" },
            "pdf-merge":      { label: "PDF birleştirildi", desc: "PDF Birleştirici", href: "/dashboard/tools/pdf-merge" },
            "image-to-pdf":   { label: "Görsel → PDF", desc: "Görsel → PDF Dönüştürücü", href: "/dashboard/tools/image-to-pdf" },
            "pdf-to-image":   { label: "PDF → Görsel", desc: "PDF → Görsel Dönüştürücü", href: "/dashboard/tools/pdf-to-image" },
            "tiff-to-pdf":    { label: "TIFF → PDF", desc: "TIFF → PDF Dönüştürücü", href: "/dashboard/tools/tiff-to-pdf" },
            "ocr-text":       { label: "OCR Metin Çıkarma", desc: "OCR Metin Çıkarma", href: "/dashboard/tools/ocr-text" },
            "batch-convert":  { label: "Toplu Belge Dönüştürücü", desc: "Toplu Belge Dönüştürücü", href: "/dashboard/tools/batch-convert" },
        };
        for (const u of toolUsages) {
            const meta = TOOL_META[u.toolSlug] ?? { label: "Araç kullanıldı", desc: u.toolSlug, href: "/dashboard/tools" };
            events.push({
                id: `tool-${u.id}`,
                type: "tool_used",
                title: meta.label,
                description: meta.desc,
                date: u.createdAt.toISOString(),
                href: meta.href,
            });
        }

        events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const timeline = events.slice(0, 15);

        return NextResponse.json({ timeline });
    } catch (error) {
        console.error("[dashboard/timeline] GET error", error);
        return NextResponse.json(
            { error: "Zaman çizelgesi alınırken bir hata oluştu." },
            { status: 500 }
        );
    }
}
