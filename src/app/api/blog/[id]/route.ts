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

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const post = await prisma.blogPost.findUnique({
            where: { id: params.id },
            include: {
                category: true,
                tags: { include: { tag: true } },
                _count: { select: { comments: true, likes: true } },
            },
        });
        if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(post);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
    }
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

        if (body.slug !== undefined && !slugRegex().test(body.slug)) {
            return NextResponse.json({ error: "Geçersiz slug." }, { status: 400 });
        }

        const {
            slug,
            title_tr,
            title_en,
            excerpt_tr,
            excerpt_en,
            content_tr,
            content_en,
            cover_image,
            seo_title_tr,
            seo_title_en,
            seo_description_tr,
            seo_description_en,
            seo_keywords_tr,
            seo_keywords_en,
            og_image,
            canonical_url,
            category_id,
            tag_ids,
            is_featured,
            allow_comments,
            status,
            published_at,
            reading_time_min,
        } = body;

        const updateData: any = {};
        if (slug !== undefined) updateData.slug = slug;
        if (title_tr !== undefined) updateData.title_tr = title_tr;
        if (title_en !== undefined) updateData.title_en = title_en;
        if (excerpt_tr !== undefined) updateData.excerpt_tr = excerpt_tr;
        if (excerpt_en !== undefined) updateData.excerpt_en = excerpt_en;
        if (content_tr !== undefined) updateData.content_tr = content_tr;
        if (content_en !== undefined) updateData.content_en = content_en;
        if (cover_image !== undefined) updateData.cover_image = cover_image;
        if (seo_title_tr !== undefined) updateData.seo_title_tr = seo_title_tr;
        if (seo_title_en !== undefined) updateData.seo_title_en = seo_title_en;
        if (seo_description_tr !== undefined) updateData.seo_description_tr = seo_description_tr;
        if (seo_description_en !== undefined) updateData.seo_description_en = seo_description_en;
        if (seo_keywords_tr !== undefined) updateData.seo_keywords_tr = seo_keywords_tr;
        if (seo_keywords_en !== undefined) updateData.seo_keywords_en = seo_keywords_en;
        if (og_image !== undefined) updateData.og_image = og_image;
        if (canonical_url !== undefined) updateData.canonical_url = canonical_url;
        if (category_id !== undefined) updateData.category_id = category_id;
        if (allow_comments !== undefined) updateData.allow_comments = !!allow_comments;
        if (is_featured !== undefined) updateData.is_featured = !!is_featured;
        if (status !== undefined) updateData.published = status === "published";
        if (reading_time_min !== undefined) updateData.reading_time_min = reading_time_min;

        if (status === "published") {
            const existing = await prisma.blogPost.findUnique({ where: { id: params.id } });
            if (existing && !existing.published_at) {
                updateData.published_at = published_at ? new Date(published_at) : new Date();
            } else if (published_at) {
                updateData.published_at = new Date(published_at);
            }
        }

        const post = await prisma.blogPost.update({
            where: { id: params.id },
            data: updateData,
        });

        if (Array.isArray(tag_ids)) {
            await prisma.blogPostTag.deleteMany({ where: { post_id: params.id } });
            const uniqueTagIds = [...new Set(tag_ids)];
            if (uniqueTagIds.length > 0) {
                await prisma.blogPostTag.createMany({
                    data: uniqueTagIds.map((tag_id: string) => ({ post_id: params.id, tag_id })),
                });
            }
        }

        const updated = await prisma.blogPost.findUnique({
            where: { id: params.id },
            include: { category: true, tags: { include: { tag: true } } },
        });
        return NextResponse.json(updated);
    } catch (error: any) {
        if (error?.code === "P2002") {
            return NextResponse.json({ error: `Bu slug zaten kullanımda.` }, { status: 409 });
        }
        return NextResponse.json({ error: "Blog yazısı güncellenemedi." }, { status: 500 });
    }
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
        const { published, is_featured } = body;

        const updateData: any = {};
        if (typeof published === "boolean") {
            updateData.published = published;
            if (published) {
                const existing = await prisma.blogPost.findUnique({ where: { id: params.id }, select: { published_at: true } });
                if (!existing?.published_at) updateData.published_at = new Date();
            }
        }
        if (typeof is_featured === "boolean") updateData.is_featured = is_featured;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "Geçersiz güncelleme." }, { status: 400 });
        }

        const post = await prisma.blogPost.update({
            where: { id: params.id },
            data: updateData,
        });
        return NextResponse.json(post);
    } catch (error) {
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
        await prisma.blogPost.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}
