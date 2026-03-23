"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { 
    ArrowRight, 
    FileText, 
    Layers, 
    Scissors, 
    ImageIcon, 
    FileStack, 
    Zap, 
    CheckCircle2, 
    Star,
    ShieldCheck
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const PRODUCT_URL = "/dijital-urunler/hukuk-araclari-paketi";

export default function DijitalUrunlerPage() {
    const t = useTranslations("AppStore");

    return (
        <div className="min-h-screen flex flex-col font-sans bg-[#fafafc] selection:bg-[#e6c800] selection:text-[#343131]">
            <Header />

            <main className="flex-1 pt-32 pb-32 relative overflow-hidden">
                {/* Background ambient glows */}
                <div className="absolute right-0 top-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#e6c800]/5 to-transparent rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
                <div className="absolute left-0 bottom-0 w-[600px] h-[600px] bg-gradient-to-tr from-slate-200/50 to-transparent rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

                <div className="container mx-auto px-6 max-w-6xl relative z-10">
                    
                    {/* Page Header */}
                    <div className="text-center max-w-3xl mx-auto mb-20 md:mb-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#343131]/[0.05] text-[#343131] text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-[#e6c800]" />
                                {t("storeBadge")}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight text-[#343131] mb-6 leading-[1.1]">
                                {t("storeTitle")}
                            </h1>
                            <p className="text-[#343131]/60 text-lg md:text-xl font-medium leading-relaxed">
                                {t("storeDesc")}
                            </p>
                        </motion.div>
                    </div>

                    {/* Flagship Product Showcase (Hukuk Araçları Paketi) */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="relative w-full rounded-[2.5rem] md:rounded-[3.5rem] bg-[#141313] text-white p-8 md:p-16 lg:p-20 overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.15)] group">
                            
                            {/* Inner glows for dark card */}
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#e6c800]/20 to-transparent rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
                            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3" />

                            <div className="relative z-10 grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                                
                                {/* Left: Info */}
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#e6c800]/10 text-[#e6c800] border border-[#e6c800]/20 text-[10px] font-black uppercase tracking-widest mb-8">
                                        <Star size={12} fill="currentColor" />
                                        {t("flagshipBadge")}
                                    </div>
                                    
                                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-6 tracking-tight leading-[1.05]">
                                        {t("services.legalToolkitName")}
                                    </h2>
                                    
                                    <p className="text-white/60 text-lg md:text-xl leading-relaxed mb-8 font-medium">
                                        {t("services.legalToolkitDesc")}
                                    </p>

                                    <div className="flex flex-col gap-4 mb-10">
                                        {[
                                            "Sınırsız araç kullanımı", 
                                            "Aynı gün aktivasyon", 
                                            "KVKK uyumlu & İşlem sonrası otomatik silinme"
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 text-white/80 font-medium">
                                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                    <CheckCircle2 size={12} className="text-emerald-400" />
                                                </div>
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                        <Link
                                            href={PRODUCT_URL}
                                            className="inline-flex items-center gap-3 bg-[#e6c800] text-[#141313] px-8 py-4 md:py-5 rounded-2xl text-[13px] md:text-sm font-black uppercase tracking-widest hover:bg-[#c9ad00] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#e6c800]/20 whitespace-nowrap"
                                        >
                                            {t("viewDetails")} <ArrowRight size={18} />
                                        </Link>
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black text-white">₺3.000 <span className="text-sm text-white/40 font-bold">{t("services.legalToolkitPeriod")}</span></span>
                                            <span className="text-xs font-bold text-[#e6c800] uppercase tracking-wider mt-1">{t("services.legalToolkitToolCount")}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Features Grid (Bento style inside the card) */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md hover:bg-white/10 transition-colors">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                                            <FileText size={24} />
                                        </div>
                                        <div className="text-sm font-bold text-white mb-2">{t("services.legalToolkitF1")}</div>
                                    </div>
                                    
                                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md hover:bg-white/10 transition-colors translate-y-0 lg:translate-y-8">
                                        <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4">
                                            <Layers size={24} />
                                        </div>
                                        <div className="text-sm font-bold text-white mb-2">{t("services.legalToolkitF4")}</div>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md hover:bg-white/10 transition-colors">
                                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                                            <Scissors size={24} />
                                        </div>
                                        <div className="text-sm font-bold text-white mb-2">{t("services.legalToolkitF5")}</div>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md hover:bg-white/10 transition-colors translate-y-0 lg:translate-y-8">
                                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
                                            <ImageIcon size={24} />
                                        </div>
                                        <div className="text-sm font-bold text-white mb-2">{t("services.legalToolkitF6")}</div>
                                    </div>
                                    
                                    <div className="col-span-2 bg-[#e6c800]/10 border border-[#e6c800]/20 p-6 rounded-3xl backdrop-blur-md mt-0 lg:mt-8 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[#e6c800] text-[#141313] flex items-center justify-center shrink-0">
                                            <Zap size={24} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white mb-1">OCR & AI Desktekli Toplu İşlemler</div>
                                            <p className="text-xs font-medium text-white/50 leading-relaxed">Yeni nesil belge yönetimi. Süreçlerinizi saniyelere indirin.</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </motion.div>

                    {/* How It Works Layer */}
                    <div className="mt-32">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-display font-black text-[#343131] mb-4">{t("howItWorksTitle")}</h2>
                            <p className="text-[#343131]/60 font-medium">Satın alma ve aktivasyon adımları</p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6">
                            {[
                                { step: 1, title: "Hesap Oluşturun", desc: "Ücretsiz hesabınıza giriş yapın.", icon: <ShieldCheck size={24} /> },
                                { step: 2, title: "Ödeme Yapın", desc: "İlgili tutarı banka hesabımıza gönderin.", icon: <FileText size={24} /> },
                                { step: 3, title: "Dekont İletin", desc: "Panelden ödeme bildirimi gönderin.", icon: <Layers size={24} /> },
                                { step: 4, title: "Anında Kullanın", desc: "Onay ardından araçlarınızı sınırsız kullanın.", icon: <Zap size={24} /> },
                            ].map((item, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className="bg-white border border-[#343131]/[0.06] rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-[#fafafc] border border-[#343131]/5 flex items-center justify-center text-[#343131]/40 mb-6">
                                        {item.icon}
                                    </div>
                                    <div className="text-[10px] font-black text-[#e6c800] mb-2 uppercase tracking-widest">Adım 0{item.step}</div>
                                    <h3 className="text-lg font-black text-[#343131] mb-2">{item.title}</h3>
                                    <p className="text-sm text-[#343131]/60 font-medium leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
