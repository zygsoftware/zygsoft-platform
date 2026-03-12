"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
    FileText,
    CheckCircle2,
    Loader2,
    LayoutDashboard,
    FileStack,
    ScanText,
    Shield,
    Settings,
    ChevronRight,
    Zap,
    Merge,
} from "lucide-react";

type ToolTab = "docx-udf" | "pdf-merge" | "ocr";

type DocxUdfState = "idle" | "file-arrives" | "uploading" | "analyzing" | "converting" | "ready" | "reset";

const STATE_DURATIONS: Record<DocxUdfState, number> = {
    idle: 2000,
    "file-arrives": 900,
    uploading: 1100,
    analyzing: 1400,
    converting: 2400,
    ready: 2800,
    reset: 500,
};

const SIDEBAR_ITEMS = [
    { label: "Genel Bakış", icon: LayoutDashboard },
    { label: "Belge Araçları", icon: FileStack },
    { label: "PDF Araçları", icon: Merge },
    { label: "OCR", icon: ScanText },
    { label: "Güvenlik", icon: Shield },
    { label: "Ayarlar", icon: Settings },
];

const TOOL_TABS: { id: ToolTab; label: string; icon: typeof FileText }[] = [
    { id: "docx-udf", label: "DOCX → UDF", icon: FileText },
    { id: "pdf-merge", label: "PDF Birleştir", icon: Merge },
    { id: "ocr", label: "OCR Metin Çıkarma", icon: ScanText },
];

const VALUE_POINTS = [
    "UYAP uyumlu çıktı",
    "Tek tıkla belge akışı",
    "Hızlı ve güvenli işlem",
];

const EASE = [0.22, 1, 0.36, 1] as const;

