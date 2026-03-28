import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { buildStorageObjectPath, storageBuckets, uploadToStorage } from "@/lib/supabase-storage";
import { sendPaymentNotification } from "@/lib/mail";

const KNOWN_PRODUCTS: Record<
    string,
    { name: string; description: string; category: string; price: number; billingPeriod: string; iconType: string }
> = {
    "legal-toolkit": {
        name: "Hukuk Araçları Paketi",
        description: "UYAP uyumlu belge dönüşümü, PDF araçları, OCR ve toplu işlem araçlarını içeren yıllık dijital ürün paketi.",
        category: "legal",
        price: 3000,
        billingPeriod: "yearly",
        iconType: "blocks",
    },
};

type PaymentSessionUser = {
    id: string;
    role?: string | null;
    emailVerified?: boolean | Date | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    company?: string | null;
};

function getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
}

function parseReceiptDataUrl(dataUrl: string): { buffer: Buffer; contentType: string; extension: string } {
    const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
    if (!match) {
        throw new Error("Geçersiz dekont formatı.");
    }

    const [, contentType, base64Body] = match;
    const extensionMap: Record<string, string> = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "application/pdf": ".pdf",
    };
    const extension = extensionMap[contentType];

    if (!extension) {
        throw new Error("Dekont için desteklenmeyen dosya türü.");
    }

    return {
        buffer: Buffer.from(base64Body, "base64"),
        contentType,
        extension,
    };
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
        }

        const user = session.user as PaymentSessionUser;
        if (user.role !== "admin" && !user.emailVerified) {
            return NextResponse.json(
                { error: "Ödeme bildirimi yapmak için e-posta adresinizi doğrulamanız gerekiyor." },
                { status: 403 }
            );
        }

        const { amount, receiptImage, productId, note } = await req.json();

        if (!amount || !productId) {
            return NextResponse.json({ error: "Tutar ve ürün seçimi zorunludur." }, { status: 400 });
        }

        // Reject oversized receipt uploads (base64 ~4/3 of binary — cap at ~8 MB)
        if (typeof receiptImage === "string" && receiptImage.length > 11_000_000) {
            return NextResponse.json({ error: "Dekont dosyası çok büyük (maks. 8 MB)." }, { status: 400 });
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return NextResponse.json({ error: "Geçersiz tutar." }, { status: 400 });
        }

        let receiptUrl: string | null = null;
        if (typeof receiptImage === "string" && receiptImage.trim()) {
            try {
                const parsedReceipt = parseReceiptDataUrl(receiptImage);
                const receiptPath = buildStorageObjectPath([
                    session.user.id,
                    `${Date.now()}-${crypto.randomUUID()}${parsedReceipt.extension}`,
                ]);
                const uploaded = await uploadToStorage({
                    bucket: storageBuckets.payments,
                    objectPath: receiptPath,
                    body: new Uint8Array(parsedReceipt.buffer),
                    contentType: parsedReceipt.contentType,
                    upsert: false,
                });
                receiptUrl = uploaded.publicUrl;
            } catch (receiptError: unknown) {
                return NextResponse.json({ error: getErrorMessage(receiptError, "Dekont yüklenemedi.") }, { status: 400 });
            }
        }

        const normalizedProductSlug = String(productId).trim();
        let dbProduct = await prisma.product.findUnique({ where: { slug: normalizedProductSlug } });

        if (!dbProduct) {
            const fallbackProduct = KNOWN_PRODUCTS[normalizedProductSlug];
            if (!fallbackProduct) {
                return NextResponse.json({ error: "Seçilen ürün bulunamadı." }, { status: 404 });
            }

            dbProduct = await prisma.product.create({
                data: {
                    slug: normalizedProductSlug,
                    name: fallbackProduct.name,
                    description: fallbackProduct.description,
                    category: fallbackProduct.category,
                    price: fallbackProduct.price,
                    billingPeriod: fallbackProduct.billingPeriod,
                    iconType: fallbackProduct.iconType,
                    isActive: true,
                },
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
                amount: parsedAmount,
                receiptImage: receiptUrl,
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

        try {
            await sendPaymentNotification({
                paymentId: newPayment.id,
                createdAt: newPayment.createdAt,
                amount: parsedAmount,
                receiptUrl,
                note: typeof note === "string" && note.trim() ? note.trim() : null,
                productName: dbProduct.name,
                productSlug: dbProduct.slug,
                userName: user.name ?? null,
                userEmail: String(user.email ?? ""),
                userPhone: user.phone ?? null,
                userCompany: user.company ?? null,
            });
        } catch (mailError) {
            console.error("[payments/notify] Payment notification email failed:", mailError);
        }

        return NextResponse.json(
            { message: "Ödeme bildirimi başarıyla alındı.", paymentId: newPayment.id },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error("PAYMENT_NOTIFY_ERROR", error);

        let errorMessage = "Bildirim oluşturulurken hata oluştu.";
        if (error instanceof Error && error.message.includes("product")) {
            errorMessage = "Veritabanı değişikliği algılandı. Lütfen terminali (npm run dev) kapatıp YENİDEN BAŞLATIN.";
        } else if (error instanceof Error && error.message) {
            errorMessage = error.message;
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
