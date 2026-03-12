"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Blocks, Zap, Shield, FileText, Workflow, CheckCircle2, Sparkles, Layers } from "lucide-react";
import { Link } from "@/i18n/navigation";
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

    const featureRows = [
        { icon: Workflow, text: isTr ? "8 belge aracı, tek yıllık abonelik" : "8 document tools, one annual subscription", detail: isTr ? "Tüm araçlara sınırsız erişim" : "Unlimited access" },
        { icon: Shield, text: isTr ? "KVKK uyumlu, belgeler işlem sonrası silinir" : "KVKK-compliant, documents deleted after processing", detail: isTr ? "Güvenli altyapı" : "Secure infrastructure" },
        { icon: Layers, text: isTr ? "UYAP, PDF, OCR — hepsi dahil" : "UYAP, PDF, OCR — all included", detail: isTr ? "Tek paket" : "Single package" },
        { icon: CheckCircle2, text: isTr ? "Ayrı satın alma yok, tüm araçlar dahil" : "No separate purchases, all tools included", detail: isTr ? "Şeffaf fiyatlandırma" : "Transparent pricing" },
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

                        <Link
                            href="/dijital-urunler/hukuk-araclari-paketi"
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
                            <div className="relative rounded-[2.3rem] border border-white/10 bg-gradient-to-b from-white/[0.09] to-white/[0.03] p-7 md:p-8 shadow-[0_50px_120px_rgba(0,0,0,0.38)] overflow-hidden">
                                <div className="absolute -top-20 -right-16 h-60 w-60 rounded-full bg-[#e6c800]/15 blur-3xl pointer-events-none" />
                                <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

                                <div className="relative z-10 flex items-start justify-between mb-6">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e6c800] text-[#0a0c10] text-[10px] font-black uppercase tracking-[0.24em]">
                                        <Sparkles size={12} />
                                        {previewProducts[0].tag}
                                    </div>
                                    <span className="text-white/70 text-[10px] uppercase tracking-[0.2em] font-bold">{isTr ? "Belge Araçları Paketi" : "Document Tools Package"}</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                    {/* Main product card */}
                                    <div className="rounded-2xl bg-[#0a0c10]/90 border border-white/10 p-5">
                                        <div className="w-12 h-12 rounded-xl bg-[#e6c800]/20 text-[#e6c800] flex items-center justify-center mb-4">
                                            {previewProducts[0].icon}
                                        </div>
                                        <h3 className="text-2xl font-black text-white leading-tight mb-2">{previewProducts[0].name}</h3>
                                        <p className="text-white/75 text-sm leading-relaxed mb-5">{previewProducts[0].desc}</p>
                                        {/* Price with subtle shine sweep */}
                                        <div className="relative rounded-xl bg-white/[0.08] border border-white/10 px-4 py-3 overflow-hidden">
                                            <span className="relative z-10 text-white text-2xl font-black">{previewProducts[0].price}<span className="text-base text-white/70 font-bold ml-0.5">{previewProducts[0].period}</span></span>
                                            {!reducedMotion && (
                                                <motion.div
                                                    className="absolute inset-0 z-0 pointer-events-none"
                                                    initial={{ x: "-100%" }}
                                                    animate={{ x: "200%" }}
                                                    transition={{
                                                        duration: 3,
                                                        repeat: Infinity,
                                                        ease: [0.4, 0, 0.2, 1],
                                                    }}
                                                    style={{
                                                        background: "linear-gradient(90deg, transparent 0%, rgba(230,200,0,0.1) 30%, rgba(255,255,255,0.14) 50%, rgba(230,200,0,0.1) 70%, transparent 100%)",
                                                        width: "60%",
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Feature cards — interactive */}
                                    <div className="space-y-3">
                                        {featureRows.map((row, i) => {
                                            const Icon = row.icon;
                                            return (
                                                <motion.div
                                                    key={i}
                                                    className="group/card rounded-xl border border-white/10 bg-white/[0.04] p-3 flex items-start gap-3 cursor-default overflow-hidden"
                                                    initial={false}
                                                    whileHover={reducedMotion ? {} : {
                                                        scale: 1.02,
                                                        y: -2,
                                                        borderColor: "rgba(255,255,255,0.2)",
                                                        backgroundColor: "rgba(255,255,255,0.08)",
                                                        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                                                    }}
                                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                                >
                                                    <span className="shrink-0 mt-0.5 text-[#e6c800] group-hover/card:text-[#e6c800] transition-colors">
                                                        <Icon size={16} className="group-hover/card:scale-110 transition-transform duration-300" />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[13px] font-medium text-white/95 leading-snug">{row.text}</p>
                                                        <p className="text-[11px] text-white/60 mt-1 opacity-100 md:opacity-0 md:group-hover/card:opacity-100 transition-opacity duration-300 ease-out">
                                                            {row.detail}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="relative rounded-2xl border border-white/12 bg-white/[0.05] p-4">
                                    <div className="absolute inset-y-0 left-4 w-px bg-gradient-to-b from-transparent via-[#e6c800]/40 to-transparent" />
                                    <div className="pl-7 space-y-3">
                                        {[
                                            isTr ? "1. Belgeleri yükleyin" : "1. Upload your documents",
                                            isTr ? "2. Otomatik dönüşüm kuyruğunu çalıştırın" : "2. Run automated conversion queue",
                                            isTr ? "3. UYAP uyumlu çıktıyı indirin" : "3. Download UYAP-compatible output",
                                        ].map((item, i) => (
                                            <p key={i} className="text-white/85 text-sm">{item}</p>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                    <Link href="/dijital-urunler/hukuk-araclari-paketi" className="home-btn-primary-yellow inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-colors">
                                        {isTr ? "Aboneliği gör" : "View plans"}
                                        <ArrowRight size={14} />
                                    </Link>
                                    <Link href="/dashboard/tools" className="home-btn-outline-light inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-colors">
                                        {isTr ? "Aracı incele" : "Explore tool"}
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
