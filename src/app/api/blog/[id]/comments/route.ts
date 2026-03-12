import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const post = await prisma.blogPost.findUnique({
            where: { id: params.id },
            select: { id: true, published: true, allow_comments: true },
        });

        if (!post || !post.published || !post.allow_comments) {
            return NextResponse.json([]);
        }

        const comments = await prisma.blogComment.findMany({
            where: { post_id: params.id, status: "approved", parent_id: null },
            include: {
                user: { select: { id: true, name: true, image: true } },
                replies: {
                    where: { status: "approved" },
                    include: { user: { select: { id: true, name: true, image: true } } },
                    orderBy: { created_at: "asc" },
                },
            },
            orderBy: { created_at: "asc" },
        });

        return NextResponse.json(comments);
    } catch (error) {
        return NextResponse.json({ error: "Yorumlar alınamadı" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const session = await getServerSession(authOptions);
        const body = await req.json();
        const { content, parent_id, name, email } = body;

        if (!content?.trim()) {
            return NextResponse.json({ error: "Yorum içeriği gerekli" }, { status: 400 });
        }

        const post = await prisma.blogPost.findUnique({
            where: { id: params.id },
            select: { id: true, published: true, allow_comments: true },
        });

        if (!post || !post.published || !post.allow_comments) {
            return NextResponse.json({ error: "Yorumlar kapalı" }, { status: 403 });
        }

        const userId = session?.user ? (session.user as any).id : null;
        const userName = session?.user?.name ?? name?.trim();
        const userEmail = session?.user?.email ?? email?.trim();

        if (!userId && (!userName || !userEmail)) {
            return NextResponse.json({ error: "Ad ve e-posta gerekli (misafir yorumları için)" }, { status: 400 });
        }

        if (userId) {
            const user = session!.user as any;
            if (user.role !== "admin" && !user.emailVerified) {
                return NextResponse.json(
                    { error: "Yorum yazmak için e-posta adresinizi doğrulamanız gerekiyor." },
                    { status: 403 }
                );
            }
        }

        const comment = await prisma.blogComment.create({
            data: {
                post_id: params.id,
                user_id: userId || undefined,
                name: userName || undefined,
                email: userEmail || undefined,
                content: content.trim(),
                status: "pending",
                parent_id: parent_id || undefined,
            },
        });

        return NextResponse.json(comment);
    } catch (error) {
        console.error("Blog comment create error:", error);
        return NextResponse.json({ error: "Yorum gönderilemedi" }, { status: 500 });
    }
}
