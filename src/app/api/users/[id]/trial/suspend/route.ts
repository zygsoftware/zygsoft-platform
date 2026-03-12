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

        if (user.trialStatus !== "active") {
            return NextResponse.json({ error: "Sadece aktif demo askıya alınabilir." }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: params.id },
            data: {
                trialStatus: "expired",
            },
        });

        return NextResponse.json({ success: true, message: "Demo askıya alındı." });
    } catch (error) {
        console.error("TRIAL_SUSPEND_ERROR", error);
        return NextResponse.json({ error: "Demo askıya alınamadı." }, { status: 500 });
    }
}
