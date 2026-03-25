"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import {
    ArrowRight,
    BookOpen,
    ChevronRight,
    Compass,
    Flame,
    FolderKanban,
    Heart,
    MessageSquare,
    Newspaper,
    Search,
    Sparkles,
    X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlogPostCard, type BlogPostCardData } from "@/components/blog/BlogPostCard";
import { createRevealUp } from "@/components/ui/motion";
import { NEWS_CATEGORY_SLUG } from "@/lib/news";

type ContentFilter = "all" | "blog" | "news" | "liked";

type CountedCategory = {
    slug: string;
    name: string;
    count: number;
    isNews: boolean;
};

type CountedTag = {
    id: string;
    name: string;
    slug: string;
    count: number;
};

export default function BlogPage() {
    const { status } = useSession();
    const t = useTranslations("Blog");
    const locale = useLocale();
    const isTr = locale === "tr";
    const reducedMotion = !!useReducedMotion();
    const isAuthenticated = status === "authenticated";

    const [posts, setPosts] = useState<BlogPostCardData[]>([]);
    const [featured, setFeatured] = useState<BlogPostCardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");
    const [contentFilter, setContentFilter] = useState<ContentFilter>("all");
    const [requiresAuthForLiked, setRequiresAuthForLiked] = useState(false);
    const [refreshSeed, setRefreshSeed] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => setSearch(searchInput.trim()), 250);
        return () => clearTimeout(timeout);
    }, [searchInput]);

    useEffect(() => {
        const params = new URLSearchParams();
        params.set("limit", "12");
        params.set("page", String(page));
        params.set("sort", sortBy === "popular" ? "popular" : "published");
        params.set("type", contentFilter);
        if (search) params.set("search", search);
        params.set("_ts", String(Date.now()));

        fetch(`/api/blog?${params.toString()}`, {
            cache: "no-store",
            credentials: "include",
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.requiresAuth) {
                    setRequiresAuthForLiked(true);
                    setFeatured(null);
                    setPosts([]);
                    setTotalPages(0);
                    setTotalResults(0);
                    return;
                }

                setRequiresAuthForLiked(false);
                const list = data.posts ?? [];
                const hero = list.find((post: BlogPostCardData) => post.is_featured) || list[0] || null;
                setFeatured(hero);
                setPosts(hero ? list.filter((post: BlogPostCardData) => post.id !== hero.id) : list);
                setTotalPages(data.totalPages ?? 1);
                setTotalResults(data.total ?? list.length);
            })
            .catch(() => {
                setRequiresAuthForLiked(false);
                setFeatured(null);
                setPosts([]);
                setTotalPages(1);
                setTotalResults(0);
            })
            .finally(() => setLoading(false));
    }, [contentFilter, page, refreshSeed, search, sortBy, status]);

    useEffect(() => {
        const refreshFeed = () => setRefreshSeed((value) => value + 1);
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") refreshFeed();
        };
        window.addEventListener("focus", refreshFeed);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            window.removeEventListener("focus", refreshFeed);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    const allVisiblePosts = useMemo(
        () => [featured, ...posts].filter(Boolean) as BlogPostCardData[],
        [featured, posts]
    );

    const heroSideStories = useMemo(() => posts.slice(0, 2), [posts]);
    const discoveryLead = useMemo(() => posts[2] ?? null, [posts]);
    const discoveryGridStories = useMemo(() => posts.slice(3, 7), [posts]);
    const archiveStories = useMemo(() => posts.slice(7), [posts]);

    const latestStories = useMemo(
        () => [...allVisiblePosts]
            .sort((a, b) => new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime())
            .slice(0, 5),
        [allVisiblePosts]
    );

    const communityStories = useMemo(
        () => [...allVisiblePosts]
            .sort((a, b) => {
                const scoreA = (a._count?.comments ?? 0) * 3 + (a._count?.likes ?? 0) * 2 + (a.view_count ?? 0);
                const scoreB = (b._count?.comments ?? 0) * 3 + (b._count?.likes ?? 0) * 2 + (b.view_count ?? 0);
                return scoreB - scoreA;
            })
            .slice(0, 4),
        [allVisiblePosts]
    );

    const commentOpenStories = useMemo(
        () => [...allVisiblePosts]
            .filter((post) => post.allow_comments !== false)
            .sort((a, b) => (b._count?.comments ?? 0) - (a._count?.comments ?? 0))
            .slice(0, 4),
        [allVisiblePosts]
    );

    const editorialCategories = useMemo(() => {
        const unique = new Map<string, CountedCategory>();
        for (const post of allVisiblePosts) {
            if (!post.category) continue;
            const existing = unique.get(post.category.slug);
            if (existing) {
                existing.count += 1;
                continue;
            }
            unique.set(post.category.slug, {
                slug: post.category.slug,
                name: isTr ? post.category.name_tr : post.category.name_en,
                count: 1,
                isNews: post.category.slug === NEWS_CATEGORY_SLUG,
            });
        }
        return Array.from(unique.values()).sort((a, b) => b.count - a.count).slice(0, 6);
    }, [allVisiblePosts, isTr]);

    const quickTags = useMemo(() => {
        const unique = new Map<string, CountedTag>();
        for (const post of allVisiblePosts) {
            for (const tagItem of post.tags ?? []) {
                const tag = tagItem.tag;
                if (!tag) continue;
                const existing = unique.get(tag.id);
                if (existing) {
                    existing.count += 1;
                    continue;
                }
                unique.set(tag.id, { id: tag.id, name: tag.name, slug: tag.slug, count: 1 });
            }
        }
        return Array.from(unique.values()).sort((a, b) => b.count - a.count).slice(0, 12);
    }, [allVisiblePosts]);

    const filterItems: Array<{ value: ContentFilter; label: string; icon: typeof BookOpen }> = [
        { value: "all", label: isTr ? "Tümü" : "All", icon: Sparkles },
        { value: "blog", label: isTr ? "Sadece Blog" : "Only Blog", icon: BookOpen },
        { value: "news", label: isTr ? "Sadece Haber" : "Only News", icon: Newspaper },
        { value: "liked", label: isTr ? "Beğendiklerim" : "Liked", icon: Heart },
    ];

    const formatDate = (value: string | null) => value
        ? new Date(value).toLocaleDateString(isTr ? "tr-TR" : "en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
        : "";

    const getTone = (post: BlogPostCardData) => post.category?.slug === NEWS_CATEGORY_SLUG ? "bg-[#e6c800]" : "bg-slate-900";
    const activeFilterLabel = contentFilter === "liked"
        ? (isTr ? "Beğendiklerim" : "Liked")
        : filterItems.find((item) => item.value === contentFilter)?.label ?? filterItems[0].label;
    const activeSortLabel = sortBy === "popular" ? (isTr ? "En popüler" : "Most popular") : (isTr ? "En yeni" : "Newest");
    const blogTagRootHref = locale === "tr" ? "/blog-haberler/etiket" : `/${locale}/blog/tag`;
    const blogCategoryRootHref = locale === "tr" ? "/blog-haberler/kategori" : `/${locale}/blog/category`;

    const getLocalizedPostHref = (post: BlogPostCardData) => {
        if (post.category?.slug === NEWS_CATEGORY_SLUG) {
            return locale === "tr" ? `/haberler/${post.slug}` : `/${locale}/news/${post.slug}`;
        }
        return locale === "tr" ? `/blog-haberler/${post.slug}` : `/${locale}/blog/${post.slug}`;
    };

    const getLocalizedCategoryHref = (slug: string) => `${blogCategoryRootHref}/${slug}`;

    const activeChips = [
        search ? { id: "search", label: `"${search}"`, clear: () => { setLoading(true); setSearchInput(""); setSearch(""); setPage(1); } } : null,
        contentFilter !== "all" ? { id: "filter", label: activeFilterLabel, clear: () => { setLoading(true); setContentFilter("all"); setPage(1); } } : null,
        sortBy !== "newest" ? { id: "sort", label: activeSortLabel, clear: () => { setLoading(true); setSortBy("newest"); setPage(1); } } : null,
    ].filter(Boolean) as Array<{ id: string; label: string; clear: () => void }>;

    const clearAllFilters = () => {
        setLoading(true);
        setSearchInput("");
        setSearch("");
        setContentFilter("all");
        setSortBy("newest");
        setPage(1);
    };

    const resultHeadline = search
        ? (isTr ? `"${search}" için sonuçlar` : `Results for "${search}"`)
        : contentFilter === "liked"
            ? (isTr ? "Beğendiğiniz içerikler" : "Stories you liked")
        : contentFilter === "news"
            ? (isTr ? "Güncel haber akışı" : "Current news stream")
            : contentFilter === "blog"
                ? (isTr ? "Derinlikli blog yazıları" : "Long-form blog stories")
                : (isTr ? "Blog ve haber akışı" : "Blog and news stream");

    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#f7f6f2]">
                <section className="relative overflow-hidden border-b border-[#343131]/[0.06] bg-[linear-gradient(180deg,#fcfbf6_0%,#f7f6f2_100%)] pt-28 pb-8 md:pt-32 md:pb-10">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #343131 1px, transparent 0)", backgroundSize: "24px 24px" }} />
                    <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#e6c800]/12 blur-3xl" />
                    <div className="container relative z-10 mx-auto max-w-7xl px-6">
                        <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#343131]/45">
                            <Link href="/" className="hover:text-[#0e0e0e] transition-colors">{isTr ? "Anasayfa" : "Home"}</Link>
                            <ChevronRight size={12} />
                            <span>{t("blogTag")}</span>
                        </div>

                        <div className="max-w-4xl">
                            <motion.h1
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45 }}
                                className="max-w-4xl text-3xl font-extrabold leading-[1] tracking-tight text-[#0e0e0e] md:text-5xl xl:text-[3.7rem]"
                            >
                                {t("title")}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.05 }}
                                className="mt-5 max-w-3xl text-base leading-7 text-[#343131]/65 md:text-lg"
                            >
                                {t("subtitle")}
                            </motion.p>
                        </div>
                    </div>
                </section>

                <section className="relative z-10 -mt-px border-b border-[#343131]/[0.05] bg-white/[0.85] backdrop-blur-xl">
                    <div className="container mx-auto max-w-7xl px-6 py-5">
                        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr] xl:items-center">
                            <div role="search" className="flex flex-wrap items-center gap-3">
                                <div className="relative min-w-[280px] flex-1 xl:max-w-xl">
                                    <label htmlFor="blog-news-search" className="sr-only">
                                        {isTr ? "Blog ve haber içinde ara" : "Search blog and news"}
                                    </label>
                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#343131]/40" />
                                    <input
                                        id="blog-news-search"
                                        type="text"
                                        value={searchInput}
                                        onChange={(event) => { setLoading(true); setSearchInput(event.target.value); setPage(1); }}
                                        placeholder={isTr ? "Başlık, içerik, kategori veya etiket ara..." : "Search title, content, category or tag..."}
                                        aria-label={isTr ? "Blog ve haber içinde ara" : "Search blog and news"}
                                        className="w-full rounded-2xl border border-[#343131]/[0.08] bg-[#fafafc] py-3 pl-12 pr-12 outline-none transition-shadow focus:border-[#e6c800]/50 focus:ring-2 focus:ring-[#e6c800]/20"
                                    />
                                    {searchInput && (
                                        <button
                                            type="button"
                                            onClick={() => { setLoading(true); setSearchInput(""); setSearch(""); setPage(1); }}
                                            className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#343131]/45 transition-colors hover:bg-[#343131]/[0.06] hover:text-[#0e0e0e]"
                                            aria-label={isTr ? "Aramayı temizle" : "Clear search"}
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                                <label className="sr-only" htmlFor="blog-sort-select">
                                    {isTr ? "Sıralama seçin" : "Choose sorting"}
                                </label>
                                <select
                                    id="blog-sort-select"
                                    value={sortBy}
                                    onChange={(event) => { setLoading(true); setSortBy(event.target.value as "newest" | "popular"); setPage(1); }}
                                    aria-label={isTr ? "Sıralama seçin" : "Choose sorting"}
                                    className="rounded-2xl border border-[#343131]/[0.08] bg-[#fafafc] px-4 py-3 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                                >
                                    <option value="newest">{isTr ? "En Yeni" : "Newest"}</option>
                                    <option value="popular">{isTr ? "En Popüler" : "Most Popular"}</option>
                                </select>
                            </div>

                            <div className="flex flex-wrap items-center justify-start gap-2 xl:justify-end">
                                {filterItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={item.value}
                                            type="button"
                                            onClick={() => {
                                                if (item.value === "liked" && !isAuthenticated) {
                                                    signIn(undefined, { callbackUrl: window.location.href });
                                                    return;
                                                }
                                                setLoading(true);
                                                setContentFilter(item.value);
                                                setPage(1);
                                            }}
                                            aria-pressed={contentFilter === item.value}
                                            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#e6c800]/30 ${
                                                contentFilter === item.value
                                                    ? "bg-[#0e0e0e] text-white shadow-[0_10px_26px_rgba(0,0,0,0.12)]"
                                                    : "border border-[#343131]/[0.08] bg-[#fafafc] text-[#343131]/70 hover:bg-white hover:text-[#0e0e0e]"
                                            }`}
                                        >
                                            <Icon size={15} className={contentFilter === item.value ? "text-[#e6c800]" : ""} />
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="pt-6">
                    <div className="container mx-auto max-w-7xl px-6">
                        <div
                            aria-live="polite"
                            className="rounded-[32px] border border-[#343131]/[0.06] bg-white/92 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                        >
                            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[#343131]/40">
                                        {isTr ? "Yayın Akışı" : "Editorial Flow"}
                                    </p>
                                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0e0e0e] md:text-[2rem]">
                                        {resultHeadline}
                                    </h2>
                                    <p className="mt-2 max-w-3xl text-sm leading-7 text-[#343131]/60 md:text-base">
                                        {isTr
                                            ? `${totalResults} içerik bulundu. ${activeSortLabel.toLowerCase()} sıralama ile ${totalPages > 1 ? `${page}. sayfadasınız.` : "Aynı ekranda blog yazıları ve haberleri birlikte inceleyebilirsiniz."}`
                                            : `${totalResults} items found. Sorted by ${activeSortLabel.toLowerCase()}${totalPages > 1 ? `, page ${page}.` : " so you can browse blogs and news together."}`}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {activeChips.map((chip) => (
                                        <button
                                            key={chip.id}
                                            type="button"
                                            onClick={chip.clear}
                                            className="inline-flex items-center gap-2 rounded-full border border-[#343131]/[0.08] bg-[#fafafc] px-3 py-1.5 text-xs font-semibold text-[#343131]/70 transition-colors hover:border-[#e6c800]/60 hover:text-[#0e0e0e]"
                                        >
                                            {chip.label}
                                            <X size={13} />
                                        </button>
                                    ))}
                                    {activeChips.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={clearAllFilters}
                                            className="inline-flex items-center gap-2 rounded-full bg-[#0e0e0e] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#1a1a1a]"
                                        >
                                            {isTr ? "Temizle" : "Reset"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="pb-16 pt-8 md:pb-24">
                    <div className="container mx-auto max-w-7xl px-6">
                        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
                            <div className="space-y-8">
                                {loading ? (
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        {[1, 2, 3, 4, 5, 6].map((item) => (
                                            <div key={item} className="h-[380px] animate-pulse rounded-2xl border border-[#343131]/[0.06] bg-white/70" />
                                        ))}
                                    </div>
                                ) : requiresAuthForLiked ? (
                                    <div className="rounded-[32px] border border-[#343131]/[0.06] bg-white px-8 py-20 text-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#e6c800]/10 text-[#e6c800]">
                                            <Heart size={36} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-[#0e0e0e]">
                                            {isTr ? "Beğendiklerinizi görmek için giriş yapın" : "Sign in to view your liked stories"}
                                        </h3>
                                        <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-[#343131]/60">
                                            {isTr
                                                ? "Beğendiğiniz blog ve haberleri tek akışta görmek için hesabınızla giriş yapabilirsiniz."
                                                : "Sign in to revisit the blog posts and news stories you have liked."}
                                        </p>
                                        <Link href="/login" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#0e0e0e] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#1a1a1a]">
                                            {isTr ? "Giriş Yap" : "Sign In"}
                                            <Heart size={16} />
                                        </Link>
                                    </div>
                                ) : allVisiblePosts.length === 0 ? (
                                    <div className="rounded-[32px] border border-[#343131]/[0.06] bg-white px-8 py-20 text-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#e6c800]/10 text-[#e6c800]">
                                            {contentFilter === "liked" ? <Heart size={36} /> : <BookOpen size={36} />}
                                        </div>
                                        <h3 className="text-2xl font-bold text-[#0e0e0e]">
                                            {contentFilter === "liked"
                                                ? (isTr ? "Henüz beğendiğiniz içerik yok" : "You have not liked any stories yet")
                                                : search ? t("searchEmptyTitle") : t("noPostsYet")}
                                        </h3>
                                        <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-[#343131]/60">
                                            {contentFilter === "liked"
                                                ? (isTr ? "Bir blog yazısı ya da haberi beğendiğinizde burada tekrar kolayca bulabilirsiniz." : "When you like a blog post or news story, you will be able to revisit it here.")
                                                : search ? t("searchEmptyDesc") : t("emptyDesc")}
                                        </p>
                                        {quickTags.length > 0 && (
                                            <div className="mt-8 flex flex-wrap justify-center gap-2">
                                                {quickTags.slice(0, 6).map((tag) => (
                                                    <Link
                                                        key={tag.id}
                                                        href={`${blogTagRootHref}/${tag.slug}`}
                                                        className="rounded-full border border-[#343131]/[0.08] bg-[#fafafc] px-3 py-1.5 text-xs font-semibold text-[#343131]/70 transition-colors hover:border-[#e6c800]/60 hover:text-[#0e0e0e]"
                                                    >
                                                        {tag.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {featured && (
                                            <section id="featured-stream" className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] scroll-mt-28">
                                                <BlogPostCard
                                                    post={featured}
                                                    locale={locale}
                                                    variant="featured"
                                                    index={0}
                                                    sectionBasePath={featured.category?.slug === NEWS_CATEGORY_SLUG ? "/news" : "/blog"}
                                                />

                                                <div className="grid gap-4">
                                                    {heroSideStories.map((post) => (
                                                        <Link
                                                            key={post.id}
                                                            href={getLocalizedPostHref(post)}
                                                            className="group overflow-hidden rounded-[28px] border border-[#343131]/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]"
                                                        >
                                                            <div className="relative aspect-[16/9] overflow-hidden bg-[linear-gradient(180deg,#f8f1cd_0%,#f5f6fa_100%)]">
                                                                {post.cover_image ? (
                                                                    <img
                                                                        src={post.cover_image}
                                                                        alt={isTr ? post.title_tr : post.title_en}
                                                                        className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.06]"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full items-center justify-center text-[#343131]/20">
                                                                        <BookOpen size={30} />
                                                                    </div>
                                                                )}
                                                                <div className="absolute bottom-4 left-4">
                                                                    <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#343131] shadow-sm">
                                                                        <span className={`h-2 w-2 rounded-full ${getTone(post)}`} />
                                                                        {post.category ? (isTr ? post.category.name_tr : post.category.name_en) : (isTr ? "İçerik" : "Content")}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="p-5">
                                                                <h3 className="mt-3 text-xl font-bold leading-tight text-[#0e0e0e] transition-colors group-hover:text-[#e6c800]">
                                                                    {isTr ? post.title_tr : post.title_en}
                                                                </h3>
                                                                <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#343131]/62">
                                                                    {isTr ? post.excerpt_tr : post.excerpt_en}
                                                                </p>
                                                                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-[#343131]/48">
                                                                    <span>{formatDate(post.published_at)}</span>
                                                                    {(post._count?.comments ?? 0) > 0 && (
                                                                        <span className="inline-flex items-center gap-1">
                                                                            <MessageSquare size={12} />
                                                                            {post._count?.comments}
                                                                        </span>
                                                                    )}
                                                                    {(post._count?.likes ?? 0) > 0 && (
                                                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${
                                                                            post.liked_by_current_user ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"
                                                                        }`}>
                                                                            <Heart size={12} className={post.liked_by_current_user ? "fill-current" : ""} />
                                                                            {post._count?.likes}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </section>
                                        )}

                                        {(discoveryLead || discoveryGridStories.length > 0 || communityStories.length > 0) && (
                                            <section id="editorial-board" className="grid gap-6 2xl:grid-cols-[1.08fr_0.92fr] scroll-mt-28">
                                                <div className="grid gap-6">
                                                    {discoveryLead && (
                                                        <Link
                                                            href={getLocalizedPostHref(discoveryLead)}
                                                            className="group overflow-hidden rounded-[32px] border border-[#343131]/[0.06] bg-[#0e0e0e] text-white shadow-[0_12px_40px_rgba(0,0,0,0.14)]"
                                                        >
                                                            <div className="grid h-full gap-0 lg:grid-cols-[1.04fr_0.96fr]">
                                                                <div className="relative min-h-[280px] overflow-hidden bg-[radial-gradient(circle_at_top_left,#f6d52f_0%,#d1a900_55%,#0e0e0e_130%)]">
                                                                    {discoveryLead.cover_image ? (
                                                                        <img
                                                                            src={discoveryLead.cover_image}
                                                                            alt={isTr ? discoveryLead.title_tr : discoveryLead.title_en}
                                                                            className="h-full w-full object-cover object-center mix-blend-luminosity opacity-90 transition-transform duration-500 group-hover:scale-[1.04]"
                                                                        />
                                                                    ) : (
                                                                        <div className="flex h-full items-center justify-center text-white/30">
                                                                            <Newspaper size={54} />
                                                                        </div>
                                                                    )}
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                                                                </div>
                                                                <div className="flex flex-col justify-between p-7 md:p-8">
                                                                    <div>
                                                                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/60">
                                                                            {isTr ? "Editör Vitrini" : "Editor's Spotlight"}
                                                                        </p>
                                                                        <h3 className="mt-4 text-2xl font-bold leading-[1.05] text-white md:text-3xl">
                                                                            {isTr ? discoveryLead.title_tr : discoveryLead.title_en}
                                                                        </h3>
                                                                        <p className="mt-4 line-clamp-4 text-sm leading-7 text-white/70 md:text-base">
                                                                            {isTr ? discoveryLead.excerpt_tr : discoveryLead.excerpt_en}
                                                                        </p>
                                                                    </div>
                                                                    <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/60">
                                                                        <span>{formatDate(discoveryLead.published_at)}</span>
                                                                        {(discoveryLead._count?.comments ?? 0) > 0 && (
                                                                            <span className="inline-flex items-center gap-1">
                                                                                <MessageSquare size={14} />
                                                                                {discoveryLead._count?.comments}
                                                                            </span>
                                                                        )}
                                                                        {(discoveryLead._count?.likes ?? 0) > 0 && (
                                                                            <span className="inline-flex items-center gap-1">
                                                                                <Heart size={14} />
                                                                                {discoveryLead._count?.likes}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    )}

                                                    {discoveryGridStories.length > 0 && (
                                                        <div className="grid gap-6 md:grid-cols-2">
                                                            {discoveryGridStories.map((post) => (
                                                                <Link
                                                                    key={post.id}
                                                                    href={getLocalizedPostHref(post)}
                                                                    className="group overflow-hidden rounded-[28px] border border-[#343131]/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)]"
                                                                >
                                                                    <div className="relative aspect-[16/10] overflow-hidden bg-[linear-gradient(180deg,#f8f1cd_0%,#f5f6fa_100%)]">
                                                                        {post.cover_image ? (
                                                                            <img
                                                                                src={post.cover_image}
                                                                                alt={isTr ? post.title_tr : post.title_en}
                                                                                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                                                                            />
                                                                        ) : (
                                                                            <div className="flex h-full items-center justify-center text-[#343131]/18">
                                                                                <BookOpen size={34} />
                                                                            </div>
                                                                        )}
                                                                        <div className="absolute bottom-4 left-4">
                                                                            <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#343131] shadow-sm">
                                                                                <span className={`h-2 w-2 rounded-full ${getTone(post)}`} />
                                                                                {post.category ? (isTr ? post.category.name_tr : post.category.name_en) : (isTr ? "İçerik" : "Content")}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="p-5">
                                                                        <h3 className="text-xl font-bold leading-tight text-[#0e0e0e] transition-colors group-hover:text-[#e6c800]">
                                                                            {isTr ? post.title_tr : post.title_en}
                                                                        </h3>
                                                                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#343131]/62">
                                                                            {isTr ? post.excerpt_tr : post.excerpt_en}
                                                                        </p>
                                                                        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-medium text-[#343131]/45">
                                                                            <span>{formatDate(post.published_at)}</span>
                                                                            {(post._count?.comments ?? 0) > 0 && (
                                                                                <span className="inline-flex items-center gap-1">
                                                                                    <MessageSquare size={12} />
                                                                                    {post._count?.comments}
                                                                                </span>
                                                                            )}
                                                                            {(post._count?.likes ?? 0) > 0 && (
                                                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${
                                                                                    post.liked_by_current_user ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"
                                                                                }`}>
                                                                                    <Heart size={12} className={post.liked_by_current_user ? "fill-current" : ""} />
                                                                                    {post._count?.likes}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid gap-6 content-start">
                                                    <section id="conversation-desk" className="rounded-[32px] border border-[#343131]/[0.06] bg-[#121212] p-6 text-white shadow-[0_14px_40px_rgba(0,0,0,0.14)] scroll-mt-28">
                                                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-white/60">
                                                            <Flame size={14} className="text-[#e6c800]" />
                                                            {isTr ? "Konuşulanlar" : "Community Picks"}
                                                        </div>
                                                        <p className="mt-3 text-sm leading-7 text-white/70">
                                                            {isTr
                                                                ? "Yorum ve beğeni alan, daha çok konuşulan içerikleri hızlıca görün."
                                                                : "Scan the stories getting more comments and reactions."}
                                                        </p>
                                                        <div className="mt-6 space-y-3">
                                                            {communityStories.map((post, index) => (
                                                                <Link
                                                                    key={`${post.id}-community-${index}`}
                                                                    href={getLocalizedPostHref(post)}
                                                                    className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 transition-colors hover:bg-white/[0.08]"
                                                                >
                                                                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e6c800] text-sm font-black text-[#0e0e0e]">
                                                                        {index + 1}
                                                                    </span>
                                                                    <div className="min-w-0">
                                                                        <p className="line-clamp-2 text-sm font-semibold leading-6 text-white transition-colors group-hover:text-[#f7d93e]">
                                                                            {isTr ? post.title_tr : post.title_en}
                                                                        </p>
                                                                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/60">
                                                                            <span>{formatDate(post.published_at)}</span>
                                                                            <span className="inline-flex items-center gap-1">
                                                                                <MessageSquare size={12} />
                                                                                {post._count?.comments ?? 0}
                                                                            </span>
                                                                            <span className="inline-flex items-center gap-1">
                                                                                <Heart size={12} />
                                                                                {post._count?.likes ?? 0}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </section>

                                                    {editorialCategories.length > 0 && (
                                                        <section className="rounded-[32px] border border-[#343131]/[0.06] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                                                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[#343131]/40">
                                                                <FolderKanban size={14} className="text-[#e6c800]" />
                                                                {isTr ? "Konu Rafı" : "Topic Shelf"}
                                                            </div>
                                                            <p className="mt-3 text-sm leading-7 text-[#343131]/58">
                                                                {isTr
                                                                    ? "Aradığınız alana tek tıkla geçin ve ilgili içerik kümelerini filtreleyin."
                                                                    : "Jump straight into the topic you need and narrow the feed faster."}
                                                            </p>
                                                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                                                {editorialCategories.map((category) => (
                                                                    <Link
                                                                        key={category.slug}
                                                                        href={getLocalizedCategoryHref(category.slug)}
                                                                        className="group rounded-2xl border border-[#343131]/[0.08] bg-[#fafafc] p-4 transition-colors hover:border-[#e6c800]/50 hover:bg-white"
                                                                    >
                                                                        <div className="flex items-center justify-between gap-3">
                                                                            <p className="text-sm font-bold text-[#0e0e0e]">
                                                                                {category.name}
                                                                            </p>
                                                                            <span className={`h-2.5 w-2.5 rounded-full ${category.isNews ? "bg-[#e6c800]" : "bg-slate-900"}`} />
                                                                        </div>
                                                                        <p className="mt-2 text-xs font-medium text-[#343131]/48">
                                                                            {category.count} {isTr ? "içerik" : "stories"}
                                                                        </p>
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </section>
                                                    )}
                                                </div>
                                            </section>
                                        )}

                                        {archiveStories.length > 0 && (
                                            <section id="archive-grid" className="scroll-mt-28">
                                                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#343131]/40">
                                                            {isTr ? "Arşiv Akışı" : "Archive Stream"}
                                                        </p>
                                                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0e0e0e]">
                                                            {isTr ? "Daha Fazla İçerik" : "More Stories"}
                                                        </h2>
                                                        <p className="mt-2 text-sm leading-7 text-[#343131]/58">
                                                            {isTr
                                                                ? "Ana vitrine girmeyen ama keşfetmeye değer içerikleri burada tarayabilirsiniz."
                                                                : "Browse the wider archive without losing the editorial structure above."}
                                                        </p>
                                                    </div>
                                                    {search && (
                                                        <button
                                                            type="button"
                                                            onClick={() => { setLoading(true); setSearchInput(""); setSearch(""); setPage(1); }}
                                                            className="rounded-full border border-[#343131]/[0.08] bg-white px-4 py-2 text-sm font-semibold text-[#0e0e0e] transition-colors hover:border-[#e6c800]/60 hover:text-[#e6c800]"
                                                        >
                                                            {isTr ? "Aramayı Temizle" : "Clear Search"}
                                                        </button>
                                                    )}
                                                </div>
                                                <motion.div
                                                    className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3"
                                                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } } }}
                                                    initial="hidden"
                                                    animate="visible"
                                                >
                                                    {archiveStories.map((post, index) => (
                                                        <motion.div key={post.id} variants={createRevealUp(reducedMotion, 24, 6)}>
                                                            <BlogPostCard
                                                                post={post}
                                                                locale={locale}
                                                                index={index}
                                                                sectionBasePath={post.category?.slug === NEWS_CATEGORY_SLUG ? "/news" : "/blog"}
                                                            />
                                                        </motion.div>
                                                    ))}
                                                </motion.div>
                                            </section>
                                        )}
                                    </>
                                )}
                            </div>

                            <aside className="xl:block">
                                <div className="space-y-5 xl:sticky xl:top-28">
                                    <section className="overflow-hidden rounded-[28px] border border-[#343131]/[0.06] bg-[linear-gradient(180deg,#fffef9_0%,#f7f5ee_100%)] p-5 text-[#0e0e0e] shadow-[0_14px_36px_rgba(0,0,0,0.05)]">
                                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[#343131]/42">
                                            <Compass size={14} className="text-[#e6c800]" />
                                            {isTr ? "Hızlı Geçiş" : "Quick Navigation"}
                                        </div>
                                        <p className="mt-3 text-sm leading-7 text-[#343131]/62">
                                            {isTr
                                                ? "Akışı temizleyin, aktif filtreleri görün ve içerik blokları arasında tek tıkla gezinin."
                                                : "Reset the feed, review active filters, and jump between content blocks in one click."}
                                        </p>

                                        <div className="mt-5 flex flex-wrap gap-2">
                                                <span className="rounded-full border border-[#343131]/[0.08] bg-white px-3 py-1.5 text-xs font-semibold text-[#343131]/72 shadow-sm">{activeFilterLabel}</span>
                                                <span className="rounded-full border border-[#343131]/[0.08] bg-white px-3 py-1.5 text-xs font-semibold text-[#343131]/72 shadow-sm">{activeSortLabel}</span>
                                                {search && (
                                                    <span className="rounded-full border border-[#343131]/[0.08] bg-white px-3 py-1.5 text-xs font-semibold text-[#343131]/72 shadow-sm">
                                                        {`"${search}"`}
                                                    </span>
                                                )}
                                        </div>

                                        <div className="mt-5 grid gap-2">
                                            <a href="#featured-stream" className="rounded-2xl border border-[#343131]/[0.08] bg-white px-4 py-3 text-sm font-semibold text-[#0e0e0e] transition-colors hover:border-[#e6c800]/60 hover:bg-[#fff8d6]">
                                                {isTr ? "Manşete Git" : "Jump to Lead Story"}
                                            </a>
                                            <a href="#editorial-board" className="rounded-2xl border border-[#343131]/[0.08] bg-white px-4 py-3 text-sm font-semibold text-[#0e0e0e] transition-colors hover:border-[#e6c800]/60 hover:bg-[#fff8d6]">
                                                {isTr ? "Keşif Panosuna Git" : "Open Discovery Board"}
                                            </a>
                                            <a href="#archive-grid" className="rounded-2xl border border-[#343131]/[0.08] bg-white px-4 py-3 text-sm font-semibold text-[#0e0e0e] transition-colors hover:border-[#e6c800]/60 hover:bg-[#fff8d6]">
                                                {isTr ? "Arşive Git" : "Jump to Archive"}
                                            </a>
                                        </div>

                                        {activeChips.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={clearAllFilters}
                                                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0e0e0e] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#1d1d1d]"
                                            >
                                                {isTr ? "Tümünü Temizle" : "Clear All"}
                                            </button>
                                        )}
                                    </section>

                                    <section className="rounded-[28px] border border-[#343131]/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                                        <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.22em] text-[#343131]/40">
                                            <Sparkles size={14} className="text-[#e6c800]" />
                                            {isTr ? "Son Paylaşımlar" : "Latest Stories"}
                                        </h3>
                                        <div className="mt-4 space-y-4">
                                            {latestStories.length === 0 ? (
                                                <p className="text-sm text-[#343131]/55">{t("sidebarEmpty")}</p>
                                            ) : (
                                                latestStories.map((post, index) => (
                                                    <Link
                                                        key={`${post.id}-latest-${index}`}
                                                        href={getLocalizedPostHref(post)}
                                                        className="group flex gap-3 rounded-2xl border border-transparent p-2 -mx-2 transition-colors hover:border-[#343131]/[0.06] hover:bg-[#fafafc]"
                                                    >
                                                        <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#faf4d4] text-[11px] font-bold text-[#0e0e0e]">
                                                            {index + 1}
                                                        </span>
                                                        <div className="min-w-0">
                                                            <p className="line-clamp-2 text-sm font-semibold leading-6 text-[#0e0e0e] group-hover:text-[#e6c800]">
                                                                {isTr ? post.title_tr : post.title_en}
                                                            </p>
                                                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#343131]/45">
                                                                <span>{formatDate(post.published_at)}</span>
                                                                <span className="inline-flex items-center gap-1">
                                                                    <MessageSquare size={11} />
                                                                    {post._count?.comments ?? 0}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))
                                            )}
                                        </div>
                                    </section>

                                    <section className="rounded-[28px] border border-[#343131]/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                                        <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.22em] text-[#343131]/40">
                                            <MessageSquare size={14} className="text-[#e6c800]" />
                                            {isTr ? "Yorumlara Katıl" : "Join the Conversation"}
                                        </h3>
                                        <p className="mt-3 text-sm leading-6 text-[#343131]/58">
                                            {isTr
                                                ? "Yorumları açık olan içeriklere doğrudan gidip katkı verebilirsiniz."
                                                : "Jump directly into comment-enabled stories and add your take."}
                                        </p>
                                        <div className="mt-4 space-y-3">
                                            {commentOpenStories.length === 0 ? (
                                                <p className="text-sm text-[#343131]/55">{t("sidebarEmpty")}</p>
                                            ) : (
                                                commentOpenStories.map((post) => (
                                                    <Link
                                                        key={`${post.id}-comments`}
                                                        href={`${getLocalizedPostHref(post)}#comments`}
                                                        className="group block rounded-2xl border border-[#343131]/[0.06] bg-[#fafafc] p-4 transition-colors hover:border-[#e6c800]/40 hover:bg-white"
                                                    >
                                                        <p className="line-clamp-2 text-sm font-semibold leading-6 text-[#0e0e0e] group-hover:text-[#e6c800]">
                                                            {isTr ? post.title_tr : post.title_en}
                                                        </p>
                                                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#343131]/48">
                                                            <span className="inline-flex items-center gap-1">
                                                                <MessageSquare size={11} />
                                                                {post._count?.comments ?? 0}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1">
                                                                <Heart size={11} />
                                                                {post._count?.likes ?? 0}
                                                            </span>
                                                            <span className="font-semibold text-[#0e0e0e]">
                                                                {isTr ? "Yorum Yap" : "Comment"}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                ))
                                            )}
                                        </div>
                                    </section>

                                    <section className="rounded-[28px] border border-[#343131]/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                                        <h3 className="text-sm font-black uppercase tracking-[0.22em] text-[#343131]/40">
                                            {isTr ? "Trend Etiketler" : "Trending Tags"}
                                        </h3>
                                        <p className="mt-3 text-sm leading-6 text-[#343131]/58">
                                            {isTr
                                                ? "Aynı konu etrafındaki içerikleri hızlıca keşfetmek için etiketleri kullanın."
                                                : "Use tags to move across related stories without losing your place."}
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {quickTags.length === 0 ? (
                                                <p className="text-sm text-[#343131]/55">{t("sidebarEmpty")}</p>
                                            ) : (
                                                quickTags.map((tag) => (
                                                    <Link
                                                        key={tag.id}
                                                        href={`${blogTagRootHref}/${tag.slug}`}
                                                        className="inline-flex items-center gap-2 rounded-full border border-[#343131]/[0.08] bg-[#fafafc] px-3 py-1.5 text-xs font-semibold text-[#343131]/70 transition-colors hover:border-[#e6c800]/60 hover:text-[#0e0e0e]"
                                                    >
                                                        <span>{tag.name}</span>
                                                        <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] text-[#343131]/55">{tag.count}</span>
                                                    </Link>
                                                ))
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </aside>
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-14 flex justify-center gap-2">
                                <button
                                    onClick={() => { setLoading(true); setPage((current) => Math.max(1, current - 1)); }}
                                    disabled={page <= 1}
                                    className="rounded-xl border border-[#343131]/[0.08] px-5 py-2.5 text-sm font-bold text-[#343131] transition-all hover:bg-[#343131]/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    ←
                                </button>
                                <span className="px-5 py-2.5 text-sm font-medium text-[#343131]/70">{page} / {totalPages}</span>
                                <button
                                    onClick={() => { setLoading(true); setPage((current) => Math.min(totalPages, current + 1)); }}
                                    disabled={page >= totalPages}
                                    className="rounded-xl border border-[#343131]/[0.08] px-5 py-2.5 text-sm font-bold text-[#343131] transition-all hover:bg-[#343131]/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    →
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                <section className="bg-[#0e0e0e] py-20">
                    <div className="container mx-auto max-w-4xl px-6 text-center">
                        <h2 className="text-2xl font-extrabold text-white md:text-3xl">{t("ctaTitle")}</h2>
                        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/70">{t("ctaDesc")}</p>
                        <Link href="/contact" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#e6c800] px-8 py-4 font-bold text-[#343131] transition-colors hover:bg-white">
                            {t("ctaButton")} <ArrowRight size={18} />
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
