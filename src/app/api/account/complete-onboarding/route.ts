import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { onboardingCompleted: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[complete-onboarding] Error:", error);
        return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
    }
}
