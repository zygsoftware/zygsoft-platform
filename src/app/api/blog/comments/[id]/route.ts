import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user && (session.user as any).role === "admin";
}

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const params = await props.params;
        const body = await req.json();
        const { status } = body; // approved | rejected

        if (!["approved", "rejected"].includes(status)) {
            return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
        }

        const comment = await prisma.blogComment.update({
            where: { id: params.id },
            data: { status },
        });

        return NextResponse.json(comment);
    } catch (error) {
        console.error("Blog comment update error:", error);
        return NextResponse.json({ error: "Yorum güncellenemedi" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const params = await props.params;
        await prisma.blogComment.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Blog comment delete error:", error);
        return NextResponse.json({ error: "Yorum silinemedi" }, { status: 500 });
    }
}
