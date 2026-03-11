"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Check, ArrowRight, Zap, Shield, FileText, Users, FileType, Lock, Target } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ParticleField } from "@/components/ui/ParticleField";

export default function SubscriptionsPage() {
    const { data: session, status } = useSession();
    const t = useTranslations("AppStore");
    const hasLegalToolkit = (session?.user as any)?.activeProductSlugs?.includes("legal-toolkit");

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

                    {/* Featured Legal Toolkit Product Block */}
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
                                            {t("flagshipBadge")}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-6 leading-tight">
                                        {t("services.legalToolkitName")}
                                    </h2>
                                    <p className="text-white/70 text-lg leading-relaxed mb-6">
                                        {t("services.legalToolkitProductWhat")}
                                    </p>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-start gap-4">
                                            <Users size={20} className="text-[#e6c800] shrink-0 mt-0.5" />
                                            <p className="text-white/80 text-sm leading-relaxed">{t("services.legalToolkitProductWho")}</p>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <Target size={20} className="text-[#e6c800] shrink-0 mt-0.5" />
                                            <p className="text-white/80 text-sm leading-relaxed">{t("services.legalToolkitProductProblems")}</p>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <Lock size={20} className="text-[#e6c800] shrink-0 mt-0.5" />
                                            <p className="text-white/70 text-sm leading-relaxed">{t("services.legalToolkitProductSecurity")}</p>
                                        </div>
                                    </div>

                                    {status === "authenticated" && hasLegalToolkit ? (
                                        <Link href="/dashboard/tools" className="inline-flex items-center gap-3 px-8 py-4 bg-[#e6c800] text-[#0a0c10] font-black uppercase tracking-wider text-sm rounded-2xl hover:bg-white transition-all shadow-xl shadow-[#e6c800]/20">
                                            {t("services.legalToolkitCtaUse")} <ArrowRight size={18} />
                                        </Link>
                                    ) : status === "authenticated" ? (
                                        <Link href="/dashboard/billing?product=legal-toolkit" className="inline-flex items-center gap-3 px-8 py-4 bg-[#e6c800] text-[#0a0c10] font-black uppercase tracking-wider text-sm rounded-2xl hover:bg-white transition-all shadow-xl shadow-[#e6c800]/20">
                                            {t("services.legalToolkitCtaSubscribe")} <ArrowRight size={18} />
                                        </Link>
                                    ) : (
                                        <Link href="/register" className="inline-flex items-center gap-3 px-8 py-4 bg-[#e6c800] text-[#0a0c10] font-black uppercase tracking-wider text-sm rounded-2xl hover:bg-white transition-all shadow-xl shadow-[#e6c800]/20">
                                            {t("registerNow")} <ArrowRight size={18} />
                                        </Link>
                                    )}
                                </div>

                                <div className="rounded-2xl bg-white/5 border border-white/10 p-8">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-[#e6c800] mb-2">{t("services.legalToolkitWhatsIncluded")}</p>
                                    <p className="text-white/60 text-xs font-medium mb-5">{t("services.legalToolkitValueProp")}</p>
                                    <div className="space-y-5">
                                        <div>
                                            <p className="text-white/50 text-[10px] font-black uppercase tracking-wider mb-2">{t("services.legalToolkitGroupUyap")}</p>
                                            <ul className="space-y-2">
                                                <li className="flex items-center gap-3 text-white/80 text-sm"><Check size={14} className="text-[#e6c800] shrink-0" />{t("services.legalToolkitF1")}</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="text-white/50 text-[10px] font-black uppercase tracking-wider mb-2">{t("services.legalToolkitGroupPdf")}</p>
                                            <ul className="space-y-2">
                                                <li className="flex items-center gap-3 text-white/80 text-sm"><Check size={14} className="text-[#e6c800] shrink-0" />{t("services.legalToolkitF2")}</li>
                                                <li className="flex items-center gap-3 text-white/80 text-sm"><Check size={14} className="text-[#e6c800] shrink-0" />{t("services.legalToolkitF3")}</li>
                                                <li className="flex items-center gap-3 text-white/80 text-sm"><Check size={14} className="text-[#e6c800] shrink-0" />{t("services.legalToolkitF4")}</li>
                                                <li className="flex items-center gap-3 text-white/80 text-sm"><Check size={14} className="text-[#e6c800] shrink-0" />{t("services.legalToolkitF5")}</li>
                                                <li className="flex items-center gap-3 text-white/80 text-sm"><Check size={14} className="text-[#e6c800] shrink-0" />{t("services.legalToolkitF6")}</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="text-white/50 text-[10px] font-black uppercase tracking-wider mb-2">{t("services.legalToolkitGroupOcr")}</p>
                                            <ul className="space-y-2">
                                                <li className="flex items-center gap-3 text-white/80 text-sm"><Check size={14} className="text-[#e6c800] shrink-0" />{t("services.legalToolkitF7")}</li>
                                                <li className="flex items-center gap-3 text-white/80 text-sm"><Check size={14} className="text-[#e6c800] shrink-0" />{t("services.legalToolkitF8")}</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-white/10">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-white">₺3.000</span>
                                            <span className="text-white/50 text-sm font-bold">{t("services.legalToolkitPeriod")}</span>
                                        </div>
                                        <p className="text-white/40 text-[10px] font-medium mt-2">{t("services.legalToolkitPriceNote")}</p>
                                        <p className="text-white/50 text-[10px] font-bold mt-1">{t("services.legalToolkitToolCount")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

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
