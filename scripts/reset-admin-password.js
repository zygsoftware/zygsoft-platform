/**
 * Admin şifresini veritabanında günceller (admin zaten olsa bile).
 *
 * Kullanım:
 *   ADMIN_PASSWORD='GuvenliSifre123!' node scripts/reset-admin-password.js
 *   (en az 8 karakter; 12+ önerilir)
 *
 * İsteğe bağlı:
 *   ADMIN_EMAIL=admin@zygsoft.com  (varsayılan: admin@zygsoft.com)
 */

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

const email = process.env.ADMIN_EMAIL?.trim() || "admin@zygsoft.com";
const password = process.env.ADMIN_PASSWORD || process.env.ADMIN_INITIAL_PASSWORD;

async function main() {
    if (!password || password.length < 8) {
        console.error("✗ ADMIN_PASSWORD tanımlayın (en az 8 karakter). Örnek:");
        console.error('  ADMIN_PASSWORD="YeniSifreniz123!" npm run reset:admin');
        process.exit(1);
    }
    if (password.length < 12) {
        console.warn("⚠ Şifre 12 karakterden kısa — mümkünse daha uzun ve karmaşık bir şifre kullanın.\n");
    }

    const hash = await bcrypt.hash(password, 12);

    const user = await prisma.user.upsert({
        where: { email },
        update: { password: hash, role: "admin" },
        create: {
            email,
            name: process.env.ADMIN_NAME?.trim() || "Admin",
            password: hash,
            role: "admin",
            emailVerified: true,
        },
    });

    console.log("✓ Admin şifresi güncellendi.");
    console.log("  E-posta:", user.email);
    console.log("  Giriş: /login");
}

main()
    .catch((err) => {
        console.error("Hata:", err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
