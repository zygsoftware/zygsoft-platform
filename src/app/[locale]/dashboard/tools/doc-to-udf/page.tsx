"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    File as FileIcon,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ArrowLeft,
    X,
    Files,
    ShieldAlert,
    Zap,
    FileText
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

const ACCEPTED_FORMAT = ".docx";
const SUPPORTED_LABEL = "DOCX → UDF";

export default function DocToUdfTool() {
    const { data: session } = useSession();
    const [files, setFiles] = useState<QueuedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        const newFiles: QueuedFile[] = selectedFiles.map(f => {
            const ext = f.name.split(".").pop()?.toLowerCase();
            const isValid = ext === "docx";
            return {
                id: Math.random().toString(36).substr(2, 9),
                file: f,
                status: "idle" as const,
                error: isValid ? "" : "Sadece .docx dosyaları desteklenir",
                progress: 0
            };
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
                formData.append("format", "udf");

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

                let filename = fileItem.file.name.replace(/\.[^/.]+$/, "") + ".udf";

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
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#0a0c10]/50 hover:text-[#0a0c10] transition-colors mb-10 text-xs font-bold uppercase tracking-wider">
                        <ArrowLeft size={14} /> Geri Dön
                    </Link>
                </motion.div>

                <div className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-display font-black text-[#0a0c10] mb-3 tracking-tight">UDF Dönüştürme Merkezi</h1>
                            <p className="text-[#0a0c10]/60 font-medium text-lg max-w-xl leading-relaxed">
                                DOCX dosyalarınızı UYAP uyumlu UDF formatına saniyeler içinde dönüştürün. Belgeleriniz işlendikten sonra otomatik olarak silinir.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="px-4 py-2.5 bg-[#0a0c10] text-[#e6c800] rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <FileText size={14} /> {SUPPORTED_LABEL}
                            </div>
                            <p className="text-[11px] text-[#0a0c10]/50 font-medium">Maks. 60 sn işlem süresi</p>
                        </div>
                    </div>
                </div>

                {!hasSubscription && session?.user ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] p-12 md:p-16 border-2 border-[#e6c800]/20 text-center shadow-xl shadow-[#e6c800]/5 relative overflow-hidden"
                    >
                        <div className="w-24 h-24 mx-auto bg-[#e6c800]/10 rounded-2xl flex items-center justify-center text-[#e6c800] mb-8 border border-[#e6c800]/20">
                            <ShieldAlert size={48} />
                        </div>
                        <h2 className="text-3xl font-display font-black text-[#0a0c10] mb-4">Erişim Kısıtlı</h2>
                        <p className="text-[#0a0c10]/60 font-medium text-lg mb-10 max-w-md mx-auto leading-relaxed">
                            Bu aracı kullanabilmek için aktif bir <strong>Hukuk UDF Dönüştürücü</strong> aboneliğinizin olması gerekmektedir.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link href="/abonelikler" className="bg-[#e6c800] text-[#0a0c10] px-10 py-4 rounded-2xl font-black uppercase tracking-wider hover:bg-[#c9ad00] transition-all shadow-xl shadow-[#e6c800]/20 inline-flex items-center gap-3">
                                Abonelikleri Görüntüle <Zap size={18} fill="currentColor" />
                            </Link>
                            <Link href="/dashboard/billing?product=udf-toolkit" className="bg-[#0a0c10] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-wider hover:bg-[#0a0c10]/90 transition-all shadow-xl inline-flex items-center gap-3">
                                Ödeme Bildir
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`bg-white rounded-[2rem] border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300 h-full flex flex-col justify-center items-center shadow-sm hover:shadow-lg hover:shadow-[#0a0c10]/[0.06] ${isDragging
                                    ? "border-[#e6c800] bg-[#e6c800]/[0.06] scale-[1.02]"
                                    : "border-[#0a0c10]/[0.12] hover:border-[#0a0c10]/[0.2] hover:bg-[#fafafc]"
                                    }`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    multiple
                                    onChange={(e) => e.target.files && handleFilesSelect(Array.from(e.target.files))}
                                    accept={ACCEPTED_FORMAT}
                                />
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${isDragging ? "bg-[#e6c800]/20 text-[#e6c800]" : "bg-[#0a0c10] text-[#e6c800]"}`}>
                                    <Upload size={28} />
                                </div>
                                <h3 className="text-lg font-black text-[#0a0c10] mb-2">Belgeleri Yükle</h3>
                                <p className="text-[#0a0c10]/50 text-sm font-medium leading-relaxed mb-4">
                                    Sürükle-bırak veya tıklayın
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#0a0c10]/40">
                                    Sadece .docx • Toplu işlem desteklenir
                                </p>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-[2rem] border border-[#0a0c10]/[0.06] p-8 h-full flex flex-col shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-lg font-black text-[#0a0c10] flex items-center gap-2">
                                        <Files size={18} className="text-[#e6c800]" />
                                        İşlem Kuyruğu ({files.length})
                                    </h3>
                                    {files.length > 0 && (
                                        <button
                                            onClick={handleConvertAll}
                                            disabled={isProcessing || files.every(f => f.status === "success" || f.error)}
                                            className="px-6 py-3 bg-[#e6c800] text-[#0a0c10] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#c9ad00] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-[#e6c800]/20"
                                        >
                                            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                                            Dönüştürmeyi Başlat
                                        </button>
                                    )}
                                </div>

                                <div className="flex-1 space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {files.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-[#0a0c10]/30">
                                            <div className="w-20 h-20 bg-[#fafafc] rounded-2xl flex items-center justify-center mb-4 border border-[#0a0c10]/[0.06]">
                                                <FileIcon size={36} className="opacity-40" />
                                            </div>
                                            <p className="text-[11px] font-bold uppercase tracking-wider">Dosya ekleyin</p>
                                            <p className="text-[10px] text-[#0a0c10]/40 mt-1">DOCX dosyalarınızı sürükleyin veya yukarıdan seçin</p>
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
                                                    className="bg-[#fafafc] border border-[#0a0c10]/[0.06] rounded-xl p-4 flex items-center justify-between group hover:border-[#0a0c10]/[0.1] transition-colors"
                                                >
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${f.status === "success" ? "bg-emerald-500/10 text-emerald-600" :
                                                            f.status === "error" ? "bg-red-500/10 text-red-600" :
                                                                f.status === "converting" ? "bg-[#e6c800]/10 text-[#e6c800]" :
                                                                    "bg-white border border-[#0a0c10]/[0.08] text-[#0a0c10]/50"
                                                            }`}>
                                                            {f.status === "converting" ? <Loader2 size={18} className="animate-spin" /> :
                                                                f.status === "success" ? <CheckCircle2 size={18} /> :
                                                                    f.status === "error" ? <AlertCircle size={18} /> :
                                                                        <FileIcon size={18} />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[13px] font-bold text-[#0a0c10] truncate">{f.file.name}</p>
                                                            <p className={`text-[10px] font-bold uppercase tracking-wider ${f.status === "error" ? "text-red-600" : "text-[#0a0c10]/50"}`}>
                                                                {f.status === "error" ? (f.error?.includes("Dönüşüm hatası:") ? "Dönüşüm Başarısız" : f.error) : f.status === "success" ? "Tamamlandı" : f.status === "converting" ? "Dönüştürülüyor" : "Beklemede"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        disabled={isProcessing}
                                                        onClick={() => removeFile(f.id)}
                                                        className="p-2 text-[#0a0c10]/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    )}
                                </div>

                                <div className="mt-auto pt-6 border-t border-[#0a0c10]/[0.06] text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#0a0c10]/40">
                                        Belgeleriniz işlendikten sonra sunucudan silinir. KVKK uyumlu.
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
