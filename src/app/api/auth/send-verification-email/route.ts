import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { verificationEmailRateLimit } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/mail";
import { getSiteUrl } from "@/lib/site-url";
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
  const siteUrl = getSiteUrl();
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

  let body: { locale?: string; email?: string };
  try {
    body = await req.json().catch(() => ({}));
  } catch {
    return NextResponse.json({ message: genericMessage("tr") }, { status: 200 });
  }

  const locale = (body?.locale === "en" ? "en" : "tr") as "tr" | "en";

  try {
    const session = await getServerSession(authOptions);
    const normalizedEmail = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    const user = session?.user?.id
      ? await prisma.user.findUnique({
          where: { id: session.user.id },
        })
      : normalizedEmail
        ? await prisma.user.findUnique({
            where: { email: normalizedEmail },
          })
        : null;

    if (!user?.email) {
      return NextResponse.json({ message: genericMessage(locale) }, { status: 200 });
    }

    if (user.role !== "customer" || user.status !== "active") {
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
