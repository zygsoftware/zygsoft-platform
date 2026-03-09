import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Tüm alanları doldurmak zorunludur." },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Bu e-posta adresi zaten kullanımda." },
                { status: 400 }
            );
        }

        // Add Customer role and default inactive subscription
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "customer"
            },
        });

        return NextResponse.json(
            { message: "Kullanıcı başarıyla oluşturuldu.", user: { email: newUser.email } },
            { status: 201 }
        );
    } catch (error) {
        console.error("CUSTOMER_REGISTER_ERROR", error);
        return NextResponse.json(
            { error: "Bir hata oluştu, lütfen tekrar deneyin." },
            { status: 500 }
        );
    }
}
