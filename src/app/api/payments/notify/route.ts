import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
        }

        const { amount, receiptImage, productId } = await req.json();

        if (!amount || !receiptImage || !productId) {
            return NextResponse.json({ error: "Tutar, dekont görüntüsü ve ürün seçimi zorunludur." }, { status: 400 });
        }

        let dbProduct = await prisma.product.findUnique({ where: { slug: productId } });
        if (!dbProduct) {
            dbProduct = await prisma.product.create({
                data: {
                    name: productId,
                    slug: productId,
                    description: "Hizmet/Ürün"
                }
            });
        }

        // Check if there is already a pending payment for this specific product
        const existingPending = await prisma.payment.findFirst({
            where: {
                userId: session.user.id,
                productId: dbProduct.id,
                status: "pending"
            }
        });

        if (existingPending) {
            return NextResponse.json({ error: "Bu ürün için halihazırda incelemede olan bir ödeme bildiriminiz bulunuyor." }, { status: 400 });
        }

        const newPayment = await prisma.payment.create({
            data: {
                userId: session.user.id,
                productId: dbProduct.id,
                amount: parseFloat(amount),
                receiptImage,
                status: "pending",
            },
        });

        // Upsert subscription: safely handles @@unique([userId, productId]) constraint
        await prisma.subscription.upsert({
            where: { userId_productId: { userId: session.user.id as string, productId: dbProduct.id } },
            update: { status: "pending_approval" },
            create: {
                userId: session.user.id as string,
                productId: dbProduct.id,
                status: "pending_approval"
            }
        });

        return NextResponse.json(
            { message: "Ödeme bildirimi başarıyla alındı.", paymentId: newPayment.id },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("PAYMENT_NOTIFY_ERROR", error);

        let errorMessage = "Bildirim oluşturulurken hata oluştu.";
        if (error?.message && error.message.includes("product")) {
            errorMessage = "Veritabanı değişikliği algılandı. Lütfen terminali (npm run dev) kapatıp YENİDEN BAŞLATIN.";
        } else if (error?.message) {
            errorMessage = error.message;
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
