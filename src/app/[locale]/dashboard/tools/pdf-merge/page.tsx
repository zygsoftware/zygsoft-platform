"use client";

import { useState } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import {
    UploadCloud,
    Layers,
    ArrowLeft,
    Loader2,
    Download,
    Trash2,
    GripVertical,
    CheckCircle2,
    Zap,
    Files,
    FileText
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

export default function PdfMergeTool() {
    const t = useTranslations("Dashboard.overview.tools");
    const tPdf = useTranslations("Dashboard.overview.tools.pdfMerge");
    const { data: session } = useSession();
    const hasSubscription = session?.user && hasToolAccess(session.user as any);
    const [files, setFiles] = useState<{ id: string; file: File }[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
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
        e.stopPropagation();
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
        const validFiles = newFiles.filter(f => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));

        const fileObjects = validFiles.map(file => ({
            id: Math.random().toString(36).substring(7),
            file
        }));

        setFiles(prev => [...prev, ...fileObjects]);
    };

    const removeFile = (idToRemove: string) => {
        setFiles(files.filter(f => f.id !== idToRemove));
    };

    const handleProcess = async () => {
        if (files.length < 2) return;
        setLoading(true);
        const start = Date.now();

        try {
            const formData = new FormData();
            files.forEach((f) => {
                formData.append("files", f.file);
            });

            const res = await fetch("/api/tools/pdf-merge", {
                method: "POST",
                body: formData
            }).catch(() => {
                throw new Error("Dönüştürme servisi şu an devre dışı. Lütfen destek ile iletişime geçin.");
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Birleştirme başarısız oldu.");
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
            alert(err.message || "Bir hata oluştu.");
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
                            <h1 className="text-4xl font-display font-black text-[#0e0e0e] mb-3">PDF Birleştirici</h1>
                            <p className="text-[#666] font-medium text-lg max-w-2xl">
                                Birden fazla PDF belgesini tek bir dosyada birleştirin ve sıralamayı dilediğiniz gibi özelleştirin.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Usage tip */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
                        <span className="text-amber-500 font-black">•</span>
                        {tPdf("tip1")}
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
                                multiple
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="w-16 h-16 bg-[#0e0e0e] rounded-2xl flex items-center justify-center text-[#e6c800] mb-6 shadow-xl">
                                <UploadCloud size={28} />
                            </div>
                            <h3 className="text-xl font-display font-bold text-[#0e0e0e] mb-2">PDF Ekleyin</h3>
                            <p className="text-[#888] text-sm font-medium leading-relaxed">
                                {tPdf("uploadHint")}
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
                                            Dosya Listesi ({files.length})
                                        </h3>
                                        {files.length > 1 && (
                                            <button
                                                onClick={handleProcess}
                                                disabled={loading}
                                                className="bg-[#0e0e0e] text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all flex items-center gap-2"
                                            >
                                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="white" />}
                                                Dosyaları Birleştir
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                                        {files.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-20 text-[#888]">
                                                <FileText size={48} className="opacity-10 mb-4" />
                                                <p className="text-sm font-bold uppercase tracking-widest opacity-40">Kuyruk Boş</p>
                                            </div>
                                        ) : (
                                            <Reorder.Group axis="y" values={files} onReorder={setFiles} className="space-y-3">
                                                <AnimatePresence>
                                                    {files.map((item) => (
                                                        <Reorder.Item key={item.id} value={item} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl cursor-grab active:cursor-grabbing hover:border-slate-300 transition-colors shadow-sm">
                                                            <GripVertical size={18} className="text-[#ccc]" />
                                                            <div className="w-10 h-10 rounded-xl bg-[#f3f1ed] text-[#0e0e0e] flex items-center justify-center shrink-0">
                                                                <span className="text-[10px] font-black">PDF</span>
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
                                        filename="zygsoft_merged.pdf"
                                        fileSize={resultBlob.size}
                                        conversionType="PDF Merge"
                                        conversionTimeMs={conversionTimeMs ?? undefined}
                                        pageCount={pageCount ?? undefined}
                                        pageCountLabel={pageCount === 1 ? t("resultPanel.pageCountOne") : t("resultPanel.pageCount")}
                                        preview={<PdfPreview url={resultUrl} />}
                                        downloadOptions={
                                            <a
                                                href={resultUrl}
                                                download="zygsoft_merged.pdf"
                                                className="bg-[#0e0e0e] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2"
                                            >
                                                <Download size={16} /> {tPdf("downloadButton")}
                                            </a>
                                        }
                                        onReset={() => {
                                            if (resultUrl) window.URL.revokeObjectURL(resultUrl);
                                            setFiles([]);
                                            setResultUrl(null);
                                            setResultBlob(null);
                                            setConversionTimeMs(null);
                                            setPageCount(null);
                                        }}
                                        successTitle={tPdf("successTitle")}
                                        successDesc={tPdf("successDesc")}
                                        newButtonLabel={tPdf("newButton")}
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
