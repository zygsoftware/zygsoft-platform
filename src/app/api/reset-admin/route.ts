import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import * as bcrypt from "bcryptjs";
import path from "path";

export async function GET() {
    let prisma;
    try {
        const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./dev.db" });
        prisma = new PrismaClient({ adapter });

        const hashedPassword = await bcrypt.hash("admin123", 12);

        const user = await prisma.user.upsert({
            where: { email: "admin@zygsoft.com" },
            update: { password: hashedPassword },
            create: {
                email: "admin@zygsoft.com",
                password: hashedPassword,
                role: "admin"
            },
        });

        return NextResponse.json({
            success: true,
            message: "Admin password reset to admin123",
            user: user.email
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({
            error: "Failed to reset password",
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
