"use client";

import { useState } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import {
    UploadCloud,
    FileImage,
    ArrowLeft,
    Loader2,
    Download,
    Trash2,
    CheckCircle2,
    Image as ImageIcon,
    Plus,
    FileText,
    Zap,
    ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ToolPageHint } from "@/components/dashboard/ToolPageHint";
import { ConversionResultPanel } from "@/components/dashboard/ConversionResultPanel";
import { PdfPreview } from "@/components/dashboard/PdfPreview";
import { getPdfPageCount } from "@/lib/pdf-utils";

export default function ImageToPdfTool() {
    const t = useTranslations("Dashboard.overview.tools");
    const tImg = useTranslations("Dashboard.overview.tools.imageToPdf");
    const { data: session } = useSession();
    const hasSubscription = session?.user &&
        (((session.user as any).activeProductSlugs?.includes("legal-toolkit")) || (session.user as any).role === "admin");
    const [files, setFiles] = useState<{ id: string; file: File; previewUrl: string }[]>([]);
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
        const validFiles = newFiles.filter(f => f.type.startsWith("image/") || f.name.toLowerCase().endsWith(".tiff") || f.name.toLowerCase().endsWith(".tif"));

        const fileObjects = validFiles.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            previewUrl: URL.createObjectURL(file)
        }));

        setFiles(prev => [...prev, ...fileObjects]);
    };

    const removeFile = (idToRemove: string) => {
        const fileToRemove = files.find(f => f.id === idToRemove);
        if (fileToRemove) {
            URL.revokeObjectURL(fileToRemove.previewUrl);
        }
        setFiles(files.filter(f => f.id !== idToRemove));
    };

    const handleProcess = async () => {
        if (files.length === 0) return;
        setLoading(true);
        const start = Date.now();

        try {
            const formData = new FormData();
            files.forEach((f) => {
                formData.append("files", f.file);
            });

            const res = await fetch("/api/tools/image-to-pdf", {
                method: "POST",
                body: formData
            }).catch(() => {
                throw new Error("Dönüştürme servisi şu an devre dışı. Lütfen destek ile iletişime geçin.");
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "PDF oluşturma başarısız oldu.");
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

    const reset = () => {
        files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
        if (resultUrl) window.URL.revokeObjectURL(resultUrl);
        setFiles([]);
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
                            <h1 className="text-4xl font-display font-black text-[#0e0e0e] mb-3">Resim → PDF Kitapçığı</h1>
                            <p className="text-[#666] font-medium text-lg max-w-2xl">
                                TIFF, JPG ve PNG dosyalarınızı saniyeler içinde profesyonel bir PDF dosyasına çevirin.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Usage tip */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
                        <span className="text-amber-500 font-black">•</span>
                        {tImg("tip1")}
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
                                accept="image/*,.tiff,.tif"
                                multiple
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="w-16 h-16 bg-[#0e0e0e] rounded-2xl flex items-center justify-center text-[#e6c800] mb-6 shadow-xl">
                                <UploadCloud size={28} />
                            </div>
                            <h3 className="text-xl font-display font-bold text-[#0e0e0e] mb-2">Resim Ekleyin</h3>
                            <p className="text-[#888] text-sm font-medium leading-relaxed">
                                {tImg("uploadHint")}
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="glass rounded-3xl border border-slate-200 p-8 h-full flex flex-col">
                            {!resultUrl ? (
                                <>
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-display font-bold text-[#0e0e0e] flex items-center gap-3">
                                            <ImageIcon size={20} className="text-[#e6c800]" />
                                            Seçilen Resimler ({files.length})
                                        </h3>
                                        {files.length > 0 && (
                                            <button
                                                onClick={handleProcess}
                                                disabled={loading}
                                                className="bg-[#0e0e0e] text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all flex items-center gap-2"
                                            >
                                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="white" />}
                                                PDF Oluştur
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                                        {files.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-20 text-[#888]">
                                                <ImageIcon size={48} className="opacity-10 mb-4" />
                                                <p className="text-sm font-bold uppercase tracking-widest opacity-40">Henüz dosya seçilmedi</p>
                                            </div>
                                        ) : (
                                            <Reorder.Group axis="y" values={files} onReorder={setFiles} className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <AnimatePresence>
                                                    {files.map((item, index) => (
                                                        <Reorder.Item key={item.id} value={item} className="relative group cursor-grab active:cursor-grabbing bg-white border border-slate-200 rounded-2xl overflow-hidden aspect-[3/4] flex flex-col shadow-sm">
                                                            <div className="absolute top-2 left-2 w-6 h-6 bg-[#0e0e0e] rounded-lg flex items-center justify-center text-[10px] font-black text-[#e6c800] z-10">
                                                                {index + 1}
                                                            </div>
                                                            <button
                                                                onClick={(e) => { e.preventDefault(); removeFile(item.id); }}
                                                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-xl text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 shadow-lg hover:bg-red-600"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                            <div className="flex-1 relative">
                                                                <img src={item.previewUrl} alt={item.file.name} className="absolute inset-0 w-full h-full object-cover" />
                                                            </div>
                                                            <div className="bg-white p-2 text-[10px] font-bold text-[#0e0e0e] truncate border-t border-slate-100">
                                                                {item.file.name}
                                                            </div>
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
                                        filename="zygsoft_pdf_kitapcigi.pdf"
                                        fileSize={resultBlob.size}
                                        conversionType="Image → PDF"
                                        conversionTimeMs={conversionTimeMs ?? undefined}
                                        pageCount={pageCount ?? undefined}
                                        pageCountLabel={pageCount === 1 ? t("resultPanel.pageCountOne") : t("resultPanel.pageCount")}
                                        preview={<PdfPreview url={resultUrl} />}
                                        downloadOptions={
                                            <a
                                                href={resultUrl}
                                                download="zygsoft_pdf_kitapcigi.pdf"
                                                className="bg-[#0e0e0e] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2"
                                            >
                                                <Download size={16} /> {tImg("downloadButton")}
                                            </a>
                                        }
                                        onReset={reset}
                                        successTitle={tImg("successTitle")}
                                        successDesc={tImg("successDesc")}
                                        newButtonLabel={tImg("newButton")}
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
