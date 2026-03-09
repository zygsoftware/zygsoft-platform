"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ExternalLink, Code2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useInView } from "framer-motion";
import { useRef } from "react";

type Project = {
    id: string;
    title: string;
    description: string;
    client?: string;
    link?: string;
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

export default function Portfolio() {
    const t = useTranslations("Portfolio");
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch("/api/projects");
                const data = await res.json();
                setProjects(data);
            } catch (error) {
                console.error("Projeler yüklenemedi", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
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
                    <motion.div className="absolute right-20 top-20 w-72 h-72 rounded-full pointer-events-none"
                        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        style={{ background: "radial-gradient(circle, rgba(230,200,0,0.1) 0%, transparent 70%)" }} />
                    <div className="container mx-auto px-6 max-w-7xl">
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                            <span className="section-label">Portfolyo</span>
                            <h1 className="font-display font-extrabold text-[#0e0e0e] mt-4 mb-6"
                                style={{ fontSize: "clamp(44px,6vw,88px)", lineHeight: 1.03 }}>
                                Seçilmiş Projeler
                            </h1>
                            <p className="text-[#666] text-xl max-w-xl leading-relaxed">
                                Geliştirdiğimiz yazılımları, tasarladığımız markaları ve yönettiğimiz kampanyaları keşfedin.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* ── Projects Grid ── */}
                <section className="py-24 bg-white border-y border-black/8">
                    <div className="container mx-auto px-6 max-w-7xl">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[1, 2, 3, 4].map(n => (
                                    <div key={n} className="aspect-[4/3] bg-[#f9f7f3] border border-black/8 rounded-sm animate-pulse" />
                                ))}
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="text-center py-20 bg-[#f9f7f3] border border-black/8 border-dashed rounded-sm">
                                <Code2 size={48} className="mx-auto text-black/20 mb-4" />
                                <h3 className="font-display font-bold text-2xl text-[#0e0e0e] mb-2">Henüz Proje Yok</h3>
                                <p className="text-[#888]">{t("description")}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {projects.map((p, i) => (
                                    <AnimIn key={p.id} delay={i * 0.1}>
                                        <div className="group block overflow-hidden rounded-xl glass hover-glow transition-all duration-300">
                                            <motion.div
                                                className="aspect-[4/3] flex flex-col justify-end relative overflow-hidden"
                                                style={{ background: i % 2 === 0 ? "#0e0e0e" : "#f9f7f3" }}
                                                whileHover={{ scale: 1.02 }}
                                                transition={{ duration: 0.4 }}
                                            >
                                                <motion.div
                                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                                    style={{ background: i % 2 === 0 ? "linear-gradient(135deg, rgba(230,200,0,0.08) 0%, transparent 60%)" : "linear-gradient(135deg, rgba(230,200,0,0.06) 0%, transparent 60%)" }} />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Code2 size={100} style={{ color: i % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }} />
                                                </div>
                                            </motion.div>

                                            <div className="p-8 relative">
                                                <motion.div className="absolute top-0 left-0 h-1"
                                                    style={{ background: "#e6c800" }}
                                                    initial={{ width: "0%" }}
                                                    whileHover={{ width: "100%" }}
                                                    transition={{ duration: 0.4 }} />

                                                <span className="text-xs font-bold uppercase tracking-widest text-[#888] mb-3 block">
                                                    {p.client ? `${p.client} / 2024` : "2024"}
                                                </span>
                                                <h3 className="font-display font-bold text-2xl text-[#0e0e0e] mb-4">
                                                    {p.title}
                                                </h3>
                                                <p className="text-[#666] leading-relaxed mb-6 line-clamp-3">
                                                    {p.description}
                                                </p>
                                                {p.link && (
                                                    <a href={p.link} target="_blank" rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 text-sm font-bold text-[#e6c800] hover:text-[#c9ad00] transition-colors uppercase tracking-wider relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[#e6c800] hover:after:w-full after:transition-all after:duration-300 mt-4">
                                                        Projeyi İncele <ExternalLink size={16} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </AnimIn>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="py-20" style={{ background: "#0e0e0e" }}>
                    <div className="container mx-auto px-6 max-w-7xl text-center">
                        <AnimIn>
                            <span className="section-label" style={{ color: "#e6c800", borderColor: "#e6c800" }}>Benzer Bir Proje?</span>
                            <h2 className="font-display font-extrabold text-white mt-4 mb-8" style={{ fontSize: "clamp(32px,4vw,56px)" }}>
                                Sizin Projenizi De Konuşalım
                            </h2>
                            <Link href="/contact" className="btn-yellow inline-flex">
                                İletişime Geç
                            </Link>
                        </AnimIn>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
