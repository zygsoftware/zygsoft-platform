import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Oturum açmanız gerekiyor." },
                { status: 401 }
            );
        }

        const subscriptions = await prisma.subscription.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                        category: true,
                        price: true,
                    },
                },
            },
        });

        // Fetch the most recent payment per product for each subscription
        const productIds = subscriptions
            .map((s) => s.productId)
            .filter(Boolean) as string[];

        const latestPayments =
            productIds.length > 0
                ? await prisma.payment.findMany({
                      where: { userId: session.user.id, productId: { in: productIds } },
                      orderBy: { createdAt: "desc" },
                      select: {
                          productId: true,
                          status: true,
                          amount: true,
                          createdAt: true,
                      },
                  })
                : [];

        // Keep only the first (newest) payment per product
        const paymentMap = new Map<string, (typeof latestPayments)[0]>();
        for (const p of latestPayments) {
            if (p.productId && !paymentMap.has(p.productId)) {
                paymentMap.set(p.productId, p);
            }
        }

        const now = new Date();

        const result = subscriptions.map((sub) => {
            const latestPayment = paymentMap.get(sub.productId) ?? null;

            // Derived presentation status
            let derivedStatus: "active" | "expired" | "pending_approval" | "payment_rejected" | "inactive";

            if (sub.status === "active") {
                derivedStatus =
                    sub.endsAt && new Date(sub.endsAt) < now ? "expired" : "active";
            } else if (sub.status === "pending_approval") {
                derivedStatus = "pending_approval";
            } else {
                // inactive — refine by latest payment outcome
                derivedStatus =
                    latestPayment?.status === "rejected" ? "payment_rejected" : "inactive";
            }

            return {
                subscriptionId: sub.id,
                productId: sub.product.id,
                productName: sub.product.name,
                productDescription: sub.product.description,
                productSlug: sub.product.slug,
                productCategory: sub.product.category,
                productPrice: sub.product.price,
                subscriptionStatus: sub.status,
                derivedStatus,
                endsAt: sub.endsAt ? sub.endsAt.toISOString() : null,
                startedAt: sub.createdAt.toISOString(),
                latestPayment: latestPayment
                    ? {
                          status: latestPayment.status,
                          amount: latestPayment.amount,
                          createdAt: latestPayment.createdAt.toISOString(),
                      }
                    : null,
            };
        });

        return NextResponse.json({ services: result, total: result.length });
    } catch (error) {
        console.error("[dashboard/services] GET error", error);
        return NextResponse.json(
            { error: "Hizmet bilgileri alınırken bir hata oluştu." },
            { status: 500 }
        );
    }
}
