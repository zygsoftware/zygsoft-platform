import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordRateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const TOKEN_EXPIRY_HOURS = 1;

/** Generic success message — never reveal whether account exists */
function successMessage(locale: "tr" | "en") {
  return locale === "tr"
    ? "E-posta adresinize şifre sıfırlama bağlantısı gönderildi."
    : "If an account exists, a password reset link has been sent.";
}

/** Build reset URL. localePrefix as-needed: tr = no prefix, en = /en */
function buildResetUrl(token: string, locale: "tr" | "en") {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const pathPrefix = locale === "en" ? "/en" : "";
  return `${siteUrl}${pathPrefix}/reset-password?token=${encodeURIComponent(token)}`;
}

export async function POST(req: Request) {
  const rl = forgotPasswordRateLimit(req);
  if (rl.limited) {
    return NextResponse.json(
      { error: "Çok fazla istek. Lütfen 15 dakika sonra tekrar deneyin." },
      { status: 429 }
    );
  }

  let body: { email?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek. Lütfen tekrar deneyin." },
      { status: 400 }
    );
  }

  const email = body.email?.trim()?.toLowerCase();
  const locale = (body.locale === "en" ? "en" : "tr") as "tr" | "en";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Geçerli bir e-posta adresi girin." },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ message: successMessage(locale) }, { status: 200 });
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
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });
    });

    const resetLink = buildResetUrl(rawToken, locale);

    await sendPasswordResetEmail({
      toEmail: email,
      resetLink,
      locale,
    });

    return NextResponse.json({ message: successMessage(locale) }, { status: 200 });
  } catch (err) {
    console.error("[forgot-password] ERROR:", err);
    if (err instanceof Error) {
      console.error("[forgot-password] Message:", err.message);
    }
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
