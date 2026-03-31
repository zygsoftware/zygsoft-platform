"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    UploadCloud,
    ArrowLeft,
    Loader2,
    Download,
    FileText,
    FileType2,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ToolPageHint } from "@/components/dashboard/ToolPageHint";
import { ToolLockedGate } from "@/components/dashboard/ToolLockedGate";
import { hasToolAccess } from "@/lib/trial-access-client";
import { ConversionResultPanel } from "@/components/dashboard/ConversionResultPanel";
import { PdfPreview } from "@/components/dashboard/PdfPreview";
type ToolAccessUser = Parameters<typeof hasToolAccess>[0];

export default function PdfToWordTool() {
    const t = useTranslations("Dashboard.overview.tools");
    const tConv = useTranslations("Dashboard.overview.tools.pdfToWord");
    const { data: session } = useSession();
    const hasSubscription = session?.user && hasToolAccess(session.user as ToolAccessUser);

    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [conversionTimeMs, setConversionTimeMs] = useState<number | null>(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setFilePreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setFilePreviewUrl(url);
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [file]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped && (dropped.type === "application/pdf" || dropped.name.toLowerCase().endsWith(".pdf"))) {
            setFile(dropped);
            setError(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected && (selected.type === "application/pdf" || selected.name.toLowerCase().endsWith(".pdf"))) {
            setFile(selected);
            setError(null);
        }
    };

    const handleProcess = async () => {
        if (!file) {
            setError(tConv("errorNoFile"));
            return;
        }

        setLoading(true);
        setError(null);
        const start = Date.now();

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/tools/pdf-to-word", {
                method: "POST",
                body: formData,
            }).catch(() => {
                throw new Error(tConv("errorService"));
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || tConv("errorGeneric"));
            }

            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            setResultUrl(downloadUrl);
            setResultBlob(blob);
            setConversionTimeMs(Date.now() - start);
        } catch (err: unknown) {
            console.error(err);
            setError(err instanceof Error ? err.message : tConv("errorGeneric"));
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        if (resultUrl) window.URL.revokeObjectURL(resultUrl);
        setFile(null);
        setError(null);
        setResultUrl(null);
        setResultBlob(null);
        setConversionTimeMs(null);
    };

    if (!hasSubscription && session?.user) {
        return (
            <div className="relative">
                <div className="max-w-5xl relative z-10">
                    <Link
                        href="/document-tools"
                        className="mb-8 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#343131]/48 transition-colors hover:text-[#343131]"
                    >
                        <ArrowLeft size={16} /> {t("backToHub")}
                    </Link>
                    <ToolLockedGate session={session} />
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="max-w-5xl relative z-10">
                <Link
                    href="/document-tools"
                    className="mb-8 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#343131]/48 transition-colors hover:text-[#343131]"
                >
                    <ArrowLeft size={16} /> {t("backToHub")}
                </Link>

                <div className="mb-10 border-b border-[#343131]/8 pb-8">
                    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h1 className="mb-3 text-3xl md:text-4xl font-display font-black tracking-tight text-[#343131]">{tConv("title")}</h1>
                            <p className="max-w-2xl text-[16px] leading-8 text-[#343131]/60">{tConv("description")}</p>
                        </div>
                    </div>
                </div>

                <div className="mb-4 space-y-2">
                    <div className="flex items-start gap-3 rounded-[1.15rem] border border-[#343131]/8 bg-white/72 px-4 py-3 text-sm text-[#343131]/62">
                        <span className="text-amber-500 font-black">•</span>
                        {tConv("tip1")}
                    </div>
                    <div className="flex items-start gap-3 rounded-[1.15rem] border border-[#343131]/8 bg-white/72 px-4 py-3 text-sm text-[#343131]/62">
                        <span className="text-amber-500 font-black">•</span>
                        {tConv("tip2")}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`glass rounded-3xl border-2 border-dashed p-10 text-center cursor-pointer transition-all h-full flex flex-col justify-center items-center relative ${
                                isDragging
                                    ? "border-amber-400 bg-amber-50/50 scale-[0.99]"
                                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                            }`}
                        >
                            <input
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="w-16 h-16 bg-[#0e0e0e] rounded-2xl flex items-center justify-center text-[#e6c800] mb-6 shadow-xl">
                                <UploadCloud size={28} />
                            </div>
                            <h3 className="text-xl font-display font-bold text-[#0e0e0e] mb-2">{tConv("uploadTitle")}</h3>
                            <p className="text-[#888] text-sm font-medium leading-relaxed">{tConv("uploadHint")}</p>
                            {file && (
                                <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <FileText size={14} className="text-emerald-600" />
                                    <span className="text-xs font-bold text-emerald-700 truncate max-w-[140px]">{file.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="glass rounded-[1.8rem] p-8 h-full flex flex-col">
                            {!resultUrl ? (
                                <>
                                    {file && filePreviewUrl ? (
                                        <div className="mb-6 flex-1 flex flex-col min-h-0">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                {tConv("previewTitle")}
                                            </p>
                                            <div className="rounded-2xl border border-black/5 overflow-hidden bg-slate-100 flex-1 min-h-[320px]">
                                                <PdfPreview url={`${filePreviewUrl}#toolbar=1&navpanes=0`} className="min-h-[320px] h-[min(55vh,480px)]" />
                                            </div>
                                            <p className="mt-2 text-[11px] text-slate-400 font-medium">{tConv("previewHint")}</p>
                                        </div>
                                    ) : (
                                        <div className="mb-6 flex-1 min-h-[200px] rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 flex items-center justify-center">
                                            <p className="text-sm text-slate-400 font-medium text-center px-6">{tConv("previewPlaceholder")}</p>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center gap-2">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
                                        <span className="text-sm text-[#888] font-medium">
                                            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "—"}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleProcess}
                                            disabled={loading || !file}
                                            className="bg-[#0e0e0e] text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        >
                                            {loading ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <FileType2 size={14} />
                                            )}
                                            {tConv("convertButton")}
                                        </button>
                                    </div>
                                </>
                            ) : resultUrl && resultBlob ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex-1 flex flex-col"
                                >
                                    <ConversionResultPanel
                                        filename="zygsoft_document.docx"
                                        fileSize={resultBlob.size}
                                        conversionType="PDF → Word"
                                        conversionTimeMs={conversionTimeMs ?? undefined}
                                        downloadOptions={
                                            <a
                                                href={resultUrl}
                                                download="zygsoft_document.docx"
                                                className="bg-[#0e0e0e] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2"
                                            >
                                                <Download size={16} /> {tConv("downloadButton")}
                                            </a>
                                        }
                                        onReset={reset}
                                        successTitle={tConv("successTitle")}
                                        successDesc={tConv("successDesc")}
                                        newButtonLabel={tConv("newButton")}
                                    />
                                </motion.div>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <ToolPageHint />
                </div>
            </div>
        </div>
    );
}
