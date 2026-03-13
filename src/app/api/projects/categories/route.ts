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

export async function GET() {
    try {
        const categories = await prisma.projectCategory.findMany({
            orderBy: { name_tr: "asc" },
            include: { _count: { select: { projects: true } } },
        });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }
        const body = await req.json();
        const { name_tr, name_en, slug, description_tr, description_en } = body;
        if (!name_tr?.trim() || !name_en?.trim() || !slug?.trim()) {
            return NextResponse.json({ error: "name_tr, name_en ve slug zorunludur." }, { status: 400 });
        }
        if (!slugRegex().test(slug)) {
            return NextResponse.json({ error: "Geçersiz slug." }, { status: 400 });
        }
        const category = await prisma.projectCategory.create({
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
        return NextResponse.json({ error: "Kategori oluşturulamadı." }, { status: 500 });
    }
}
