"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    FileText,
    Shield,
    Check,
    ChevronDown,
    LayoutDashboard,
    FileStack,
    ScanText,
    Merge,
    Image,
    Split,
    ImageIcon,
    Layers,
    Scale,
    Briefcase,
    GraduationCap,
    UserCheck,
    AlertCircle,
    Play,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/Header";
import { TrialRequestCTA } from "@/components/trial/TrialRequestCTA";
import { Footer } from "@/components/layout/Footer";
import { PanelShowcase } from "@/components/home/PanelShowcase";
import { createRevealUp, revealViewport, staggerContainer } from "@/components/ui/motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const TOOLS = [
    { icon: FileText, title: "DOCX → UDF dönüştürücü", desc: "UYAP uyumlu belge dönüşümü, tek tıkla." },
    { icon: Image, title: "TIFF → PDF", desc: "Tarama belgelerini PDF'e çevirin." },
    { icon: ImageIcon, title: "Görsel → PDF", desc: "JPG, PNG dosyalarını PDF'e dönüştürün." },
    { icon: Merge, title: "PDF Birleştir", desc: "Birden fazla PDF'i tek dosyada birleştirin." },
    { icon: Split, title: "PDF Böl", desc: "PDF sayfalarını bölün veya ayırın." },
    { icon: ImageIcon, title: "PDF → Görsel", desc: "PDF sayfalarını görsel formatına çevirin." },
    { icon: ScanText, title: "OCR Metin çıkarma", desc: "Taranan belgelerden metin çıkarın." },
    { icon: Layers, title: "Toplu belge dönüştürme", desc: "Çoklu dosya işlemleri tek seferde." },
];

const AUDIENCE = [
    { icon: Scale, title: "Avukatlar", desc: "Dilekçe ve savunma belgelerini hızlıca UYAP formatına dönüştürün." },
    { icon: Briefcase, title: "Hukuk büroları", desc: "Ekip genelinde standart belge iş akışlarını yönetin." },
    { icon: GraduationCap, title: "Stajyer avukatlar", desc: "Belge hazırlama süreçlerini hızlandırın." },
    { icon: UserCheck, title: "Hukuk sekreterleri", desc: "UYAP yükleme ve dosya işlemlerini kolaylaştırın." },
];

const PROBLEMS = [
    {
        problem: "UYAP belge format uyumsuzluğu",
        solution: "DOCX → UDF dönüştürücü ile belgeleriniz otomatik olarak UYAP uyumlu formata dönüştürülür. Manuel düzenleme gerektirmez.",
    },
    {
        problem: "Tarama belgelerden metin çıkarma",
        solution: "OCR aracı ile taranan belgelerden metin çıkarın. Kopyalayın, düzenleyin veya dışa aktarın.",
    },
    {
        problem: "PDF işlemleri için farklı program kullanma",
        solution: "PDF birleştirme, bölme ve dönüştürme tek platformda. Tüm araçlar aynı panelde.",
    },
    {
        problem: "Toplu belge işlemlerinin zaman kaybı",
        solution: "Toplu dönüştürme aracı ile yüzlerce dosyayı tek seferde işleyin. Zamandan tasarruf edin.",
    },
];

const STEPS = [
    { num: 1, title: "Belgenizi yükleyin", desc: "Dosyayı sürükleyin veya seçin." },
    { num: 2, title: "Araç otomatik işlemi başlatsın", desc: "UYAP uyumlu dönüşüm otomatik başlar." },
    { num: 3, title: "UYAP uyumlu çıktıyı indirin", desc: "İşlenen belgeyi indirin ve kullanın." },
];

const FAQ_ITEMS = [
    {
        q: "UYAP için DOCX nasıl UDF yapılır?",
        a: "Belgenizi yükleyin, sistem otomatik olarak UYAP uyumlu UDF formatına dönüştürür. Ek işlem gerekmez.",
    },
    {
        q: "PDF birleştirme aracı nasıl çalışır?",
        a: "Birden fazla PDF dosyasını yükleyin, sıralama yapın ve birleştirme butonuna tıklayın. Tek PDF çıktısı alırsınız.",
    },
    {
        q: "OCR metin çıkarma nedir?",
        a: "Taranan veya görsel belgelerdeki metni tanıyıp metin formatına çeviren teknolojidir. Kopyala-yapıştır veya dışa aktarma yapabilirsiniz.",
    },
    {
        q: "Belgelerim saklanıyor mu?",
        a: "Hayır. Belgeleriniz işlem tamamlandıktan sonra sunucularımızdan kalıcı olarak silinir. KVKK uyumlu, gizlilik öncelikli altyapı.",
    },
];

