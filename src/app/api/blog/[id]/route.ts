import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user && (session.user as any).role === "admin";
}

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
        if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(post);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
    }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }
        const params = await props.params;
        const body = await req.json();

        if (body.slug !== undefined && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug)) {
            return NextResponse.json({ error: "Geçersiz slug. Yalnızca küçük harf, rakam ve tire kullanın." }, { status: 400 });
        }

        const post = await prisma.blogPost.update({
            where: { id: params.id },
            data: body,
        });
        return NextResponse.json(post);
    } catch (error: any) {
        if (error?.code === "P2002") {
            return NextResponse.json({ error: `Bu slug zaten kullanımda: "${error.meta?.target?.[0] ?? "slug"}"` }, { status: 409 });
        }
        return NextResponse.json({ error: "Blog yazısı güncellenemedi." }, { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }
        const params = await props.params;
        await prisma.blogPost.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}
