"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    FileText,
    File as FileIcon,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ArrowLeft,
    Download,
    X,
    Files,
    ShieldAlert,
    Zap
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface QueuedFile {
    id: string;
    file: File;
    status: "idle" | "converting" | "success" | "error";
    error?: string;
    progress: number;
}

export default function DocToUdfTool() {
    const { data: session } = useSession();
    const [files, setFiles] = useState<QueuedFile[]>([]);
    const [format, setFormat] = useState<"udf" | "docx" | "pdf">("udf");
    const [isAntet, setIsAntet] = useState(false);
    const [customTemplate, setCustomTemplate] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const customTemplateRef = useRef<HTMLInputElement>(null);

    const hasSubscription = session?.user &&
        (((session.user as any).activeProductSlugs?.includes("udf-toolkit")) || (session.user as any).role === "admin");

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            handleFilesSelect(Array.from(e.dataTransfer.files));
        }
    };

    const handleFilesSelect = (selectedFiles: File[]) => {
        const newFiles: QueuedFile[] = [];

        selectedFiles.forEach(f => {
            const ext = f.name.split('.').pop()?.toLowerCase();
            let isValid = false;
            let error = "";

            if (format === "udf" && ext === "docx") isValid = true;
            else if (format === "docx" && ext === "udf") isValid = true;
            else if (format === "pdf" && ext === "udf") isValid = true;
            else {
                error = `Hatalı Format (Beklenen: ${format === "udf" ? "DOCX" : "UDF"})`;
            }

            newFiles.push({
                id: Math.random().toString(36).substr(2, 9),
                file: f,
                status: "idle",
                error: error,
                progress: 0
            });
        });

        setFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleConvertAll = async () => {
        if (!hasSubscription) return;

        setIsProcessing(true);
        const filesToConvert = files.filter(f => f.status === "idle" && !f.error);

        for (const fileItem of filesToConvert) {
            setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: "converting" } : f));

            try {
                const formData = new FormData();
                formData.append("file", fileItem.file);
                formData.append("format", format);
                formData.append("antetli", isAntet.toString());
                if (customTemplate) {
                    formData.append("customTemplate", customTemplate);
                }

                const response = await fetch("/api/tools/udf-convert", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Hata oluştu.");
                }

                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);

                const disposition = response.headers.get("Content-Disposition");

                // Fallback name logic: BELGE_ISMI.FORMAT
                let filename = fileItem.file.name.replace(/\.[^/.]+$/, "") + `.${format}`;

                if (disposition) {
                    const filenameMatch = disposition.match(/filename="?([^";]+)"?/);
                    if (filenameMatch && filenameMatch[1]) {
                        filename = filenameMatch[1];
                    }
                }

                const link = document.createElement("a");
                link.href = downloadUrl;
                link.setAttribute("download", filename);
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(downloadUrl);
                }, 100);

                setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: "success" } : f));
            } catch (err: any) {
                setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: "error", error: err.message } : f));
            }
        }
        setIsProcessing(false);
    };

    return (
        <div className="relative">
            <div className="max-w-5xl relative z-10">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-10 text-xs font-bold uppercase tracking-wider">
                        <ArrowLeft size={14} /> Geri Dön
                    </Link>
                </motion.div>

                <div className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">UDF Dönüştürme Merkezi</h1>
                            <p className="text-slate-500 font-medium text-lg max-w-xl">
                                Profesyonel hukuk büroları için güvenli ve hızlı belge dönüşüm sistemi.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4">
                            {format === "udf" && (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-4">Antet Ekle</span>
                                        <button
                                            onClick={() => {
                                                setIsAntet(!isAntet);
                                                if (!isAntet) setCustomTemplate(null);
                                            }}
                                            className={`w-10 h-5 rounded-full transition-colors relative ${isAntet ? "bg-[#e6c800]" : "bg-gray-200"}`}
                                        >
                                            <motion.div
                                                animate={{ x: isAntet ? 22 : 2 }}
                                                className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                                            />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Özel Şablon (.udf)</span>
                                            {customTemplate && (
                                                <span className="text-[10px] text-emerald-600 font-bold max-w-[120px] truncate">{customTemplate.name}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {customTemplate && (
                                                <button
                                                    onClick={() => setCustomTemplate(null)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => customTemplateRef.current?.click()}
                                                className={`p-1.5 rounded-lg transition-all ${customTemplate ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400 hover:text-slate-900"}`}
                                            >
                                                <Upload size={14} />
                                            </button>
                                            <input
                                                type="file"
                                                ref={customTemplateRef}
                                                className="hidden"
                                                accept=".udf"
                                                onChange={(e) => {
                                                    const f = e.target.files?.[0];
                                                    if (f) {
                                                        setCustomTemplate(f);
                                                        setIsAntet(false);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-1.5 p-1 bg-white border border-gray-100 rounded-xl shadow-sm">
                                {[
                                    { id: "udf", label: "→ UDF" },
                                    { id: "docx", label: "→ DOCX" },
                                    { id: "pdf", label: "→ PDF" }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setFormat(tab.id as any); setFiles([]); }}
                                        className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${format === tab.id ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600 hover:bg-gray-50"}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {!hasSubscription && session?.user ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-12 border border-blue-50 text-center shadow-xl shadow-blue-900/5 relative overflow-hidden"
                    >
                        <div className="w-20 h-20 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8">
                            <ShieldAlert size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Erişim Kısıtlı</h2>
                        <p className="text-slate-500 font-medium text-lg mb-10 max-w-md mx-auto">
                            Bu aracı kullanabilmek için aktif bir <strong>Hukuk Paketi</strong> aboneliğinizin olması gerekmektedir.
                        </p>
                        <Link href="/dashboard/billing?product=udf-toolkit" className="bg-[#e6c800] text-[#1e293b] px-10 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-[#c9ad00] transition-all shadow-lg shadow-[#e6c800]/20 inline-flex items-center gap-3">
                            Aboneliği Başlat <Zap size={18} fill="currentColor" />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`bg-white rounded-3xl border-2 border-dashed p-10 text-center cursor-pointer transition-all h-full flex flex-col justify-center items-center shadow-sm ${isDragging ? "border-[#e6c800] bg-[#e6c800]/5" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                                    }`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    multiple
                                    onChange={(e) => e.target.files && handleFilesSelect(Array.from(e.target.files))}
                                    accept={format === "udf" ? ".docx" : ".udf"}
                                />
                                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-[#e6c800] mb-6 shadow-xl shadow-slate-200">
                                    <Upload size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Belgeleri Yükle</h3>
                                <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                                    Dosyaları buraya sürükleyin <br /> veya tıklayarak seçin
                                </p>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-3xl border border-gray-100 p-8 h-full flex flex-col shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Files size={18} className="text-[#e6c800]" />
                                        İşlem Kuyruğu ({files.length})
                                    </h3>
                                    {files.length > 0 && (
                                        <button
                                            onClick={handleConvertAll}
                                            disabled={isProcessing || files.every(f => f.status === "success" || f.error)}
                                            className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2"
                                        >
                                            {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                                            Dönüştürmeyi Başlat
                                        </button>
                                    )}
                                </div>

                                <div className="flex-1 space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {files.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <FileIcon size={32} className="opacity-20" />
                                            </div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">Seçili dosya yok</p>
                                        </div>
                                    ) : (
                                        <AnimatePresence>
                                            {files.map((f) => (
                                                <motion.div
                                                    key={f.id}
                                                    layout
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 flex items-center justify-between group"
                                                >
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${f.status === "success" ? "bg-emerald-50 text-emerald-600" :
                                                            f.status === "error" ? "bg-red-50 text-red-600" :
                                                                "bg-white border border-gray-100 text-slate-400"
                                                            }`}>
                                                            {f.status === "converting" ? <Loader2 size={18} className="animate-spin" /> :
                                                                f.status === "success" ? <CheckCircle2 size={18} /> :
                                                                    f.status === "error" ? <AlertCircle size={18} /> :
                                                                        <FileIcon size={18} />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[13px] font-bold text-slate-900 truncate">{f.file.name}</p>
                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                                {f.status === "error" ? (f.error?.includes("Dönüşüm hatası:") ? "Dönüşüm Başarısız" : f.error) : f.status === "success" ? "Tamamlandı" : f.status === "converting" ? "Dönüştürülüyor" : "Beklemede"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        disabled={isProcessing}
                                                        onClick={() => removeFile(f.id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    )}
                                </div>

                                <div className="mt-auto pt-6 border-t border-gray-100 text-center">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300">
                                        Güvenli Veri • Anlık Dönüşüm • Gizlilik Odaklı
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
