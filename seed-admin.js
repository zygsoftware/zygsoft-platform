/**
 * seed-admin.js
 * Creates the initial admin user if one does not already exist.
 *
 * Usage:
 *   node seed-admin.js
 *
 * Recommended (production) — supply the password via env var so it is never
 * stored in shell history or commit history:
 *   ADMIN_INITIAL_PASSWORD='YourSecurePassword123!' node seed-admin.js
 *
 * ⚠️  IMPORTANT — change the admin password immediately after first login on
 * any production server. The built-in fallback password below is intentionally
 * weak and well-known; it MUST NOT remain active in production.
 */

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const FALLBACK_PASSWORD = "Zygsoft2024!";
const password = process.env.ADMIN_INITIAL_PASSWORD || FALLBACK_PASSWORD;

if (password === FALLBACK_PASSWORD) {
    console.warn("");
    console.warn("╔══════════════════════════════════════════════════════════════╗");
    console.warn("║  ⚠️  SECURITY WARNING                                         ║");
    console.warn("║                                                              ║");
    console.warn("║  Using the default admin password: Zygsoft2024!              ║");
    console.warn("║                                                              ║");
    console.warn("║  This password is publicly known. Change it immediately      ║");
    console.warn("║  after the first login, or supply a custom password via:     ║");
    console.warn("║                                                              ║");
    console.warn("║  ADMIN_INITIAL_PASSWORD='YourPass!' node seed-admin.js       ║");
    console.warn("╚══════════════════════════════════════════════════════════════╝");
    console.warn("");
}

async function main() {
    const email = "admin@zygsoft.com";
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
        console.log("✓ Admin user already exists:", email);
        console.log("  (password was NOT changed — run /api/reset-admin if needed)");
        return;
    }

    const hash = await bcrypt.hash(password, 12);
    await prisma.user.create({
        data: {
            email,
            password: hash,
            role: "admin",
        },
    });

    console.log("✓ Admin user created successfully!");
    console.log("  Email:", email);
    console.log("  Role:  admin");

    if (password === FALLBACK_PASSWORD) {
        console.warn("");
        console.warn("  ⚠️  Password is the default. Change it before going live!");
    } else {
        console.log("  Password: (custom — from ADMIN_INITIAL_PASSWORD env var)");
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
