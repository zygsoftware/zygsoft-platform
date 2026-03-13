"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Calendar, ArrowLeft, ArrowRight, Clock, Linkedin, Twitter, Copy, Check, Heart, MessageSquare, Eye, Lock, Tag } from "lucide-react";
import { AuthorBox } from "@/components/blog/AuthorBox";
import { RelatedServicesCTA } from "@/components/blog/RelatedServicesCTA";
import { slugifyHeading } from "@/lib/slugify-heading";

type RelatedPost = {
    id: string;
    slug: string;
    title_tr: string;
    title_en: string;
    excerpt_tr: string;
    excerpt_en: string;
    cover_image: string | null;
    published_at: string | null;
    reading_time_min: number | null;
    category: { name_tr: string; name_en: string } | null;
};

type PrevNext = { slug: string; title: string } | null;

export default function BlogDetailClient({
    post,
    related,
    prev,
    next,
    locale,
    inPreview,
}: {
    post: any;
    related: RelatedPost[];
    prev?: PrevNext;
    next?: PrevNext;
    locale: string;
    inPreview?: boolean;
}) {
    const isTr = locale === "tr";
    const [progress, setProgress] = useState(0);
    const [copied, setCopied] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [liked, setLiked] = useState(false);
    const [comments, setComments] = useState<{ id: string; content: string; name: string | null; created_at: string; user?: { name: string | null } }[]>([]);
    const [commentContent, setCommentContent] = useState("");
    const [commentName, setCommentName] = useState("");
    const [commentEmail, setCommentEmail] = useState("");
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [commentSuccess, setCommentSuccess] = useState(false);
    const [commentError, setCommentError] = useState("");

    useEffect(() => {
        if (post?.id) {
            fetch(`/api/blog/${post.id}/view`, { method: "POST" }).catch(() => {});
        }
    }, [post?.id]);

    const fetchLikes = useCallback(() => {
        if (!post?.id) return;
        fetch(`/api/blog/${post.id}/like`)
            .then((r) => r.json())
            .then((d) => {
                setLikeCount(d.count ?? 0);
                setLiked(d.liked ?? false);
            })
            .catch(() => {});
    }, [post?.id]);

    const fetchComments = useCallback(() => {
        if (!post?.id) return;
        fetch(`/api/blog/${post.id}/comments`)
            .then((r) => r.json())
            .then((d) => setComments(Array.isArray(d) ? d : []))
            .catch(() => setComments([]));
    }, [post?.id]);

    useEffect(() => {
        fetchLikes();
    }, [fetchLikes]);

    useEffect(() => {
        if (post?.allow_comments) fetchComments();
    }, [post?.allow_comments, fetchComments]);

    const handleLike = () => {
        if (!post?.id) return;
        fetch(`/api/blog/${post.id}/like`, { method: "POST" })
            .then((r) => r.json())
            .then((d) => {
                setLiked(d.liked ?? false);
                setLikeCount((c) => (d.liked ? c + 1 : Math.max(0, c - 1)));
            })
            .catch(() => {});
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!post?.id || !commentContent.trim()) return;
        setCommentSubmitting(true);
        setCommentError("");
        fetch(`/api/blog/${post.id}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: commentContent.trim(), name: commentName.trim(), email: commentEmail.trim() }),
        })
            .then((r) => r.json())
            .then((d) => {
                if (d.error) {
                    setCommentError(d.error);
                } else {
                    setCommentContent("");
                    setCommentName("");
                    setCommentEmail("");
                    setCommentSuccess(true);
                    setTimeout(() => setCommentSuccess(false), 3000);
                }
            })
            .catch(() => setCommentError(isTr ? "Bir hata oluştu." : "An error occurred."))
            .finally(() => setCommentSubmitting(false));
    };

    useEffect(() => {
        const onScroll = () => {
            const winScroll = document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            setProgress(height > 0 ? (winScroll / height) * 100 : 0);
        };
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const [headings, setHeadings] = useState<{ level: number; text: string; id: string }[]>([]);
    const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

    useEffect(() => {
        const run = () => {
            const el = document.querySelector(".prose-article");
            if (!el) return;
            const hs = el.querySelectorAll("h2, h3");
            const items: { level: number; text: string; id: string }[] = [];
            const slugCounts: Record<string, number> = {};
            hs.forEach((h) => {
                const text = h.textContent || "";
                let baseSlug = slugifyHeading(text);
                if (!baseSlug) baseSlug = "section";
                const count = (slugCounts[baseSlug] = (slugCounts[baseSlug] ?? 0) + 1);
                const id = count > 1 ? `${baseSlug}-${count}` : baseSlug;
                (h as HTMLElement).id = id;
                items.push({ level: h.tagName === "H2" ? 2 : 3, text, id });
            });
            setHeadings(items);
            const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
            if (hash && items.some((i) => i.id === hash)) {
                requestAnimationFrame(() => {
                    const el = document.getElementById(hash);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                });
            }
        };
        const t = setTimeout(run, 100);
        return () => clearTimeout(t);
    }, [post.content]);

    useEffect(() => {
        if (headings.length === 0) return;
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting);
                if (visible.length === 0) return;
                const byTop = visible
                    .map((e) => ({ id: e.target.id, top: e.boundingClientRect.top }))
                    .sort((a, b) => a.top - b.top);
                const topmost = byTop[0];
                if (topmost && topmost.top < 150) setActiveHeadingId(topmost.id);
            },
            { rootMargin: "-100px 0px -70% 0px", threshold: 0 }
        );
        headings.forEach((h) => {
            const el = document.getElementById(h.id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [headings]);

    const scrollToHeading = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareTitle = encodeURIComponent(post.title);
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`;

    const copyLink = () => {
        navigator.clipboard.writeText(shareUrl || window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const blogHref = (slug: string) => ({ pathname: "/blog/[slug]" as const, params: { slug } });
    const tagHref = (slug: string) => ({ pathname: "/blog/tag/[slug]" as const, params: { slug } });
    const hasPrevNext = (prev && prev.slug) || (next && next.slug);
    const postTags = post.tags?.map((t: { tag?: { id: string; name: string; slug: string } }) => t.tag).filter(Boolean) ?? [];

    return (
        <>
            {!inPreview && (
            <div className="hidden lg:block fixed left-6 top-1/2 -translate-y-1/2 z-30">
                <div className="flex flex-col gap-2 p-2 bg-white/95 backdrop-blur rounded-xl border border-slate-200 shadow-lg">
                    <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#0077b5] hover:text-white transition-colors" title="LinkedIn">
                        <Linkedin size={18} />
                    </a>
                    <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#1da1f2] hover:text-white transition-colors" title="Twitter">
                        <Twitter size={18} />
                    </a>
                    <button onClick={copyLink} className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors" title={isTr ? "Linki kopyala" : "Copy link"}>
                        {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                    </button>
                    <button onClick={handleLike} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${liked ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`} title={isTr ? "Beğen" : "Like"}>
                        <Heart size={18} className={liked ? "fill-current" : ""} />
                    </button>
                    <span className="text-xs text-center text-slate-500 font-medium">{likeCount}</span>
                </div>
            </div>
            )}

            <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 z-50">
                <motion.div className="h-full bg-[#e6c800]" style={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
            </div>

            <Header />
            <main className="min-h-screen bg-[#fafafc] pt-16">
                <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#0a0c10 1px, transparent 1px), linear-gradient(90deg, #0a0c10 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
                    <div className="container mx-auto px-6 max-w-4xl relative z-10">
                        <Link href="/blog" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#0a0c10]/[0.08] rounded-full text-xs font-bold uppercase tracking-wide text-[#0a0c10]/70 hover:text-[#0e0e0e] hover:bg-white/90 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all mb-8 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                            <ArrowLeft size={14} /> {isTr ? "Blog'a Geri Dön" : "Back to Blog"}
                        </Link>

                        {post.category && (
                            <span className="inline-block px-3 py-1 rounded-full bg-[#e6c800]/20 text-[#0a0c10] text-[11px] font-bold uppercase tracking-wider mb-4">
                                {isTr ? post.category.name_tr : post.category.name_en}
                            </span>
                        )}

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold text-[#0e0e0e] mb-6 leading-[1.15] tracking-tight">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 md:gap-8 text-sm text-slate-500">
                            <span className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#0e0e0e]">
                                    <Calendar size={14} />
                                </span>
                                {post.published_at && new Date(post.published_at).toLocaleDateString(isTr ? "tr-TR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                            </span>
                            {post.reading_time_min && (
                                <span className="flex items-center gap-2">
                                    <Clock size={14} />
                                    {post.reading_time_min} {isTr ? "dk okuma" : "min read"}
                                </span>
                            )}
                            {(post.view_count ?? 0) > 0 && (
                                <span className="flex items-center gap-2">
                                    <Eye size={14} />
                                    {post.view_count} {isTr ? "görüntülenme" : "views"}
                                </span>
                            )}
                            {post.author && (
                                <span className="flex items-center gap-2">
                                    <span className="text-[#0a0c10]/70 font-medium">{post.author}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </section>

                {post.cover_image && (
                    <section className="container mx-auto px-6 max-w-5xl -mt-4 mb-12">
                        <motion.figure
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="relative"
                        >
                            <div className="relative aspect-video md:aspect-[21/9] bg-[#fafafc] rounded-xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.08)] border border-[#0a0c10]/[0.05]">
                                <Image
                                    src={post.cover_image}
                                    alt={post.cover_image_alt_tr || post.cover_image_alt_en || post.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 1024px"
                                    priority
                                />
                            </div>
                            {(post.cover_image_caption_tr || post.cover_image_caption_en) && (
                                <figcaption className="mt-3 text-center text-sm text-slate-500 font-medium">
                                    {isTr ? (post.cover_image_caption_tr || post.cover_image_caption_en) : (post.cover_image_caption_en || post.cover_image_caption_tr)}
                                </figcaption>
                            )}
                        </motion.figure>
                    </section>
                )}

                <section className="py-8 md:py-12">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <div className="flex flex-col lg:flex-row gap-12">
                            <motion.article
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="flex-1 min-w-0"
                            >
                                <p className="text-xl md:text-2xl font-medium text-[#0e0e0e] leading-relaxed mb-10 p-6 bg-white border border-[#0a0c10]/[0.05] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-l-4 border-l-[#e6c800]">
                                    {post.excerpt}
                                </p>

                                <div
                                    className="prose-article max-w-none text-[var(--prose-text)]"
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />

                                <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-6">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">{isTr ? "Paylaş" : "Share"}</p>
                                        <div className="flex items-center gap-3">
                                        <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#0077b5] hover:text-white transition-colors">
                                            <Linkedin size={18} />
                                        </a>
                                        <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#1da1f2] hover:text-white transition-colors">
                                            <Twitter size={18} />
                                        </a>
                                        <button onClick={copyLink} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
                                            {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                                        </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLike}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                                            liked ? "bg-red-50 border-red-200 text-red-600" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                                        }`}
                                    >
                                        <Heart size={18} className={liked ? "fill-current" : ""} />
                                        <span className="font-semibold">{likeCount}</span>
                                    </button>
                                </div>

                                <AuthorBox author={post.author || "ZYGSOFT"} locale={locale} />

                                {postTags.length > 0 && (
                                    <div className="mt-8">
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                                            <Tag size={14} /> {isTr ? "Etiketler" : "Tags"}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {postTags.map((t: { id: string; name: string; slug: string }) => (
                                                <Link
                                                    key={t.id}
                                                    href={tagHref(t.slug)}
                                                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-[#e6c800]/20 hover:text-[#0a0c10] transition-colors"
                                                >
                                                    {t.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-10">
                                    <RelatedServicesCTA locale={locale} />
                                </div>
                            </motion.article>

                            {headings.length > 0 && (
                                <aside className="lg:w-72 shrink-0">
                                    <div className="sticky top-24 p-6 bg-white rounded-xl border border-[#0a0c10]/[0.05] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                                            <span className="w-1 h-4 bg-[#e6c800] rounded-full" />
                                            {isTr ? "İçindekiler" : "Table of Contents"}
                                        </p>
                                        <nav className="space-y-1.5 max-h-[320px] overflow-y-auto">
                                            {headings.map((h) => (
                                                <a
                                                    key={h.id}
                                                    href={`#${h.id}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        scrollToHeading(h.id);
                                                    }}
                                                    className={`block text-sm font-medium py-1.5 px-3 rounded-lg transition-colors border-l-2 hover:bg-slate-50 hover:border-[#e6c800]/50 hover:text-[#0e0e0e] toc-link ${h.level === 3 ? "pl-6 text-slate-600" : "pl-3 text-slate-700 font-semibold"} ${activeHeadingId === h.id ? "border-[#e6c800] bg-[#e6c800]/10 text-[#0e0e0e]" : "border-transparent"}`}
                                                    data-heading-id={h.id}
                                                >
                                                    {h.text}
                                                </a>
                                            ))}
                                        </nav>
                                    </div>
                                </aside>
                            )}
                        </div>
                    </div>
                </section>

                {!post.allow_comments && (
                    <section className="py-12 bg-slate-50/50 border-t border-slate-100">
                        <div className="container mx-auto px-6 max-w-3xl text-center">
                            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-100 text-slate-500 text-sm font-medium shadow-sm">
                                <Lock size={18} />
                                {isTr ? "Yorumlar bu yazı için kapatıldı." : "Comments are closed for this post."}
                            </div>
                        </div>
                    </section>
                )}

                {post.allow_comments && (
                    <section className="py-16 bg-slate-50/50 border-t border-slate-100">
                        <div className="container mx-auto px-6 max-w-3xl">
                            <h2 className="text-2xl font-display font-bold text-[#0e0e0e] mb-2 flex items-center gap-2">
                                <MessageSquare size={24} /> {isTr ? "Yorumlar" : "Comments"}
                            </h2>
                            <p className="text-slate-500 text-sm mb-8">
                                {comments.length === 0
                                    ? (isTr ? "Henüz yorum yok. İlk yorumu siz yapın." : "No comments yet. Be the first to comment.")
                                    : `${comments.length} ${isTr ? "yorum" : "comment"}`}
                            </p>
                            <form onSubmit={handleCommentSubmit} className="mb-10 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                <textarea
                                    required
                                    rows={4}
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    placeholder={isTr ? "Yorumunuzu yazın..." : "Write your comment..."}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#e6c800]/30 focus:border-[#e6c800]/50 outline-none resize-none transition-colors"
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        value={commentName}
                                        onChange={(e) => setCommentName(e.target.value)}
                                        placeholder={isTr ? "Adınız" : "Your name"}
                                        className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#e6c800]/30 focus:border-[#e6c800]/50 outline-none"
                                    />
                                    <input
                                        type="email"
                                        value={commentEmail}
                                        onChange={(e) => setCommentEmail(e.target.value)}
                                        placeholder={isTr ? "E-posta" : "Email"}
                                        className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#e6c800]/30 focus:border-[#e6c800]/50 outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={commentSubmitting}
                                    className="px-6 py-3 bg-[#0e0e0e] text-white font-semibold rounded-xl hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors"
                                >
                                    {commentSubmitting ? (isTr ? "Gönderiliyor..." : "Sending...") : (isTr ? "Yorum Gönder" : "Submit Comment")}
                                </button>
                                {commentSuccess && <p className="text-emerald-600 text-sm font-medium flex items-center gap-2">{isTr ? "Yorumunuz onay bekliyor. Teşekkürler!" : "Your comment is pending approval. Thank you!"}</p>}
                                {commentError && <p className="text-red-600 text-sm font-medium">{commentError}</p>}
                            </form>
                            <div className="space-y-4">
                                {comments.map((c) => (
                                    <article key={c.id} className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm">
                                        <p className="text-[#0e0e0e] leading-relaxed">{c.content}</p>
                                        <footer className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                                            <strong className="text-slate-700">{c.user?.name || c.name || (isTr ? "Anonim" : "Anonymous")}</strong>
                                            {" · "}
                                            {new Date(c.created_at).toLocaleDateString(isTr ? "tr-TR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                                        </footer>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {hasPrevNext && (
                    <section className="py-16 bg-white border-t border-[#0a0c10]/[0.06]">
                        <div className="container mx-auto px-6 max-w-5xl">
                            <div className="flex items-center justify-between gap-4">
                                {prev && prev.slug ? (
                                    <Link href={blogHref(prev.slug)} className="group flex-1 max-w-md p-6 rounded-xl border border-[#0a0c10]/[0.06] hover:border-[#e6c800]/50 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-2">
                                            <ArrowLeft size={12} /> {isTr ? "Önceki" : "Previous"}
                                        </span>
                                        <p className="font-bold text-[#0e0e0e] line-clamp-2 group-hover:text-[#e6c800] transition-colors">{prev.title}</p>
                                    </Link>
                                ) : (
                                    <div className="flex-1" />
                                )}
                                {next && next.slug ? (
                                    <Link href={blogHref(next.slug)} className="group flex-1 max-w-md p-6 rounded-xl border border-[#0a0c10]/[0.06] hover:border-[#e6c800]/50 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all text-right">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 justify-end mb-2">
                                            {isTr ? "Sonraki" : "Next"} <ArrowRight size={12} />
                                        </span>
                                        <p className="font-bold text-[#0e0e0e] line-clamp-2 group-hover:text-[#e6c800] transition-colors">{next.title}</p>
                                    </Link>
                                ) : (
                                    <div className="flex-1" />
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {related.length > 0 && (
                    <section className="py-16 bg-white border-t border-[#0a0c10]/[0.06]">
                        <div className="container mx-auto px-6 max-w-5xl">
                            <h2 className="text-2xl font-display font-bold text-[#0e0e0e] mb-8">{isTr ? "İlgili Yazılar" : "Related Posts"}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                                {related.map((r) => (
                                    <Link key={r.id} href={blogHref(r.slug)} className="group block">
                                        <article className="rounded-xl overflow-hidden border border-[#0a0c10]/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300">
                                            <div className="relative aspect-video bg-slate-100">
                                                {r.cover_image ? (
                                                    <Image src={r.cover_image} alt={isTr ? r.title_tr : r.title_en} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">—</div>
                                                )}
                                            </div>
                                            <div className="p-5">
                                                {r.category && <span className="text-[10px] font-bold uppercase text-[#e6c800]">{isTr ? r.category.name_tr : r.category.name_en}</span>}
                                                <h3 className="font-bold text-[#0e0e0e] mt-1 line-clamp-2 group-hover:text-[#e6c800] transition-colors">{isTr ? r.title_tr : r.title_en}</h3>
                                                <p className="text-sm text-slate-500 mt-2 line-clamp-2">{isTr ? r.excerpt_tr : r.excerpt_en}</p>
                                                {r.reading_time_min && <span className="text-xs text-slate-400 mt-2 block">{r.reading_time_min} dk</span>}
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <section className="py-20 bg-[#0a0c10] relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
                    <div className="container mx-auto px-6 max-w-3xl text-center relative z-10">
                        <h2 className="font-display font-extrabold text-white text-2xl md:text-3xl mb-4">
                            {isTr ? "Belgelerinizi UYAP uyumlu formata otomatik dönüştürün" : "Convert your documents to UYAP compatible format automatically"}
                        </h2>
                        <p className="text-white/70 mb-8">
                            {isTr ? "Hukuk Araçları Paketi ile belge iş akışlarınızı hızlandırın." : "Speed up your document workflows with Legal Tools Suite."}
                        </p>
                        <Link href="/dijital-urunler/hukuk-araclari-paketi" className="inline-flex items-center gap-2 px-8 py-4 bg-[#e6c800] text-[#0a0c10] font-bold rounded-xl hover:bg-white transition-colors">
                            {isTr ? "Hukuk Araçları Paketi'ni İncele" : "Try Legal Tools Suite"} <ArrowRight size={18} />
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
