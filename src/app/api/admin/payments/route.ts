import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getSubscriptionEndDate } from "@/lib/subscription-utils";

type SessionUser = {
    role?: string;
};

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as SessionUser | undefined)?.role !== "admin") {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const payments = await prisma.payment.findMany({
            include: {
                user: {
                    select: { email: true, subscriptions: true }
                },
                product: {
                    select: { name: true, slug: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ payments });
    } catch {
        return NextResponse.json({ error: "Ödemeler getirilirken hata oluştu." }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as SessionUser | undefined)?.role !== "admin") {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const { paymentId, status } = await req.json();

        if (!paymentId || !status) {
            return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
        }

        const ALLOWED_PAYMENT_STATUSES = ["approved", "rejected", "pending"];
        if (!ALLOWED_PAYMENT_STATUSES.includes(status)) {
            return NextResponse.json({ error: "Geçersiz ödeme durumu." }, { status: 400 });
        }

        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                product: {
                    select: {
                        billingPeriod: true,
                    },
                },
            },
        });
        if (!payment) {
            return NextResponse.json({ error: "Ödeme bulunamadı." }, { status: 404 });
        }

        // Update payment status
        await prisma.payment.update({
            where: { id: paymentId },
            data: { status }
        });

        // If approved, update the subscription using the product billing period.
        if (status === "approved" && payment.productId) {
            const existingSub = await prisma.subscription.findFirst({
                where: { userId: payment.userId, productId: payment.productId }
            });

            const baseDate =
                existingSub?.endsAt && new Date(existingSub.endsAt) > new Date()
                    ? new Date(existingSub.endsAt)
                    : new Date();

            const endDate = getSubscriptionEndDate(payment.product?.billingPeriod, baseDate);

            if (existingSub) {
                await prisma.subscription.update({
                    where: { id: existingSub.id },
                    data: {
                        status: "active",
                        endsAt: endDate
                    }
                });
            } else {
                await prisma.subscription.create({
                    data: {
                        userId: payment.userId,
                        productId: payment.productId,
                        status: "active",
                        endsAt: endDate
                    }
                });
            }
        } else if (status === "rejected" && payment.productId) {
            const existingSub = await prisma.subscription.findFirst({
                where: { userId: payment.userId, productId: payment.productId, status: "pending_approval" }
            });

            if (existingSub) {
                await prisma.subscription.update({
                    where: { id: existingSub.id },
                    data: { status: "inactive" }
                });
            }
        }

        return NextResponse.json({ message: `Ödeme ${status} olarak işaretlendi.` });
    } catch {
        return NextResponse.json({ error: "İşlem sırasında hata oluştu." }, { status: 500 });
    }
}
