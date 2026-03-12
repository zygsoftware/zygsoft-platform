import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { verificationEmailRateLimit } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const TOKEN_EXPIRY_HOURS = 24;

/** Generic response — never reveal whether user exists or is already verified */
function genericMessage(locale: "tr" | "en") {
  return locale === "tr"
    ? "Uygun ise doğrulama bağlantısı gönderildi."
    : "If applicable, a verification link has been sent.";
}

function buildVerifyUrl(token: string, locale: "tr" | "en") {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const pathPrefix = locale === "en" ? "/en" : "";
  return `${siteUrl}${pathPrefix}/verify-email?token=${encodeURIComponent(token)}`;
}

export async function POST(req: Request) {
  const rl = verificationEmailRateLimit(req);
  if (rl.limited) {
    return NextResponse.json(
      { error: "Çok fazla istek. Lütfen bir saat sonra tekrar deneyin." },
      { status: 429 }
    );
  }

  let body: { locale?: string };
  try {
    body = await req.json().catch(() => ({}));
  } catch {
    return NextResponse.json({ message: genericMessage("tr") }, { status: 200 });
  }

  const locale = (body?.locale === "en" ? "en" : "tr") as "tr" | "en";

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: genericMessage(locale) }, { status: 200 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.email) {
      return NextResponse.json({ message: genericMessage(locale) }, { status: 200 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: genericMessage(locale) }, { status: 200 });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

    await prisma.$transaction(async (tx) => {
      await tx.emailVerificationToken.deleteMany({ where: { userId: user.id } });
      await tx.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });
    });

    const verifyLink = buildVerifyUrl(rawToken, locale);

    await sendVerificationEmail({
      toEmail: user.email,
      verifyLink,
      locale,
    });

    return NextResponse.json({ message: genericMessage(locale) }, { status: 200 });
  } catch (err) {
    console.error("[send-verification-email] ERROR:", err);
    return NextResponse.json({ message: genericMessage(locale) }, { status: 200 });
  }
}
