import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

type SessionUser = {
    id?: string;
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
        select: { id: true, role: true, emailVerified: true, email: true },
    });

    return dbUser ? { ...user, ...dbUser } : user;
}

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const user = await resolveSessionUser(session?.user as SessionUser | undefined);
        if (!user?.id) {
            return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
        }

        if (user.role !== "admin" && !user.emailVerified) {
            return NextResponse.json(
                { error: "Beğeni yapmak için e-posta adresinizi doğrulamanız gerekiyor." },
                { status: 403 }
            );
        }

        const params = await props.params;
        const userId = user.id;

        const post = await prisma.blogPost.findUnique({
            where: { id: params.id },
            select: { id: true, published: true },
        });

        if (!post || !post.published) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const existing = await prisma.blogLike.findUnique({
            where: { post_id_user_id: { post_id: params.id, user_id: userId } },
        });

        if (existing) {
            await prisma.blogLike.delete({ where: { id: existing.id } });
            return NextResponse.json({ liked: false });
        }

        await prisma.blogLike.create({
            data: { post_id: params.id, user_id: userId },
        });

        return NextResponse.json({ liked: true });
    } catch (error) {
        console.error("Blog like error:", error);
        return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
    }
}

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const user = await resolveSessionUser(session?.user as SessionUser | undefined);
        const params = await props.params;

        const post = await prisma.blogPost.findUnique({
            where: { id: params.id },
            select: { id: true, _count: { select: { likes: true } } },
        });

        if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

        let userLiked = false;
        if (user?.id) {
            const like = await prisma.blogLike.findUnique({
                where: {
                    post_id_user_id: { post_id: params.id, user_id: user.id },
                },
            });
            userLiked = !!like;
        }

        return NextResponse.json({
            count: post._count.likes,
            liked: userLiked,
        });
    } catch {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
