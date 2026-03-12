import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendPasswordResetEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const TOKEN_EXPIRY_HOURS = 1;

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user && (session.user as any).role === "admin";
}

function buildResetUrl(token: string, locale: "tr" | "en") {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const pathPrefix = locale === "en" ? "/en" : "";
    return `${siteUrl}${pathPrefix}/reset-password?token=${encodeURIComponent(token)}`;
}

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const params = await props.params;
        const user = await prisma.user.findUnique({
            where: { id: params.id },
            select: { id: true, email: true, name: true, locale: true, password: true },
        });

        if (!user || !user.email) {
            return NextResponse.json({ error: "Kullanıcı veya e-posta bulunamadı." }, { status: 404 });
        }

        if (!user.password) {
            return NextResponse.json({ error: "Bu kullanıcı e-posta ile giriş yapmıyor (OAuth). Şifre sıfırlama gönderilemez." }, { status: 400 });
        }

        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = await bcrypt.hash(rawToken, 10);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

        await prisma.$transaction(async (tx) => {
            await tx.passwordResetToken.updateMany({
                where: { userId: user.id, usedAt: null },
                data: { usedAt: new Date() },
            });
            await tx.passwordResetToken.create({
                data: { userId: user.id, tokenHash, expiresAt },
            });
        });

        const locale = (user.locale === "en" ? "en" : "tr") as "tr" | "en";
        const resetLink = buildResetUrl(rawToken, locale);

        await sendPasswordResetEmail({
            toEmail: user.email,
            resetLink,
            locale,
        });

        return NextResponse.json({ message: "Şifre sıfırlama e-postası gönderildi." });
    } catch (err) {
        console.error("[users/send-reset] ERROR:", err);
        return NextResponse.json({ error: "Şifre sıfırlama e-postası gönderilemedi." }, { status: 500 });
    }
}
