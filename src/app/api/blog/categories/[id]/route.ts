import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

function slugRegex() {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
}

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user && (session.user as any).role === "admin";
}

export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }
        const params = await props.params;
        const body = await req.json();
        const { name_tr, name_en, slug, description_tr, description_en } = body;

        const updateData: Record<string, unknown> = {};
        if (name_tr?.trim() !== undefined) updateData.name_tr = name_tr.trim();
        if (name_en?.trim() !== undefined) updateData.name_en = name_en.trim();
        if (slug?.trim() !== undefined) {
            if (!slugRegex().test(slug.trim())) {
                return NextResponse.json({ error: "Geçersiz slug." }, { status: 400 });
            }
            updateData.slug = slug.trim();
        }
        if (description_tr !== undefined) updateData.description_tr = description_tr?.trim() || null;
        if (description_en !== undefined) updateData.description_en = description_en?.trim() || null;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "Güncellenecek alan yok." }, { status: 400 });
        }

        const category = await prisma.blogCategory.update({
            where: { id: params.id },
            data: updateData,
        });
        return NextResponse.json(category);
    } catch (error: any) {
        if (error?.code === "P2002") {
            return NextResponse.json({ error: "Bu slug zaten kullanımda." }, { status: 409 });
        }
        return NextResponse.json({ error: "Kategori güncellenemedi." }, { status: 500 });
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

        const count = await prisma.blogPost.count({ where: { category_id: params.id } });
        if (count > 0) {
            return NextResponse.json({
                error: `Bu kategori ${count} yazıda kullanılıyor. Önce yazıların kategorisini değiştirin veya silin.`,
            }, { status: 400 });
        }

        await prisma.blogCategory.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Kategori silinemedi." }, { status: 500 });
    }
}
