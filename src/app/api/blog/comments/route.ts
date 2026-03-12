import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user && (session.user as any).role === "admin";
}

export async function GET(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const postId = searchParams.get("postId");
        const status = searchParams.get("status"); // pending | approved | rejected

        const where: Record<string, unknown> = {};
        if (postId) where.post_id = postId;
        if (status) where.status = status;

        const comments = await prisma.blogComment.findMany({
            where,
            include: {
                post: { select: { id: true, slug: true, title_tr: true, title_en: true } },
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { created_at: "desc" },
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error("Blog comments fetch error:", error);
        return NextResponse.json({ error: "Yorumlar alınamadı" }, { status: 500 });
    }
}
