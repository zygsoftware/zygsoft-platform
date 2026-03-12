"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { useLocale } from "next-intl";
import { BlogPostCard, type BlogPostCardData } from "@/components/blog/BlogPostCard";

type Category = { id: string; name_tr: string; name_en: string; slug: string; description_tr?: string | null; description_en?: string | null };

export default function BlogCategoryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const locale = useLocale();
    const isTr = locale === "tr";
    const [posts, setPosts] = useState<BlogPostCardData[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        fetch("/api/blog/categories")
            .then((r) => r.json())
            .then((cats: Category[]) => {
                const list = Array.isArray(cats) ? cats : [];
                setCategories(list);
                const cat = list.find((c) => c.slug === slug) ?? null;
                setCategory(cat);
                if (cat) {
                    return fetch(`/api/blog?category=${cat.id}&limit=50`).then((r) => r.json());
                }
                return { posts: [] };
            })
            .then((data) => setPosts(data.posts ?? []))
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    }, [slug]);

    if (!category && !loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-[#fafafc] pt-32 pb-16">
                    <div className="container mx-auto px-6 max-w-4xl text-center">
                        <p className="text-slate-500 text-lg">{isTr ? "Kategori bulunamadı." : "Category not found."}</p>
                        <Link href={locale === "tr" ? "/blog" : `/${locale}/blog`} className="inline-flex items-center gap-2 mt-4 text-[#e6c800] font-semibold hover:underline">
                            <ArrowLeft size={18} /> {isTr ? "Blog'a dön" : "Back to Blog"}
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    const title = category ? (isTr ? category.name_tr : category.name_en) : "";
    const description = category ? (isTr ? category.description_tr : category.description_en) : "";

    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#fafafc]">
                <section className="pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#0a0c10 1px, transparent 1px), linear-gradient(90deg, #0a0c10 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
                    <div className="container mx-auto px-6 max-w-7xl relative z-10">
                        <Link href={locale === "tr" ? "/blog" : `/${locale}/blog`} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#0a0c10]/[0.08] rounded-full text-xs font-bold uppercase tracking-wide text-[#0a0c10]/70 hover:text-[#0e0e0e] hover:bg-white/90 mb-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                            <ArrowLeft size={14} /> {isTr ? "Blog'a Geri Dön" : "Back to Blog"}
                        </Link>
                        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
                            <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#0a0c10]/50 mb-4 block">{isTr ? "Kategori" : "Category"}</span>
                            <h1 className="font-display font-extrabold text-[#0e0e0e] text-4xl md:text-5xl leading-[1.05] tracking-tight mb-4">{title}</h1>
                            {description && <p className="text-[#0a0c10]/60 text-lg leading-relaxed">{description}</p>}
                        </motion.div>
                    </div>
                </section>

                <section className="pb-16 md:pb-24">
                    <div className="container mx-auto px-6 max-w-7xl">
                        {categories.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-10">
                                <Link
                                    href={locale === "tr" ? "/blog" : `/${locale}/blog`}
                                    className="px-4 py-2 rounded-full text-sm font-medium bg-white border border-[#0a0c10]/[0.08] text-[#0a0c10]/70 hover:border-[#e6c800]/50 transition-colors"
                                >
                                    {isTr ? "Tümü" : "All"}
                                </Link>
                                {categories.map((c) => {
                                    const categoryHref = locale === "tr" ? `/blog/category/${c.slug}` : `/${locale}/blog/category/${c.slug}`;
                                    const isActive = c.slug === slug;
                                    return (
                                        <Link
                                            key={c.id}
                                            href={categoryHref}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? "bg-[#e6c800] text-[#0a0c10]" : "bg-white border border-[#0a0c10]/[0.08] text-[#0a0c10]/70 hover:border-[#e6c800]/50"}`}
                                        >
                                            {isTr ? c.name_tr : c.name_en}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <div key={n} className="h-[380px] bg-white/60 border border-[#0a0c10]/[0.06] rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-24 px-8 bg-white rounded-2xl border border-[#0a0c10]/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                                <div className="w-20 h-20 rounded-2xl bg-[#e6c800]/10 flex items-center justify-center mx-auto mb-6">
                                    <BookOpen size={40} className="text-[#e6c800]" />
                                </div>
                                <h3 className="font-display font-bold text-2xl text-[#0e0e0e] mb-2">{isTr ? "Bu kategoride henüz yazı yok" : "No posts in this category yet"}</h3>
                                <p className="text-[#0a0c10]/60 max-w-md mx-auto mb-6">{isTr ? "Yakında bu kategoride yeni içerikler eklenecek." : "New content in this category coming soon."}</p>
                                <Link href={locale === "tr" ? "/blog" : `/${locale}/blog`} className="inline-flex items-center gap-2 text-[#e6c800] font-semibold hover:underline">
                                    <ArrowLeft size={18} /> {isTr ? "Tüm yazılara git" : "View all posts"}
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                {posts.map((post, i) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: i * 0.06 }}
                                    >
                                        <BlogPostCard post={post} locale={locale} variant="default" index={i} />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
