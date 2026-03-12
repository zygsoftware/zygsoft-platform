"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, FileText } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const PRODUCT_URL = "/dijital-urunler/hukuk-araclari-paketi";

export default function DijitalUrunlerPage() {
    const t = useTranslations("AppStore");

    return (
        <div className="min-h-screen flex flex-col font-sans bg-[#fafafc]">
            <Header />

            <main className="flex-1 pt-24 pb-32 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full pointer-events-none bg-[#e6c800]/[0.04]" />
                <div className="container mx-auto px-6 max-w-3xl relative z-10 text-center">
                    <motion.section
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#0a0c10]/[0.08] text-[#0a0c10] text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-[#e6c800]" />
                            {t("badge")}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-[#0a0c10] mb-5 leading-[1.1]">
                            {t("title1")} <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e6c800] via-[#c9ad00] to-[#8a7600]">
                                {t("title2")}
                            </span>
                        </h1>
                        <p className="text-[#0a0c10]/60 text-lg leading-relaxed mb-10">
                            {t("desc")}
                        </p>
                        <Link
                            href={PRODUCT_URL}
                            className="home-btn-primary-yellow inline-flex items-center gap-2.5 px-8 py-4 font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#e6c800]/25"
                        >
                            {t("services.legalToolkitName")} <ArrowRight size={18} />
                        </Link>
                    </motion.section>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="rounded-2xl bg-white border border-[#0a0c10]/[0.06] p-8 shadow-sm hover:shadow-lg transition-shadow"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-[#e6c800]/10 flex items-center justify-center mx-auto mb-4 text-[#e6c800]">
                            <FileText size={32} />
                        </div>
                        <h2 className="text-xl font-black text-[#0a0c10] mb-2">{t("services.legalToolkitName")}</h2>
                        <p className="text-[#0a0c10]/60 text-sm mb-6">{t("services.legalToolkitProductWhat")}</p>
                        <Link
                            href={PRODUCT_URL}
                            className="inline-flex items-center gap-2 text-[#e6c800] font-bold text-sm hover:underline"
                        >
                            {t("viewDetails")} <ArrowRight size={14} />
                        </Link>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
