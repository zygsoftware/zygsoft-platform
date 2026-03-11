"use client";

import { useState } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import {
    UploadCloud,
    ArrowLeft,
    Loader2,
    Download,
    Trash2,
    GripVertical,
    CheckCircle2,
    Zap,
    Files,
    FileText,
    ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ToolPageHint } from "@/components/dashboard/ToolPageHint";
import { ConversionResultPanel } from "@/components/dashboard/ConversionResultPanel";
import { PdfPreview } from "@/components/dashboard/PdfPreview";
import { getPdfPageCount } from "@/lib/pdf-utils";

const ACCEPT = ".tif,.tiff,image/tiff";

function isTiff(file: File): boolean {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    return ext === "tif" || ext === "tiff";
}

export default function TiffToPdfTool() {
    const t = useTranslations("Dashboard.overview.tools");
    const tTiff = useTranslations("Dashboard.overview.tools.tiffToPdf");
    const { data: session } = useSession();
    const hasSubscription = session?.user &&
        (((session.user as any).activeProductSlugs?.includes("legal-toolkit")) || (session.user as any).role === "admin");

    const [files, setFiles] = useState<{ id: string; file: File }[]>([]);
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
        if (e.dataTransfer.files) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const handleFiles = (newFiles: File[]) => {
        const valid = newFiles.filter(isTiff);
        const fileObjects = valid.map((file) => ({
            id: Math.random().toString(36).substring(7),
            file,
        }));
        setFiles((prev) => {
            const combined = [...prev, ...fileObjects];
            return combined.slice(0, 10);
        });
        setError(null);
    };

    const removeFile = (idToRemove: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== idToRemove));
        setError(null);
    };

    const handleProcess = async () => {
        if (files.length === 0) {
            setError(tTiff("errorNoFile"));
            return;
        }
        setLoading(true);
        setError(null);
        const start = Date.now();

        try {
            const formData = new FormData();
            files.forEach((f) => formData.append("files", f.file));

            const res = await fetch("/api/tools/tiff-to-pdf", {
                method: "POST",
                body: formData,
            }).catch(() => {
                throw new Error(tTiff("errorService"));
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || tTiff("errorGeneric"));
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
            setError(err.message || tTiff("errorGeneric"));
        } finally {
            setLoading(false);
        }
    };

    if (!hasSubscription && session?.user) {
        return (
            <div className="relative">
                <div className="max-w-5xl relative z-10">
                    <Link href="/dashboard/tools" className="inline-flex items-center gap-2 text-[#888] hover:text-[#0e0e0e] transition-colors mb-8 text-sm font-bold uppercase tracking-wider">
                        <ArrowLeft size={16} /> {t("backToHub")}
                    </Link>
                    <div className="bg-white rounded-[2.5rem] p-12 md:p-16 border border-slate-200 text-center shadow-sm relative overflow-hidden">
                        <div className="w-24 h-24 mx-auto bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-8 border border-amber-100">
                            <ShieldAlert size={48} />
                        </div>
                        <h2 className="text-3xl font-display font-black text-[#0a0c10] mb-4">Erişim Kısıtlı</h2>
                        <p className="text-[#0a0c10]/60 font-medium text-lg mb-10 max-w-md mx-auto leading-relaxed">
                            Bu aracı kullanabilmek için aktif bir <strong>Hukuk Araçları Paketi</strong> aboneliğinizin olması gerekmektedir.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link href="/abonelikler" className="bg-[#e6c800] text-[#0a0c10] px-10 py-4 rounded-2xl font-black uppercase tracking-wider hover:bg-[#c9ad00] transition-all shadow-sm inline-flex items-center gap-3">
                                Paketi İncele <Zap size={18} fill="currentColor" />
                            </Link>
                            <Link href="/dashboard/billing?product=legal-toolkit" className="bg-[#0a0c10] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-wider hover:bg-[#0a0c10]/90 transition-all shadow-xl inline-flex items-center gap-3">
                                Ödeme Bildir
                            </Link>
                        </div>
                    </div>
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
                            <h1 className="text-4xl font-display font-black text-[#0e0e0e] mb-3">{tTiff("title")}</h1>
                            <p className="text-[#666] font-medium text-lg max-w-2xl">
                                {tTiff("description")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
                        <span className="text-amber-500 font-black">•</span>
                        {tTiff("tip1")}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
                        <span className="text-amber-500 font-black">•</span>
                        {tTiff("tip2")}
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
                                multiple
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="w-16 h-16 bg-[#0e0e0e] rounded-2xl flex items-center justify-center text-[#e6c800] mb-6 shadow-xl">
                                <UploadCloud size={28} />
                            </div>
                            <h3 className="text-xl font-display font-bold text-[#0e0e0e] mb-2">{tTiff("uploadTitle")}</h3>
                            <p className="text-[#888] text-sm font-medium leading-relaxed">
                                {tTiff("uploadHint")}
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="glass rounded-3xl border border-slate-200 p-8 h-full flex flex-col">
                            {!resultUrl ? (
                                <>
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-display font-bold text-[#0e0e0e] flex items-center gap-3">
                                            <Files size={20} className="text-[#e6c800]" />
                                            {tTiff("fileList")} ({files.length})
                                        </h3>
                                        {files.length > 0 && (
                                            <button
                                                onClick={handleProcess}
                                                disabled={loading}
                                                className="bg-[#0e0e0e] text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all flex items-center gap-2"
                                            >
                                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="white" />}
                                                {tTiff("convertButton")}
                                            </button>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center gap-2">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex-1 space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                                        {files.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-20 text-[#888]">
                                                <FileText size={48} className="opacity-10 mb-4" />
                                                <p className="text-sm font-bold uppercase tracking-widest opacity-40">{tTiff("emptyList")}</p>
                                            </div>
                                        ) : (
                                            <Reorder.Group axis="y" values={files} onReorder={setFiles} className="space-y-3">
                                                <AnimatePresence>
                                                    {files.map((item) => (
                                                        <Reorder.Item key={item.id} value={item} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl cursor-grab active:cursor-grabbing hover:border-slate-300 transition-colors shadow-sm">
                                                            <GripVertical size={18} className="text-[#ccc]" />
                                                            <div className="w-10 h-10 rounded-xl bg-[#f3f1ed] text-[#0e0e0e] flex items-center justify-center shrink-0">
                                                                <span className="text-[10px] font-black">TIFF</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold text-[#0e0e0e] truncate">{item.file.name}</p>
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-[#888]">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                            </div>
                                                            <button
                                                                onClick={(e) => { e.preventDefault(); removeFile(item.id); }}
                                                                className="p-2 text-[#888] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </Reorder.Item>
                                                    ))}
                                                </AnimatePresence>
                                            </Reorder.Group>
                                        )}
                                    </div>
                                </>
                            ) : resultUrl && resultBlob ? (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col">
                                    <ConversionResultPanel
                                        filename="zygsoft_tiff_merged.pdf"
                                        fileSize={resultBlob.size}
                                        conversionType="TIFF → PDF"
                                        conversionTimeMs={conversionTimeMs ?? undefined}
                                        pageCount={pageCount ?? undefined}
                                        pageCountLabel={pageCount === 1 ? t("resultPanel.pageCountOne") : t("resultPanel.pageCount")}
                                        preview={<PdfPreview url={resultUrl} />}
                                        downloadOptions={
                                            <a
                                                href={resultUrl}
                                                download="zygsoft_tiff_merged.pdf"
                                                className="bg-[#0e0e0e] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2"
                                            >
                                                <Download size={16} /> {tTiff("downloadButton")}
                                            </a>
                                        }
                                        onReset={() => {
                                            if (resultUrl) window.URL.revokeObjectURL(resultUrl);
                                            setFiles([]);
                                            setResultUrl(null);
                                            setResultBlob(null);
                                            setConversionTimeMs(null);
                                            setPageCount(null);
                                            setError(null);
                                        }}
                                        successTitle={tTiff("successTitle")}
                                        successDesc={tTiff("successDesc")}
                                        newButtonLabel={tTiff("newButton")}
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
