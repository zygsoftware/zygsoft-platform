import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

type SessionUser = {
    id?: string;
    name?: string | null;
    role?: string;
    emailVerified?: boolean;
    email?: string | null;
};

async function resolveSessionUser(user?: SessionUser | null) {
    if (!user) return null;
    if (user.id) return user;
    if (!user.email) return user;

    const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true, name: true, role: true, emailVerified: true, email: true },
    });

    return dbUser ? { ...user, ...dbUser } : user;
}

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
    } catch {
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
        const { content, parent_id } = body;
        const user = await resolveSessionUser(session?.user as SessionUser | undefined);

        if (!user?.id) {
            return NextResponse.json({ error: "Yorum yapmak için giriş yapmanız gerekiyor." }, { status: 401 });
        }

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

        if (user.role !== "admin" && !user.emailVerified) {
            return NextResponse.json(
                { error: "Yorum yazmak için e-posta adresinizi doğrulamanız gerekiyor." },
                { status: 403 }
            );
        }

        const comment = await prisma.blogComment.create({
            data: {
                post_id: params.id,
                user_id: user.id,
                name: user.name ?? undefined,
                email: user.email ?? undefined,
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
