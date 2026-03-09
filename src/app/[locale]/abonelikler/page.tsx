"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Check, ArrowRight, Zap, Shield, Blocks, Layers, FileText, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function SubscriptionsPage() {
    const { data: session, status } = useSession();
    const t = useTranslations("AppStore");

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
            icon: <FileText size={32} className="text-emerald-400" />
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
        <div className="min-h-screen flex flex-col font-sans" style={{ background: "#f9f7f3" }}>
            <Header />

            <main className="flex-1 pt-32 pb-24 relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute right-0 top-0 w-[600px] h-[600px] rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(230,200,0,0.06) 0%, transparent 70%)" }} />
                <div className="absolute left-[-10%] top-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(0,0,0,0.02) 0%, transparent 70%)" }} />

                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="text-center md:max-w-3xl lg:max-w-4xl mx-auto mb-20 px-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-black/10 bg-white/60 backdrop-blur-md text-[#0e0e0e] text-xs font-bold uppercase tracking-widest mb-8 shadow-sm"
                        >
                            <span className="w-2 h-2 rounded-full bg-[#e6c800] animate-pulse"></span>
                            Zygsoft {t("badge") || "Hizmet Mağazası"}
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-7xl font-display font-extrabold tracking-tight text-[#0e0e0e] mb-6 leading-tight"
                        >
                            {t("title1")} <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e6c800] via-[#c9ad00] to-[#8a7600]">
                                {t("title2")}
                            </span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-[#666] leading-relaxed max-w-2xl mx-auto"
                        >
                            {t("desc")}
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {services.map((service, index) => (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className={`relative flex flex-col h-full rounded-2xl p-8 transition-all duration-500 group hover-glow glass ${service.popular
                                    ? "border-[#e6c800]/50 shadow-[0_20px_40px_rgba(230,200,0,0.1)] -translate-y-2"
                                    : "border-black/5 hover:-translate-y-2"
                                    }`}
                            >
                                {service.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-[#0e0e0e] text-[#e6c800] text-xs font-bold uppercase tracking-wider rounded-full shadow-lg z-10 flex items-center gap-1.5 border border-[#e6c800]/20">
                                        <Zap size={14} fill="currentColor" /> {t("popular")}
                                    </div>
                                )}

                                <div className="mb-8 flex justify-between items-start">
                                    <div className="w-16 h-16 rounded-[1.25rem] bg-[#0e0e0e] text-[#e6c800] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500 ease-out">
                                        {service.icon}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-display font-bold text-[#0e0e0e] mb-3">{service.name}</h3>
                                <p className="text-[#666] text-sm leading-relaxed mb-6 h-12 font-medium">{service.desc}</p>

                                <div className="mb-8 flex items-end gap-1">
                                    <span className="text-4xl font-display font-extrabold text-[#0e0e0e] tracking-tight">{service.price}</span>
                                    {service.period && <span className="text-[#888] font-bold mb-1.5 ml-1">{service.period}</span>}
                                </div>

                                <div className="flex-1 space-y-4 mb-8">
                                    {service.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="mt-1 w-5 h-5 rounded-full bg-[#0e0e0e] text-[#e6c800] flex items-center justify-center shrink-0">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            <span className="text-sm text-[#555] font-semibold leading-relaxed">{feature}</span>
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
                                                        className="w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 bg-[#e6c800] text-[#0e0e0e] hover:bg-[#c9ad00] shadow-md shadow-[#e6c800]/20"
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
                                                        ? "bg-[#0e0e0e] text-white hover:bg-black shadow-lg shadow-black/20"
                                                        : "bg-white text-[#0e0e0e] hover:bg-zinc-100 border border-black/10 shadow-sm"
                                                        }`}
                                                >
                                                    {t("buyNow")} <ArrowRight size={18} />
                                                </Link>
                                            )
                                        ) : (
                                            <Link
                                                href="/contact"
                                                className="w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 bg-white text-[#0e0e0e] hover:bg-zinc-100 border border-black/10 shadow-sm"
                                            >
                                                {t("getInfo")} <ArrowRight size={18} />
                                            </Link>
                                        )
                                    ) : (
                                        <Link
                                            href="/register"
                                            className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${service.popular
                                                ? "bg-[#e6c800] text-[#0e0e0e] hover:bg-[#c9ad00] shadow-md shadow-[#e6c800]/20"
                                                : "bg-[#0e0e0e] text-white hover:bg-black shadow-lg shadow-black/20"
                                                }`}
                                        >
                                            {t("registerNow")} <ArrowRight size={18} />
                                        </Link>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Info Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-32 max-w-4xl mx-auto p-10 md:p-14 text-center relative overflow-hidden flex flex-col items-center bg-[#0e0e0e] rounded-3xl"
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
                            <Link href="/register" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-[#e6c800] text-[#0e0e0e] rounded-2xl font-extrabold text-lg hover:bg-[#c9ad00] transition-colors shadow-xl shadow-[#e6c800]/20 relative z-10 w-full md:w-auto">
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
