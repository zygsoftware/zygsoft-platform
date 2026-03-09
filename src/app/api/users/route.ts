import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 });

        // Prevent admin from deleting themselves
        if (id === (session.user as any).id) {
            return NextResponse.json({ error: "Kendi hesabınızı silemezsiniz." }, { status: 400 });
        }

        // Delete related records first
        await prisma.payment.deleteMany({ where: { userId: id } });
        await prisma.subscription.deleteMany({ where: { userId: id } });
        await prisma.user.delete({ where: { id } });

        return NextResponse.json({ message: "Kullanıcı silindi." });
    } catch (error) {
        console.error("USER_DELETE_ERROR", error);
        return NextResponse.json({ error: "Kullanıcı silinemedi." }, { status: 500 });
    }
}
