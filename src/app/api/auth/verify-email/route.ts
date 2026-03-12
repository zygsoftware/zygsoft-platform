import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "invalid", message: "Geçersiz istek." },
      { status: 400 }
    );
  }

  const token = body.token?.trim();
  if (!token) {
    return NextResponse.json(
      { success: false, error: "invalid", message: "Token gerekli." },
      { status: 400 }
    );
  }

  try {
    const tokens = await prisma.emailVerificationToken.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    for (const t of tokens) {
      const match = await bcrypt.compare(token, t.tokenHash);
      if (match) {
        if (t.expiresAt < now) {
          return NextResponse.json(
            { success: false, error: "expired", message: "Bu bağlantının süresi dolmuş." },
            { status: 400 }
          );
        }
        await prisma.$transaction([
          prisma.emailVerificationToken.delete({ where: { id: t.id } }),
          prisma.user.update({
            where: { id: t.userId },
            data: { emailVerified: true },
          }),
        ]);
        return NextResponse.json({
          success: true,
          message: "E-posta adresiniz başarıyla doğrulandı.",
        });
      }
    }

    return NextResponse.json(
      { success: false, error: "invalid", message: "Geçersiz veya kullanılmış bağlantı." },
      { status: 400 }
    );
  } catch (err) {
    console.error("[verify-email] ERROR:", err);
    return NextResponse.json(
      { success: false, error: "invalid", message: "Bir hata oluştu." },
      { status: 500 }
    );
  }
}
