"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    UploadCloud,
    ArrowLeft,
    Loader2,
    Download,
    Trash2,
    CheckCircle2,
    Zap,
    FileText,
    Layers,
    FileImage,
    ScanText,
    Languages
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ToolPageHint } from "@/components/dashboard/ToolPageHint";
import { ToolLockedGate } from "@/components/dashboard/ToolLockedGate";
import { hasToolAccess } from "@/lib/trial-access-client";
import { ConversionResultPanel } from "@/components/dashboard/ConversionResultPanel";

export type BatchToolType = "doc-to-udf" | "image-to-pdf" | "tiff-to-pdf" | "ocr-text";

const TOOL_OPTIONS: { value: BatchToolType; label: string; accept: string; icon: React.ReactNode }[] = [
    { value: "doc-to-udf", label: "DOCX → UDF", accept: ".docx", icon: <FileText size={20} /> },
    { value: "image-to-pdf", label: "Görsel → PDF", accept: ".jpg,.jpeg,.png,image/jpeg,image/png", icon: <FileImage size={20} /> },
    { value: "tiff-to-pdf", label: "TIFF → PDF", accept: ".tif,.tiff,image/tiff", icon: <Layers size={20} /> },
    { value: "ocr-text", label: "OCR Metin Çıkarma", accept: ".pdf,.png,.jpg,.jpeg,.tif,.tiff,image/tiff,application/pdf", icon: <ScanText size={20} /> },
];

function getAcceptForTool(tool: BatchToolType): string {
    return TOOL_OPTIONS.find((o) => o.value === tool)?.accept || "";
}

function isValidForTool(file: File, tool: BatchToolType): boolean {
    const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
    const config: Record<BatchToolType, string[]> = {
        "doc-to-udf":     [".docx"],
        "image-to-pdf":   [".jpg", ".jpeg", ".png"],
        "tiff-to-pdf":    [".tif", ".tiff"],
        "ocr-text":       [".pdf", ".png", ".jpg", ".jpeg", ".tif", ".tiff"],
    };
    return config[tool].includes(ext);
}

