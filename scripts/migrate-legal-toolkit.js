#!/usr/bin/env node
/**
 * One-time migration: Consolidate all document-tool products to legal-toolkit.
 *
 * - Migrates subscriptions from legacy products → legal-toolkit
 * - Migrates payments from legacy products → legal-toolkit
 * - Deactivates or deletes legacy products
 *
 * Run: node scripts/migrate-legal-toolkit.js
 * Or:  npm run migrate:legal-toolkit (if added to package.json)
 */

const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

// Use same DB as app: DATABASE_URL or ./dev.db (relative to project root when running from scripts/)
const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
const dbPath = dbUrl.replace(/^file:/, "").trim();
const resolvedPath = path.isAbsolute(dbPath)
    ? dbPath
    : path.resolve(path.join(__dirname, "..", path.basename(dbPath) || "dev.db"));
const adapter = new PrismaBetterSqlite3({ url: "file:" + resolvedPath });
const prisma = new PrismaClient({ adapter });

const LEGAL_TOOLKIT_SLUG = "legal-toolkit";

async function main() {
    console.log("🔧 Legal Toolkit Migration\n");
    console.log("Consolidating document-tool products to single product: legal-toolkit\n");

    // 1. Ensure legal-toolkit exists
    let legalProduct = await prisma.product.findUnique({ where: { slug: LEGAL_TOOLKIT_SLUG } });
    if (!legalProduct) {
        legalProduct = await prisma.product.create({
            data: {
                name: "Hukuk Araçları Paketi",
                slug: LEGAL_TOOLKIT_SLUG,
                description: "UYAP ve belge iş akışları için geliştirilmiş profesyonel belge araçları paketi.",
                category: "legal",
                price: 3000,
                iconType: "file-text",
                isActive: true,
            },
        });
        console.log("✓ Created legal-toolkit product");
    } else {
        console.log("✓ legal-toolkit product exists");
    }

    // 2. Find all products that are NOT legal-toolkit
    const allProducts = await prisma.product.findMany();
    const legacyProducts = allProducts.filter((p) => p.slug !== LEGAL_TOOLKIT_SLUG);

    if (legacyProducts.length === 0) {
        console.log("\n✓ No legacy products found. Database is already clean.");
        return;
    }

    console.log("\n📋 Legacy products found:");
    legacyProducts.forEach((p) => console.log(`   - ${p.slug} (${p.name}) [id: ${p.id}]`));

    // 3. Migrate Subscriptions
    let subMigrated = 0;
    let subDeleted = 0;

    for (const oldProduct of legacyProducts) {
        const subs = await prisma.subscription.findMany({
            where: { productId: oldProduct.id },
            include: { user: true },
        });

        for (const sub of subs) {
            const existingLegal = await prisma.subscription.findUnique({
                where: {
                    userId_productId: { userId: sub.userId, productId: legalProduct.id },
                },
            });

            if (existingLegal) {
                // User already has legal-toolkit subscription — keep the better one
                const keepLegal = !sub.endsAt || (existingLegal.endsAt && new Date(sub.endsAt) <= new Date(existingLegal.endsAt));
                if (!keepLegal) {
                    await prisma.subscription.update({
                        where: { id: existingLegal.id },
                        data: {
                            status: sub.status,
                            endsAt: sub.endsAt,
                        },
                    });
                }
                await prisma.subscription.delete({ where: { id: sub.id } });
                subDeleted++;
            } else {
                await prisma.subscription.update({
                    where: { id: sub.id },
                    data: { productId: legalProduct.id },
                });
                subMigrated++;
            }
        }
    }

    console.log(`\n✓ Subscriptions: ${subMigrated} migrated, ${subDeleted} merged/deleted`);

    // 4. Migrate Payments
    let payMigrated = 0;

    for (const oldProduct of legacyProducts) {
        const count = await prisma.payment.updateMany({
            where: { productId: oldProduct.id },
            data: { productId: legalProduct.id },
        });
        payMigrated += count.count;
    }

    console.log(`✓ Payments: ${payMigrated} updated to legal-toolkit`);

    // 5. Deactivate or delete legacy products
    for (const oldProduct of legacyProducts) {
        const paymentCount = await prisma.payment.count({ where: { productId: oldProduct.id } });
        const subCount = await prisma.subscription.count({ where: { productId: oldProduct.id } });

        if (paymentCount > 0 || subCount > 0) {
            console.warn(`   ⚠ ${oldProduct.slug} still has refs (pay: ${paymentCount}, sub: ${subCount}) — deactivating only`);
            await prisma.product.update({
                where: { id: oldProduct.id },
                data: { isActive: false },
            });
        } else {
            await prisma.product.delete({ where: { id: oldProduct.id } });
            console.log(`   ✓ Deleted product: ${oldProduct.slug}`);
        }
    }

    // 6. Verify
    const remaining = await prisma.product.findMany();
    const activeProducts = remaining.filter((p) => p.isActive);

    console.log("\n✅ Migration complete.");
    console.log(`   Active products: ${activeProducts.map((p) => p.slug).join(", ")}`);
    if (activeProducts.length === 1 && activeProducts[0].slug === LEGAL_TOOLKIT_SLUG) {
        console.log("   ✓ Only legal-toolkit is active.");
    }
}

main()
    .catch((e) => {
        console.error("Migration error:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
