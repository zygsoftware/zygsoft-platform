"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { BlogEditorForm } from "@/components/admin/BlogEditorForm";
import { AdminPageHeader } from "@/components/admin";
import type { BlogFormData } from "@/components/admin/BlogEditorForm";

function estimateReadingTime(html: string): number {
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}

function normalizePayload(data: BlogFormData): Record<string, unknown> {
    const reading_time_min = data.reading_time_min ?? Math.max(
        estimateReadingTime(data.content_tr || ""),
        estimateReadingTime(data.content_en || "")
    );

    return {
        ...data,
        category_id: data.category_id?.trim() || null,
        cover_image: data.cover_image?.trim() || null,
        cover_image_alt_tr: data.cover_image_alt_tr?.trim() || null,
        cover_image_alt_en: data.cover_image_alt_en?.trim() || null,
        cover_image_title_tr: data.cover_image_title_tr?.trim() || null,
        cover_image_title_en: data.cover_image_title_en?.trim() || null,
        cover_image_caption_tr: data.cover_image_caption_tr?.trim() || null,
        cover_image_caption_en: data.cover_image_caption_en?.trim() || null,
        seo_title_tr: data.seo_title_tr?.trim() || null,
        seo_title_en: data.seo_title_en?.trim() || null,
        seo_description_tr: data.seo_description_tr?.trim() || null,
        seo_description_en: data.seo_description_en?.trim() || null,
        seo_keywords_tr: data.seo_keywords_tr?.trim() || null,
        seo_keywords_en: data.seo_keywords_en?.trim() || null,
        og_image: data.og_image?.trim() || null,
        canonical_url: data.canonical_url?.trim() || null,
        reading_time_min,
        allow_comments: !!data.allow_comments,
        is_featured: !!data.is_featured,
    };
}

export default function AdminBlogEditPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [loading, setLoading] = useState(true);
    const [initialData, setInitialData] = useState<Partial<BlogFormData> | null>(null);

    useEffect(() => {
        fetch(`/api/blog/${id}`)
            .then((r) => r.json())
            .then((post) => {
                setInitialData({
                    slug: post.slug,
                    title_tr: post.title_tr,
                    title_en: post.title_en,
                    excerpt_tr: post.excerpt_tr,
                    excerpt_en: post.excerpt_en,
                    content_tr: post.content_tr,
                    content_en: post.content_en,
                    cover_image: post.cover_image || "",
                    cover_image_alt_tr: post.cover_image_alt_tr || "",
                    cover_image_alt_en: post.cover_image_alt_en || "",
                    cover_image_title_tr: post.cover_image_title_tr || "",
                    cover_image_title_en: post.cover_image_title_en || "",
                    cover_image_caption_tr: post.cover_image_caption_tr || "",
                    cover_image_caption_en: post.cover_image_caption_en || "",
                    seo_title_tr: post.seo_title_tr || "",
                    seo_title_en: post.seo_title_en || "",
                    seo_description_tr: post.seo_description_tr || "",
                    seo_description_en: post.seo_description_en || "",
                    seo_keywords_tr: post.seo_keywords_tr || "",
                    seo_keywords_en: post.seo_keywords_en || "",
                    og_image: post.og_image || "",
                    canonical_url: post.canonical_url || "",
                    category_id: post.category_id || "",
                    tag_ids: post.tags?.map((t: { tag_id?: string; tag?: { id: string } }) => t.tag_id ?? t.tag?.id) || [],
                    is_featured: post.is_featured,
                    allow_comments: post.allow_comments !== false,
                    status: post.published ? "published" : "draft",
                    published_at: post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : "",
                    reading_time_min: post.reading_time_min ?? undefined,
                });
            })
            .catch(() => setInitialData(null))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = async (data: BlogFormData) => {
        const payload = normalizePayload(data);
        const res = await fetch(`/api/blog/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
            const msg = json.error || "Güncelleme başarısız";
            if (process.env.NODE_ENV === "development") {
                console.error("[Blog Edit] Update failed:", res.status, json);
            }
            throw new Error(msg);
        }
        toast.success("Blog yazısı güncellendi.");
        router.push("/admin/blog");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 size={32} className="animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!initialData) {
        return (
            <div className="text-center py-16">
                <p className="text-slate-500">Yazı bulunamadı.</p>
                <Link href="/admin/blog" className="mt-4 inline-block text-emerald-600 font-medium hover:underline">
                    Listeye dön
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <AdminPageHeader
                title="Yazıyı Düzenle"
                subtitle={initialData.title_tr}
                backHref="/admin/blog"
            />
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[var(--shadow-sm)] p-8">
                <BlogEditorForm initialData={initialData} onSubmit={handleSubmit} isEdit postId={id} />
            </div>
        </div>
    );
}
