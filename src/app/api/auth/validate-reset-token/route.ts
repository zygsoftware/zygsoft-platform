import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export type TokenValidationStatus = "valid" | "expired" | "used" | "invalid";

export async function POST(req: Request) {
  try {
    let body: { token?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ status: "invalid" as TokenValidationStatus }, { status: 200 });
    }

    const token = body.token?.trim();
    if (!token) {
      return NextResponse.json({ status: "invalid" as TokenValidationStatus }, { status: 200 });
    }

    const tokens = await prisma.passwordResetToken.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    for (const t of tokens) {
      const match = await bcrypt.compare(token, t.tokenHash);
      if (!match) continue;

      if (t.usedAt) {
        return NextResponse.json({ status: "used" as TokenValidationStatus }, { status: 200 });
      }
      if (t.expiresAt < new Date()) {
        return NextResponse.json({ status: "expired" as TokenValidationStatus }, { status: 200 });
      }
      return NextResponse.json({ status: "valid" as TokenValidationStatus }, { status: 200 });
    }

    return NextResponse.json({ status: "invalid" as TokenValidationStatus }, { status: 200 });
  } catch (err) {
    console.error("[validate-reset-token] ERROR:", err);
    if (err instanceof Error) {
      console.error("[validate-reset-token] Message:", err.message);
    }
    return NextResponse.json({ status: "invalid" as TokenValidationStatus }, { status: 200 });
  }
}
