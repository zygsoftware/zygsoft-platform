import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 400 });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: {
                id: true,
                emailVerified: true,
                password: true,
                role: true,
                status: true,
            },
        });

        if (!user || user.status !== "active") {
            return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
        }

        const isValid = await bcrypt.compare(String(password), user.password || "");
        if (!isValid) {
            return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
        }

        if (user.role === "customer" && !user.emailVerified) {
            return NextResponse.json({ error: "EMAIL_NOT_VERIFIED" }, { status: 403 });
        }

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        console.error("[login-precheck] ERROR:", error);
        return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
    }
}
