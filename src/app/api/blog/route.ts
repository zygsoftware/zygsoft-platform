import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

function slugRegex() {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
}

function estimateReadingTime(html: string): number {
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user && (session.user as any).role === "admin";
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const all = searchParams.get("all") === "true";
        const category = searchParams.get("category");
        const tag = searchParams.get("tag");
        const search = searchParams.get("search");
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
        const featured = searchParams.get("featured") === "true";
        const allowComments = searchParams.get("allow_comments");
        const sort = searchParams.get("sort") || "published";

        const where: any = {};
        if (!all) {
            where.published = true;
        }
        if (category) {
            where.category_id = category;
        }
        if (tag) {
            where.tags = { some: { tag: { slug: tag } } };
        }
        if (search) {
            where.OR = [
                { title_tr: { contains: search } },
                { title_en: { contains: search } },
                { excerpt_tr: { contains: search } },
                { excerpt_en: { contains: search } },
            ];
        }
        if (featured) {
            where.is_featured = true;
        }
        if (allowComments === "true") where.allow_comments = true;
        if (allowComments === "false") where.allow_comments = false;

        const orderBy: any[] = sort === "updated"
            ? [{ updated_at: "desc" }]
            : sort === "popular"
                ? [{ view_count: "desc" }, { published_at: "desc" }]
                : [{ is_featured: "desc" }, { published_at: "desc" }];

        const [posts, total] = await Promise.all([
            prisma.blogPost.findMany({
                where,
                include: {
                    category: true,
                    tags: { include: { tag: true } },
                    _count: { select: { comments: true, likes: true } },
                },
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.blogPost.count({ where }),
        ]);

        return NextResponse.json({
            posts,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Blog fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const body = await req.json();
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

        if (!slug || !slugRegex().test(slug)) {
            return NextResponse.json({ error: "Geçersiz slug. Yalnızca küçük harf, rakam ve tire kullanın." }, { status: 400 });
        }
        if (!title_tr?.trim() || !title_en?.trim()) {
            return NextResponse.json({ error: "Başlık (TR ve EN) zorunludur." }, { status: 400 });
        }
        if (!excerpt_tr?.trim() || !excerpt_en?.trim()) {
            return NextResponse.json({ error: "Özet (TR ve EN) zorunludur." }, { status: 400 });
        }
        if (!content_tr?.trim() || !content_en?.trim()) {
            return NextResponse.json({ error: "İçerik (TR ve EN) zorunludur." }, { status: 400 });
        }

        const publishedAt = status === "published" ? (published_at ? new Date(published_at) : new Date()) : null;
        const computedReadingTime = reading_time_min ?? estimateReadingTime(content_tr || content_en || "");

        const post = await prisma.blogPost.create({
            data: {
                slug,
                title_tr: title_tr.trim(),
                title_en: title_en.trim(),
                excerpt_tr: excerpt_tr.trim(),
                excerpt_en: excerpt_en.trim(),
                content_tr: content_tr.trim(),
                content_en: content_en.trim(),
                cover_image: cover_image || null,
                seo_title_tr: seo_title_tr?.trim() || null,
                seo_title_en: seo_title_en?.trim() || null,
                seo_description_tr: seo_description_tr?.trim() || null,
                seo_description_en: seo_description_en?.trim() || null,
                seo_keywords_tr: seo_keywords_tr?.trim() || null,
                seo_keywords_en: seo_keywords_en?.trim() || null,
                og_image: og_image || null,
                canonical_url: canonical_url?.trim() || null,
                category_id: category_id || null,
                allow_comments: allow_comments !== false,
                is_featured: !!is_featured,
                published: status === "published",
                published_at: publishedAt,
                reading_time_min: computedReadingTime,
            },
            include: { category: true, tags: { include: { tag: true } } },
        });

        if (Array.isArray(tag_ids) && tag_ids.length > 0) {
            const uniqueTagIds = [...new Set(tag_ids)];
            await prisma.blogPostTag.createMany({
                data: uniqueTagIds.map((tag_id: string) => ({ post_id: post.id, tag_id })),
            });
        }

        const updated = await prisma.blogPost.findUnique({
            where: { id: post.id },
            include: { category: true, tags: { include: { tag: true } } },
        });
        return NextResponse.json(updated);
    } catch (error: any) {
        if (error?.code === "P2002") {
            return NextResponse.json({ error: `Bu slug zaten kullanımda: "${error.meta?.target?.[0] ?? "slug"}"` }, { status: 409 });
        }
        console.error("Blog create error:", error);
        return NextResponse.json({ error: "Blog yazısı oluşturulamadı." }, { status: 500 });
    }
}
