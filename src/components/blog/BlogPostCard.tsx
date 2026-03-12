"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Clock, Calendar, Eye } from "lucide-react";

export type BlogPostCardData = {
    id: string;
    slug: string;
    title_tr: string;
    title_en: string;
    excerpt_tr: string;
    excerpt_en: string;
    cover_image: string | null;
    published_at: string | null;
    reading_time_min: number | null;
    view_count?: number;
    is_featured?: boolean;
    category?: { name_tr: string; name_en: string; slug: string } | null;
    tags?: { tag: { id: string; name: string; slug: string } }[];
};

type BlogPostCardProps = {
    post: BlogPostCardData;
    locale: string;
    variant?: "default" | "compact" | "featured";
    index?: number;
};

export function BlogPostCard({ post, locale, variant = "default", index = 0 }: BlogPostCardProps) {
    const router = useRouter();
    const isTr = locale === "tr";
    const title = isTr ? post.title_tr : post.title_en;
    const excerpt = isTr ? post.excerpt_tr : post.excerpt_en;
    const categoryName = post.category ? (isTr ? post.category.name_tr : post.category.name_en) : null;
    const blogHref = locale === "tr" ? `/blog/${post.slug}` : `/${locale}/blog/${post.slug}`;
    const tagHref = (slug: string) => (locale === "tr" ? `/blog/tag/${slug}` : `/${locale}/blog/tag/${slug}`);
    const postTags = post.tags?.map((t: { tag: { id: string; name: string; slug: string } }) => t.tag).filter(Boolean) ?? [];

    const isFeatured = variant === "featured";

    const cardContent = (
        <article
            className={`group flex flex-col h-full overflow-hidden bg-white border border-[#0a0c10]/[0.05] rounded-xl transition-all duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
                isFeatured ? "lg:flex lg:flex-row" : ""
            }`}
        >
            <div
                className={`relative bg-[#fafafc] overflow-hidden shrink-0 ${
                    isFeatured ? "aspect-video lg:aspect-auto lg:w-1/2 lg:min-h-[320px]" : "aspect-video"
                }`}
            >
                {post.cover_image ? (
                    <Image
                        src={post.cover_image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes={isFeatured ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#0a0c10]/15">
                        <BookOpen size={isFeatured ? 48 : 40} />
                    </div>
                )}
                <div
                    className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-hidden
                />
                {post.is_featured && (
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#e6c800] text-[#0a0c10] text-[10px] font-black uppercase tracking-wider">
                        {isTr ? "Öne Çıkan" : "Featured"}
                    </span>
                )}
                {categoryName && !post.is_featured && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/95 text-[10px] font-bold uppercase text-[#0a0c10] shadow-sm">
                        {categoryName}
                    </span>
                )}
            </div>
            <div className={`flex flex-col flex-1 ${isFeatured ? "p-8 md:p-10 lg:w-1/2 lg:justify-center" : "p-6"}`}>
                <h3
                    className={`font-display font-bold text-[#0e0e0e] line-clamp-2 group-hover:text-[#e6c800] transition-colors ${
                        isFeatured ? "text-2xl md:text-3xl mb-4" : "text-lg mb-2"
                    }`}
                >
                    {title}
                </h3>
                <p
                    className={`text-[#0a0c10]/60 leading-relaxed flex-1 ${
                        isFeatured ? "text-base line-clamp-3 mb-6" : "text-sm line-clamp-3 mb-4"
                    }`}
                >
                    {excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#0a0c10]/50 font-medium">
                    {categoryName && (
                        <span className="text-[#e6c800] font-semibold">{categoryName}</span>
                    )}
                    {post.published_at && (
                        <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(post.published_at).toLocaleDateString(isTr ? "tr-TR" : "en-US", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}
                        </span>
                    )}
                    {post.reading_time_min && (
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {post.reading_time_min} {isTr ? "dk" : "min"}
                        </span>
                    )}
                    {(post.view_count ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                            <Eye size={12} />
                            {post.view_count}
                        </span>
                    )}
                </div>
                {postTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
                        {postTags.slice(0, 3).map((t: { id: string; name: string; slug: string }) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(tagHref(t.slug)); }}
                                className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium hover:bg-[#e6c800]/20 hover:text-[#0a0c10] transition-colors text-left"
                            >
                                {t.name}
                            </button>
                        ))}
                    </div>
                )}
                <span className="mt-4 inline-flex items-center gap-2 font-bold text-[#0e0e0e] text-sm group-hover:text-[#e6c800] transition-colors">
                    {isTr ? "Devamını Oku" : "Read more"}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
            </div>
        </article>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
            <Link href={blogHref} className="block h-full">
                {cardContent}
            </Link>
        </motion.div>
    );
}
