"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    UploadCloud,
    ArrowLeft,
    Loader2,
    Download,
    Zap,
    FileText,
    Scissors
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ToolPageHint } from "@/components/dashboard/ToolPageHint";
import { ToolLockedGate } from "@/components/dashboard/ToolLockedGate";
import { hasToolAccess } from "@/lib/trial-access-client";
import { ConversionResultPanel } from "@/components/dashboard/ConversionResultPanel";
import { PdfPreview } from "@/components/dashboard/PdfPreview";
import { getPdfPageCount } from "@/lib/pdf-utils";

export default function PdfSplitTool() {
    const t = useTranslations("Dashboard.overview.tools");
    const tSplit = useTranslations("Dashboard.overview.tools.pdfSplit");
    const { data: session } = useSession();
    const hasSubscription = session?.user && hasToolAccess(session.user as any);

    const [file, setFile] = useState<File | null>(null);
    const [pageRange, setPageRange] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [conversionTimeMs, setConversionTimeMs] = useState<number | null>(null);
    const [pageCount, setPageCount] = useState<number | null>(null);

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
            setError(tSplit("errorNoFile"));
            return;
        }
        if (!pageRange.trim()) {
            setError(tSplit("errorNoPageRange"));
            return;
        }

        setLoading(true);
        setError(null);
        const start = Date.now();

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("pageRange", pageRange.trim());

            const res = await fetch("/api/tools/pdf-split", {
                method: "POST",
                body: formData
            }).catch(() => {
                throw new Error(tSplit("errorService"));
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || tSplit("errorGeneric"));
            }

            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            setResultUrl(downloadUrl);
            setResultBlob(blob);
            setConversionTimeMs(Date.now() - start);
            const count = await getPdfPageCount(blob);
            setPageCount(count);
        } catch (err: any) {
            console.error(err);
            setError(err.message || tSplit("errorGeneric"));
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        if (resultUrl) window.URL.revokeObjectURL(resultUrl);
        setFile(null);
        setPageRange("");
        setError(null);
        setResultUrl(null);
        setResultBlob(null);
        setConversionTimeMs(null);
        setPageCount(null);
    };

    if (!hasSubscription && session?.user) {
        return (
            <div className="relative">
                <div className="max-w-5xl relative z-10">
                    <Link href="/dashboard/tools" className="inline-flex items-center gap-2 text-[#888] hover:text-[#0e0e0e] transition-colors mb-8 text-sm font-bold uppercase tracking-wider">
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
                <Link href="/dashboard/tools" className="inline-flex items-center gap-2 text-[#888] hover:text-[#0e0e0e] transition-colors mb-8 text-sm font-bold uppercase tracking-wider">
                    <ArrowLeft size={16} /> {t("backToHub")}
                </Link>

                <div className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-display font-black text-[#0e0e0e] mb-3">{tSplit("title")}</h1>
                            <p className="text-[#666] font-medium text-lg max-w-2xl">
                                {tSplit("description")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Usage tips */}
                <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
                        <span className="text-amber-500 font-black">•</span>
                        {tSplit("tip1")}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
                        <span className="text-amber-500 font-black">•</span>
                        {tSplit("tip2")}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`glass rounded-3xl border-2 border-dashed p-10 text-center cursor-pointer transition-all h-full flex flex-col justify-center items-center relative ${isDragging ? "border-amber-400 bg-amber-50/50 scale-[0.99]" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
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
                            <h3 className="text-xl font-display font-bold text-[#0e0e0e] mb-2">{tSplit("uploadTitle")}</h3>
                            <p className="text-[#888] text-sm font-medium leading-relaxed">
                                {tSplit("uploadHint")}
                            </p>
                            {file && (
                                <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <FileText size={14} className="text-emerald-600" />
                                    <span className="text-xs font-bold text-emerald-700 truncate max-w-[140px]">{file.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="glass rounded-3xl border border-slate-200 p-8 h-full flex flex-col">
                            {!resultUrl ? (
                                <>
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-[#0e0e0e] mb-2">
                                            {tSplit("pageRangeLabel")}
                                        </label>
                                        <input
                                            type="text"
                                            value={pageRange}
                                            onChange={(e) => { setPageRange(e.target.value); setError(null); }}
                                            placeholder={tSplit("pageRangePlaceholder")}
                                            className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-[#0e0e0e] font-mono text-sm focus:ring-2 focus:ring-[#e6c800] focus:border-transparent focus:outline-none"
                                        />
                                        <p className="mt-2 text-xs text-[#888] font-medium">
                                            {tSplit("pageRangeHelp")}
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center gap-2">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-[#888] font-medium">
                                            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "—"}
                                        </span>
                                        <button
                                            onClick={handleProcess}
                                            disabled={loading || !file || !pageRange.trim()}
                                            className="bg-[#0e0e0e] text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        >
                                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Scissors size={14} />}
                                            {tSplit("splitButton")}
                                        </button>
                                    </div>
                                </>
                            ) : resultUrl && resultBlob ? (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col">
                                    <ConversionResultPanel
                                        filename="zygsoft_split.pdf"
                                        fileSize={resultBlob.size}
                                        conversionType="PDF Split"
                                        conversionTimeMs={conversionTimeMs ?? undefined}
                                        pageCount={pageCount ?? undefined}
                                        pageCountLabel={pageCount === 1 ? t("resultPanel.pageCountOne") : t("resultPanel.pageCount")}
                                        preview={<PdfPreview url={resultUrl} />}
                                        downloadOptions={
                                            <a
                                                href={resultUrl}
                                                download="zygsoft_split.pdf"
                                                className="bg-[#0e0e0e] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2"
                                            >
                                                <Download size={16} /> {tSplit("downloadButton")}
                                            </a>
                                        }
                                        onReset={reset}
                                        successTitle={tSplit("successTitle")}
                                        successDesc={tSplit("successDesc")}
                                        newButtonLabel={tSplit("newButton")}
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
