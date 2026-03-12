"use client";

import { useState, useRef, useEffect } from "react";
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
    Zap,
    FileText,
    Download,
    Image as ImageIcon,
    Trash2,
    RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ToolPageHint } from "@/components/dashboard/ToolPageHint";
import { ToolLockedGate } from "@/components/dashboard/ToolLockedGate";
import { hasToolAccess } from "@/lib/trial-access-client";

interface QueuedFile {
    id: string;
    file: File;
    status: "idle" | "converting" | "success" | "error";
    error?: string;
    progress: number;
    resultUrl?: string;
    resultFilename?: string;
    resultSize?: number;
    conversionTimeMs?: number;
}

const ACCEPTED_FORMAT = ".docx";
const SUPPORTED_LABEL = "DOCX → UDF";
const LETTERHEAD_ACCEPT = ".udf,.xml";

function parseFilenameFromDisposition(disposition: string | null, fallback: string): string {
    if (!disposition) return fallback;
    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match) {
        try {
            return decodeURIComponent(utf8Match[1].trim());
        } catch {
            return fallback;
        }
    }
    const asciiMatch = disposition.match(/filename="?([^";]+)"?/);
    return asciiMatch?.[1]?.trim() || fallback;
}

export default function DocToUdfTool() {
    const t = useTranslations("Dashboard.overview.tools");
    const tUdf = useTranslations("Dashboard.overview.tools.docToUdf");
    const { data: session } = useSession();
    const [files, setFiles] = useState<QueuedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [useLetterhead, setUseLetterhead] = useState(false);
    const [hasLetterhead, setHasLetterhead] = useState(false);
    const [letterheadLoading, setLetterheadLoading] = useState(true);
    const [letterheadUploading, setLetterheadUploading] = useState(false);
    const [letterheadDeleting, setLetterheadDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const letterheadInputRef = useRef<HTMLInputElement>(null);

    const hasSubscription = session?.user && hasToolAccess(session.user as any);

    useEffect(() => {
        if (!hasSubscription) return;
        fetch("/api/tools/letterhead")
            .then((r) => r.json())
            .then((d) => setHasLetterhead(!!d.hasLetterhead))
            .catch(() => setHasLetterhead(false))
            .finally(() => setLetterheadLoading(false));
    }, [hasSubscription]);

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

    const handleLetterheadUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !hasSubscription) return;
        e.target.value = "";
        setLetterheadUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/tools/letterhead", { method: "POST", body: fd });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Yükleme başarısız");
            }
            setHasLetterhead(true);
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Yükleme başarısız");
        } finally {
            setLetterheadUploading(false);
        }
    };

    const handleLetterheadDelete = async () => {
        if (!hasLetterhead) return;
        setLetterheadDeleting(true);
        try {
            const res = await fetch("/api/tools/letterhead", { method: "DELETE" });
            if (!res.ok) throw new Error("Silme başarısız");
            setHasLetterhead(false);
            setUseLetterhead(false);
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Silme başarısız");
        } finally {
            setLetterheadDeleting(false);
        }
    };

    const handleConvertAll = async () => {
        if (!hasSubscription) return;

        setIsProcessing(true);
        const filesToConvert = files.filter(f => f.status === "idle" && !f.error);

        for (const fileItem of filesToConvert) {
            setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: "converting" } : f));
            const start = Date.now();

            try {
                const formData = new FormData();
                formData.append("file", fileItem.file);
                formData.append("format", "udf");
                formData.append("useLetterhead", useLetterhead ? "true" : "false");

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
                const fallbackFilename = fileItem.file.name.replace(/\.[^/.]+$/, "") + ".udf";
                const filename = parseFilenameFromDisposition(disposition, fallbackFilename);

                setFiles(prev => prev.map(f => f.id === fileItem.id ? {
                    ...f,
                    status: "success",
                    resultUrl: downloadUrl,
                    resultFilename: filename,
                    resultSize: blob.size,
                    conversionTimeMs: Date.now() - start
                } : f));
            } catch (err: any) {
                setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: "error", error: err.message } : f));
            }
        }
        setIsProcessing(false);
    };

    return (
        <div className="relative">
            <div className="max-w-5xl relative z-10">
                <Link href="/dashboard/tools" className="inline-flex items-center gap-2 text-[#0a0c10]/50 hover:text-[#0a0c10] transition-colors mb-10 text-xs font-bold uppercase tracking-wider">
                    <ArrowLeft size={14} /> {t("backToHub")}
                </Link>

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
                    <ToolLockedGate session={session} />
                ) : null}
                {hasSubscription && session?.user ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Usage tips */}
                        <div className="lg:col-span-3 mb-4">
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
                                    <span className="text-[#e6c800] font-black">•</span>
                                    {tUdf("tip1")}
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
                                    <span className="text-[#e6c800] font-black">•</span>
                                    {tUdf("tip2")}
                                </div>
                            </div>
                        </div>

                        {/* Letterhead panel */}
                        <div className="lg:col-span-3 mb-4">
                            <div className="bg-white rounded-[2rem] border border-[#0a0c10]/[0.06] p-6 shadow-sm">
                                <h3 className="text-base font-black text-[#0a0c10] flex items-center gap-2 mb-4">
                                    <ImageIcon size={18} className="text-[#e6c800]" />
                                    Antetli Kağıt (Letterhead)
                                </h3>
                                {letterheadLoading ? (
                                    <div className="flex items-center gap-2 text-[#0a0c10]/50 text-sm">
                                        <Loader2 size={16} className="animate-spin" />
                                        Yükleniyor…
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            {hasLetterhead ? (
                                                <>
                                                    <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 text-sm font-bold">
                                                        Kayıtlı antet mevcut
                                                    </span>
                                                    <button
                                                        onClick={() => letterheadInputRef.current?.click()}
                                                        disabled={letterheadUploading}
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0a0c10] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#0a0c10]/90 disabled:opacity-50 transition-all"
                                                    >
                                                        {letterheadUploading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                                        Değiştir
                                                    </button>
                                                    <button
                                                        onClick={handleLetterheadDelete}
                                                        disabled={letterheadDeleting}
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-600 text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 disabled:opacity-50 transition-all"
                                                    >
                                                        {letterheadDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                        Sil
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-sm text-[#0a0c10]/60">Antet yüklemeden dönüştürme yapılır.</span>
                                                    <button
                                                        onClick={() => letterheadInputRef.current?.click()}
                                                        disabled={letterheadUploading}
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e6c800] text-[#0a0c10] text-xs font-bold uppercase tracking-wider hover:bg-[#c9ad00] disabled:opacity-50 transition-all"
                                                    >
                                                        {letterheadUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                                        Antet Yükle
                                                    </button>
                                                </>
                                            )}
                                            <input
                                                ref={letterheadInputRef}
                                                type="file"
                                                className="hidden"
                                                accept={LETTERHEAD_ACCEPT}
                                                onChange={handleLetterheadUpload}
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 pt-2 border-t border-[#0a0c10]/[0.06]">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={useLetterhead}
                                                    onChange={(e) => setUseLetterhead(e.target.checked)}
                                                    disabled={!hasLetterhead}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-[#0a0c10]/[0.12] peer-focus:ring-2 peer-focus:ring-[#e6c800]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e6c800] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed" />
                                                <span className="ml-3 text-sm font-bold text-[#0a0c10]">Antet kullan</span>
                                            </label>
                                            <span className="text-xs text-[#0a0c10]/50">
                                                {!hasLetterhead
                                                    ? "Antet yüklemeden bu seçenek kullanılamaz."
                                                    : useLetterhead
                                                        ? "Bu dönüşümde kayıtlı antet uygulanacak."
                                                        : "Bu dönüşümde antet uygulanmayacak."}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`bg-white rounded-[2rem] border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300 h-full flex flex-col justify-center items-center shadow-sm hover:shadow-lg hover:shadow-[#0a0c10]/[0.06] ${isDragging
                                    ? "border-amber-400 bg-amber-50/50 scale-[1.01]"
                                    : "border-[#0a0c10]/[0.12] hover:border-[#0a0c10]/[0.2] hover:bg-[#fafafc]"
                                    }`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    multiple
                                    onChange={(e) => {
                                        const chosen = e.target.files;
                                        if (chosen?.length) {
                                            handleFilesSelect(Array.from(chosen));
                                            e.target.value = "";
                                        }
                                    }}
                                    accept={ACCEPTED_FORMAT}
                                />
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${isDragging ? "bg-[#e6c800]/20 text-[#e6c800]" : "bg-[#0a0c10] text-[#e6c800]"}`}>
                                    <Upload size={28} />
                                </div>
                                <h3 className="text-lg font-black text-[#0a0c10] mb-2">Belgeleri Yükle</h3>
                                <p className="text-[#0a0c10]/50 text-sm font-medium leading-relaxed mb-4">
                                    {tUdf("uploadHint")}
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#0a0c10]/40">
                                    {tUdf("uploadFormat")}
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
                                            disabled={isProcessing || !files.some(f => f.status === "idle" && !f.error)}
                                            className="px-6 py-3 bg-[#e6c800] text-[#0a0c10] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#c9ad00] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
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
                                                                {f.status === "error" ? (f.error?.includes("Dönüşüm hatası:") ? "Dönüşüm Başarısız" : f.error) : f.status === "success" ? (
                                                                    [f.resultSize != null && `${(f.resultSize / 1024).toFixed(1)} KB`, f.conversionTimeMs != null && `${(f.conversionTimeMs / 1000).toFixed(1)} sn`].filter(Boolean).join(" • ") || "Tamamlandı"
                                                                ) : f.status === "converting" ? "Dönüştürülüyor" : "Beklemede"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {f.status === "success" && f.resultUrl && f.resultFilename && (
                                                            <a
                                                                href={f.resultUrl}
                                                                download={f.resultFilename}
                                                                className="p-2 text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-all flex items-center gap-1 text-xs font-bold"
                                                            >
                                                                <Download size={14} /> İndir
                                                            </a>
                                                        )}
                                                        <button
                                                            disabled={isProcessing}
                                                            onClick={() => {
                                                                if (f.resultUrl) window.URL.revokeObjectURL(f.resultUrl);
                                                                removeFile(f.id);
                                                            }}
                                                            className="p-2 text-[#0a0c10]/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
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
                ) : null}

                {/* Browse other tools hint — always visible */}
                <div className="mt-10">
                    <ToolPageHint />
                </div>
            </div>
        </div>
    );
}
