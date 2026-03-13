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

function toNull(v: unknown): string | null {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    return s === "" ? null : s;
}

function toIntOrNull(v: unknown): number | null {
    if (v === "" || v === undefined || v === null) return null;
    const n = typeof v === "number" ? v : parseInt(String(v), 10);
    return isNaN(n) ? null : n;
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

        if (process.env.NODE_ENV === "development") {
            console.log("[Blog PUT] Request body:", JSON.stringify(body, null, 2).slice(0, 500));
        }

        if (body.slug !== undefined && !slugRegex().test(body.slug)) {
            return NextResponse.json({ error: "Geçersiz slug. Yalnızca küçük harf, rakam ve tire kullanın." }, { status: 400 });
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
            cover_image_alt_tr,
            cover_image_alt_en,
            cover_image_title_tr,
            cover_image_title_en,
            cover_image_caption_tr,
            cover_image_caption_en,
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

        const updateData: Record<string, unknown> = {};
        if (slug !== undefined) updateData.slug = String(slug).trim();
        if (title_tr !== undefined) updateData.title_tr = String(title_tr).trim();
        if (title_en !== undefined) updateData.title_en = String(title_en).trim();
        if (excerpt_tr !== undefined) updateData.excerpt_tr = String(excerpt_tr).trim();
        if (excerpt_en !== undefined) updateData.excerpt_en = String(excerpt_en).trim();
        if (content_tr !== undefined) updateData.content_tr = String(content_tr).trim();
        if (content_en !== undefined) updateData.content_en = String(content_en).trim();
        if (cover_image !== undefined) updateData.cover_image = toNull(cover_image);
        if (cover_image_alt_tr !== undefined) updateData.cover_image_alt_tr = toNull(cover_image_alt_tr);
        if (cover_image_alt_en !== undefined) updateData.cover_image_alt_en = toNull(cover_image_alt_en);
        if (cover_image_title_tr !== undefined) updateData.cover_image_title_tr = toNull(cover_image_title_tr);
        if (cover_image_title_en !== undefined) updateData.cover_image_title_en = toNull(cover_image_title_en);
        if (cover_image_caption_tr !== undefined) updateData.cover_image_caption_tr = toNull(cover_image_caption_tr);
        if (cover_image_caption_en !== undefined) updateData.cover_image_caption_en = toNull(cover_image_caption_en);
        if (seo_title_tr !== undefined) updateData.seo_title_tr = toNull(seo_title_tr);
        if (seo_title_en !== undefined) updateData.seo_title_en = toNull(seo_title_en);
        if (seo_description_tr !== undefined) updateData.seo_description_tr = toNull(seo_description_tr);
        if (seo_description_en !== undefined) updateData.seo_description_en = toNull(seo_description_en);
        if (seo_keywords_tr !== undefined) updateData.seo_keywords_tr = toNull(seo_keywords_tr);
        if (seo_keywords_en !== undefined) updateData.seo_keywords_en = toNull(seo_keywords_en);
        if (og_image !== undefined) updateData.og_image = toNull(og_image);
        if (canonical_url !== undefined) updateData.canonical_url = toNull(canonical_url);
        if (category_id !== undefined) updateData.category_id = toNull(category_id);
        if (allow_comments !== undefined) updateData.allow_comments = !!allow_comments;
        if (is_featured !== undefined) updateData.is_featured = !!is_featured;
        if (status !== undefined) updateData.published = status === "published";
        if (reading_time_min !== undefined) updateData.reading_time_min = toIntOrNull(reading_time_min);

        if (status === "published") {
            const existing = await prisma.blogPost.findUnique({ where: { id: params.id } });
            if (existing && !existing.published_at) {
                updateData.published_at = published_at ? new Date(published_at) : new Date();
            } else if (published_at) {
                updateData.published_at = new Date(published_at);
            }
        }

        const BLOG_POST_UPDATE_FIELDS = [
            "slug", "title_tr", "title_en", "excerpt_tr", "excerpt_en",
            "content_tr", "content_en", "cover_image", "cover_image_alt_tr",
            "cover_image_alt_en", "cover_image_title_tr", "cover_image_title_en",
            "cover_image_caption_tr", "cover_image_caption_en", "seo_title_tr",
            "seo_title_en", "seo_description_tr", "seo_description_en",
            "seo_keywords_tr", "seo_keywords_en", "og_image", "canonical_url",
            "category_id", "allow_comments", "is_featured", "published",
            "published_at", "reading_time_min",
        ] as const;
        const allowed = new Set(BLOG_POST_UPDATE_FIELDS);
        const filteredData: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(updateData)) {
            if (allowed.has(k as (typeof BLOG_POST_UPDATE_FIELDS)[number])) {
                filteredData[k] = v;
            } else if (process.env.NODE_ENV === "development") {
                console.warn(`[Blog PUT] Ignoring unknown field: ${k}`);
            }
        }

        if (process.env.NODE_ENV === "development") {
            console.log("[Blog PUT] Normalized updateData:", JSON.stringify(filteredData, null, 2).slice(0, 800));
        }

        await prisma.blogPost.update({
            where: { id: params.id },
            data: filteredData,
        });

        if (Array.isArray(tag_ids)) {
            await prisma.blogPostTag.deleteMany({ where: { post_id: params.id } });
            const uniqueTagIds = [...new Set(tag_ids)].filter((id): id is string => typeof id === "string" && id.length > 0);
            if (uniqueTagIds.length > 0) {
                await prisma.blogPostTag.createMany({
                    data: uniqueTagIds.map((tag_id) => ({ post_id: params.id, tag_id })),
                });
            }
        }

        const updated = await prisma.blogPost.findUnique({
            where: { id: params.id },
            include: { category: true, tags: { include: { tag: true } } },
        });
        return NextResponse.json(updated);
    } catch (error: unknown) {
        const err = error as { code?: string; message?: string; meta?: { target?: string[] } };
        if (process.env.NODE_ENV === "development") {
            console.error("[Blog PUT] Error:", err);
        }
        if (err?.code === "P2002") {
            const target = err?.meta?.target?.[0] ?? "slug";
            return NextResponse.json({ error: `Bu ${target} zaten kullanımda.` }, { status: 409 });
        }
        if (err?.code === "P2003") {
            return NextResponse.json({ error: "Geçersiz kategori veya etiket ID." }, { status: 400 });
        }
        const msg = err?.message || "Blog yazısı güncellenemedi.";
        return NextResponse.json({ error: msg }, { status: 500 });
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
