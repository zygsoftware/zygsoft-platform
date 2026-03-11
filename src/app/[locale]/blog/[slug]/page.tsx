import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlogDetailClient from "./BlogDetailClient";
import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zygsoft.com";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({
        where: { slug },
    });

    if (!post) return { title: "Blog Yazısı Bulunamadı", description: "" };

    return {
        title: `${post.title} | Zygsoft Blog`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: post.image ? [{ url: post.image }] : [],
            type: "article",
            publishedTime: post.createdAt.toISOString(),
            authors: [post.author],
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt,
            images: post.image ? [post.image] : [],
        }
    };
}

export default async function BlogDetailPage({
    params,
}: {
    params: Promise<{ slug: string; locale: string }>;
}) {
    const { slug, locale } = await params;
    const post = await prisma.blogPost.findUnique({
        where: { slug },
    });

    if (!post || (!post.published && process.env.NODE_ENV === "production")) {
        notFound();
    }

    const isEn    = locale === "en";
    const prefix  = isEn ? `${SITE_URL}/en` : SITE_URL;
    const pageUrl = `${prefix}/blog/${slug}`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BlogPosting",
                "@id": pageUrl,
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": pageUrl,
                },
                "headline":      post.title,
                "description":   post.excerpt ?? undefined,
                "datePublished": post.createdAt.toISOString(),
                "dateModified":  (post.updatedAt ?? post.createdAt).toISOString(),
                "author": {
                    "@type": "Person",
                    "name":  post.author,
                },
                "publisher": {
                    "@type": "Organization",
                    "@id":   `${SITE_URL}/#organization`,
                    "name":  "ZYGSOFT",
                },
                ...(post.image ? { "image": { "@type": "ImageObject", "url": post.image } } : {}),
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type":    "ListItem",
                        "position": 1,
                        "name":     isEn ? "Home" : "Ana Sayfa",
                        "item":     prefix,
                    },
                    {
                        "@type":    "ListItem",
                        "position": 2,
                        "name":     "Blog",
                        "item":     `${prefix}/blog`,
                    },
                    {
                        "@type":    "ListItem",
                        "position": 3,
                        "name":     post.title,
                        "item":     pageUrl,
                    },
                ],
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BlogDetailClient post={post} />
        </>
    );
}
