import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetPasswordRateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const rl = resetPasswordRateLimit(req);
  if (rl.limited) {
    return NextResponse.json(
      { error: "Çok fazla istek. Lütfen 15 dakika sonra tekrar deneyin." },
      { status: 429 }
    );
  }

  let body: { token?: string; password?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek. Lütfen tekrar deneyin." },
      { status: 400 }
    );
  }

  const token = body.token?.trim();
  const password = body.password?.trim();
  const locale = body.locale === "en" ? "en" : "tr";

  const genericSuccess =
    locale === "tr"
      ? "Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz."
      : "Your password has been updated. You can now sign in.";

  const genericError =
    locale === "tr"
      ? "Bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir şifre sıfırlama talebi oluşturun."
      : "This link is invalid or has expired. Please request a new password reset.";

  const errorShort =
    locale === "tr"
      ? "Şifre en az 8 karakter olmalıdır."
      : "Password must be at least 8 characters.";

  const errorMismatch =
    locale === "tr" ? "Şifreler eşleşmiyor." : "Passwords do not match.";

  if (!token || !password) {
    return NextResponse.json({ error: genericError }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: errorShort }, { status: 400 });
  }

  try {
    const tokens = await prisma.passwordResetToken.findMany({
      where: { usedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    let matched: (typeof tokens)[0] | null = null;
    for (const t of tokens) {
      const ok = await bcrypt.compare(token, t.tokenHash);
      if (ok) {
        matched = t;
        break;
      }
    }

    if (!matched) {
      return NextResponse.json({ error: genericError }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: matched.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: matched.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ message: genericSuccess }, { status: 200 });
  } catch (err) {
    console.error("[reset-password] ERROR:", err);
    if (err instanceof Error) {
      console.error("[reset-password] Message:", err.message);
    }
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
