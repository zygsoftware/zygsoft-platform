import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlogDetailClient from "./BlogDetailClient";
import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zygsoft.com";

type Props = { params: Promise<{ slug: string; locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, locale } = await params;
    const post = await prisma.blogPost.findUnique({ where: { slug }, include: { category: true } });
    if (!post) return { title: "Blog Yazısı Bulunamadı", description: "" };
    if (!post.published) return { title: "Taslak", robots: { index: false, follow: false } };

    const isEn = locale === "en";
    const title = (isEn ? (post.seo_title_en || post.title_en) : (post.seo_title_tr || post.title_tr)) + " | ZYGSOFT Blog";
    const description = isEn ? (post.seo_description_en || post.excerpt_en) : (post.seo_description_tr || post.excerpt_tr);
    const image = post.og_image || post.cover_image;
    const prefix = isEn ? `${SITE_URL}/en` : SITE_URL;
    const canonical = post.canonical_url?.trim() || `${prefix}/blog/${slug}`;
    const languages = {
        tr: `${SITE_URL}/blog/${slug}`,
        en: `${SITE_URL}/en/blog/${slug}`,
    };

    return {
        title,
        description,
        alternates: {
            canonical,
            languages,
        },
        openGraph: {
            title,
            description,
            images: image ? [{ url: image.startsWith("http") ? image : `${SITE_URL}${image}` }] : [],
            type: "article",
            publishedTime: post.published_at?.toISOString(),
            modifiedTime: post.updated_at?.toISOString(),
            url: canonical,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: image ? [image.startsWith("http") ? image : `${SITE_URL}${image}`] : [],
        },
    };
}

export default async function BlogDetailPage({ params }: Props) {
    const { slug, locale } = await params;
    const post = await prisma.blogPost.findUnique({
        where: { slug },
        include: { category: true, tags: { include: { tag: true } } },
    });

    if (!post || !post.published) {
        notFound();
    }

    const isEn = locale === "en";
    const prefix = isEn ? `${SITE_URL}/en` : SITE_URL;
    const pageUrl = `${prefix}/blog/${slug}`;

    const contentText = (isEn ? post.content_en : post.content_tr) || "";
    const wordCount = contentText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().split(/\s+/).filter(Boolean).length;

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Article",
                "@id": `${pageUrl}#article`,
                "mainEntityOfPage": { "@type": "WebPage", "@id": pageUrl },
                "headline": isEn ? post.title_en : post.title_tr,
                "description": isEn ? (post.seo_description_en || post.excerpt_en) : (post.seo_description_tr || post.excerpt_tr),
                "articleBody": contentText.replace(/<[^>]*>/g, " ").trim().slice(0, 500),
                "datePublished": post.published_at?.toISOString(),
                "dateModified": post.updated_at?.toISOString(),
                "author": { "@type": "Person", "name": post.author, "url": SITE_URL },
                "publisher": {
                    "@type": "Organization",
                    "@id": `${SITE_URL}/#organization`,
                    "name": "ZYGSOFT",
                    "logo": { "@type": "ImageObject", "url": `${SITE_URL}/logo.png` },
                },
                "wordCount": wordCount,
                ...(post.reading_time_min ? { "timeRequired": `PT${post.reading_time_min}M` } : {}),
                ...(post.cover_image ? { "image": { "@type": "ImageObject", "url": post.cover_image.startsWith("http") ? post.cover_image : `${SITE_URL}${post.cover_image}` } } : {}),
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": isEn ? "Home" : "Ana Sayfa", "item": prefix },
                    { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${prefix}/blog` },
                    { "@type": "ListItem", "position": 3, "name": isEn ? post.title_en : post.title_tr, "item": pageUrl },
                ],
            },
        ],
    };

    const postTagIds = (post.tags?.map((t: { tag_id?: string; tag?: { id: string } }) => t.tag_id ?? t.tag?.id) ?? []).filter((id): id is string => typeof id === "string");
    const [sameCategory, sameTags, recent, prevPost, nextPost] = await Promise.all([
        post.category_id
            ? prisma.blogPost.findMany({
                where: { published: true, id: { not: post.id }, category_id: post.category_id },
                take: 3,
                orderBy: { published_at: "desc" },
                include: { category: true },
            })
            : [],
        postTagIds.length > 0
            ? prisma.blogPost.findMany({
                where: {
                    published: true,
                    id: { not: post.id },
                    tags: { some: { tag_id: { in: postTagIds } } },
                },
                take: 3,
                orderBy: { published_at: "desc" },
                include: { category: true },
            })
            : [],
        prisma.blogPost.findMany({
            where: { published: true, id: { not: post.id } },
            take: 5,
            orderBy: [{ view_count: "desc" }, { published_at: "desc" }],
            include: { category: true },
        }),
        prisma.blogPost.findFirst({
            where: { published: true, published_at: { gt: post.published_at ?? new Date(0) } },
            orderBy: { published_at: "asc" },
            select: { slug: true, title_tr: true, title_en: true },
        }),
        prisma.blogPost.findFirst({
            where: { published: true, published_at: { lt: post.published_at ?? new Date(9999) } },
            orderBy: { published_at: "desc" },
            select: { slug: true, title_tr: true, title_en: true },
        }),
    ]);
    const relatedIds = new Set<string>();
    const relatedRaw = [...sameTags, ...sameCategory, ...recent].filter((r) => {
        if (relatedIds.has(r.id)) return false;
        relatedIds.add(r.id);
        return true;
    }).slice(0, 3);

    const related = relatedRaw.map((r) => ({
        ...r,
        published_at: r.published_at?.toISOString() ?? null,
    }));

    const postForClient = {
        ...post,
        id: post.id,
        title: isEn ? post.title_en : post.title_tr,
        excerpt: isEn ? post.excerpt_en : post.excerpt_tr,
        content: isEn ? post.content_en : post.content_tr,
        cover_image: post.cover_image,
        published_at: post.published_at,
        reading_time_min: post.reading_time_min,
        view_count: post.view_count ?? 0,
        category: post.category,
        tags: post.tags,
        allow_comments: post.allow_comments !== false,
    };

    const prev = prevPost ? { slug: prevPost.slug, title: isEn ? prevPost.title_en : prevPost.title_tr } : null;
    const next = nextPost ? { slug: nextPost.slug, title: isEn ? nextPost.title_en : nextPost.title_tr } : null;

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <BlogDetailClient post={postForClient} related={related} prev={prev} next={next} locale={locale} />
        </>
    );
}
