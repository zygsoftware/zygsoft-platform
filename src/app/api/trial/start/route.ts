import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { trialStartRateLimit } from "@/lib/rate-limit";

const TRIAL_DAYS = 3;
const TRIAL_OPERATIONS_LIMIT = 20;

export async function POST(req: Request) {
    const rl = trialStartRateLimit(req);
    if (rl.limited) {
        return NextResponse.json(
            { error: "Çok fazla istek. Lütfen bir saat sonra tekrar deneyin." },
            { status: 429 }
        );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user?.email) {
        return NextResponse.json({ error: "Geçerli bir e-posta adresi gerekli." }, { status: 400 });
    }

    if (!user.emailVerified) {
        return NextResponse.json(
            { error: "Demo başlatmak için önce e-posta adresinizi doğrulamanız gerekiyor." },
            { status: 403 }
        );
    }

    if (user.trialStatus !== "none") {
        return NextResponse.json(
            { error: "Demo zaten başlatılmış." },
            { status: 400 }
        );
    }

    const now = new Date();
    const endsAt = new Date(now);
    endsAt.setDate(endsAt.getDate() + TRIAL_DAYS);

    let source = "dashboard";
    try {
        const body = await req.json().catch(() => ({}));
        if (body?.source && typeof body.source === "string") {
            const allowed = ["dashboard", "product-page", "tool-page", "onboarding", "banner"];
            source = allowed.includes(body.source) ? body.source : "dashboard";
        }
    } catch {
        // ignore
    }

    await prisma.$transaction([
        prisma.user.update({
            where: { id: user.id },
            data: {
                trialStatus: "active",
                trialStartedAt: now,
                trialEndsAt: endsAt,
                trialOperationsUsed: 0,
                trialOperationsLimit: TRIAL_OPERATIONS_LIMIT,
            },
        }),
        prisma.trialStartEvent.create({
            data: { userId: user.id, source },
        }),
    ]);

    return NextResponse.json({
        success: true,
        message: "Demo başarıyla başlatıldı.",
        trialEndsAt: endsAt.toISOString(),
        trialOperationsLimit: TRIAL_OPERATIONS_LIMIT,
    });
}