export default function BatchConvertTool() {
    const t = useTranslations("Dashboard.overview.tools");
    const tBatch = useTranslations("Dashboard.overview.tools.batchConvert");
    const { data: session } = useSession();
    const hasSubscription = session?.user && hasToolAccess(session.user as any);

    const [files, setFiles] = useState<{ id: string; file: File }[]>([]);
    const [toolType, setToolType] = useState<BatchToolType>("doc-to-udf");
    const [language, setLanguage] = useState<"tr" | "en">("tr");
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [conversionTimeMs, setConversionTimeMs] = useState<number | null>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
        else if (e.type === "dragleave") setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) handleFiles(Array.from(e.dataTransfer.files));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) handleFiles(Array.from(e.target.files));
    };

    const handleFiles = (newFiles: File[]) => {
        const valid = newFiles.filter((f) => isValidForTool(f, toolType));
        const fileObjects = valid.map((file) => ({
            id: Math.random().toString(36).substring(7),
            file,
        }));
        setFiles((prev) => {
            const combined = [...prev, ...fileObjects];
            return combined.slice(0, 20);
        });
        setError(null);
    };

    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        setError(null);
    };

    const handleToolChange = (newTool: BatchToolType) => {
        setToolType(newTool);
        setFiles([]);
        setError(null);
    };

    const handleConvert = async () => {
        if (files.length === 0) {
            setError(tBatch("errorNoFile"));
            return;
        }
        setLoading(true);
        setError(null);
        const start = Date.now();

        try {
            const formData = new FormData();
            formData.append("toolType", toolType);
            formData.append("language", language);
            files.forEach((f) => formData.append("files", f.file));

            const res = await fetch("/api/tools/batch-convert", {
                method: "POST",
                body: formData,
            }).catch(() => {
                throw new Error(tBatch("errorService"));
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || tBatch("errorGeneric"));
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            setResultUrl(url);
            setResultBlob(blob);
            setConversionTimeMs(Date.now() - start);
        } catch (err: any) {
            setError(err.message || tBatch("errorGeneric"));
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (resultUrl) window.URL.revokeObjectURL(resultUrl);
        setFiles([]);
        setResultUrl(null);
        setResultBlob(null);
        setConversionTimeMs(null);
        setError(null);
    };

    const getConversionTypeLabel = () => {
        const labels: Record<BatchToolType, string> = {
            "doc-to-udf": "DOCX → UDF",
            "image-to-pdf": "Image → PDF",
            "tiff-to-pdf": "TIFF → PDF",
            "ocr-text": "OCR",
        };
        return labels[toolType];
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
                    <h1 className="text-4xl font-display font-black text-[#0e0e0e] mb-3">{tBatch("title")}</h1>
                    <p className="text-[#666] font-medium text-lg max-w-2xl">{tBatch("description")}</p>
                </div>

                <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
                        <span className="text-amber-500 font-black">•</span>
                        {tBatch("tip1")}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
                        <span className="text-amber-500 font-black">•</span>
                        {tBatch("tip2")}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`glass rounded-3xl border-2 border-dashed p-10 text-center cursor-pointer transition-all flex flex-col justify-center items-center min-h-[200px] relative ${isDragging ? "border-amber-400 bg-amber-50/50 scale-[0.99]" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"}`}
                        >
                            <input
                                type="file"
                                accept={getAcceptForTool(toolType)}
                                multiple
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <UploadCloud size={32} className="text-[#e6c800] mb-4" />
                            <h3 className="text-lg font-display font-bold text-[#0e0e0e] mb-2">{tBatch("uploadTitle")}</h3>
                            <p className="text-[#888] text-sm font-medium">{tBatch("uploadHint")}</p>
                        </div>

                        <div className="glass rounded-3xl border border-slate-200 p-6">
                            <label className="block text-sm font-bold text-[#0e0e0e] mb-3">{tBatch("toolSelectorLabel")}</label>
                            <div className="space-y-2">
                                {TOOL_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleToolChange(opt.value)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold transition-all ${toolType === opt.value ? "bg-[#0e0e0e] text-white" : "bg-slate-50 hover:bg-slate-100 text-slate-700"}`}
                                    >
                                        {opt.icon}
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {toolType === "ocr-text" && (
                            <div className="glass rounded-3xl border border-slate-200 p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Languages size={18} className="text-[#e6c800]" />
                                    <span className="text-sm font-bold text-[#0e0e0e]">{tBatch("languageLabel")}</span>
                                </div>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="lang" checked={language === "tr"} onChange={() => setLanguage("tr")} className="accent-[#e6c800]" />
                                        <span className="text-sm font-bold">{tBatch("langTr")}</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="lang" checked={language === "en"} onChange={() => setLanguage("en")} className="accent-[#e6c800]" />
                                        <span className="text-sm font-bold">{tBatch("langEn")}</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <div className="glass rounded-3xl border border-slate-200 p-8">
                            {!resultUrl ? (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-display font-bold text-[#0e0e0e] flex items-center gap-3">
                                            <FileText size={20} className="text-[#e6c800]" />
                                            {tBatch("fileList")} ({files.length}/20)
                                        </h3>
                                        {files.length > 0 && (
                                            <button
                                                onClick={handleConvert}
                                                disabled={loading}
                                                className="bg-[#0e0e0e] text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all flex items-center gap-2"
                                            >
                                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="white" />}
                                                {tBatch("convertButton")}
                                            </button>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold">{error}</div>
                                    )}

                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {files.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-16 text-[#888]">
                                                <FileText size={40} className="opacity-10 mb-3" />
                                                <p className="text-sm font-bold uppercase tracking-widest opacity-40">{tBatch("emptyList")}</p>
                                            </div>
                                        ) : (
                                            files.map((item) => (
                                                <div key={item.id} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl">
                                                    <div className="w-10 h-10 rounded-xl bg-[#f3f1ed] flex items-center justify-center shrink-0">
                                                        <FileText size={18} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-[#0e0e0e] truncate">{item.file.name}</p>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#888]">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                    <button onClick={() => removeFile(item.id)} className="p-2 text-[#888] hover:text-red-500 rounded-lg transition-all">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            ) : resultUrl && resultBlob ? (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col">
                                    <ConversionResultPanel
                                        filename="zygsoft_batch_converted.zip"
                                        fileSize={resultBlob.size}
                                        conversionType={getConversionTypeLabel()}
                                        conversionTimeMs={conversionTimeMs ?? undefined}
                                        fileCount={files.length}
                                        fileCountLabel={files.length === 1 ? t("resultPanel.fileCountOne") : t("resultPanel.fileCount")}
                                        downloadOptions={
                                            <a
                                                href={resultUrl}
                                                download="zygsoft_batch_converted.zip"
                                                className="bg-[#0e0e0e] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2"
                                            >
                                                <Download size={16} /> {tBatch("downloadButton")}
                                            </a>
                                        }
                                        onReset={handleReset}
                                        successTitle={tBatch("successTitle")}
                                        successDesc={tBatch("successDesc")}
                                        newButtonLabel={tBatch("newButton")}
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
