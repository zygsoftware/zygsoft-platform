"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { BlogPostCard, type BlogPostCardData } from "@/components/blog/BlogPostCard";
import { createRevealUp } from "@/components/ui/motion";

export default function BlogPage() {
    const t = useTranslations("Blog");
    const locale = useLocale();
    const isTr = locale === "tr";
    const reducedMotion = !!useReducedMotion();
    const [posts, setPosts] = useState<BlogPostCardData[]>([]);
    const [featured, setFeatured] = useState<BlogPostCardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [categories, setCategories] = useState<{ id: string; name_tr: string; name_en: string; slug: string }[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");

    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput.trim()), 350);
        return () => clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        const params = new URLSearchParams();
        params.set("limit", "9");
        params.set("page", String(page));
        if (search) params.set("search", search);
        params.set("sort", sortBy === "popular" ? "popular" : "published");

        fetch(`/api/blog?${params}`)
            .then((res) => res.json())
            .then((data) => {
                const list = data.posts ?? [];
                const feat = list.find((p: BlogPostCardData) => p.is_featured) || null;
                setFeatured(feat);
                setPosts(feat ? list.filter((p: BlogPostCardData) => p.id !== feat.id) : list);
                setTotalPages(data.totalPages ?? 1);
            })
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    }, [page, search, sortBy]);

    useEffect(() => {
        fetch("/api/blog/categories")
            .then((res) => res.json())
            .then((data) => setCategories(Array.isArray(data) ? data : []))
            .catch(() => setCategories([]));
    }, []);


    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#fafafc]">
                <section className="pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#0a0c10 1px, transparent 1px), linear-gradient(90deg, #0a0c10 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
                    <div className="container mx-auto px-6 max-w-7xl relative z-10">
                        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
                            <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#0a0c10]/50 mb-4 block">{t("blogTag")}</span>
                            <h1 className="font-display font-extrabold text-[#0e0e0e] text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight mb-4">
                                {t("title")}
                            </h1>
                            <p className="text-[#0a0c10]/60 text-lg leading-relaxed">{t("subtitle")}</p>
                        </motion.div>
                    </div>
                </section>

                <section className="pb-16 md:pb-24">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="flex flex-col gap-6 mb-10">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0a0c10]/40" />
                                    <input
                                        type="text"
                                        placeholder={isTr ? "Başlık veya özet ara..." : "Search by title or excerpt..."}
                                        value={searchInput}
                                        onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
                                        className="w-full pl-12 pr-4 py-3 border border-[#0a0c10]/[0.08] rounded-xl bg-white focus:ring-2 focus:ring-[#e6c800]/30 focus:border-[#e6c800]/50 outline-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-shadow"
                                    />
                                </div>
                                <select
                                    value={sortBy}
                                    onChange={(e) => { setSortBy(e.target.value as "newest" | "popular"); setPage(1); }}
                                    className="px-4 py-3 border border-[#0a0c10]/[0.08] rounded-xl bg-white min-w-[160px] shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                                >
                                    <option value="newest">{isTr ? "En Yeni" : "Newest"}</option>
                                    <option value="popular">{isTr ? "En Popüler" : "Most Popular"}</option>
                                </select>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Link
                                    href={locale === "tr" ? "/blog" : `/${locale}/blog`}
                                    className="px-4 py-2 rounded-full text-sm font-medium bg-[#e6c800] text-[#0a0c10]"
                                >
                                    {isTr ? "Tümü" : "All"}
                                </Link>
                                {categories.map((c) => (
                                    <Link
                                        key={c.id}
                                        href={locale === "tr" ? `/blog/category/${c.slug}` : `/${locale}/blog/category/${c.slug}`}
                                        className="px-4 py-2 rounded-full text-sm font-medium bg-white border border-[#0a0c10]/[0.08] text-[#0a0c10]/70 hover:border-[#e6c800]/50 transition-colors"
                                    >
                                        {isTr ? c.name_tr : c.name_en}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <div key={n} className="h-[380px] bg-white/60 border border-[#0a0c10]/[0.06] rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : featured && posts.length === 0 && !search ? (
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <BlogPostCard post={featured} locale={locale} variant="featured" index={0} />
                            </motion.div>
                        ) : (
                            <>
                                {featured && !search && (
                                    <div className="mb-10">
                                        <BlogPostCard post={featured} locale={locale} variant="featured" index={0} />
                                    </div>
                                )}

                                {posts.length === 0 && !featured ? (
                                    <div className="text-center py-24 px-8 bg-white rounded-2xl border border-[#0a0c10]/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                                        <div className="w-20 h-20 rounded-2xl bg-[#e6c800]/10 flex items-center justify-center mx-auto mb-6">
                                            <BookOpen size={40} className="text-[#e6c800]" />
                                        </div>
                                        <h3 className="font-display font-bold text-2xl text-[#0e0e0e] mb-2">
                                            {search ? (isTr ? "Aramanıza uygun yazı bulunamadı" : "No posts match your search") : t("noPostsYet")}
                                        </h3>
                                        <p className="text-[#0a0c10]/60 max-w-md mx-auto mb-6">
                                            {search
                                                ? (isTr ? "Farklı anahtar kelimeler deneyin veya filtreleri değiştirin." : "Try different keywords or adjust filters.")
                                                : (isTr ? "Yakında yeni içerikler eklenecek." : "New content coming soon.")}
                                        </p>
                                        {search && (
                                            <button
                                                onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
                                                className="text-[#e6c800] font-semibold hover:underline"
                                            >
                                                {isTr ? "Aramayı temizle" : "Clear search"}
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <motion.div
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                                        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } } }}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {posts.map((post, i) => (
                                            <motion.div key={post.id} variants={createRevealUp(reducedMotion, 24, 6)}>
                                                <BlogPostCard post={post} locale={locale} variant="default" index={i} />
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}

                                {totalPages > 1 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-center gap-2 mt-14"
                                    >
                                        <button
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page <= 1}
                                            className="px-5 py-2.5 rounded-xl border border-[#0a0c10]/[0.08] font-bold text-sm text-[#0a0c10] hover:bg-[#0a0c10]/[0.04] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                        >
                                            ←
                                        </button>
                                        <span className="px-5 py-2.5 text-sm font-medium text-[#0a0c10]/70">
                                            {page} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page >= totalPages}
                                            className="px-5 py-2.5 rounded-xl border border-[#0a0c10]/[0.08] font-bold text-sm text-[#0a0c10] hover:bg-[#0a0c10]/[0.04] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                        >
                                            →
                                        </button>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </div>
                </section>

                <section className="py-20 bg-[#0a0c10]">
                    <div className="container mx-auto px-6 max-w-4xl text-center">
                        <h2 className="font-display font-extrabold text-white text-2xl md:text-3xl mb-4">{isTr ? "Gelişmelerden Haberdar Olun" : "Stay Updated"}</h2>
                        <p className="text-white/70 mb-8">{isTr ? "Yazılım ve dijital dünyadan güncel içerikler." : "Latest content from software and digital world."}</p>
                        <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-[#e6c800] text-[#0a0c10] font-bold rounded-xl hover:bg-white transition-colors">
                            {isTr ? "Bültene Abone Ol" : "Subscribe"} <ArrowRight size={18} />
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
