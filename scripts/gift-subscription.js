/**
 * Bir kullanıcıya ürün aboneliği hediye eder veya mevcut aboneliğini uzatır.
 *
 * Kullanım:
 *   GIFT_EMAIL='musteri@example.com' npm run gift:subscription
 *
 * İsteğe bağlı:
 *   GIFT_PRODUCT_SLUG=legal-toolkit   (varsayılan: legal-toolkit)
 *   GIFT_MONTHS=12                    (varsayılan: ürünün billingPeriod'una göre; legal-toolkit için 12 ay)
 */

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
}

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const email = process.env.GIFT_EMAIL?.trim().toLowerCase();
const productSlug = process.env.GIFT_PRODUCT_SLUG?.trim() || "legal-toolkit";
const giftMonthsRaw = process.env.GIFT_MONTHS?.trim();

function addMonths(fromDate, months) {
    const next = new Date(fromDate);
    next.setMonth(next.getMonth() + months);
    return next;
}

function getDefaultMonthsForBillingPeriod(billingPeriod) {
    return billingPeriod === "monthly" ? 1 : 12;
}

async function main() {
    if (!email) {
        console.error("✗ GIFT_EMAIL tanımlayın. Örnek:");
        console.error('  GIFT_EMAIL="musteri@example.com" npm run gift:subscription');
        process.exit(1);
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.error(`✗ Kullanıcı bulunamadı: ${email}`);
        process.exit(1);
    }

    const product = await prisma.product.findUnique({
        where: { slug: productSlug },
    });

    if (!product) {
        console.error(`✗ Ürün bulunamadı: ${productSlug}`);
        process.exit(1);
    }

    const defaultMonths = getDefaultMonthsForBillingPeriod(product.billingPeriod);
    const giftMonths = giftMonthsRaw ? Number(giftMonthsRaw) : defaultMonths;

    if (!Number.isFinite(giftMonths) || giftMonths <= 0) {
        console.error("✗ GIFT_MONTHS pozitif bir sayı olmalı.");
        process.exit(1);
    }

    const existingSubscription = await prisma.subscription.findUnique({
        where: {
            userId_productId: {
                userId: user.id,
                productId: product.id,
            },
        },
    });

    const now = new Date();
    const baseDate =
        existingSubscription?.endsAt && new Date(existingSubscription.endsAt) > now
            ? new Date(existingSubscription.endsAt)
            : now;

    const endsAt = addMonths(baseDate, giftMonths);

    const subscription = await prisma.subscription.upsert({
        where: {
            userId_productId: {
                userId: user.id,
                productId: product.id,
            },
        },
        update: {
            status: "active",
            endsAt,
        },
        create: {
            userId: user.id,
            productId: product.id,
            status: "active",
            endsAt,
        },
    });

    console.log("✓ Hediye abonelik tanımlandı.");
    console.log("  Kullanıcı:", user.email);
    console.log("  Ürün:", product.slug);
    console.log("  Süre:", `${giftMonths} ay`);
    console.log("  Durum:", subscription.status);
    console.log("  Bitiş:", endsAt.toISOString());
}

main()
    .catch((err) => {
        console.error("Hata:", err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
