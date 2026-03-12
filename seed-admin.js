/**
 * seed-admin.js
 * Creates the initial admin user if one does not already exist.
 *
 * Usage:
 *   node seed-admin.js
 *   npm run seed:admin
 *
 * Environment variables (optional):
 *   ADMIN_EMAIL     — admin email (default: admin@zygsoft.com)
 *   ADMIN_PASSWORD — admin password (or use ADMIN_INITIAL_PASSWORD)
 *   ADMIN_NAME     — admin display name (default: null)
 *
 * Recommended (production) — supply credentials via env vars:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='YourSecurePass123!' node seed-admin.js
 *
 * ⚠️  IMPORTANT — the built-in fallback password is intentionally weak and well-known.
 * It MUST NOT remain active in production. Change it immediately after first login.
 */

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

const DEFAULT_EMAIL = "admin@zygsoft.com";
const FALLBACK_PASSWORD = "Zygsoft2024!";

const email = process.env.ADMIN_EMAIL?.trim() || DEFAULT_EMAIL;
const password = process.env.ADMIN_PASSWORD || process.env.ADMIN_INITIAL_PASSWORD || FALLBACK_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || null;

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
    console.warn("║  ADMIN_PASSWORD='YourPass!' node seed-admin.js               ║");
    console.warn("╚══════════════════════════════════════════════════════════════╝");
    console.warn("");
}

async function main() {
    const existing = await prisma.user.findFirst({
        where: { role: "admin" },
    });

    if (existing) {
        console.log("✓ Admin user already exists:", existing.email);
        console.log("  (password was NOT changed — use /api/reset-admin or seed:admin with new env vars)");
        return;
    }

    // Check if the specific email exists (might be customer)
    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail) {
        if (existingByEmail.role === "admin") {
            console.log("✓ Admin user already exists:", email);
            return;
        }
        console.error("✗ A user with email", email, "already exists with role:", existingByEmail.role);
        console.error("  Use a different ADMIN_EMAIL or promote the user manually.");
        process.exit(1);
    }

    const hash = await bcrypt.hash(password, 12);
    await prisma.user.create({
        data: {
            email,
            name: name || "Admin",
            password: hash,
            role: "admin",
            emailVerified: new Date(),
        },
    });

    console.log("✓ Admin user created successfully!");
    console.log("  Email:", email);
    console.log("  Name:", name || "Admin");
    console.log("  Role:  admin");

    if (password === FALLBACK_PASSWORD) {
        console.warn("");
        console.warn("  ⚠️  Password is the default. Change it before going live!");
    } else {
        console.log("  Password: (from ADMIN_PASSWORD / ADMIN_INITIAL_PASSWORD)");
    }
}

main()
    .catch((err) => {
        console.error("Seed admin error:", err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
