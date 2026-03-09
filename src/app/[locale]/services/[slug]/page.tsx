"use client";

import { notFound } from "next/navigation";
import { servicesData } from "@/lib/servicesData";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { use, useRef } from "react";
import { useInView } from "framer-motion";

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

import { Plus, Minus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";

function FAQItem({ q, a }: { q: string; a: string }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-black/8 last:border-0 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left group"
            >
                <span className="text-xl font-display font-bold text-[#0e0e0e] group-hover:text-[#e6c800] transition-colors">{q}</span>
                <div className={`w-8 h-8 rounded-full border border-black/10 flex items-center justify-center transition-all ${isOpen ? 'bg-[#e6c800] border-[#e6c800] text-[#0e0e0e]' : 'text-[#666]'}`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="pb-8 text-[#666] leading-relaxed max-w-2xl text-lg">
                            {a}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const serviceExists = slug in servicesData;
    const t = useTranslations("ServiceDetails");

    if (!serviceExists) {
        notFound();
    }

    const title = t(`${slug}.title`);
    const subtitle = t(`${slug}.subtitle`);
    const content = t(`${slug}.content`);
    const features = t.raw(`${slug}.features`) as string[];
    const faqs = t.raw(`${slug}.faq`) as { q: string; a: string }[];

    return (
        <>
            <Header />
            <main style={{ background: "#f9f7f3" }} className="min-h-screen">

                {/* ── Hero ── */}
                <section className="pt-48 pb-32 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #f9f7f3 60%, #f0ece0 100%)" }}>
                    <div className="absolute inset-0 pointer-events-none" style={{
                        backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }} />

                    {/* Dynamic Image based on slug */}
                    <div className="absolute right-0 top-0 w-full h-full pointer-events-none flex justify-end">
                        <motion.div
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 0.1, scale: 1 }}
                            transition={{ duration: 1.5 }}
                            className="w-full h-full lg:w-1/2"
                        >
                            <img
                                src={
                                    slug === "web-ve-uygulama-gelistirme" ? "file:///Users/gunesai/.gemini/antigravity/brain/f86ca286-fc44-40fe-b0ce-6cf989e2c8b3/service_web_dev_premium_1772719410336.png" :
                                        slug === "sosyal-medya-yonetimi" ? "file:///Users/gunesai/.gemini/antigravity/brain/f86ca286-fc44-40fe-b0ce-6cf989e2c8b3/service_social_media_dynamic_1772719430451.png" :
                                            slug === "marka-kimligi-ve-grafik-tasarim" ? "file:///Users/gunesai/.gemini/antigravity/brain/f86ca286-fc44-40fe-b0ce-6cf989e2c8b3/service_branding_identity_1772719444719.png" :
                                                "file:///Users/gunesai/.gemini/antigravity/brain/f86ca286-fc44-40fe-b0ce-6cf989e2c8b3/hero_digital_future_1772719393563.png"
                                }
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#f9f7f3] via-[#f9f7f3]/50 to-transparent lg:block hidden" />
                        </motion.div>
                    </div>

                    <div className="container mx-auto px-6 max-w-7xl relative z-10">
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
                            <span className="section-label">Hizmet Detayı</span>
                            <h1 className="font-display font-extrabold text-[#0e0e0e] mt-4 mb-6"
                                style={{ fontSize: "clamp(36px,5vw,72px)", lineHeight: 1.05 }}>
                                {title}
                            </h1>
                            <p className="text-[#666] text-xl leading-relaxed">
                                {subtitle}
                            </p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-12"
                            >
                                <Link href="/contact" className="btn-primary">Hemen Başlayın <ArrowRight size={18} /></Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* ── Content ── */}
                <section className="py-24 bg-white border-y border-black/8">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                            {/* Main Content (Left) */}
                            <div className="lg:col-span-8">
                                <AnimIn>
                                    <h2 className="font-display font-bold text-3xl text-[#0e0e0e] mb-6">Genel Bakış</h2>
                                    <p className="text-[#666] text-lg leading-relaxed mb-12">
                                        {content}
                                    </p>

                                    <h3 className="font-display font-bold text-2xl text-[#0e0e0e] mb-6">Sürecin Avantajları</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
                                        {features.map((feature, idx) => (
                                            <div key={idx} className="flex items-start gap-4 p-5 bg-[#f9f7f3] border border-black/8 rounded-sm">
                                                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#e6c800" }}>
                                                    <Check size={14} className="text-[#0e0e0e]" strokeWidth={3} />
                                                </div>
                                                <span className="text-[#0e0e0e] font-medium leading-relaxed">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* FAQ Section */}
                                    <div className="pt-20 border-t border-black/8">
                                        <h3 className="font-display font-bold text-3xl text-[#0e0e0e] mb-2">Sıkça Sorulan Sorular</h3>
                                        <p className="text-[#888] mb-10 text-lg">Hizmetimizle ilgili en çok merak edilenlere göz atın.</p>
                                        <div className="flex flex-col">
                                            {faqs?.map((faq, idx) => (
                                                <FAQItem key={idx} q={faq.q} a={faq.a} />
                                            ))}
                                        </div>
                                    </div>
                                </AnimIn>
                            </div>

                            {/* Sidebar CTA (Right) */}
                            <div className="lg:col-span-4">
                                <AnimIn delay={0.15}>
                                    <div className="bg-[#0e0e0e] p-10 rounded-sm text-center sticky top-32">
                                        <div className="w-16 h-16 mx-auto bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6">
                                            <span className="text-3xl">👋</span>
                                        </div>
                                        <h3 className="font-display font-bold text-2xl text-white mb-4">
                                            Projeye Başlayalım
                                        </h3>
                                        <p className="text-white/60 mb-8 leading-relaxed">
                                            Bu hizmetle ilgili detaylı bilgi ve fiyat teklifi almak için bizimle iletişime geçin.
                                        </p>
                                        <Link href="/contact" className="btn-yellow w-full justify-center">
                                            Teklif Alın <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </AnimIn>
                            </div>

                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
