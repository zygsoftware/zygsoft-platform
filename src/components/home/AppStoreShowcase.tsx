"use client";

import { motion, useInView } from "framer-motion";
import { ArrowRight, Blocks, Zap, Shield, FileText, ImageIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRef } from "react";

export function AppStoreShowcase() {
    const t = useTranslations("AppStore");
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });

    const showcaseFeatures = [
        {
            title: t("storeFeature1Title") || "Kullanıma Hazır Araçlar",
            desc: t("storeFeature1Desc") || "Projelerinizi hızlandıracak, test edilmiş ve onaylanmış premium yazılım çözümleri.",
            icon: <Blocks size={22} className="text-emerald-400" />
        },
        {
            title: t("storeFeature2Title") || "Anında Teslimat",
            desc: t("storeFeature2Desc") || "Satın aldıktan saniyeler sonra aracınızı panelinizde aktif olarak görmeye başlayın.",
            icon: <Zap size={22} className="text-cyan-400" />
        },
        {
            title: t("storeFeature3Title") || "Güvenli ve Şeffaf",
            desc: t("storeFeature3Desc") || "Açık kaynaklı güven inşa eden sistemler. Verileriniz sunucuda işlendikten sonra anında imha edilir.",
            icon: <Shield size={22} className="text-violet-400" />
        }
    ];

    const previewProducts = [
        {
            id: "udf-toolkit",
            name: t("services.udfToolkitName") || "Kapsamlı Hukuk Paketi",
            desc: t("services.udfToolkitDesc") || "Avukatlık büroları için UDF dönüştürücü, OCR, AI özet, KVKK sansürleme ve e-imza araçları.",
            price: "₺499",
            period: t("services.udfToolkitPeriod") || "/ay",
            icon: <FileText size={36} className="text-emerald-400" />,
            tag: "Hukuk",
            color: "emerald"
        },
        {
            id: "social-media",
            name: t("services.socialMediaName") || "Sosyal Medya Yönetimi",
            desc: t("services.socialMediaDesc") || "Aylık 15 kreatif özel gönderi, moderasyon, hedefleme ve Meta Ads yönetimi.",
            price: "₺15.000",
            period: t("services.socialMediaPeriod") || "/ay",
            icon: <ImageIcon size={36} className="text-violet-400" />,
            tag: "Dijital",
            color: "violet"
        }
    ];

    return (
        <section ref={ref} className="py-32 bg-[#0a0a0f] relative overflow-hidden">
            {/* Orbs */}
            <div className="orb orb-brand w-[700px] h-[700px] top-0 right-0 opacity-8" />
            <div className="orb orb-accent w-[500px] h-[500px] bottom-0 left-0 opacity-8" />
            <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                    {/* Left: Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7 }}
                    >
                        <span className="section-eyebrow">
                            <Blocks size={12} className="inline mr-1.5" />
                            {t("storeBadge") || "SaaS Ürünleri & Araçlar"}
                        </span>

                        <h2 className="section-title text-4xl md:text-5xl mb-6">
                            {t("storeTitle") || "İşinizi Büyütecek Premium Araçlar"}
                        </h2>

                        <p className="section-desc text-base mb-10">
                            {t("storeDesc") || "Ajans hizmetlerimizin yanı sıra, işletmenizin günlük operasyonlarını kolaylaştıracak hazır yazılım çözümlerimizi de inceleyin."}
                        </p>

                        <div className="space-y-6 mb-10">
                            {showcaseFeatures.map((feat, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={inView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ delay: 0.1 * idx + 0.3 }}
                                    className="flex gap-4 group"
                                >
                                    <div className="shrink-0 w-11 h-11 rounded-xl bg-white/[0.05] border border-white/8 flex items-center justify-center group-hover:border-emerald-500/20 transition-colors">
                                        {feat.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">{feat.title}</h4>
                                        <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.6 }}
                        >
                            <Link
                                href="/abonelikler"
                                className="btn-primary inline-flex px-8 py-4 rounded-2xl text-sm group"
                            >
                                {t("viewStoreButton")} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Right: Product Cards */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="relative h-full min-h-[480px] flex items-center justify-center"
                    >
                        <div className="relative w-full max-w-sm mx-auto">
                            {previewProducts.map((prod, idx) => (
                                <motion.div
                                    key={prod.id}
                                    initial={{ opacity: 0, y: 40, scale: 0.92 }}
                                    animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                                    transition={{ delay: 0.3 + idx * 0.15, type: "spring", bounce: 0.3 }}
                                    className={`${idx !== 0
                                        ? "absolute top-16 -right-6 scale-[0.88] opacity-50 blur-[1px]"
                                        : ""
                                        } glass-card p-6 rounded-2xl`}
                                >
                                    <div className="flex items-start justify-between mb-5">
                                        <div className={`w-14 h-14 rounded-xl bg-${prod.color === "emerald" ? "emerald" : "violet"}-500/10 border border-${prod.color === "emerald" ? "emerald" : "violet"}-500/20 flex items-center justify-center`}>
                                            {prod.icon}
                                        </div>
                                        <span className={`badge-${prod.color === "emerald" ? "brand" : "accent"} text-[10px]`}>{prod.tag}</span>
                                    </div>
                                    <h3 className="text-lg font-extrabold text-white mb-2">{prod.name}</h3>
                                    <p className="text-sm text-slate-500 mb-5 line-clamp-2">{prod.desc}</p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-2xl font-black text-white">{prod.price}</span>
                                            <span className="text-slate-600 text-sm ml-1">{prod.period}</span>
                                        </div>
                                        <Link href="/abonelikler" className="px-4 py-2 text-sm font-bold rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                                            Seç
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
