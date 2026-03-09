"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { Calendar, User, ArrowRight, BookOpen, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useInView } from "framer-motion";
import { useRef } from "react";

type Post = {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string | null;
    publishedAt: string | null;
    tags?: string[];
    author: { name: string };
};

function AnimIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    return (
        <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay }} className={className}>
            {children}
        </motion.div>
    );
}

export default function BlogPage() {
    const t = useTranslations("Blog");
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/blog?published=true")
            .then((res) => res.json())
            .then((data) => {
                const arr = Array.isArray(data) ? data : (data.posts ?? []);
                setPosts(arr);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <>
            <Header />
            <main style={{ background: "#f9f7f3" }} className="min-h-screen">

                {/* ── Hero ── */}
                <section className="pt-40 pb-24 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #f9f7f3 60%, #f0ece0 100%)" }}>
                    <div className="absolute inset-0 pointer-events-none" style={{
                        backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }} />
                    <motion.div className="absolute left-20 top-20 w-72 h-72 rounded-full pointer-events-none"
                        animate={{ y: [0, 20, 0], scale: [1, 1.05, 1] }}
                        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                        style={{ background: "radial-gradient(circle, rgba(230,200,0,0.1) 0%, transparent 70%)" }} />
                    <div className="container mx-auto px-6 max-w-7xl">
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
                            <span className="section-label">{t("blogTag")}</span>
                            <h1 className="font-display font-extrabold text-[#0e0e0e] mt-4 mb-6"
                                style={{ fontSize: "clamp(44px,6vw,88px)", lineHeight: 1.03 }}>
                                {t("title")}
                            </h1>
                            <p className="text-[#666] text-xl leading-relaxed">
                                {t("subtitle")}
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* ── Posts Grid ── */}
                <section className="py-24 bg-white border-y border-black/8">
                    <div className="container mx-auto px-6 max-w-7xl">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3].map(n => (
                                    <div key={n} className="h-[400px] bg-[#f9f7f3] border border-black/8 rounded-sm animate-pulse" />
                                ))}
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-20 bg-[#f9f7f3] border border-black/8 border-dashed rounded-sm">
                                <BookOpen size={48} className="mx-auto text-black/20 mb-4" />
                                <h3 className="font-display font-bold text-2xl text-[#0e0e0e] mb-2">{t("noPostsFound")}</h3>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {posts.map((post, i) => (
                                    <AnimIn key={post.id} delay={i * 0.1}>
                                        <Link href={`/blog/${post.slug}`} className="block h-full group">
                                            <div className="h-full flex flex-col glass rounded-xl overflow-hidden hover-glow transition-all duration-300 hover:-translate-y-2">

                                                {/* Cover */}
                                                <div className="relative h-56 w-full bg-[#f3f0ea] overflow-hidden">
                                                    {post.coverImage ? (
                                                        <img
                                                            src={post.coverImage}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-black/15">
                                                            <BookOpen size={48} />
                                                        </div>
                                                    )}
                                                    {post.tags && post.tags.length > 0 && (
                                                        <div className="absolute bottom-4 left-5">
                                                            <span className="tag-yellow text-[10px] shadow-sm">{post.tags[0]}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="p-8 flex flex-col flex-1">
                                                    <div className="flex items-center gap-3 text-xs text-[#888] mb-4 font-medium uppercase tracking-wide">
                                                        <span className="flex items-center gap-1.5"><User size={12} /> {post.author.name}</span>
                                                        <span className="w-1 h-1 rounded-full bg-black/15" />
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock size={12} />
                                                            {post.publishedAt
                                                                ? new Date(post.publishedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
                                                                : t("newStatus")
                                                            }
                                                        </span>
                                                    </div>

                                                    <h3 className="text-xl font-display font-bold text-[#0e0e0e] mb-3 line-clamp-2 group-hover:text-[#555] transition-colors leading-snug">
                                                        {post.title}
                                                    </h3>

                                                    <p className="text-[#666] text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                                                        {post.excerpt}
                                                    </p>

                                                    <div className="flex items-center font-bold text-[#0e0e0e] text-sm uppercase tracking-wide mt-auto group-hover:text-[#c9ad00] transition-colors">
                                                        {t("readMore")}
                                                        <span className="ml-2 w-8 h-8 rounded-full flex items-center justify-center bg-[#f9f7f3] group-hover:bg-[#e6c800] group-hover:text-[#0e0e0e] transition-all duration-300 shadow-sm group-hover:shadow-[0_4px_15px_rgba(230,200,0,0.3)]">
                                                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                        </span>
                                                    </div>
                                                </div>

                                            </div>
                                        </Link>
                                    </AnimIn>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="py-20" style={{ background: "#f9f7f3" }}>
                    <div className="container mx-auto px-6 max-w-7xl text-center">
                        <AnimIn>
                            <span className="section-label">Bizimle Öğrenin</span>
                            <h2 className="font-display font-extrabold text-[#0e0e0e] mt-4 mb-8" style={{ fontSize: "clamp(32px,4vw,56px)" }}>
                                Gelişmelerden Haberdar Olun
                            </h2>
                            <Link href="/contact" className="btn-primary inline-flex">
                                Bültene Abone Ol
                            </Link>
                        </AnimIn>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
