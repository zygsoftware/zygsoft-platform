"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
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

type PanelT = ReturnType<typeof useTranslations<"Homepage.panelShowcase">>;

const STATE_DURATIONS: Record<DocxUdfState, number> = {
    idle: 2000,
    "file-arrives": 900,
    uploading: 1100,
    analyzing: 1400,
    converting: 2400,
    ready: 2800,
    reset: 500,
};

const EASE = [0.22, 1, 0.36, 1] as const;

function StaticPanel({ t }: { t: PanelT }) {
    return (
        <div className="w-full max-w-[340px] mx-auto rounded-2xl bg-white border border-[#343131]/[0.06] shadow-[0_24px_64px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="h-10 bg-[#343131]/[0.02] border-b border-[#343131]/[0.06] flex items-center px-4">
                <span className="text-[11px] font-bold text-[#343131]/72">{t("panelName")}</span>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#343131]/[0.04] flex items-center justify-center">
                    <FileText size={28} className="text-[#343131]/70" />
                </div>
                <div className="text-center">
                    <p className="text-base font-bold text-[#343131]">{t("docxConverterLine1")}</p>
                    <p className="text-[12px] text-[#343131]/62 mt-1">{t("docxConverterLine2")}</p>
                </div>
                <div className="flex items-center gap-2 text-[#e6c800]">
                    <CheckCircle2 size={18} />
                    <span className="text-[12px] font-bold">{t("docxConversionComplete")}</span>
                </div>
            </div>
        </div>
    );
}

function DocxUdfDemo({ state, t }: { state: DocxUdfState; t: PanelT }) {
    return (
        <div className="flex gap-5 flex-1 min-h-0">
            <div className="flex-1 min-w-0 rounded-2xl border border-[#343131]/10 bg-white p-5 relative overflow-hidden shadow-[0_18px_45px_rgba(0,0,0,0.06)]">
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#e6c800]/10 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#343131]/70">{t("docxInput")}</span>
                    {state !== "idle" && state !== "reset" && (
                        <span className="text-[10px] font-medium text-[#343131]/64">dava_dilekcesi.docx</span>
                    )}
                </div>
                <AnimatePresence mode="wait">
                    {state === "idle" && (
                        <motion.div
                            key="idle"
                            className="absolute inset-5 top-12 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#343131]/15 bg-[#fafafc]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <p className="text-[13px] font-medium text-[#343131]/66">{t("docxDragHint")}</p>
                        </motion.div>
                    )}
                    {state === "file-arrives" && (
                        <motion.div
                            key="file-arrives"
                            className="flex items-center justify-center min-h-[180px]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <motion.div
                                className="flex items-center gap-4 px-5 py-4 rounded-xl bg-white border border-[#343131]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.45, ease: EASE }}
                            >
                                <div className="w-12 h-12 rounded-lg bg-[#343131]/[0.06] flex items-center justify-center">
                                    <FileText size={22} className="text-[#343131]/70" />
                                </div>
                                <div>
                                    <p className="text-[15px] font-bold text-[#343131]">dava_dilekcesi.docx</p>
                                    <p className="text-[12px] text-[#343131]/58">124 KB</p>
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
                                <div className="w-12 h-12 rounded-lg bg-white border border-[#343131]/[0.06] flex items-center justify-center shadow-sm">
                                    <FileText size={22} className="text-[#343131]/70" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[15px] font-bold text-[#343131]">dava_dilekcesi.docx</p>
                                    <p className="text-[12px] text-[#e6c800] font-medium flex items-center gap-2 mt-0.5">
                                        <Loader2 size={14} className="animate-spin shrink-0" />
                                        {state === "uploading" ? t("docxUploading") : t("docxAnalyzing")}
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
                                <div className="w-12 h-12 rounded-lg bg-[#343131]/[0.06] flex items-center justify-center">
                                    <FileText size={22} className="text-[#343131]/70" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[15px] font-bold text-[#343131]">dava_dilekcesi.docx</p>
                                    <p className="text-[12px] text-[#343131]/62 flex items-center gap-2 mt-0.5">
                                        <Loader2 size={14} className="animate-spin shrink-0" />
                                        {t("docxConverting")}
                                    </p>
                                </div>
                            </div>
                            <div className="h-2 rounded-full bg-[#343131]/[0.08] overflow-hidden">
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
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-[#343131]/[0.08] bg-white">
                                <div className="w-12 h-12 rounded-lg bg-[#e6c800]/15 flex items-center justify-center">
                                    <CheckCircle2 size={24} className="text-[#e6c800]" />
                                </div>
                                <div>
                                    <p className="text-[15px] font-bold text-[#343131]">dava_dilekcesi.docx</p>
                                    <p className="text-[12px] text-[#e6c800] font-medium">{t("docxProcessed")}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {state === "reset" && (
                        <motion.div
                            key="reset"
                            className="absolute inset-5 top-12 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#343131]/15 bg-[#fafafc]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <p className="text-[13px] font-medium text-[#343131]/66">{t("docxDragHint")}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="w-[220px] shrink-0 rounded-2xl border border-[#343131]/10 bg-white p-5 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#343131]/70">{t("docxOutput")}</span>
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
                                <p className="text-[12px] text-[#343131]/56">—</p>
                                <p className="text-[11px] text-[#343131]/52 mt-1">{t("docxWaiting")}</p>
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
                                <p className="text-[13px] font-bold text-[#343131] text-center">dava_dilekcesi.udf</p>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#e6c800]/15 text-[10px] font-bold text-[#e6c800] border border-[#e6c800]/25 [font-family:var(--font-button)]">
                                    <Zap size={10} />
                                    {t("docxUyapBadge")}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function PdfMergeDemo({ reducedMotion, t }: { reducedMotion: boolean; t: PanelT }) {
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
            <div className="flex-1 min-w-0 rounded-2xl border border-[#343131]/10 bg-white p-5 shadow-[0_18px_45px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#343131]/70">{t("pdfFilesLabel")}</span>
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
                                    className="flex items-center gap-3 p-3 rounded-lg border border-[#343131]/[0.08] bg-white"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.15, duration: 0.35, ease: EASE }}
                                >
                                    <FileText size={14} className="text-[#343131]/66" />
                                    <span className="text-[13px] font-medium text-[#343131]">{name}</span>
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
                                <FileText size={14} className="text-[#343131]/66" />
                                <FileText size={14} className="text-[#343131]/66" />
                                <FileText size={14} className="text-[#343131]/66" />
                            </motion.div>
                            <p className="text-[12px] text-[#343131]/62">{t("pdfMerging")}</p>
                            <div className="w-full h-1.5 rounded-full bg-[#343131]/[0.06] overflow-hidden">
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
                            <p className="text-[15px] font-bold text-[#343131]">birleştirilmiş.pdf</p>
                            <p className="text-[12px] text-[#e6c800] font-medium">{t("pdfMergeComplete")}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function OcrDemo({ reducedMotion, t }: { reducedMotion: boolean; t: PanelT }) {
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

    const lines = [t("ocrSampleLine1"), t("ocrSampleLine2"), t("ocrSampleLine3")];

    return (
        <div className="flex gap-5 flex-1 min-h-0">
            <div className="flex-1 min-w-0 rounded-2xl border border-[#343131]/10 bg-white p-5 shadow-[0_18px_45px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#343131]/70">{t("ocrScannedPage")}</span>
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
                                className="w-24 h-32 rounded-lg bg-[#343131]/[0.06] border border-[#343131]/[0.1] flex items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <ScanText size={32} className="text-[#343131]/48" />
                            </motion.div>
                            <p className="text-[12px] text-[#343131]/54 mt-3">{t("ocrPagePreview")}</p>
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
                            <div className="flex items-center gap-2 text-[12px] text-[#343131]/62">
                                <Loader2 size={14} className="animate-spin shrink-0" />
                                {t("ocrExtracting")}
                            </div>
                            <div className="space-y-2">
                                {lines.map((line, i) => (
                                    <motion.div
                                        key={line}
                                        className="h-4 rounded bg-[#343131]/[0.04]"
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
                                {t("ocrDone")}
                            </div>
                            <div className="space-y-2">
                                {lines.map((line, i) => (
                                    <motion.p
                                        key={line}
                                        className="text-[12px] text-[#343131]/80"
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.08, duration: 0.3, ease: EASE }}
                                    >
                                        {line}
                                    </motion.p>
                                ))}
                            </div>
                            <p className="text-[11px] text-[#343131]/52 mt-2">{t("ocrCopyExport")}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export function PanelShowcase() {
    const t = useTranslations("Homepage.panelShowcase");
    const [docxState, setDocxState] = useState<DocxUdfState>("idle");
    const [activeTab, setActiveTab] = useState<ToolTab>("docx-udf");
    const [isMobile, setIsMobile] = useState(true);
    const [performanceMode, setPerformanceMode] = useState<"static" | "animated">("static");
    const reduceMotion = !!useReducedMotion();
    const useStatic = reduceMotion || isMobile || performanceMode === "static";

    const valuePoints = t.raw("valuePoints") as string[];

    const sidebarItems = useMemo(
        () => [
            { label: t("sidebarOverview"), icon: LayoutDashboard },
            { label: t("sidebarDocTools"), icon: FileStack },
            { label: t("sidebarPdfTools"), icon: Merge },
            { label: t("sidebarOcr"), icon: ScanText },
            { label: t("sidebarSecurity"), icon: Shield },
            { label: t("sidebarSettings"), icon: Settings },
        ],
        [t]
    );

    const toolTabs = useMemo(
        () =>
            [
                { id: "docx-udf" as const, label: t("tabDocxUdf"), icon: FileText },
                { id: "pdf-merge" as const, label: t("tabPdfMerge"), icon: Merge },
                { id: "ocr" as const, label: t("tabOcr"), icon: ScanText },
            ] as const,
        [t]
    );

    useEffect(() => {
        const syncViewportMode = () => {
            setIsMobile(window.innerWidth < 768);
            const isWideDesktop = window.innerWidth >= 1440;
            const deviceMemory = "deviceMemory" in navigator ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4 : 4;
            const cpuCores = navigator.hardwareConcurrency ?? 4;
            const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            const prefersTouch = window.matchMedia("(pointer: coarse)").matches;

            setPerformanceMode(
                !prefersReducedMotion && !prefersTouch && isWideDesktop && deviceMemory >= 8 && cpuCores >= 8
                    ? "animated"
                    : "static"
            );
        };

        syncViewportMode();
        window.addEventListener("resize", syncViewportMode);

        return () => window.removeEventListener("resize", syncViewportMode);
    }, []);

    useEffect(() => {
        if (useStatic || activeTab !== "docx-udf") return;

        const sequence: DocxUdfState[] = ["idle", "file-arrives", "uploading", "analyzing", "converting", "ready", "reset"];
        let idx = 0;
        let timeoutHandle: ReturnType<typeof setTimeout>;

        timeoutHandle = setTimeout(() => {
            setDocxState("idle");
        }, 0);

        const advance = () => {
            idx = (idx + 1) % sequence.length;
            setDocxState(sequence[idx]);
            timeoutHandle = setTimeout(advance, STATE_DURATIONS[sequence[idx]]);
        };
        const advanceHandle = setTimeout(advance, STATE_DURATIONS.idle);

        return () => {
            clearTimeout(timeoutHandle);
            clearTimeout(advanceHandle);
        };
    }, [useStatic, activeTab]);

    useEffect(() => {
        if (useStatic) return;

        let duration = 6000;
        if (activeTab === "docx-udf") duration = 11500;
        else if (activeTab === "pdf-merge") duration = 6500;
        else if (activeTab === "ocr") duration = 7500;

        const tId = setTimeout(() => {
            setActiveTab((prev) => {
                const order: ToolTab[] = ["docx-udf", "pdf-merge", "ocr"];
                const i = order.indexOf(prev);
                return order[(i + 1) % order.length];
            });
        }, duration);

        return () => clearTimeout(tId);
    }, [useStatic, activeTab]);

    const activeTabLabel = toolTabs.find((tab) => tab.id === activeTab)?.label ?? "";
    const activeSidebarLabels = {
        "docx-udf": t("sidebarDocTools"),
        "pdf-merge": t("sidebarPdfTools"),
        ocr: t("sidebarOcr"),
    } as const;

    if (useStatic) {
        return (
            <section className="relative py-16 md:py-24 bg-[#fafafc]">
                <div className="container mx-auto px-6">
                    <div className="flex justify-center">
                        <StaticPanel t={t} />
                    </div>
                    <div className="mt-12 text-center max-w-2xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-display font-black text-[#343131] mb-4">
                            {t("staticHeroTitle")}
                        </h2>
                        <p className="text-[#343131]/66 text-[15px] font-medium leading-relaxed mb-6">
                            {t("staticHeroDesc")}
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {valuePoints.map((p) => (
                                <span key={p} className="text-[12px] font-medium text-[#343131]/62 px-3 py-1.5 rounded-full bg-[#343131]/[0.04]">
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
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/2 top-10 h-56 w-[42rem] -translate-x-1/2 rounded-full bg-[#e6c800]/12 blur-3xl" />
                <div className="absolute right-0 top-28 h-72 w-72 rounded-full bg-[#343131]/[0.05] blur-3xl" />
            </div>
            <div className="container mx-auto px-6">
                <motion.div
                    className="relative z-10 w-full max-w-[1140px] mx-auto"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
                >
                    <div className="rounded-[2rem] bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfd_100%)] border border-[#343131]/[0.08] shadow-[0_36px_120px_rgba(0,0,0,0.12)] overflow-hidden">
                        <div className="h-14 bg-white/90 border-b border-[#343131]/[0.08] flex items-center justify-between px-5 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                                </div>
                                <span className="text-[13px] font-bold text-[#343131]/80">{t("panelName")}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6c800]/15 text-[#343131]/80 text-[10px] font-bold uppercase tracking-[0.18em] border border-[#e6c800]/25 [font-family:var(--font-button)]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#e6c800]" />
                                    {t("liveSystem")}
                                </span>
                            </div>
                        </div>

                        <div className="flex min-h-[520px]">
                            <aside className="w-[230px] shrink-0 border-r border-[#343131]/[0.08] bg-[#f7f7f9] py-5">
                                {sidebarItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = item.label === activeSidebarLabels[activeTab];

                                    return (
                                        <div
                                            key={item.label}
                                            className={`flex items-center gap-3 px-4 py-3 mx-3 rounded-xl text-[13px] font-semibold mb-1 transition-all duration-200 ${
                                                isActive
                                                    ? "bg-white text-[#343131] shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-[#343131]/10"
                                                    : "text-[#343131]/70 hover:bg-white hover:text-[#343131] hover:border hover:border-[#343131]/10"
                                            }`}
                                        >
                                            <Icon size={18} className={`shrink-0 ${isActive ? "text-[#e6c800]" : "opacity-90"}`} />
                                            <span>{item.label}</span>
                                        </div>
                                    );
                                })}
                            </aside>

                            <main className="flex-1 p-6 md:p-7 min-h-[466px] flex flex-col bg-[radial-gradient(circle_at_top_right,rgba(230,200,0,0.08),transparent_28%)]">
                                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_220px] gap-6 items-start mb-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                    {toolTabs.map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-bold transition-all duration-200 ${
                                                    isActive
                                                        ? "bg-[#343131] !text-white shadow-[0_14px_30px_rgba(52,49,49,0.18)]"
                                                        : "bg-white text-[#343131]/70 border border-[#343131]/10 hover:text-[#343131] hover:border-[#343131]/20"
                                                }`}
                                            >
                                                <Icon size={14} className={isActive ? "!text-white" : ""} />
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                        </div>

                                        <div className="flex items-center gap-1.5 text-[11px] text-[#343131]/50 mb-4">
                                            <span>{t("breadcrumbDocTools")}</span>
                                            <ChevronRight size={12} />
                                            <span className="text-[#343131]/80 font-medium">{activeTabLabel}</span>
                                        </div>

                                        <div className="flex items-end justify-between pb-4 border-b border-[#343131]/[0.08]">
                                            <div>
                                                <h3 className="text-[28px] leading-none font-black text-[#343131]">
                                                    {activeTab === "docx-udf" && t("titleDocxUdf")}
                                                    {activeTab === "pdf-merge" && t("titlePdfMerge")}
                                                    {activeTab === "ocr" && t("titleOcr")}
                                                </h3>
                                                <p className="text-[15px] text-[#343131]/65 mt-2 font-medium">
                                                    {activeTab === "docx-udf" && t("subtitleDocxUdf")}
                                                    {activeTab === "pdf-merge" && t("subtitlePdfMerge")}
                                                    {activeTab === "ocr" && t("subtitleOcr")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl bg-white border border-[#343131]/10 px-4 py-3 shadow-sm">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#343131]/45">Format</p>
                                            <p className="mt-2 text-[13px] font-bold text-[#343131]">
                                                {activeTab === "docx-udf" ? "DOCX -> UDF" : activeTab === "pdf-merge" ? "PDF Stack" : "OCR Extract"}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl bg-[#343131] px-4 py-3 shadow-[0_18px_40px_rgba(52,49,49,0.18)]">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] !text-white/55">Status</p>
                                            <p className="mt-2 text-[13px] font-bold !text-white">{t("liveSystem")}</p>
                                        </div>
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
                                            <DocxUdfDemo state={docxState} t={t} />
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
                                            <PdfMergeDemo reducedMotion={reduceMotion} t={t} />
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
                                            <OcrDemo reducedMotion={reduceMotion} t={t} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="mt-5 pt-4 border-t border-[#343131]/[0.08] flex items-center gap-6 text-[11px] text-[#343131]/55 font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#e6c800]" />
                                        {t("footerKvkk")}
                                    </span>
                                </div>
                            </main>
                        </div>
                    </div>
                </motion.div>

                <div className="relative mt-12 text-center max-w-3xl mx-auto z-10">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-black text-[#343131] mb-4">
                        {t("bottomTitle")}
                    </h2>
                    <p className="text-[#343131]/60 text-[15px] md:text-[16px] font-medium leading-relaxed mb-8">
                        {t("bottomDesc")}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                        {valuePoints.map((p) => (
                            <div
                                key={p}
                                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-[#343131]/10 text-[12px] font-bold uppercase tracking-[0.14em] text-[#343131]/75 [font-family:var(--font-button)] shadow-[0_16px_34px_rgba(0,0,0,0.06)]"
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
