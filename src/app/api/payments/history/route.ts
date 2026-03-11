import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
        }

        const payments = await prisma.payment.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            include: {
                product: {
                    select: { id: true, name: true, slug: true },
                },
            },
        });

        // Attach matching subscription status per payment product
        const productIds = [
            ...new Set(payments.map((p) => p.productId).filter(Boolean) as string[]),
        ];

        const subscriptions =
            productIds.length > 0
                ? await prisma.subscription.findMany({
                      where: { userId: session.user.id, productId: { in: productIds } },
                      select: { productId: true, status: true, endsAt: true },
                  })
                : [];

        const subMap = new Map(subscriptions.map((s) => [s.productId, s]));

        const result = payments.map((p) => ({
            id: p.id,
            amount: p.amount,
            status: p.status,
            hasReceipt: Boolean(p.receiptImage),
            receiptImage: p.receiptImage ?? null,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            product: p.product
                ? { id: p.product.id, name: p.product.name, slug: p.product.slug }
                : null,
            subscription: p.productId ? (subMap.get(p.productId) ?? null) : null,
        }));

        return NextResponse.json({ payments: result, total: result.length });
    } catch (error) {
        console.error("[payments/history] GET error", error);
        return NextResponse.json(
            { error: "Ödeme geçmişi alınırken bir hata oluştu." },
            { status: 500 }
        );
    }
}
