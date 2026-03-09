"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Calendar, User, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function BlogDetailClient({ post }: { post: any }) {
    const t = useTranslations("Blog");

    return (
        <>
            <Header />
            <main className="min-h-screen" style={{ background: "#f9f7f3" }}>

                {/* ── Hero ── */}
                <section className="relative pt-40 pb-24 overflow-hidden" style={{ background: "linear-gradient(160deg, #f9f7f3 60%, #f0ece0 100%)" }}>
                    <div className="absolute inset-0 pointer-events-none" style={{
                        backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }} />

                    <motion.div className="container mx-auto px-6 max-w-4xl relative z-10"
                        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                    >
                        <Link href="/blog" className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 border border-black/8 rounded-full text-xs font-bold uppercase tracking-wide text-[#555] hover:text-[#0e0e0e] hover:bg-white transition-all mb-8 shadow-sm">
                            <ArrowLeft size={14} /> Blog'a Geri Dön
                        </Link>

                        <h1 className="text-4xl md:text-6xl font-display font-extrabold text-[#0e0e0e] mb-6 leading-[1.1] tracking-tight">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 md:gap-8 text-sm uppercase tracking-wider font-bold text-[#888]">
                            <span className="flex items-center gap-2.5">
                                <span className="w-8 h-8 rounded-full bg-[#f0ece0] flex items-center justify-center text-[#0e0e0e]"><User size={14} /></span>
                                {post.author}
                            </span>
                            <span className="flex items-center gap-2.5">
                                <span className="w-8 h-8 rounded-full bg-[#f0ece0] flex items-center justify-center text-[#0e0e0e]"><Calendar size={14} /></span>
                                {new Date(post.createdAt).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
                            </span>
                        </div>
                    </motion.div>
                </section>

                {/* ── Featured Image ── */}
                {post.image && (
                    <section className="container mx-auto px-6 max-w-5xl -mt-10 relative z-20">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
                            className="w-full aspect-video md:aspect-[21/9] bg-[#f0ece0] rounded-3xl overflow-hidden shadow-2xl border border-white/50"
                        >
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                        </motion.div>
                    </section>
                )}

                {/* ── Content ── */}
                <section className="py-20 text-lg">
                    <div className="container mx-auto px-6 max-w-3xl">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
                            {/* Excerpt */}
                            <p className="text-xl md:text-2xl font-display font-medium text-[#0e0e0e] leading-relaxed mb-12 p-8 bg-white border border-black/8 rounded-2xl shadow-sm relative overflow-hidden">
                                <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#e6c800]" />
                                {post.excerpt}
                            </p>

                            {/* Body */}
                            <div className="prose prose-lg prose-slate max-w-none text-[#444] leading-[1.8] marker:text-[#e6c800] prose-a:text-[#0e0e0e] prose-a:font-bold prose-headings:font-display prose-headings:font-bold prose-headings:text-[#0e0e0e]">
                                {post.content.split("\n").filter(Boolean).map((para: string, i: number) => (
                                    <p key={i}>{para}</p>
                                ))}
                            </div>

                        </motion.div>

                        {/* ── Share & Actions ── */}
                        <div className="mt-20 pt-10 border-t border-black/8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <Link href="/blog" className="inline-flex items-center gap-3 text-[#555] font-bold text-sm uppercase tracking-wider hover:text-[#0e0e0e] transition-colors group">
                                <span className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-black/8 group-hover:border-[#0e0e0e] transition-colors">
                                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                </span>
                                Tüm Yazılara Dön
                            </Link>

                            <Link href="/contact" className="btn-primary group">
                                Bize Ulaşın <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
