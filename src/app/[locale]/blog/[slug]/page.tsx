import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlogDetailClient from "./BlogDetailClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const post = await prisma.blogPost.findUnique({
        where: { slug: params.slug },
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

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
    const post = await prisma.blogPost.findUnique({
        where: { slug: params.slug },
    });

    if (!post || (!post.published && process.env.NODE_ENV === "production")) {
        notFound();
    }

    return <BlogDetailClient post={post} />;
}
