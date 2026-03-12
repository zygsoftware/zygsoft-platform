"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import BlogDetailClient from "@/app/[locale]/blog/[slug]/BlogDetailClient";

export default function AdminBlogPreviewPage() {
    const params = useParams();
    const id = params.id as string;
    const [post, setPost] = useState<any>(null);
    const [related, setRelated] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/blog/${id}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.error) {
                    setPost(null);
                    return;
                }
                setPost(data);
                if (data.published && data.slug) {
                    return fetch(`/api/blog?category=${data.category_id || ""}&limit=3`).then((r) => r.json());
                }
                return { posts: [] };
            })
            .then((d) => setRelated(d?.posts?.filter((p: any) => p.id !== id)?.slice(0, 3) ?? []))
            .catch(() => setPost(null))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 size={32} className="animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="text-center py-16">
                <p className="text-slate-500">Yazı bulunamadı.</p>
                <Link href="/admin/blog" className="mt-4 inline-block text-emerald-600 font-medium hover:underline">
                    Listeye dön
                </Link>
            </div>
        );
    }

    const locale = "tr";
    const postForClient = {
        ...post,
        id: post.id,
        title: post.title_tr,
        excerpt: post.excerpt_tr,
        content: post.content_tr,
        cover_image: post.cover_image,
        published_at: post.published_at,
        reading_time_min: post.reading_time_min,
        category: post.category,
        tags: post.tags,
        allow_comments: post.allow_comments !== false,
    };

    const relatedForClient = related.map((r) => ({
        ...r,
        published_at: r.published_at?.toISOString?.() ?? r.published_at,
    }));

    return (
        <div className="relative">
            <div className="fixed top-4 left-4 z-50 px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-lg shadow-lg">
                Önizleme Modu
            </div>
            <div className="fixed top-4 right-4 z-50">
                <Link href={`/admin/blog/edit/${id}`} className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700">
                    Düzenlemeye Dön
                </Link>
            </div>
            <BlogDetailClient
                post={postForClient}
                related={relatedForClient}
                prev={null}
                next={null}
                locale={locale}
                inPreview
            />
        </div>
    );
}