function StaticPanel() {
    return (
        <div className="w-full max-w-[340px] mx-auto rounded-2xl bg-white border border-[#0a0c10]/[0.06] shadow-[0_24px_64px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="h-10 bg-[#0a0c10]/[0.02] border-b border-[#0a0c10]/[0.06] flex items-center px-4">
                <span className="text-[11px] font-bold text-[#0a0c10]/60">ZYGSOFT Panel</span>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#0a0c10]/[0.04] flex items-center justify-center">
                    <FileText size={28} className="text-[#0a0c10]/50" />
                </div>
                <div className="text-center">
                    <p className="text-base font-bold text-[#0a0c10]">DOCX → UDF Dönüştürücü</p>
                    <p className="text-[12px] text-[#0a0c10]/50 mt-1">document.docx → output.udf</p>
                </div>
                <div className="flex items-center gap-2 text-[#e6c800]">
                    <CheckCircle2 size={18} />
                    <span className="text-[12px] font-bold">Dönüşüm tamamlandı</span>
                </div>
            </div>
        </div>
    );
}

function DocxUdfDemo({ state, reducedMotion }: { state: DocxUdfState; reducedMotion: boolean }) {
    return (
        <div className="flex gap-5 flex-1 min-h-0">
            <div className="flex-1 min-w-0 rounded-xl border border-[#0a0c10]/[0.08] bg-[#0a0c10]/[0.02] p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0a0c10]/50">Girdi</span>
                    {state !== "idle" && state !== "reset" && (
                        <span className="text-[10px] font-medium text-[#0a0c10]/40">dava_dilekcesi.docx</span>
                    )}
                </div>
                <AnimatePresence mode="wait">
                    {state === "idle" && (
                        <motion.div
                            key="idle"
                            className="absolute inset-5 top-12 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#0a0c10]/[0.12] bg-[#0a0c10]/[0.02]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <p className="text-[13px] font-medium text-[#0a0c10]/40">Belge sürükleyin veya tıklayın</p>
                        </motion.div>
                    )}
                    {state === "file-arrives" && (
                        <motion.div
                            key="file-arrives"
                            className="flex items-center justify-center min-h-[140px]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <motion.div
                                className="flex items-center gap-4 px-5 py-4 rounded-xl bg-white border border-[#0a0c10]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.45, ease: EASE }}
                            >
                                <div className="w-12 h-12 rounded-lg bg-[#0a0c10]/[0.06] flex items-center justify-center">
                                    <FileText size={22} className="text-[#0a0c10]/70" />
                                </div>
                                <div>
                                    <p className="text-[15px] font-bold text-[#0a0c10]">dava_dilekcesi.docx</p>
                                    <p className="text-[12px] text-[#0a0c10]/45">124 KB</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                    {(state === "uploading" || state === "analyzing") && (
                        <motion.div
                            key="uploading"
                            className="flex flex-col gap-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <motion.div
                                className="flex items-center gap-4 p-4 rounded-xl border border-[#e6c800]/20 bg-[#e6c800]/[0.05]"
                                initial={{ y: 8 }}
                                animate={{ y: 0 }}
                                transition={{ duration: 0.35, ease: EASE }}
                            >
                                <div className="w-12 h-12 rounded-lg bg-white border border-[#0a0c10]/[0.06] flex items-center justify-center shadow-sm">
                                    <FileText size={22} className="text-[#0a0c10]/70" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[15px] font-bold text-[#0a0c10]">dava_dilekcesi.docx</p>
                                    <p className="text-[12px] text-[#e6c800] font-medium flex items-center gap-2 mt-0.5">
                                        <Loader2 size={14} className="animate-spin shrink-0" />
                                        {state === "uploading" ? "Yükleniyor..." : "Belge analiz ediliyor..."}
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                    {state === "converting" && (
                        <motion.div
                            key="converting"
                            className="flex flex-col gap-5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-[#0a0c10]/[0.06] flex items-center justify-center">
                                    <FileText size={22} className="text-[#0a0c10]/70" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[15px] font-bold text-[#0a0c10]">dava_dilekcesi.docx</p>
                                    <p className="text-[12px] text-[#0a0c10]/50 flex items-center gap-2 mt-0.5">
                                        <Loader2 size={14} className="animate-spin shrink-0" />
                                        UDF dönüştürülüyor...
                                    </p>
                                </div>
                            </div>
                            <div className="h-2 rounded-full bg-[#0a0c10]/[0.06] overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full bg-[#e6c800]"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1.8, ease: EASE }}
                                />
                            </div>
                        </motion.div>
                    )}
                    {state === "ready" && (
                        <motion.div
                            key="ready"
                            className="flex flex-col gap-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-[#0a0c10]/[0.08] bg-white">
                                <div className="w-12 h-12 rounded-lg bg-[#e6c800]/15 flex items-center justify-center">
                                    <CheckCircle2 size={24} className="text-[#e6c800]" />
                                </div>
                                <div>
                                    <p className="text-[15px] font-bold text-[#0a0c10]">dava_dilekcesi.docx</p>
                                    <p className="text-[12px] text-[#e6c800] font-medium">İşlendi</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {state === "reset" && (
                        <motion.div
                            key="reset"
                            className="absolute inset-5 top-12 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#0a0c10]/[0.12] bg-[#0a0c10]/[0.02]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <p className="text-[13px] font-medium text-[#0a0c10]/40">Belge sürükleyin veya tıklayın</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="w-[200px] shrink-0 rounded-xl border border-[#0a0c10]/[0.08] bg-[#0a0c10]/[0.02] p-5">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0a0c10]/50">Çıktı</span>
                </div>
                <div className="min-h-[120px] flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                        {(state === "idle" || state === "file-arrives" || state === "uploading" || state === "analyzing" || state === "converting" || state === "reset") && (
                            <motion.div
                                key="empty"
                                className="text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <p className="text-[12px] text-[#0a0c10]/35">—</p>
                                <p className="text-[11px] text-[#0a0c10]/30 mt-1">Bekleniyor</p>
                            </motion.div>
                        )}
                        {state === "ready" && (
                            <motion.div
                                key="output"
                                className="flex flex-col items-center gap-2"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.35, ease: EASE }}
                            >
                                <div className="w-10 h-10 rounded-lg bg-[#e6c800]/15 flex items-center justify-center">
                                    <FileText size={18} className="text-[#e6c800]" />
                                </div>
                                <p className="text-[13px] font-bold text-[#0a0c10] text-center">dava_dilekcesi.udf</p>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#e6c800]/15 text-[10px] font-bold text-[#e6c800] border border-[#e6c800]/25">
                                    <Zap size={10} />
                                    UYAP uyumlu
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function PdfMergeDemo({ reducedMotion }: { reducedMotion: boolean }) {
    const [phase, setPhase] = useState<"queue" | "merging" | "ready">("queue");

    useEffect(() => {
        if (reducedMotion) return;
        const t1 = setTimeout(() => setPhase("merging"), 1500);
        const t2 = setTimeout(() => setPhase("ready"), 3500);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [reducedMotion]);

    return (
        <div className="flex gap-5 flex-1 min-h-0">
            <div className="flex-1 min-w-0 rounded-xl border border-[#0a0c10]/[0.08] bg-[#0a0c10]/[0.02] p-5">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0a0c10]/50">PDF Dosyaları</span>
                </div>
                <AnimatePresence mode="wait">
                    {phase === "queue" && (
                        <motion.div
                            key="queue"
                            className="flex flex-col gap-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {["dilekce.pdf", "ek1.pdf", "ek2.pdf"].map((name, i) => (
                                <motion.div
                                    key={name}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-[#0a0c10]/[0.08] bg-white"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.15, duration: 0.35, ease: EASE }}
                                >
                                    <FileText size={14} className="text-[#0a0c10]/50" />
                                    <span className="text-[13px] font-medium text-[#0a0c10]">{name}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                    {phase === "merging" && (
                        <motion.div
                            key="merging"
                            className="flex flex-col items-center justify-center min-h-[140px] gap-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="flex items-center gap-2"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <FileText size={14} className="text-[#0a0c10]/50" />
                                <FileText size={14} className="text-[#0a0c10]/50" />
                                <FileText size={14} className="text-[#0a0c10]/50" />
                            </motion.div>
                            <p className="text-[12px] text-[#0a0c10]/50">Birleştiriliyor...</p>
                            <div className="w-full h-1.5 rounded-full bg-[#0a0c10]/[0.06] overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full bg-[#e6c800]"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1.5, ease: EASE }}
                                />
                            </div>
                        </motion.div>
                    )}
                    {phase === "ready" && (
                        <motion.div
                            key="ready"
                            className="flex flex-col items-center justify-center min-h-[140px] gap-3"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: EASE }}
                        >
                            <div className="w-14 h-14 rounded-xl bg-[#e6c800]/15 flex items-center justify-center">
                                <CheckCircle2 size={28} className="text-[#e6c800]" />
                            </div>
                            <p className="text-[15px] font-bold text-[#0a0c10]">birleştirilmiş.pdf</p>
                            <p className="text-[12px] text-[#e6c800] font-medium">Birleştirme tamamlandı</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function OcrDemo({ reducedMotion }: { reducedMotion: boolean }) {
    const [phase, setPhase] = useState<"scan" | "extracting" | "ready">("scan");

    useEffect(() => {
        if (reducedMotion) return;
        const t1 = setTimeout(() => setPhase("extracting"), 2000);
        const t2 = setTimeout(() => setPhase("ready"), 4500);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [reducedMotion]);

    const lines = ["1. Mahkeme sayın hakim...", "2. Müvekkilim adına...", "3. İşbu dilekçe ile..."];

    return (
        <div className="flex gap-5 flex-1 min-h-0">
            <div className="flex-1 min-w-0 rounded-xl border border-[#0a0c10]/[0.08] bg-[#0a0c10]/[0.02] p-5">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0a0c10]/50">Taranan Sayfa</span>
                </div>
                <AnimatePresence mode="wait">
                    {phase === "scan" && (
                        <motion.div
                            key="scan"
                            className="flex flex-col items-center justify-center min-h-[140px]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="w-24 h-32 rounded-lg bg-[#0a0c10]/[0.06] border border-[#0a0c10]/[0.1] flex items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <ScanText size={32} className="text-[#0a0c10]/30" />
                            </motion.div>
                            <p className="text-[12px] text-[#0a0c10]/40 mt-3">Sayfa önizlemesi</p>
                        </motion.div>
                    )}
                    {phase === "extracting" && (
                        <motion.div
                            key="extracting"
                            className="flex flex-col gap-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="flex items-center gap-2 text-[12px] text-[#0a0c10]/50">
                                <Loader2 size={14} className="animate-spin shrink-0" />
                                Metin çıkarılıyor...
                            </div>
                            <div className="space-y-2">
                                {lines.map((line, i) => (
                                    <motion.div
                                        key={i}
                                        className="h-4 rounded bg-[#0a0c10]/[0.04]"
                                        initial={{ width: "0%" }}
                                        animate={{ width: `${60 + i * 15}%` }}
                                        transition={{ delay: i * 0.2, duration: 0.5, ease: EASE }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                    {phase === "ready" && (
                        <motion.div
                            key="ready"
                            className="flex flex-col gap-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35 }}
                        >
                            <div className="flex items-center gap-2 text-[12px] text-[#e6c800] font-medium">
                                <CheckCircle2 size={14} />
                                Tamamlandı
                            </div>
                            <div className="space-y-2">
                                {lines.map((line, i) => (
                                    <motion.p
                                        key={i}
                                        className="text-[12px] text-[#0a0c10]/80"
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.08, duration: 0.3, ease: EASE }}
                                    >
                                        {line}
                                    </motion.p>
                                ))}
                            </div>
                            <p className="text-[11px] text-[#0a0c10]/40 mt-2">Kopyala veya dışa aktar</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export function PanelShowcase() {
    const [docxState, setDocxState] = useState<DocxUdfState>("idle");
    const [activeTab, setActiveTab] = useState<ToolTab>("docx-udf");
    const [useStatic, setUseStatic] = useState(true);
    const reduceMotion = !!useReducedMotion();

    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        if (reduceMotion || isMobile) {
            setUseStatic(true);
            return;
        }
        setUseStatic(false);
    }, [reduceMotion]);

    useEffect(() => {
        if (useStatic || activeTab !== "docx-udf") return;
        setDocxState("idle");
        const sequence: DocxUdfState[] = ["idle", "file-arrives", "uploading", "analyzing", "converting", "ready", "reset"];
        let idx = 0;
        let t: ReturnType<typeof setTimeout>;
        const advance = () => {
            idx = (idx + 1) % sequence.length;
            setDocxState(sequence[idx]);
            t = setTimeout(advance, STATE_DURATIONS[sequence[idx]]);
        };
        t = setTimeout(advance, STATE_DURATIONS.idle);
        return () => clearTimeout(t);
    }, [useStatic, activeTab]);

    useEffect(() => {
        if (useStatic) return;
        const interval = setInterval(() => {
            setActiveTab((prev) => {
                const order: ToolTab[] = ["docx-udf", "pdf-merge", "ocr"];
                const i = order.indexOf(prev);
                return order[(i + 1) % order.length];
            });
        }, 6000);
        return () => clearInterval(interval);
    }, [useStatic]);

    if (useStatic) {
        return (
            <section className="relative py-16 md:py-24 bg-[#fafafc]">
                <div className="container mx-auto px-6">
                    <div className="flex justify-center">
                        <StaticPanel />
                    </div>
                    <div className="mt-12 text-center max-w-2xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-display font-black text-[#0a0c10] mb-4">
                            DOCX → UDF Dönüştürücü
                        </h2>
                        <p className="text-[#0a0c10]/60 text-[15px] font-medium leading-relaxed mb-6">
                            Hukuki belgelerinizi UYAP uyumlu UDF formatına anında dönüştürün.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {VALUE_POINTS.map((p) => (
                                <span key={p} className="text-[12px] font-medium text-[#0a0c10]/50 px-3 py-1.5 rounded-full bg-[#0a0c10]/[0.04]">
                                    {p}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative py-16 md:py-28 bg-[#fafafc] overflow-hidden">
            <div className="container mx-auto px-6">
                <motion.div
                    className="relative w-full max-w-[1100px] mx-auto"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
                    style={{
                        maskImage: "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
                        WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
                    }}
                >
                    <div className="rounded-[1.25rem] bg-white border border-[#0a0c10]/[0.06] shadow-[0_24px_80px_rgba(0,0,0,0.1)] overflow-hidden">
                        <div className="h-14 bg-[#0a0c10]/[0.02] border-b border-[#0a0c10]/[0.06] flex items-center justify-between px-5">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#0a0c10]/15" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#0a0c10]/15" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#0a0c10]/15" />
                                </div>
                                <span className="text-[13px] font-bold text-[#0a0c10]/70">ZYGSOFT Panel</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#e6c800]/15 text-[#0a0c10]/70 text-[10px] font-bold uppercase tracking-wider border border-[#e6c800]/25">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#e6c800]" />
                                    Canlı Sistem
                                </span>
                            </div>
                        </div>

                        <div className="flex min-h-[520px]">
                            <aside className="w-[220px] shrink-0 border-r border-[#0a0c10]/[0.06] bg-[#0a0c10]/[0.01] py-5">
                                {SIDEBAR_ITEMS.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            key={item.label}
                                            className="flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-[13px] font-medium mb-0.5 text-[#0a0c10]/50 hover:bg-[#0a0c10]/[0.04] hover:text-[#0a0c10]/70"
                                        >
                                            <Icon size={18} className="shrink-0 opacity-90" />
                                            <span>{item.label}</span>
                                        </div>
                                    );
                                })}
                            </aside>

                            <main className="flex-1 p-6 min-h-[466px] flex flex-col">
                                <div className="flex items-center gap-2 mb-4">
                                    {TOOL_TABS.map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold transition-all duration-200 ${
                                                    isActive
                                                        ? "bg-[#0a0c10] text-white"
                                                        : "text-[#0a0c10]/50 hover:bg-[#0a0c10]/[0.04] hover:text-[#0a0c10]/70"
                                                }`}
                                            >
                                                <Icon size={14} />
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center gap-1.5 text-[11px] text-[#0a0c10]/40 mb-4">
                                    <span>Belge Araçları</span>
                                    <ChevronRight size={12} />
                                    <span className="text-[#0a0c10]/60 font-medium">
                                        {TOOL_TABS.find((t) => t.id === activeTab)?.label}
                                    </span>
                                </div>

                                <div className="flex items-end justify-between mb-5 pb-4 border-b border-[#0a0c10]/[0.06]">
                                    <div>
                                        <h3 className="text-xl font-black text-[#0a0c10]">
                                            {activeTab === "docx-udf" && "DOCX → UDF Dönüştürücü"}
                                            {activeTab === "pdf-merge" && "PDF Birleştirici"}
                                            {activeTab === "ocr" && "OCR Metin Çıkarma"}
                                        </h3>
                                        <p className="text-[13px] text-[#0a0c10]/50 mt-0.5">
                                            {activeTab === "docx-udf" && "Belgelerinizi UYAP uyumlu formata dönüştürün"}
                                            {activeTab === "pdf-merge" && "PDF dosyalarını tek dosyada birleştirin"}
                                            {activeTab === "ocr" && "Taranan belgelerden metin çıkarın"}
                                        </p>
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {activeTab === "docx-udf" && (
                                        <motion.div
                                            key="docx-udf"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.3, ease: EASE }}
                                            className="flex-1 min-h-0">
                                            <DocxUdfDemo state={docxState} reducedMotion={reduceMotion} />
                                        </motion.div>
                                    )}
                                    {activeTab === "pdf-merge" && (
                                        <motion.div
                                            key="pdf-merge"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.3, ease: EASE }}
                                            className="flex-1 min-h-0">
                                            <PdfMergeDemo reducedMotion={reduceMotion} />
                                        </motion.div>
                                    )}
                                    {activeTab === "ocr" && (
                                        <motion.div
                                            key="ocr"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.3, ease: EASE }}
                                            className="flex-1 min-h-0">
                                            <OcrDemo reducedMotion={reduceMotion} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="mt-4 pt-4 border-t border-[#0a0c10]/[0.06] flex items-center gap-6 text-[11px] text-[#0a0c10]/40">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#0a0c10]/30" />
                                        KVKK uyumlu
                                    </span>
                                </div>
                            </main>
                        </div>
                    </div>
                </motion.div>

                <div className="relative -mt-32 pt-24 text-center max-w-2xl mx-auto z-10">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-black text-[#0a0c10] mb-4">
                        UYAP Uyumlu Belge Dönüşümü
                    </h2>
                    <p className="text-[#0a0c10]/60 text-[15px] md:text-[16px] font-medium leading-relaxed mb-8">
                        Hukuki belgelerinizi tek tıkla UYAP uyumlu UDF formatına dönüştürün. Otomatik iş akışı ile zamandan tasarruf edin.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                        {VALUE_POINTS.map((p) => (
                            <div
                                key={p}
                                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/80 border border-[#0a0c10]/[0.06] text-[13px] font-medium text-[#0a0c10]/70 shadow-sm"
                            >
                                <CheckCircle2 size={16} className="text-[#e6c800] shrink-0" />
                                {p}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
