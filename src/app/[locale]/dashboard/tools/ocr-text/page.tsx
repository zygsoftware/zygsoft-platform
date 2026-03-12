"use client";

import { useState } from "react";
import { Document, Paragraph, TextRun, Packer } from "docx";
import { motion } from "framer-motion";
import {
    UploadCloud,
    ArrowLeft,
    Loader2,
    Download,
    CheckCircle2,
    Zap,
    Copy,
    FileText,
    Languages
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ToolPageHint } from "@/components/dashboard/ToolPageHint";
import { ToolLockedGate } from "@/components/dashboard/ToolLockedGate";
import { hasToolAccess } from "@/lib/trial-access-client";

const ACCEPT = ".pdf,.png,.jpg,.jpeg,.tif,.tiff,image/tiff,application/pdf";

function isValidFile(file: File): boolean {
    const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
    return [".pdf", ".png", ".jpg", ".jpeg", ".tif", ".tiff"].includes(ext);
}

export default function OcrTextTool() {
    const t = useTranslations("Dashboard.overview.tools");
    const tOcr = useTranslations("Dashboard.overview.tools.ocrText");
    const { data: session } = useSession();
    const hasSubscription = session?.user && hasToolAccess(session.user as any);

    const [file, setFile] = useState<File | null>(null);
    const [language, setLanguage] = useState<"tr" | "en">("tr");
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultText, setResultText] = useState<string | null>(null);
    const [conversionTimeMs, setConversionTimeMs] = useState<number | null>(null);

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
        const f = e.dataTransfer.files?.[0];
        if (f && isValidFile(f)) {
            setFile(f);
            setError(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f && isValidFile(f)) {
            setFile(f);
            setError(null);
        }
    };

    const handleProcess = async () => {
        if (!file) {
            setError(tOcr("errorNoFile"));
            return;
        }
        setLoading(true);
        setError(null);
        const start = Date.now();

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("language", language);

            const res = await fetch("/api/tools/ocr-text", {
                method: "POST",
                body: formData,
            }).catch(() => {
                throw new Error(tOcr("errorService"));
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.error || tOcr("errorGeneric"));
            }

            setResultText(data.text ?? "");
            setConversionTimeMs(Date.now() - start);
        } catch (err: any) {
            console.error(err);
            setError(err.message || tOcr("errorGeneric"));
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!resultText) return;
        try {
            await navigator.clipboard.writeText(resultText);
        } catch {}
    };

    const handleDownloadTxt = () => {
        if (!resultText) return;
        const blob = new Blob([resultText], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "extracted_text.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadDocx = async () => {
        if (!resultText) return;
        try {
            const lines = resultText.split(/\n/);
            const paragraphs = lines.length
                ? lines.map((line) => new Paragraph({ children: [new TextRun({ text: line || " " })] }))
                : [new Paragraph({ children: [new TextRun({ text: " " })] })];
            const doc = new Document({
                sections: [{ children: paragraphs }],
            });
            const blob = await Packer.toBlob(doc);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "extracted_text.docx";
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            // fallback silent
        }
    };

    const handleReset = () => {
        setFile(null);
        setResultText(null);
        setError(null);
        setConversionTimeMs(null);
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
                            <h1 className="text-4xl font-display font-black text-[#0e0e0e] mb-3">{tOcr("title")}</h1>
                            <p className="text-[#666] font-medium text-lg max-w-2xl">
                                {tOcr("description")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
                        <span className="text-amber-500 font-black">•</span>
                        {tOcr("tip1")}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
                        <span className="text-amber-500 font-black">•</span>
                        {tOcr("tip2")}
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
                                accept={ACCEPT}
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="w-16 h-16 bg-[#0e0e0e] rounded-2xl flex items-center justify-center text-[#e6c800] mb-6 shadow-xl">
                                <UploadCloud size={28} />
                            </div>
                            <h3 className="text-xl font-display font-bold text-[#0e0e0e] mb-2">{tOcr("uploadTitle")}</h3>
                            <p className="text-[#888] text-sm font-medium leading-relaxed">
                                {tOcr("uploadHint")}
                            </p>
                        </div>

                        <div className="mt-6 glass rounded-3xl border border-slate-200 p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Languages size={18} className="text-[#e6c800]" />
                                <span className="text-sm font-bold text-[#0e0e0e]">{tOcr("languageLabel")}</span>
                            </div>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="lang"
                                        checked={language === "tr"}
                                        onChange={() => setLanguage("tr")}
                                        className="accent-[#e6c800]"
                                    />
                                    <span className="text-sm font-bold text-[#0e0e0e]">{tOcr("langTr")}</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="lang"
                                        checked={language === "en"}
                                        onChange={() => setLanguage("en")}
                                        className="accent-[#e6c800]"
                                    />
                                    <span className="text-sm font-bold text-[#0e0e0e]">{tOcr("langEn")}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="glass rounded-3xl border border-slate-200 p-8 h-full flex flex-col">
                            {resultText === null ? (
                                <>
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-display font-bold text-[#0e0e0e] flex items-center gap-3">
                                            <FileText size={20} className="text-[#e6c800]" />
                                            {file ? file.name : tOcr("noFile")}
                                        </h3>
                                        {file && (
                                            <button
                                                onClick={handleProcess}
                                                disabled={loading}
                                                className="bg-[#0e0e0e] text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all flex items-center gap-2"
                                            >
                                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="white" />}
                                                {tOcr("extractButton")}
                                            </button>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center gap-2">
                                            {error}
                                        </div>
                                    )}

                                    {!file ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-[#888]">
                                            <FileText size={48} className="opacity-10 mb-4" />
                                            <p className="text-sm font-bold uppercase tracking-widest opacity-40">{tOcr("emptyHint")}</p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl">
                                            <div className="w-12 h-12 rounded-xl bg-[#f3f1ed] text-[#0e0e0e] flex items-center justify-center shrink-0">
                                                <FileText size={24} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-[#0e0e0e] truncate">{file.name}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[#888]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                                                <CheckCircle2 size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-display font-black text-[#0e0e0e]">{tOcr("successTitle")}</h3>
                                                <p className="text-xs text-[#888] font-medium">{tOcr("successDesc")}</p>
                                                <div className="flex flex-wrap gap-2 mt-1 text-[10px] font-bold text-[#666]">
                                                    <span>extracted_text.txt</span>
                                                    <span>{(new Blob([resultText]).size / 1024).toFixed(1)} KB</span>
                                                    <span className="px-2 py-0.5 bg-slate-100 rounded">OCR</span>
                                                    {conversionTimeMs != null && (
                                                        <span>{(conversionTimeMs / 1000).toFixed(1)} s</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={handleCopy}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all"
                                            >
                                                <Copy size={16} /> {tOcr("copyButton")}
                                            </button>
                                            <button
                                                onClick={handleDownloadTxt}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0e0e0e] text-white text-sm font-bold hover:bg-black transition-all"
                                            >
                                                <Download size={16} /> {tOcr("downloadButton")}
                                            </button>
                                            <button
                                                onClick={handleDownloadDocx}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-black/10 text-[#0e0e0e] text-sm font-bold hover:bg-slate-50 transition-all"
                                            >
                                                <Download size={16} /> {t("resultPanel.downloadDocx")}
                                            </button>
                                        </div>
                                    </div>

                                    <textarea
                                        readOnly
                                        value={resultText}
                                        className="w-full h-64 p-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-300"
                                    />

                                    <button
                                        onClick={handleReset}
                                        className="mt-4 self-start bg-white border border-black/10 text-[#0e0e0e] px-6 py-2.5 rounded-xl font-black uppercase tracking-widest hover:bg-[#f3f1ed] transition-all text-sm"
                                    >
                                        {tOcr("newButton")}
                                    </button>
                                </motion.div>
                            )}
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
