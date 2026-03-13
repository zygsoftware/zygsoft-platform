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
        if (!name_tr?.trim() || !name_en?.trim() || !slug?.trim()) {
            return NextResponse.json({ error: "name_tr, name_en ve slug zorunludur." }, { status: 400 });
        }
        if (!slugRegex().test(slug)) {
            return NextResponse.json({ error: "Geçersiz slug." }, { status: 400 });
        }
        const category = await prisma.projectCategory.update({
            where: { id: params.id },
            data: {
                name_tr: name_tr.trim(),
                name_en: name_en.trim(),
                slug: slug.trim(),
                description_tr: description_tr?.trim() || null,
                description_en: description_en?.trim() || null,
            },
        });
        return NextResponse.json(category);
    } catch (error: unknown) {
        const err = error as { code?: string };
        if (err?.code === "P2002") {
            return NextResponse.json({ error: "Bu slug zaten kullanımda." }, { status: 409 });
        }
        if (err?.code === "P2025") {
            return NextResponse.json({ error: "Kategori bulunamadı." }, { status: 404 });
        }
        return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 500 });
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
        const cat = await prisma.projectCategory.findUnique({
            where: { id: params.id },
            include: { _count: { select: { projects: true } } },
        });
        if (!cat) return NextResponse.json({ error: "Kategori bulunamadı." }, { status: 404 });
        if (cat._count.projects > 0) {
            return NextResponse.json({ error: `Bu kategori ${cat._count.projects} projede kullanılıyor. Önce projelerin kategorisini değiştirin.` }, { status: 400 });
        }
        await prisma.projectCategory.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Silme başarısız." }, { status: 500 });
    }
}
