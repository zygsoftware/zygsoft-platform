"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { servicesData } from "@/lib/servicesData";
import { ArrowRight, Globe, Megaphone, Palette, BarChart3, Layers, Code2 } from "lucide-react";
import { BlockReveal, TextReveal } from "@/components/ui/reveal";

const icons: Record<string, React.ReactNode> = {
    "web-ve-uygulama-gelistirme": <Globe size={32} />,
    "sosyal-medya-yonetimi": <Megaphone size={32} />,
    "marka-kimligi-ve-grafik-tasarim": <Palette size={32} />,
    "dijital-strateji-ve-pazarlama": <BarChart3 size={32} />
};

export default function Services() {
    const t = useTranslations("Services");
    const locale = useLocale();
    const lang = locale === "en" ? "en" : "tr";

    return (
        <>
            <Header />
            <main style={{ background: "#f9f7f3" }} className="min-h-screen flex flex-col">

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
                            <span className="section-label">Hizmetlerimiz</span>
                            <h1 className="font-display font-extrabold text-[#0e0e0e] mt-4 mb-6"
                                style={{ fontSize: "clamp(44px,6vw,88px)", lineHeight: 1.03 }}>
                                {t("title")}
                            </h1>
                            <p className="text-[#666] text-xl max-w-xl leading-relaxed">
                                {t("subtitle")}
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* ── Services Grid ── */}
                <section className="py-24 bg-white border-y border-black/8 flex-1">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.keys(servicesData).map((slug, index) => {
                                const entry = servicesData[slug][lang];
                                const title = entry.title;
                                const subtitle = entry.subtitle;
                                const icon = icons[slug] || <Code2 size={32} />;

                                return (
                                    <BlockReveal key={slug} delay={index * 0.08} className="h-full">
                                        <Link href={`/services/${slug}`} className="block h-full outline-none">
                                            <motion.div
                                                className="glass p-10 h-full flex flex-col relative overflow-hidden group hover-glow"
                                                whileHover={{ y: -4, transition: { duration: 0.2 } }}>

                                                {/* Animated BG on hover */}
                                                <motion.div
                                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                                    style={{ background: "radial-gradient(circle at top right, rgba(230,200,0,0.06) 0%, transparent 60%)" }} />

                                                <div className="w-16 h-16 rounded-2xl glass border border-white/40 shadow-sm flex items-center justify-center text-[#0e0e0e] mb-8 group-hover:bg-[#e6c800] group-hover:border-[#e6c800] group-hover:shadow-[0_4px_15px_rgba(230,200,0,0.4)] transition-all duration-300">
                                                    {icon}
                                                </div>

                                                <h3 className="font-display font-bold text-2xl text-[#0e0e0e] mb-4 group-hover:text-black transition-colors">
                                                    {title}
                                                </h3>

                                                <p className="text-[#666] leading-relaxed mb-8 flex-1">
                                                    {subtitle}
                                                </p>

                                                <div className="flex items-center text-sm font-bold text-[#e6c800] uppercase tracking-wider mt-auto group-hover:text-[#c9ad00] transition-colors">
                                                    Detaylı İncele <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </motion.div>
                                        </Link>
                                    </BlockReveal>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="py-20" style={{ background: "#f9f7f3" }}>
                    <div className="container mx-auto px-6 max-w-7xl text-center">
                        <BlockReveal>
                            <TextReveal delay={0.08}>
                                <h2 className="font-display font-extrabold text-[#0e0e0e] mb-6" style={{ fontSize: "clamp(32px,3.5vw,48px)" }}>
                                    Projenizi Birlikte Hayata Geçirelim
                                </h2>
                            </TextReveal>
                            <TextReveal delay={0.16}>
                                <p className="text-[#888] text-lg mb-8 max-w-2xl mx-auto">
                                    Hangi hizmete ihtiyacınız olduğundan emin değilseniz sorun değil. İşletmenizi anlayarak size en uygun dijital stratejiyi birlikte belirleyelim.
                                </p>
                            </TextReveal>
                            <BlockReveal delay={0.12}>
                                <Link href="/contact" className="btn-primary inline-flex">
                                    Ücretsiz Ön Görüşme Talep Edin <ArrowRight size={16} />
                                </Link>
                            </BlockReveal>
                        </BlockReveal>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
