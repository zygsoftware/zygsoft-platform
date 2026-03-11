"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { FileText, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

type DemoState = "idle" | "file-arrives" | "uploading" | "converting" | "ready" | "reset";

const STATE_DURATIONS: Record<DemoState, number> = {
    idle: 2000,
    "file-arrives": 1200,
    uploading: 1400,
    converting: 2800,
    ready: 2500,
    reset: 600,
};

function StaticDemo() {
    return (
        <div className="flex justify-center py-12 md:py-16">
            <div className="w-full max-w-[320px] rounded-2xl bg-white border border-[#0a0c10]/[0.06] shadow-[0_16px_48px_rgba(0,0,0,0.08)] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#0a0c10]/[0.06] flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0c10]/60">DOCX → UDF</span>
                    <span className="text-[9px] font-bold text-[#e6c800]">Demo</span>
                </div>
                <div className="p-6 flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#0a0c10]/[0.04] flex items-center justify-center">
                        <FileText size={24} className="text-[#0a0c10]/50" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-[#0a0c10]">document.docx</p>
                        <p className="text-[11px] text-[#0a0c10]/50 mt-1">→ output.udf</p>
                    </div>
                    <div className="flex items-center gap-2 text-[#e6c800]">
                        <CheckCircle2 size={16} />
                        <span className="text-[11px] font-bold">Dönüştürüldü</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function DocToUdfDemo() {
    const [state, setState] = useState<DemoState>("idle");
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
        if (useStatic) return;

        const sequence: DemoState[] = ["idle", "file-arrives", "uploading", "converting", "ready", "reset"];
        let idx = 0;
        let t: ReturnType<typeof setTimeout>;

        const advance = () => {
            idx = (idx + 1) % sequence.length;
            setState(sequence[idx]);
            const dur = STATE_DURATIONS[sequence[idx]];
            t = setTimeout(advance, dur);
        };

        t = setTimeout(advance, STATE_DURATIONS.idle);

        return () => clearTimeout(t);
    }, [useStatic]);

    if (useStatic) {
        return <StaticDemo />;
    }

    return (
        <div className="flex justify-center py-12 md:py-16 px-4">
            <motion.div
                className="w-full max-w-[320px] rounded-2xl bg-white border border-[#0a0c10]/[0.06] shadow-[0_16px_48px_rgba(0,0,0,0.08)] overflow-hidden"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 1.8 }}
            >
                {/* Header */}
                <div className="px-4 py-3 border-b border-[#0a0c10]/[0.06] flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0c10]/60">DOCX → UDF</span>
                    <span className="text-[9px] font-bold text-[#e6c800]">Canlı Demo</span>
                </div>

                {/* Content */}
                <div className="p-5 min-h-[180px] relative">
                    <AnimatePresence mode="wait">
                        {/* idle */}
                        {state === "idle" && (
                            <motion.div
                                key="idle"
                                className="absolute inset-5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#0a0c10]/[0.1] bg-[#0a0c10]/[0.02]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <p className="text-[11px] font-medium text-[#0a0c10]/40 uppercase tracking-wider">Belge yükle</p>
                            </motion.div>
                        )}

                        {/* file-arrives */}
                        {state === "file-arrives" && (
                            <motion.div
                                key="file-arrives"
                                className="absolute inset-5 flex items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <motion.div
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-[#0a0c10]/[0.08] shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                                    initial={{ x: -80, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-[#0a0c10]/[0.06] flex items-center justify-center">
                                        <FileText size={18} className="text-[#0a0c10]/70" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-[#0a0c10]">document.docx</p>
                                        <p className="text-[10px] text-[#0a0c10]/45">2.4 KB</p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* uploading */}
                        {state === "uploading" && (
                            <motion.div
                                key="uploading"
                                className="absolute inset-5 flex flex-col items-center justify-center rounded-xl border-2 border-[#e6c800]/30 bg-[#e6c800]/[0.04]"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <motion.div
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-[#0a0c10]/[0.08] shadow-sm"
                                    initial={{ x: -40, y: 20 }}
                                    animate={{ x: 0, y: 0 }}
                                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <FileText size={18} className="text-[#0a0c10]/70" />
                                    <div>
                                        <p className="text-[13px] font-bold text-[#0a0c10]">document.docx</p>
                                        <p className="text-[10px] text-[#e6c800] font-medium">Yükleniyor...</p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* converting */}
                        {state === "converting" && (
                            <motion.div
                                key="converting"
                                className="absolute inset-5 flex flex-col gap-4 rounded-xl border border-[#0a0c10]/[0.08] bg-[#0a0c10]/[0.02] p-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#0a0c10]/[0.06] flex items-center justify-center">
                                        <FileText size={18} className="text-[#0a0c10]/70" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[13px] font-bold text-[#0a0c10]">document.docx</p>
                                        <p className="text-[10px] text-[#0a0c10]/50 flex items-center gap-1.5">
                                            <Loader2 size={12} className="animate-spin" />
                                            UDF dönüştürülüyor...
                                        </p>
                                    </div>
                                </div>
                                <div className="h-1.5 rounded-full bg-[#0a0c10]/[0.04] overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full bg-[#e6c800]"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* ready */}
                        {state === "ready" && (
                            <motion.div
                                key="ready"
                                className="absolute inset-5 flex flex-col gap-4 rounded-xl border border-[#0a0c10]/[0.08] bg-[#0a0c10]/[0.02] p-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#e6c800]/20 flex items-center justify-center">
                                        <CheckCircle2 size={20} className="text-[#e6c800]" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-[#0a0c10]">output.udf</p>
                                        <p className="text-[10px] text-[#0a0c10]/50">UYAP uyumlu</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-[#e6c800]">
                                    <ArrowRight size={14} />
                                    <span className="text-[11px] font-bold">Dönüşüm tamamlandı</span>
                                </div>
                            </motion.div>
                        )}

                        {/* reset */}
                        {state === "reset" && (
                            <motion.div
                                key="reset"
                                className="absolute inset-5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#0a0c10]/[0.1] bg-[#0a0c10]/[0.02]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <p className="text-[11px] font-medium text-[#0a0c10]/40 uppercase tracking-wider">Belge yükle</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
