import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlogDetailClient from "../../blog/[slug]/BlogDetailClient";
import { NEWS_CATEGORY_SLUG, isNewsCategory } from "@/lib/news";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zygsoft.com";

type Props = { params: Promise<{ slug: string; locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, locale } = await params;
    const post = await prisma.blogPost.findUnique({ where: { slug }, include: { category: true } });
    if (!post || !post.published || !isNewsCategory(post.category)) {
        return { title: "Haber Bulunamadı", robots: { index: false, follow: false } };
    }

    const isEn = locale === "en";
    const title = `${isEn ? (post.seo_title_en || post.title_en) : (post.seo_title_tr || post.title_tr)} | ZYGSOFT News`;
    const description = isEn ? (post.seo_description_en || post.excerpt_en) : (post.seo_description_tr || post.excerpt_tr);
    const image = post.og_image || post.cover_image;
    const prefix = isEn ? `${SITE_URL}/en` : SITE_URL;
    const canonical = post.canonical_url?.trim() || `${prefix}/news/${slug}`;

    return {
        title,
        description,
        alternates: {
            canonical,
            languages: {
                tr: `${SITE_URL}/haberler/${slug}`,
                en: `${SITE_URL}/en/news/${slug}`,
            },
        },
        openGraph: {
            title,
            description,
            type: "article",
            publishedTime: post.published_at?.toISOString(),
            modifiedTime: post.updated_at?.toISOString(),
            url: canonical,
            images: image ? [{ url: image.startsWith("http") ? image : `${SITE_URL}${image}` }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: image ? [image.startsWith("http") ? image : `${SITE_URL}${image}`] : [],
        },
    };
}

export default async function NewsDetailPage({ params }: Props) {
    const { slug, locale } = await params;
    const post = await prisma.blogPost.findUnique({
        where: { slug },
        include: { category: true, tags: { include: { tag: true } } },
    });

    if (!post || !post.published || !isNewsCategory(post.category)) {
        notFound();
    }

    const isEn = locale === "en";
    const prefix = isEn ? `${SITE_URL}/en` : SITE_URL;
    const newsHubUrl = isEn ? `${SITE_URL}/en/news` : `${SITE_URL}/haberler`;
    const pageUrl = isEn ? `${SITE_URL}/en/news/${slug}` : `${SITE_URL}/haberler/${slug}`;
    const contentText = (isEn ? post.content_en : post.content_tr) || "";
    const wordCount = contentText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().split(/\s+/).filter(Boolean).length;

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "NewsArticle",
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
                    { "@type": "ListItem", "position": 2, "name": isEn ? "News" : "Haberler", "item": newsHubUrl },
                    { "@type": "ListItem", "position": 3, "name": isEn ? post.title_en : post.title_tr, "item": pageUrl },
                ],
            },
        ],
    };

    const postTagIds = (post.tags?.map((tagItem: { tag_id?: string; tag?: { id: string } }) => tagItem.tag_id ?? tagItem.tag?.id) ?? []).filter((id): id is string => typeof id === "string");
    const [sameCategory, sameTags, recent, prevPost, nextPost] = await Promise.all([
        prisma.blogPost.findMany({
            where: {
                published: true,
                id: { not: post.id },
                category: { slug: NEWS_CATEGORY_SLUG },
            },
            take: 3,
            orderBy: { published_at: "desc" },
            include: { category: true },
        }),
        postTagIds.length > 0
            ? prisma.blogPost.findMany({
                where: {
                    published: true,
                    id: { not: post.id },
                    category: { slug: NEWS_CATEGORY_SLUG },
                    tags: { some: { tag_id: { in: postTagIds } } },
                },
                take: 3,
                orderBy: { published_at: "desc" },
                include: { category: true },
            })
            : [],
        prisma.blogPost.findMany({
            where: {
                published: true,
                id: { not: post.id },
                category: { slug: NEWS_CATEGORY_SLUG },
            },
            take: 5,
            orderBy: [{ view_count: "desc" }, { published_at: "desc" }],
            include: { category: true },
        }),
        prisma.blogPost.findFirst({
            where: {
                published: true,
                published_at: { gt: post.published_at ?? new Date(0) },
                category: { slug: NEWS_CATEGORY_SLUG },
            },
            orderBy: { published_at: "asc" },
            select: { slug: true, title_tr: true, title_en: true },
        }),
        prisma.blogPost.findFirst({
            where: {
                published: true,
                published_at: { lt: post.published_at ?? new Date(9999) },
                category: { slug: NEWS_CATEGORY_SLUG },
            },
            orderBy: { published_at: "desc" },
            select: { slug: true, title_tr: true, title_en: true },
        }),
    ]);

    const relatedIds = new Set<string>();
    const relatedRaw = [...sameTags, ...sameCategory, ...recent].filter((item) => {
        if (relatedIds.has(item.id)) return false;
        relatedIds.add(item.id);
        return true;
    }).slice(0, 3);

    const related = relatedRaw.map((item) => ({
        ...item,
        published_at: item.published_at?.toISOString() ?? null,
    }));

    const postForClient = {
        ...post,
        title: isEn ? post.title_en : post.title_tr,
        excerpt: isEn ? post.excerpt_en : post.excerpt_tr,
        content: isEn ? post.content_en : post.content_tr,
        allow_comments: post.allow_comments !== false,
    };

    const prev = prevPost ? { slug: prevPost.slug, title: isEn ? prevPost.title_en : prevPost.title_tr } : null;
    const next = nextPost ? { slug: nextPost.slug, title: isEn ? nextPost.title_en : nextPost.title_tr } : null;

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <BlogDetailClient
                post={postForClient}
                related={related}
                prev={prev}
                next={next}
                locale={locale}
                sectionBasePath="/news"
                sectionLabel={isEn ? "Blog & News" : "Blog & Haberler"}
                relatedLabel={isEn ? "More News" : "Daha Fazla Haber"}
                backLabel={isEn ? "Back to Blog & News" : "Blog & Haberlere Geri Dön"}
            />
        </>
    );
}
