import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
    // Rate limit: 3 requests per 60 minutes per IP
    const rl = registerRateLimit(req);
    if (rl.limited) {
        return NextResponse.json(
            { error: "Çok fazla kayıt denemesi yapıldı. Lütfen bir saat sonra tekrar deneyin." },
            { status: 429 }
        );
    }

    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Tüm alanları doldurmak zorunludur." },
                { status: 400 }
            );
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
        if (!isEmailValid || normalizedEmail.length > 254) {
            return NextResponse.json({ error: "Geçerli bir e-posta adresi girin." }, { status: 400 });
        }

        if (String(name).trim().length < 2 || String(name).trim().length > 100) {
            return NextResponse.json({ error: "Ad 2-100 karakter arasında olmalıdır." }, { status: 400 });
        }

        if (String(password).length < 8) {
            return NextResponse.json({ error: "Şifre en az 8 karakter olmalıdır." }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Bu e-posta adresi zaten kullanımda." },
                { status: 400 }
            );
        }

        // Add Customer role and default inactive subscription
        const hashedPassword = await bcrypt.hash(String(password), 12);
        const newUser = await prisma.user.create({
            data: {
                name: String(name).trim(),
                email: normalizedEmail,
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
