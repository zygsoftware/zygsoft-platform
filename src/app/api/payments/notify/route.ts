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

        // Reject oversized receipt uploads (base64 ~4/3 of binary — cap at ~8 MB)
        if (typeof receiptImage === "string" && receiptImage.length > 11_000_000) {
            return NextResponse.json({ error: "Dekont dosyası çok büyük (maks. 8 MB)." }, { status: 400 });
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return NextResponse.json({ error: "Geçersiz tutar." }, { status: 400 });
        }

        // Only accept known product slugs — never create products from user input
        const dbProduct = await prisma.product.findUnique({ where: { slug: String(productId).trim() } });
        if (!dbProduct) {
            return NextResponse.json({ error: "Seçilen ürün bulunamadı." }, { status: 404 });
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
                amount: parsedAmount,
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
