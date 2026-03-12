import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export type TrialGuardResult =
    | { allowed: true; incrementTrial: boolean; userId: string }
    | { allowed: false; response: NextResponse };

/**
 * Check if user can use a tool. Allows:
 * - Users with active subscription (legal-toolkit)
 * - Admins
 * - Users with active trial (not expired, under limit)
 */
export async function checkToolAccess(): Promise<TrialGuardResult> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return {
            allowed: false,
            response: NextResponse.json(
                { error: "Oturum açmanız gerekiyor." },
                { status: 401 }
            ),
        };
    }

    const activeSlugs = (session.user as any).activeProductSlugs || [];
    const isAdmin = (session.user as any).role === "admin";

    if (activeSlugs.includes("legal-toolkit") || isAdmin) {
        return { allowed: true, incrementTrial: false, userId: session.user.id };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) {
        return {
            allowed: false,
            response: NextResponse.json(
                { error: "Kullanıcı bulunamadı." },
                { status: 404 }
            ),
        };
    }

    if (user.trialStatus !== "active") {
        return {
            allowed: false,
            response: NextResponse.json(
                {
                    error: "Bu aracı kullanmak için Hukuk Araçları Paketi aboneliğinizin aktif olması veya demo başlatmanız gerekmektedir.",
                },
                { status: 403 }
            ),
        };
    }

    const now = new Date();
    if (user.trialEndsAt && now > user.trialEndsAt) {
        await prisma.user.update({
            where: { id: user.id },
            data: { trialStatus: "expired" },
        });
        return {
            allowed: false,
            response: NextResponse.json(
                {
                    error: "Demo süreniz sona erdi. Tam erişim için Hukuk Araçları Paketini satın alın.",
                },
                { status: 403 }
            ),
        };
    }

    const limit = user.trialOperationsLimit ?? 20;
    const used = user.trialOperationsUsed ?? 0;
    if (used >= limit) {
        return {
            allowed: false,
            response: NextResponse.json(
                { error: "Demo kullanım hakkınız doldu." },
                { status: 403 }
            ),
        };
    }

    return { allowed: true, incrementTrial: true, userId: user.id };
}

/**
 * Increment trial operations count. Call this after a successful tool operation.
 */
export async function incrementTrialUsage(userId: string): Promise<void> {
    await prisma.user.update({
        where: { id: userId },
        data: { trialOperationsUsed: { increment: 1 } },
    });
}
