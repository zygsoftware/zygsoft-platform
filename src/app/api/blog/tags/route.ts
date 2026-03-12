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
        const tags = await prisma.blogTag.findMany({
            orderBy: { name: "asc" },
            include: { _count: { select: { posts: true } } },
        });
        return NextResponse.json(tags);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }
        const body = await req.json();
        const { name, slug } = body;
        if (!name?.trim()) {
            return NextResponse.json({ error: "name zorunludur." }, { status: 400 });
        }
        const slugVal = (slug || name).toString().toLowerCase().replace(/[^a-z0-9ğüşıöç]+/gi, "-").replace(/^-|-$/g, "");
        if (!slugRegex().test(slugVal)) {
            return NextResponse.json({ error: "Geçersiz slug." }, { status: 400 });
        }
        const tag = await prisma.blogTag.create({
            data: { name: name.trim(), slug: slugVal },
        });
        return NextResponse.json(tag);
    } catch (error: any) {
        if (error?.code === "P2002") {
            return NextResponse.json({ error: "Bu slug zaten kullanımda." }, { status: 409 });
        }
        return NextResponse.json({ error: "Etiket oluşturulamadı." }, { status: 500 });
    }
}
