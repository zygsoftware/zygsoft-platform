"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Check, ArrowRight, Zap, Shield, Layers, FileText, Image as ImageIcon, Users, FileType, Lock } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ParticleField } from "@/components/ui/ParticleField";
import { TiltCard } from "@/components/ui/TiltCard";

export default function SubscriptionsPage() {
    const { data: session, status } = useSession();
    const t = useTranslations("AppStore");
    const hasUdf = (session?.user as any)?.activeProductSlugs?.includes("udf-toolkit");

    const services = [
        {
            id: "udf-toolkit",
            name: t("services.udfToolkitName"),
            desc: t("services.udfToolkitDesc"),
            price: "₺499",
            period: t("services.udfToolkitPeriod"),
            popular: true,
            features: [
                t("services.udfToolkitF1"),
                t("services.udfToolkitF2"),
                t("services.udfToolkitF3"),
                t("services.udfToolkitF4"),
                t("services.udfToolkitF5"),
                t("services.udfToolkitF6")
            ],
            icon: <FileText size={32} className="text-[#e6c800]" />
        },
        {
            id: "web-dev",
            name: t("services.webDevName"),
            desc: t("services.webDevDesc"),
            price: t("services.webDevPrice"),
            period: t("services.webDevPeriod"),
            features: [
                t("services.webDevF1"),
                t("services.webDevF2"),
                t("services.webDevF3"),
                t("services.webDevF4"),
                t("services.webDevF5")
            ],
            icon: <Layers size={32} className="text-cyan-400" />
        },
        {
            id: "social-media",
            name: t("services.socialMediaName"),
            desc: t("services.socialMediaDesc"),
            price: "₺15.000",
            period: t("services.socialMediaPeriod"),
            features: [
                t("services.socialMediaF1"),
                t("services.socialMediaF2"),
                t("services.socialMediaF3"),
                t("services.socialMediaF4"),
                t("services.socialMediaF5")
            ],
            icon: <ImageIcon size={32} className="text-purple-400" />
        }
    ];

    return (
        <div className="min-h-screen flex flex-col font-sans bg-[#fafafc]">
            <Header />

            <main className="flex-1 pt-28 pb-24 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full pointer-events-none bg-[#e6c800]/[0.04]" />
                <div className="absolute left-0 bottom-1/4 w-[400px] h-[400px] rounded-full pointer-events-none bg-[#0a0c10]/[0.02]" />

                <div className="container mx-auto px-6 max-w-6xl relative z-10">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#0a0c10]/[0.08] text-[#0a0c10] text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-sm"
                        >
                            <span className="w-2 h-2 rounded-full bg-[#e6c800] animate-pulse" />
                            {t("badge")}
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-[#0a0c10] mb-5 leading-[1.1]"
                        >
                            {t("title1")} <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e6c800] via-[#c9ad00] to-[#8a7600]">
                                {t("title2")}
                            </span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-[#0a0c10]/60 text-lg md:text-xl leading-relaxed"
                        >
                            {t("desc")}
                        </motion.p>
                    </div>

                    {/* Featured UDF Product Block */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="mb-20"
                    >
                        <div className="relative rounded-[2.5rem] p-8 md:p-12 lg:p-16 bg-[#0a0c10] border border-[#e6c800]/20 overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.15)]">
                            <div className="absolute inset-0 pointer-events-none">
                                <ParticleField variant="dark" count={28} opacity={0.7} />
                            </div>
                            <div className="absolute top-0 right-0 w-96 h-96 bg-[#e6c800]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

                            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-[#e6c800]/20 flex items-center justify-center text-[#e6c800]">
                                            <FileText size={28} />
                                        </div>
                                        <span className="px-3 py-1.5 rounded-full bg-[#e6c800] text-[#0a0c10] text-[10px] font-black uppercase tracking-wider">
                                            {t("udfFlagshipBadge")}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-6 leading-tight">
                                        {t("services.udfToolkitName")}
                                    </h2>
                                    <p className="text-white/70 text-lg leading-relaxed mb-8">
                                        {t("services.udfProductWhat")}
                                    </p>

                                    <div className="space-y-5 mb-8">
                                        <div className="flex items-start gap-4">
                                            <Users size={20} className="text-[#e6c800] shrink-0 mt-0.5" />
                                            <p className="text-white/80 text-sm leading-relaxed">{t("services.udfProductWho")}</p>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <FileType size={20} className="text-[#e6c800] shrink-0 mt-0.5" />
                                            <p className="text-white/80 text-sm">{t("services.udfProductFormats")}</p>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <Lock size={20} className="text-[#e6c800] shrink-0 mt-0.5" />
                                            <p className="text-white/70 text-sm leading-relaxed">{t("services.udfProductSecurity")}</p>
                                        </div>
                                    </div>

                                    {status === "authenticated" && hasUdf ? (
                                        <Link href="/dashboard/tools/doc-to-udf" className="inline-flex items-center gap-3 px-8 py-4 bg-[#e6c800] text-[#0a0c10] font-black uppercase tracking-wider text-sm rounded-2xl hover:bg-white transition-all shadow-xl shadow-[#e6c800]/20">
                                            {t("useTool") || "Aracı Kullan"} <ArrowRight size={18} />
                                        </Link>
                                    ) : status === "authenticated" ? (
                                        <Link href="/dashboard/billing?product=udf-toolkit" className="inline-flex items-center gap-3 px-8 py-4 bg-[#e6c800] text-[#0a0c10] font-black uppercase tracking-wider text-sm rounded-2xl hover:bg-white transition-all shadow-xl shadow-[#e6c800]/20">
                                            {t("buyNow")} <ArrowRight size={18} />
                                        </Link>
                                    ) : (
                                        <Link href="/register" className="inline-flex items-center gap-3 px-8 py-4 bg-[#e6c800] text-[#0a0c10] font-black uppercase tracking-wider text-sm rounded-2xl hover:bg-white transition-all shadow-xl shadow-[#e6c800]/20">
                                            {t("registerNow")} <ArrowRight size={18} />
                                        </Link>
                                    )}
                                </div>

                                <div className="rounded-2xl bg-white/5 border border-white/10 p-8">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-[#e6c800] mb-6">{t("featuresLabel")}</p>
                                    <ul className="space-y-4">
                                        {[t("services.udfToolkitF1"), t("services.udfToolkitF2"), t("services.udfToolkitF3"), t("services.udfToolkitF4"), t("services.udfToolkitF5"), t("services.udfToolkitF6")].map((f, i) => (
                                            <li key={i} className="flex items-center gap-3 text-white/80 text-sm">
                                                <Check size={16} className="text-[#e6c800] shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-8 pt-8 border-t border-white/10 flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-white">₺499</span>
                                        <span className="text-white/50 text-sm font-bold">{t("services.udfToolkitPeriod")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Other Products Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {services.filter(s => s.id !== "udf-toolkit").map((service, index) => (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className="relative flex flex-col h-full"
                            >
                                <TiltCard maxTilt={5} className="h-full">
                                <div className="relative flex flex-col h-full rounded-[2rem] p-8 bg-white border border-[#0a0c10]/[0.06] shadow-sm hover:shadow-xl hover:border-[#0a0c10]/[0.1] hover:-translate-y-1 transition-all duration-500 hover-lift">
                                <div className="mb-8 flex justify-between items-start">
                                    <div className="w-16 h-16 rounded-2xl bg-[#0a0c10] text-[#e6c800] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                                        {service.icon}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-display font-black text-[#0a0c10] mb-3">{service.name}</h3>
                                <p className="text-[#0a0c10]/60 text-sm leading-relaxed mb-6 font-medium">{service.desc}</p>

                                <div className="mb-8 flex items-end gap-1">
                                    <span className="text-3xl font-display font-black text-[#0a0c10] tracking-tight">{service.price}</span>
                                    {service.period && <span className="text-[#0a0c10]/50 font-bold mb-1 ml-1 text-sm">{service.period}</span>}
                                </div>

                                <div className="flex-1 space-y-4 mb-8">
                                    {service.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="mt-1 w-5 h-5 rounded-full bg-[#0a0c10] text-[#e6c800] flex items-center justify-center shrink-0">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            <span className="text-sm text-[#0a0c10]/70 font-medium leading-relaxed">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto">
                                    {status === "authenticated" ? (
                                        service.id === "udf-toolkit" ? (
                                            ((session?.user as any)?.activeProductSlugs || []).includes(service.id) ? (
                                                <div className="flex flex-col gap-2">
                                                    <Link
                                                        href="/dashboard"
                                                        className="w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 bg-[#e6c800] text-[#0a0c10] hover:bg-[#c9ad00] shadow-md shadow-[#e6c800]/20"
                                                    >
                                                        Panelinize Gidin <ArrowRight size={18} />
                                                    </Link>
                                                    {((session?.user as any)?.subscriptions || []).find((s: any) => s.product.slug === service.id)?.endsAt && (
                                                        <p className="text-center text-xs text-[#888] font-bold">
                                                            {t("endDate")} {new Date(((session?.user as any)?.subscriptions || []).find((s: any) => s.product.slug === service.id).endsAt).toLocaleDateString("tr-TR")}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <Link
                                                    href={`/dashboard/billing?product=${service.id}`}
                                                    className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${service.popular
                                                        ? "bg-[#0a0c10] text-white hover:bg-[#0a0c10]/90 shadow-lg"
                                                        : "bg-[#0a0c10] text-white hover:bg-[#0a0c10]/90 shadow-md"
                                                        }`}
                                                >
                                                    {t("buyNow")} <ArrowRight size={18} />
                                                </Link>
                                            )
                                        ) : (
                                            <Link
                                                href="/contact"
                                                className="w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 bg-white text-[#0a0c10] hover:bg-[#fafafc] border border-[#0a0c10]/10 shadow-sm"
                                            >
                                                {t("getInfo")} <ArrowRight size={18} />
                                            </Link>
                                        )
                                    ) : (
                                        <Link
                                            href="/register"
                                            className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${service.popular
                                                ? "bg-[#e6c800] text-[#0a0c10] hover:bg-[#c9ad00] shadow-md shadow-[#e6c800]/20"
                                                : "bg-[#0a0c10] text-white hover:bg-[#0a0c10]/90 shadow-lg"
                                                }`}
                                        >
                                            {t("registerNow")} <ArrowRight size={18} />
                                        </Link>
                                    )}
                                </div>
                                </div>
                                </TiltCard>
                            </motion.div>
                        ))}
                    </div>

                    {/* Info Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-32 max-w-4xl mx-auto p-10 md:p-14 text-center relative overflow-hidden flex flex-col items-center bg-[#0a0c10] rounded-[2.5rem] border border-[#e6c800]/10"
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#e6c800]/20 blur-[100px] pointer-events-none" />

                        <Shield size={48} className="text-[#e6c800] mx-auto mb-6" />
                        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white mb-6 leading-tight">{t("howItWorksTitle")}</h2>

                        <div className="text-left text-zinc-300 space-y-6 max-w-2xl mx-auto mb-10">
                            {[
                                t("step1"),
                                t("step2"),
                                t("step3"),
                                t("step4")
                            ].map((step, idx) => (
                                <div key={idx} className="flex items-start gap-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1a1a1a] text-[#e6c800] border border-[#e6c800]/30 font-bold shrink-0 mt-0.5 shadow-md">
                                        {idx + 1}
                                    </div>
                                    <p className="text-lg leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: step }} />
                                </div>
                            ))}
                        </div>

                        {status === "unauthenticated" && (
                            <Link href="/register" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-[#e6c800] text-[#0a0c10] rounded-2xl font-extrabold text-lg hover:bg-white transition-colors shadow-xl shadow-[#e6c800]/20 relative z-10 w-full md:w-auto">
                                {t("createAccount")} <ArrowRight size={20} />
                            </Link>
                        )}
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
