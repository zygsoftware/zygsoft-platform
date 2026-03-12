import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const bcrypt = require("bcryptjs");

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Yetkisiz erişim. Bu işlem için admin yetkisi gerekmektedir." }, { status: 403 });
        }

        const { name, email, password, role } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Tüm alanları doldurun" }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "Bu e-posta adresi zaten kullanılıyor" }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Şifre en az 6 karakter olmalı" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const assignedRole = role === "admin" ? "admin" : role === "staff" ? "staff" : "customer";

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: assignedRole,
            },
            select: { id: true, name: true, email: true, role: true },
        });

        return NextResponse.json({ success: true, user }, { status: 201 });
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
