import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { registerRateLimit } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/mail";

const TOKEN_EXPIRY_HOURS = 24;

function buildVerifyUrl(token: string, locale: "tr" | "en") {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const pathPrefix = locale === "en" ? "/en" : "";
  return `${siteUrl}${pathPrefix}/verify-email?token=${encodeURIComponent(token)}`;
}

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
        const { name, email, password, locale: bodyLocale } = await req.json();

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

        const locale = (bodyLocale === "en" ? "en" : "tr") as "tr" | "en";

        const hashedPassword = await bcrypt.hash(String(password), 12);
        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = await bcrypt.hash(rawToken, 10);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

        const newUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name:  String(name).trim(),
                    email: normalizedEmail,
                    password: hashedPassword,
                    role:  "customer",
                    emailVerified: false,
                },
            });
            await tx.emailVerificationToken.create({
                data: {
                    userId:    user.id,
                    tokenHash,
                    expiresAt,
                },
            });
            return user;
        });

        const verifyLink = buildVerifyUrl(rawToken, locale);
        sendVerificationEmail({
            toEmail:  newUser.email!,
            verifyLink,
            locale,
        }).catch((err) => console.error("[register-customer] Verification email failed:", err));

        return NextResponse.json(
            {
                message: "Kullanıcı başarıyla oluşturuldu. E-posta adresinizi doğrulamanız gerekiyor.",
                user:    { email: newUser.email },
            },
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
