import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user && (session.user as { role?: string }).role === "admin";
}

export async function POST(
    _req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const params = await props.params;
        const user = await prisma.user.findUnique({ where: { id: params.id } });
        if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

        if (user.trialStatus !== "none") {
            return NextResponse.json({ error: "Demo zaten başlatılmış." }, { status: 400 });
        }

        const now = new Date();
        const endsAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        await prisma.user.update({
            where: { id: params.id },
            data: {
                trialStatus: "active",
                trialStartedAt: now,
                trialEndsAt: endsAt,
                trialOperationsUsed: 0,
                trialOperationsLimit: 20,
            },
        });

        return NextResponse.json({ success: true, message: "Demo başlatıldı." });
    } catch (error) {
        console.error("TRIAL_START_ERROR", error);
        return NextResponse.json({ error: "Demo başlatılamadı." }, { status: 500 });
    }
}
