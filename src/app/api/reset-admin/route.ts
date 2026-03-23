import { NextResponse } from "next/server";

/**
 * This route is intentionally disabled in production.
 * Use the seed-admin.js script locally for admin setup:
 *   node seed-admin.js
 *
 * If a one-time reset is ever needed, set ADMIN_RESET_SECRET in .env
 * and pass ?secret=<value> — the route will only execute when that
 * secret is present AND non-empty.
 */
export async function GET(req: Request) {
    const resetSecret = process.env.ADMIN_RESET_SECRET;

    // Disabled by default — env var must be explicitly set
    if (!resetSecret || resetSecret.trim() === "") {
        return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const provided = searchParams.get("secret");

    if (!provided || provided !== resetSecret) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    // Only runs if a valid secret is supplied — no hardcoded password
    const newPassword = process.env.ADMIN_RESET_PASSWORD;
    if (!newPassword || newPassword.length < 12) {
        return NextResponse.json(
            { error: "ADMIN_RESET_PASSWORD must be set and at least 12 characters." },
            { status: 400 }
        );
    }

    try {
        const { PrismaPg } = await import("@prisma/adapter-pg");
        const { PrismaClient } = await import("@prisma/client");
        const bcrypt = await import("bcryptjs");

        const prisma = new PrismaClient({
            adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || "" }),
        });

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const user = await prisma.user.upsert({
            where: { email: "admin@zygsoft.com" },
            update: { password: hashedPassword },
            create: {
                email: "admin@zygsoft.com",
                password: hashedPassword,
                role: "admin",
                emailVerified: true,
            },
        });

        await prisma.$disconnect();
        return NextResponse.json({ success: true, user: user.email });
    } catch {
        // Never expose internal error details
        return NextResponse.json({ error: "Operation failed." }, { status: 500 });
    }
}