const PRICE_FEATURES = [
    "8 araç, sınırsız kullanım",
    "Tek yıllık ödeme",
    "UYAP uyumlu çıktı",
    "KVKK uyumlu altyapı",
    "Belgeler işlem sonrası silinir",
];

function DashboardMock() {
    return (
        <div className="w-full max-w-[420px] rounded-2xl bg-white border border-[#0a0c10]/[0.06] shadow-[0_24px_64px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="h-10 bg-[#0a0c10]/[0.02] border-b border-[#0a0c10]/[0.06] flex items-center px-4">
                <span className="text-[11px] font-bold text-[#0a0c10]/60">ZYGSOFT Panel</span>
            </div>
            <div className="flex min-h-[280px]">
                <aside className="w-[140px] shrink-0 border-r border-[#0a0c10]/[0.06] py-4 bg-[#0a0c10]/[0.01]">
                    {["Genel Bakış", "Belge Araçları", "PDF Araçları", "OCR", "Ayarlar"].map((label, i) => (
                        <div key={label} className="flex items-center gap-2 px-3 py-2.5 mx-2 rounded-lg text-[11px] font-medium text-[#0a0c10]/50">
                            <LayoutDashboard size={14} className="shrink-0 opacity-70" />
                            <span className="truncate">{label}</span>
                        </div>
                    ))}
                </aside>
                <main className="flex-1 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-16 h-16 rounded-xl bg-[#e6c800]/10 flex items-center justify-center">
                            <FileText size={24} className="text-[#e6c800]" />
                        </div>
                        <div>
                            <p className="text-[13px] font-black text-[#0a0c10]">DOCX → UDF</p>
                            <p className="text-[11px] text-[#0a0c10]/50">dava_dilekcesi.docx</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl border border-[#e6c800]/20 bg-[#e6c800]/[0.05]">
                        <div className="flex items-center gap-2 text-[12px] text-[#e6c800] font-bold">
                            <Check size={14} />
                            Dönüşüm tamamlandı
                        </div>
                        <p className="text-[11px] text-[#0a0c10]/50 mt-1">dava_dilekcesi.udf</p>
                    </div>
                </main>
            </div>
        </div>
    );
}

function FaqItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
    return (
        <div className="border-b border-[#0a0c10]/[0.08] last:border-0">
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center justify-between gap-4 py-5 text-left group"
            >
                <span className="font-bold text-[#0a0c10] group-hover:text-[#e6c800] transition-colors">{q}</span>
                <ChevronDown size={20} className={`shrink-0 text-[#0a0c10]/50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        className="overflow-hidden"
                    >
                        <p className="pb-5 text-[#0a0c10]/50 text-[15px] leading-relaxed">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function HukukAraclariPaketiPage() {
    const { data: session, status } = useSession();
    const reducedMotion = !!useReducedMotion();
    const hasLegalToolkit = (session?.user as any)?.activeProductSlugs?.includes("legal-toolkit");
    const [activeStep, setActiveStep] = useState(0);
    const [faqOpen, setFaqOpen] = useState<number | null>(0);

    useEffect(() => {
        if (reducedMotion) return;
        const t = setInterval(() => setActiveStep((s) => (s + 1) % 3), 2500);
        return () => clearInterval(t);
    }, [reducedMotion]);

    return (
        <div className="min-h-screen flex flex-col font-sans bg-[#fafafc]">
            <Header />

            <main className="flex-1 pt-24 pb-0 relative overflow-hidden">
                {/* SECTION 1 — HERO */}
                <section className="relative py-20 md:py-28 lg:py-32 overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full bg-[#e6c800]/[0.04]" />
                        <div className="absolute left-0 bottom-0 w-[400px] h-[400px] rounded-full bg-[#0a0c10]/[0.02]" />
                    </div>
                    <div className="container mx-auto px-6 max-w-6xl relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: EASE }}
                            >
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0a0c10]/45 mb-4 block">
                                    Hukuk Araçları Paketi
                                </span>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-[#0a0c10] mb-5 leading-[1.08]">
                                    UYAP Belge Araçları
                                </h1>
                                <p className="text-xl md:text-2xl font-medium text-[#0a0c10]/40 mb-4">
                                    Avukatlar için profesyonel belge işleme platformu
                                </p>
                                <p className="text-[#0a0c10]/60 text-lg leading-relaxed mb-8">
                                    DOCX → UDF dönüştürme, PDF araçları, OCR metin çıkarma ve toplu belge işlemleri tek platformda.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <a
                                        href="#pricing"
                                        className="home-btn-primary-yellow inline-flex items-center gap-2.5 px-8 py-4 font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#e6c800]/25"
                                    >
                                        Hukuk Araçları Paketini İncele <ArrowRight size={18} />
                                    </a>
                                    <a
                                        href="#demo"
                                        className="inline-flex items-center gap-2.5 px-8 py-4 font-bold uppercase tracking-[0.2em] text-[11px] rounded-2xl border border-[#0a0c10]/[0.12] text-[#0a0c10]/80 hover:bg-[#0a0c10]/[0.04] transition-all duration-200"
                                    >
                                        Demo Gör <Play size={18} />
                                    </a>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
                                className="flex justify-center lg:justify-end"
                            >
                                <DashboardMock />
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* SECTION 2 — INTERACTIVE PANEL DEMO */}
                <section id="demo" className="relative">
                    <div
                        className="relative"
                        style={{
                            maskImage: "linear-gradient(to bottom, black 0%, black 70%, transparent 100%)",
                            WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 70%, transparent 100%)",
                        }}
                    >
                        <PanelShowcase />
                    </div>
                </section>

                {/* SECTION 3 — WHAT IS INCLUDED */}
                <section className="py-20 md:py-28 bg-[#fafafc]">
                    <div className="container mx-auto px-6 max-w-6xl">
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={revealViewport}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-4xl font-display font-black text-[#0a0c10] mb-4">
                                Hukuk Araçları Paketi İçinde Neler Var?
                            </h2>
                            <p className="text-[#0a0c10]/60 text-lg max-w-2xl mx-auto">
                                8 araç, tek paket. UYAP uyumlu belge işlemleriniz için ihtiyacınız olan her şey.
                            </p>
                        </motion.div>
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={revealViewport}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {TOOLS.map((tool, i) => {
                                const Icon = tool.icon;
                                return (
                                    <motion.div
                                        key={tool.title}
                                        variants={createRevealUp(reducedMotion, 24, 4)}
                                        className="p-6 rounded-2xl bg-white border border-[#0a0c10]/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:border-[#0a0c10]/[0.1] hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-[#e6c800]/10 flex items-center justify-center mb-4 text-[#e6c800]">
                                            <Icon size={24} />
                                        </div>
                                        <h3 className="text-lg font-black text-[#0a0c10] mb-2">{tool.title}</h3>
                                        <p className="text-[#0a0c10]/60 text-sm leading-relaxed">{tool.desc}</p>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </section>

                {/* SECTION 4 — WHO IS THIS FOR */}
                <section className="py-20 md:py-28 bg-white">
                    <div className="container mx-auto px-6 max-w-6xl">
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={revealViewport}
                            className="text-center mb-16"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0a0c10]/45 mb-4 block">
                                Hedef Kitle
                            </span>
                            <h2 className="text-3xl md:text-4xl font-display font-black text-[#0a0c10]">
                                Bu Platform Kimler İçin?
                            </h2>
                        </motion.div>
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={revealViewport}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {AUDIENCE.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={item.title}
                                        variants={createRevealUp(reducedMotion, 24, 4)}
                                        className="p-6 rounded-2xl bg-[#fafafc] border border-[#0a0c10]/[0.06] hover:border-[#e6c800]/30 hover:shadow-[0_8px_24px_rgba(230,200,0,0.08)] transition-all duration-300"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-[#e6c800]/10 flex items-center justify-center mb-4 text-[#e6c800]">
                                            <Icon size={24} />
                                        </div>
                                        <h3 className="text-lg font-black text-[#0a0c10] mb-2">{item.title}</h3>
                                        <p className="text-[#0a0c10]/60 text-sm leading-relaxed">{item.desc}</p>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </section>

                {/* SECTION 5 — PROBLEMS THIS SOLVES */}
                <section className="py-20 md:py-28 bg-[#fafafc]">
                    <div className="container mx-auto px-6 max-w-6xl">
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={revealViewport}
                            className="text-center mb-16"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0a0c10]/45 mb-4 block">
                                Çözümler
                            </span>
                            <h2 className="text-3xl md:text-4xl font-display font-black text-[#0a0c10]">
                                Hangi Problemleri Çözüyoruz?
                            </h2>
                        </motion.div>
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={revealViewport}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {PROBLEMS.map((p, i) => (
                                <motion.div
                                    key={p.problem}
                                    variants={createRevealUp(reducedMotion, 24, 4)}
                                    className="p-6 rounded-2xl bg-white border border-[#0a0c10]/[0.06] shadow-sm"
                                >
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                            <AlertCircle size={20} className="text-red-500" />
                                        </div>
                                        <h3 className="font-black text-[#0a0c10]">{p.problem}</h3>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#e6c800]/10 flex items-center justify-center shrink-0">
                                            <Check size={20} className="text-[#e6c800]" />
                                        </div>
                                        <p className="text-[#0a0c10]/60 text-sm leading-relaxed">{p.solution}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* SECTION 6 — HOW IT WORKS */}
                <section className="py-20 md:py-28 bg-white">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={revealViewport}
                            className="text-center mb-16"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0a0c10]/45 mb-4 block">
                                Süreç
                            </span>
                            <h2 className="text-3xl md:text-4xl font-display font-black text-[#0a0c10]">
                                Nasıl Çalışır?
                            </h2>
                        </motion.div>
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={revealViewport}
                            className="space-y-8"
                        >
                            {STEPS.map((step, i) => (
                                <motion.div
                                    key={step.num}
                                    variants={createRevealUp(reducedMotion, 20, 4)}
                                    className="flex gap-6 items-start"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-[#e6c800]/10 flex items-center justify-center text-[#e6c800] font-black text-xl shrink-0 border border-[#e6c800]/20">
                                        {step.num}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-black text-[#0a0c10] mb-2">{step.title}</h3>
                                        <p className="text-[#0a0c10]/60 mb-4">{step.desc}</p>
                                        <div className="h-2 rounded-full bg-[#0a0c10]/[0.06] overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full bg-[#e6c800]"
                                                initial={{ width: "0%" }}
                                                animate={{ width: activeStep >= i ? "100%" : "0%" }}
                                                transition={{ duration: 0.8, ease: EASE }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* SECTION 7 — SECURITY */}
                <section className="py-20 md:py-28 bg-[#fafafc]">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0a0c10]/45 mb-4 block">
                                Güvenlik
                            </span>
                            <h2 className="text-3xl md:text-4xl font-display font-black text-[#0a0c10] mb-8">
                                Verileriniz Güvende
                            </h2>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            {[
                                { icon: Shield, text: "Belgeler işlem tamamlandıktan sonra otomatik olarak silinir." },
                                { icon: Shield, text: "KVKK uyumlu altyapı." },
                                { icon: Shield, text: "Sunucularımız belge içeriklerini saklamaz." },
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.text} className="p-6 rounded-2xl bg-white border border-[#0a0c10]/[0.06] flex flex-col items-center text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-[#e6c800]/10 flex items-center justify-center mb-4 text-[#e6c800]">
                                            <Icon size={28} />
                                        </div>
                                        <p className="text-[#0a0c10]/80 font-medium">{item.text}</p>
                                    </div>
                                );
                            })}
                        </motion.div>
                    </div>
                </section>

                {/* SECTION 8 — PRICING */}
                <section id="pricing" className="py-20 md:py-28 bg-white">
                    <div className="container mx-auto px-6 max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="relative rounded-[2rem] p-8 md:p-12 bg-[#0a0c10] border border-white/10 overflow-hidden"
                        >
                            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                            <div className="relative z-10 text-center">
                                <h2 className="text-2xl md:text-3xl font-display font-black text-white mb-6">
                                    Hukuk Araçları Paketi
                                </h2>
                                <div className="relative inline-block mb-6">
                                    <span className="text-4xl md:text-5xl font-black text-white">₺3.000</span>
                                    <span className="text-white/70 text-lg font-bold ml-1">/ yıl</span>
                                    {!reducedMotion && (
                                        <motion.div
                                            className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg"
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            viewport={{ once: true }}
                                        >
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                                animate={{ x: ["-100%", "200%"] }}
                                                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
                                                style={{ width: "50%" }}
                                            />
                                        </motion.div>
                                    )}
                                </div>
                                <ul className="space-y-3 mb-8 text-left max-w-sm mx-auto">
                                    {PRICE_FEATURES.map((f) => (
                                        <li key={f} className="flex items-center gap-3 text-white/80 text-sm">
                                            <Check size={18} className="text-[#e6c800] shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                {status === "authenticated" && hasLegalToolkit ? (
                                    <Link href="/dashboard/tools" className="home-btn-primary-yellow inline-flex items-center gap-3 px-10 py-4 font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl">
                                        Araçlara Git <ArrowRight size={18} />
                                    </Link>
                                ) : status === "authenticated" ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="p-3 rounded-xl bg-white/10">
                                            <p className="text-sm font-medium text-white/80 mb-2">Önce deneyin, sonra karar verin</p>
                                            <TrialRequestCTA
                                                emailVerified={(session?.user as any)?.emailVerified ?? false}
                                                trialStatus={(session?.user as any)?.trialStatus ?? "none"}
                                                hasSubscription={false}
                                                source="product-page"
                                                className="!bg-[#e6c800] !text-[#0a0c10]"
                                            />
                                        </div>
                                        <Link href="/dashboard/billing?product=legal-toolkit" className="text-white/70 hover:text-white text-sm font-medium">
                                            Veya doğrudan abone ol →
                                        </Link>
                                    </div>
                                ) : (
                                    <Link href="/register" className="home-btn-primary-yellow inline-flex items-center gap-3 px-10 py-4 font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl">
                                        Abone Ol ve Ödeme Bildir <ArrowRight size={18} />
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* SECTION 9 — FAQ */}
                <section className="py-20 md:py-28 bg-[#fafafc]">
                    <div className="container mx-auto px-6 max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0a0c10]/45 mb-4 block">
                                SSS
                            </span>
                            <h2 className="text-3xl md:text-4xl font-display font-black text-[#0a0c10]">
                                Sıkça Sorulan Sorular
                            </h2>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="rounded-2xl bg-white border border-[#0a0c10]/[0.06] shadow-sm overflow-hidden"
                        >
                            {FAQ_ITEMS.map((item, i) => (
                                <FaqItem
                                    key={item.q}
                                    q={item.q}
                                    a={item.a}
                                    isOpen={faqOpen === i}
                                    onToggle={() => setFaqOpen(faqOpen === i ? null : i)}
                                />
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* SECTION 10 — FINAL CTA */}
                <section className="py-20 md:py-28 bg-[#0a0c10] border-t border-white/10">
                    <div className="container mx-auto px-6 max-w-4xl text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-6">
                                UYAP belge işlemlerini hızlandırın.
                            </h2>
                            <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
                                Hukuk Araçları Paketi ile belge iş akışlarınızı tek platformda yönetin.
                            </p>
                            <Link
                                href="/register"
                                className="home-btn-primary-yellow inline-flex items-center gap-3 px-10 py-4 font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#e6c800]/25"
                            >
                                Hukuk Araçları Paketine Başla <ArrowRight size={20} />
                            </Link>
                            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm">
                                <Link href="/dijital-urunler" className="text-white/50 hover:text-white transition-colors">
                                    Dijital Ürünler
                                </Link>
                                <Link href="/blog" className="text-white/50 hover:text-white transition-colors">
                                    Blog
                                </Link>
                                <Link href="/dashboard/tools" className="text-white/50 hover:text-white transition-colors">
                                    Araçlar
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
