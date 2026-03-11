"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Blocks, Zap, Shield, FileText, Workflow, CheckCircle2, Sparkles, Layers, FileStack } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { TiltCard } from "@/components/ui/TiltCard";
import { createHeadingReveal, createRevealUp, revealViewport, staggerContainer } from "@/components/ui/motion";

export function AppStoreShowcase() {
    const locale = useLocale();
    const t = useTranslations("AppStore");
    const reducedMotion = !!useReducedMotion();
    const isTr = locale === "tr";

    const showcaseFeatures = [
        {
            title: t("storeFeature1Title") || "Dijital Ürünler & Yazılım Araçları",
            desc: t("storeFeature1Desc") || "Hukuk büroları ve işletmeler için premium yazılım çözümleri. Hazır, test edilmiş, anında kullanıma hazır.",
            icon: <Blocks size={22} className="text-[#e6c800]" />
        },
        {
            title: t("storeFeature2Title") || "Anında Erişim",
            desc: t("storeFeature2Desc") || "Ödeme onayından sonra araçlarınıza saniyeler içinde panel üzerinden erişin. Kurulum yok, hemen çalışır.",
            icon: <Zap size={22} className="text-[#e6c800]" />
        },
        {
            title: t("storeFeature3Title") || "Gizlilik & Güvenlik",
            desc: t("storeFeature3Desc") || "Belgeleriniz sunucuda işlendikten sonra anında silinir. KVKK uyumlu, hukuk profesyonelleri için güvenli altyapı.",
            icon: <Shield size={22} className="text-[#e6c800]" />
        }
    ];

    const previewProducts = [
        {
            id: "legal-toolkit",
            name: t("services.legalToolkitName") || "Hukuk Araçları Paketi",
            desc: t("services.legalToolkitDesc") || "UYAP ve belge iş akışları için profesyonel belge araçları paketi. Tek yıllık abonelik, tüm araçlar dahil.",
            price: "₺3.000",
            period: t("services.legalToolkitPeriod") || "/yıl",
            icon: <FileText size={36} className="text-[#e6c800]" />,
            tag: t("flagshipBadge") || "Bayrak Ürün",
            flagship: true
        },
    ];

    return (
        <section className="py-24 md:py-28 bg-[#0a0c10] relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "64px 64px" }} />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-start">
                    <motion.div
                        variants={createRevealUp(reducedMotion, 44, 10)}
                        initial="hidden"
                        whileInView="visible"
                        viewport={revealViewport}
                        className="lg:col-span-6"
                    >
                        <div className="inline-flex items-center gap-3 mb-8 px-5 py-2.5 bg-white/8 border border-white/15 rounded-full backdrop-blur">
                            <Blocks size={12} className="text-[#e6c800]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">{t("storeBadge") || "Dijital Ürünler & Yazılım Araçları"}</span>
                        </div>

                        <motion.h2
                            variants={createHeadingReveal(reducedMotion)}
                            initial="hidden"
                            whileInView="visible"
                            viewport={revealViewport}
                            className="text-4xl md:text-5xl xl:text-6xl font-display font-black leading-[0.96] tracking-tight text-white mb-7"
                        >
                            {t("storeTitle") || "Dijital Ürünler ile İşinizi Büyütün"}
                        </motion.h2>

                        <p className="text-white/65 text-lg leading-relaxed mb-10 max-w-xl">
                            {t("storeDesc") || "Avukatlık büroları ve işletmeler için özel yazılım araçları. Hukuk UDF Dönüştürücü ile belgelerinizi UYAP uyumlu formata anında çevirin. Abonelik başlat, saniyeler içinde kullanmaya başla."}
                        </p>

                        <motion.div
                            className="space-y-4 mb-10"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={revealViewport}
                        >
                            {showcaseFeatures.map((feat, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={createRevealUp(reducedMotion, 32, 8)}
                                    className="home-card-dark group flex items-start gap-4 rounded-xl p-5 hover:bg-white/[0.06] hover:border-[#e6c800]/25 transition-all duration-300"
                                >
                                    <div className="shrink-0 w-11 h-11 rounded-lg bg-white/10 border border-white/12 flex items-center justify-center group-hover:bg-[#e6c800]/12 group-hover:border-[#e6c800]/30 transition-colors">
                                        {feat.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1.5">{feat.title}</h4>
                                        <p className="text-white/75 text-sm leading-relaxed">{feat.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        <div className="grid grid-cols-3 gap-3 mb-10">
                            {[
                                { k: "01", t: "Module", d: "UDF Core" },
                                { k: "02", t: "Roadmap", d: "Next: PDF/AI" },
                                { k: "03", t: "Audience", d: "Law Firms" },
                            ].map((item) => (
                                <div key={item.k} className="home-card-dark rounded-2xl p-4">
                                    <p className="text-[#e6c800] text-xl font-black leading-none">{item.k}</p>
                                    <p className="text-white/75 text-[10px] uppercase tracking-[0.2em] mt-2 font-black">{item.t}</p>
                                    <p className="text-white text-sm font-semibold mt-1">{item.d}</p>
                                </div>
                            ))}
                        </div>

                        <Link
                            href="/abonelikler"
                            className="home-btn-primary-yellow inline-flex items-center gap-2.5 px-8 py-4 font-black uppercase tracking-[0.24em] text-[11px] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#e6c800]/25"
                        >
                            {t("viewStoreButton")} <ArrowRight size={18} />
                        </Link>
                    </motion.div>

                    <motion.div
                        variants={createRevealUp(reducedMotion, 44, 10)}
                        initial="hidden"
                        whileInView="visible"
                        viewport={revealViewport}
                        className="lg:col-span-6"
                    >
                        <TiltCard maxTilt={7} className="h-full">
                            <div className="relative rounded-[2.3rem] border border-[#e6c800]/35 bg-gradient-to-b from-white/[0.09] to-white/[0.03] p-7 md:p-8 shadow-[0_50px_120px_rgba(0,0,0,0.38)] overflow-hidden">
                                <div className="absolute -top-20 -right-16 h-60 w-60 rounded-full bg-[#e6c800]/25 blur-3xl" />
                                <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

                                <div className="relative z-10 flex items-start justify-between mb-7">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e6c800] text-[#0a0c10] text-[10px] font-black uppercase tracking-[0.24em]">
                                        <Sparkles size={12} />
                                        {previewProducts[0].tag}
                                    </div>
                                    <span className="text-white/50 text-[10px] uppercase tracking-[0.2em] font-black">{isTr ? "Belge Araçları Paketi" : "Document Tools Package"}</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="rounded-2xl bg-[#0a0c10] border border-white/10 p-5">
                                        <div className="w-12 h-12 rounded-xl bg-[#e6c800]/20 text-[#e6c800] flex items-center justify-center mb-4">
                                            {previewProducts[0].icon}
                                        </div>
                                        <h3 className="text-2xl font-black text-white leading-tight mb-2">{previewProducts[0].name}</h3>
                                        <p className="text-white/55 text-sm leading-relaxed mb-4">{previewProducts[0].desc}</p>
                                        <p className="text-white text-3xl font-black">{previewProducts[0].price}<span className="text-base text-white/50">{previewProducts[0].period}</span></p>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { icon: <Workflow size={14} />, text: isTr ? "8 belge araci, tek yillik abonelik" : "8 document tools, one annual subscription" },
                                            { icon: <Shield size={14} />, text: isTr ? "KVKK uyumlu, belgeler islem sonrasi silinir" : "KVKK-compliant, documents deleted after processing" },
                                            { icon: <Layers size={14} />, text: isTr ? "UYAP, PDF, OCR — hepsi dahil" : "UYAP, PDF, OCR — all included" },
                                            { icon: <CheckCircle2 size={14} />, text: isTr ? "Ayrı satın alma yok, tüm araçlar dahil" : "No separate purchases, all tools included" },
                                        ].map((row, i) => (
                                            <motion.div key={i} whileHover={{ x: 4 }} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 flex items-center gap-3 text-white/85">
                                                <span className="text-[#e6c800]">{row.icon}</span>
                                                <span className="text-sm font-medium">{row.text}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative rounded-2xl border border-white/12 bg-white/[0.03] p-4">
                                    <div className="absolute inset-y-0 left-4 w-px bg-gradient-to-b from-transparent via-[#e6c800]/60 to-transparent" />
                                    <div className="pl-7 space-y-3">
                                        {[
                                            isTr ? "1. Belgeleri yukleyin" : "1. Upload your documents",
                                            isTr ? "2. Otomatik donusum kuyrugunu calistirin" : "2. Run automated conversion queue",
                                            isTr ? "3. UYAP uyumlu ciktiyi indirin" : "3. Download UYAP-compatible output",
                                        ].map((item, i) => (
                                            <p key={i} className="text-white/70 text-sm">{item}</p>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                    <Link href="/abonelikler" className="home-btn-primary-yellow inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-colors">
                                        {isTr ? "Aboneligi gor" : "View plans"}
                                        <ArrowRight size={14} />
                                    </Link>
                                    <Link href="/dashboard/tools" className="home-btn-outline-light inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-colors">
                                        {isTr ? "Araci incele" : "Explore tool"}
                                    </Link>
                                </div>
                            </div>
                        </TiltCard>

                        {previewProducts.length > 1 && (
                            <motion.div
                                variants={staggerContainer}
                                initial="hidden"
                                whileInView="visible"
                                viewport={revealViewport}
                                className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3"
                            >
                                {previewProducts.slice(1).map((prod) => (
                                    <Link key={prod.id} href="/dashboard/tools" className="block">
                                        <motion.div variants={createRevealUp(reducedMotion, 28, 8)} whileHover={{ y: -3 }} transition={{ duration: 0.2 }} className="home-card-dark rounded-2xl p-4 hover:border-[#e6c800]/40 transition-colors duration-200">
                                            <div className="flex items-center gap-3 mb-3 text-white">
                                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">{prod.icon}</div>
                                                <p className="font-bold">{prod.name}</p>
                                            </div>
                                            <p className="text-white/55 text-sm line-clamp-2">{prod.desc}</p>
                                            <div className="mt-3 text-xs font-bold text-[#e6c800]/90">{prod.price}</div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
