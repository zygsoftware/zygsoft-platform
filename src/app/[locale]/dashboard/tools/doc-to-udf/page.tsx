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
import { Link } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { ToolPageHint } from "@/components/dashboard/ToolPageHint";
import { ToolLockedGate } from "@/components/dashboard/ToolLockedGate";
import { hasToolAccess } from "@/lib/trial-access-client";
import { pushDataLayerEvent } from "@/lib/analytics";

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
    const locale = useLocale();
    const isTr = locale === "tr";
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

    const hasSubscription = session?.user && hasToolAccess(session.user as Parameters<typeof hasToolAccess>[0]);
    const copy = {
        invalidDocx: isTr ? "Sadece .docx dosyaları desteklenir" : "Only .docx files are supported",
        uploadFailed: isTr ? "Yükleme başarısız" : "Upload failed",
        deleteFailed: isTr ? "Silme başarısız" : "Delete failed",
        genericError: isTr ? "Hata oluştu." : "An error occurred.",
        title: isTr ? "UDF Dönüştürme Merkezi" : "UDF Conversion Center",
        description: isTr
            ? "DOCX dosyalarınızı UYAP uyumlu UDF formatına saniyeler içinde dönüştürün. Belgeleriniz işlendikten sonra otomatik olarak silinir."
            : "Convert your DOCX files to the UYAP-compatible UDF format in seconds. Your documents are automatically deleted after processing.",
        maxTime: isTr ? "Maks. 60 sn işlem süresi" : "Max. 60 sec processing time",
        letterheadTitle: isTr ? "Antetli Kağıt (Letterhead)" : "Letterhead",
        loading: isTr ? "Yükleniyor..." : "Loading...",
        savedLetterhead: isTr ? "Kayıtlı antet mevcut" : "Saved letterhead available",
        change: isTr ? "Değiştir" : "Change",
        delete: isTr ? "Sil" : "Delete",
        convertWithoutLetterhead: isTr ? "Antet yüklemeden dönüştürme yapılır." : "Conversion will continue without a letterhead.",
        uploadLetterhead: isTr ? "Antet Yükle" : "Upload Letterhead",
        useLetterhead: isTr ? "Antet kullan" : "Use letterhead",
        letterheadDisabled: isTr ? "Antet yüklemeden bu seçenek kullanılamaz." : "This option cannot be used without uploading a letterhead.",
        letterheadWillApply: isTr ? "Bu dönüşümde kayıtlı antet uygulanacak." : "The saved letterhead will be applied to this conversion.",
        letterheadWillNotApply: isTr ? "Bu dönüşümde antet uygulanmayacak." : "No letterhead will be applied to this conversion.",
        uploadDocs: isTr ? "Belgeleri Yükle" : "Upload Documents",
        queue: isTr ? "İşlem Kuyruğu" : "Processing Queue",
        startConversion: isTr ? "Dönüştürmeyi Başlat" : "Start Conversion",
        addFile: isTr ? "Dosya ekleyin" : "Add files",
        dragDocx: isTr ? "DOCX dosyalarınızı sürükleyin veya yukarıdan seçin" : "Drag your DOCX files here or choose them above",
        conversionFailed: isTr ? "Dönüşüm başarısız" : "Conversion failed",
        completed: isTr ? "Tamamlandı" : "Completed",
        converting: isTr ? "Dönüştürülüyor" : "Converting",
        pending: isTr ? "Beklemede" : "Pending",
        download: isTr ? "İndir" : "Download",
        footer: isTr ? "Belgeleriniz işlendikten sonra sunucudan silinir. KVKK uyumlu." : "Your documents are deleted from the server after processing. KVKK compliant.",
    };

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
                error: isValid ? "" : copy.invalidDocx,
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
                throw new Error(err.error || copy.uploadFailed);
            }
            setHasLetterhead(true);
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : copy.uploadFailed);
        } finally {
            setLetterheadUploading(false);
        }
    };

    const handleLetterheadDelete = async () => {
        if (!hasLetterhead) return;
        setLetterheadDeleting(true);
        try {
            const res = await fetch("/api/tools/letterhead", { method: "DELETE" });
            if (!res.ok) throw new Error(copy.deleteFailed);
            setHasLetterhead(false);
            setUseLetterhead(false);
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : copy.deleteFailed);
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
            pushDataLayerEvent("doc_to_udf_start", {
                locale,
                use_letterhead: useLetterhead,
                source: "dashboard-doc-to-udf",
                file_name: fileItem.file.name,
                file_size: fileItem.file.size,
            });

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
                    throw new Error(errorData.error || copy.genericError);
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
                pushDataLayerEvent("doc_to_udf_success", {
                    locale,
                    use_letterhead: useLetterhead,
                    source: "dashboard-doc-to-udf",
                    file_name: fileItem.file.name,
                    output_filename: filename,
                    output_size: blob.size,
                    conversion_time_ms: Date.now() - start,
                });
            } catch (err: unknown) {
                setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: "error", error: err instanceof Error ? err.message : copy.conversionFailed } : f));
            }
        }
        setIsProcessing(false);
    };

    return (
        <div className="relative">
            <div className="max-w-5xl relative z-10">
                <Link href="/document-tools" className="mb-8 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#343131]/48 transition-colors hover:text-[#343131]">
                    <ArrowLeft size={14} /> {t("backToHub")}
                </Link>

                <div className="mb-10 border-b border-[#343131]/8 pb-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h1 className="mb-3 text-3xl font-display font-black tracking-tight text-[#343131] md:text-4xl">{copy.title}</h1>
                            <p className="max-w-xl text-[16px] leading-8 text-[#343131]/60">
                                {copy.description}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#343131]/46">
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#343131]/10 px-3 py-1.5">
                                <FileText size={13} />
                                {SUPPORTED_LABEL}
                            </span>
                            <p>{copy.maxTime}</p>
                        </div>
                    </div>
                </div>

                {!hasSubscription && session?.user ? (
                    <ToolLockedGate session={session} />
                ) : null}
                {hasSubscription && session?.user ? (
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Usage tips */}
                        <div className="mb-2 lg:col-span-3">
                            <div className="grid gap-2 md:grid-cols-2">
                                <div className="flex items-start gap-3 rounded-[1.25rem] border border-[#343131]/8 bg-white/70 px-4 py-3 text-sm text-[#343131]/62">
                                    <span className="mt-1 text-[#e6c800] font-black">•</span>
                                    <span>{tUdf("tip1")}</span>
                                </div>
                                <div className="flex items-start gap-3 rounded-[1.25rem] border border-[#343131]/8 bg-white/70 px-4 py-3 text-sm text-[#343131]/62">
                                    <span className="mt-1 text-[#e6c800] font-black">•</span>
                                    <span>{tUdf("tip2")}</span>
                                </div>
                            </div>
                        </div>

                        {/* Letterhead panel */}
                        <div className="lg:col-span-3 mb-4">
                            <div className="rounded-[1.8rem] border border-white/80 bg-white/90 p-6 shadow-[0_18px_44px_rgba(17,24,39,0.05)]">
                                <h3 className="text-base font-black text-[#343131] flex items-center gap-2 mb-4">
                                    <ImageIcon size={18} className="text-[#e6c800]" />
                                    {copy.letterheadTitle}
                                </h3>
                                {letterheadLoading ? (
                                    <div className="flex items-center gap-2 text-[#343131]/50 text-sm">
                                        <Loader2 size={16} className="animate-spin" />
                                        {copy.loading}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            {hasLetterhead ? (
                                                <>
                                                    <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 text-sm font-bold">
                                                        {copy.savedLetterhead}
                                                    </span>
                                                    <button
                                                        onClick={() => letterheadInputRef.current?.click()}
                                                        disabled={letterheadUploading}
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#343131] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#343131]/90 disabled:opacity-50 transition-all"
                                                    >
                                                        {letterheadUploading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                                        {copy.change}
                                                    </button>
                                                    <button
                                                        onClick={handleLetterheadDelete}
                                                        disabled={letterheadDeleting}
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-600 text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 disabled:opacity-50 transition-all"
                                                    >
                                                        {letterheadDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                        {copy.delete}
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-sm text-[#343131]/60">{copy.convertWithoutLetterhead}</span>
                                                    <button
                                                        onClick={() => letterheadInputRef.current?.click()}
                                                        disabled={letterheadUploading}
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e6c800] text-[#343131] text-xs font-bold uppercase tracking-wider hover:bg-[#c9ad00] disabled:opacity-50 transition-all"
                                                    >
                                                        {letterheadUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                                        {copy.uploadLetterhead}
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
                                        <div className="flex items-center gap-3 pt-2 border-t border-[#343131]/[0.06]">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={useLetterhead}
                                                    onChange={(e) => setUseLetterhead(e.target.checked)}
                                                    disabled={!hasLetterhead}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-[#343131]/[0.12] peer-focus:ring-2 peer-focus:ring-[#e6c800]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e6c800] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed" />
                                                <span className="ml-3 text-sm font-bold text-[#343131]">{copy.useLetterhead}</span>
                                            </label>
                                            <span className="text-xs text-[#343131]/50">
                                                {!hasLetterhead
                                                    ? copy.letterheadDisabled
                                                    : useLetterhead
                                                        ? copy.letterheadWillApply
                                                        : copy.letterheadWillNotApply}
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
                                className={`relative overflow-hidden rounded-[1.9rem] border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300 h-full flex flex-col justify-center items-center shadow-[0_18px_44px_rgba(17,24,39,0.05)] ${isDragging
                                    ? "border-amber-400 bg-amber-50/50 scale-[1.01]"
                                    : "border-[#343131]/[0.10] bg-white/90 hover:border-[#343131]/[0.18] hover:bg-white"
                                    }`}
                            >
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e6c800]/70 to-transparent" />
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
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${isDragging ? "bg-[#e6c800]/20 text-[#e6c800]" : "bg-[#343131] text-[#e6c800]"}`}>
                                    <Upload size={28} />
                                </div>
                                <h3 className="text-lg font-black text-[#343131] mb-2">{copy.uploadDocs}</h3>
                                <p className="text-[#343131]/50 text-sm font-medium leading-relaxed mb-4">
                                    {tUdf("uploadHint")}
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#343131]/40">
                                    {tUdf("uploadFormat")}
                                </p>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="rounded-[1.9rem] border border-white/80 bg-white/92 p-8 h-full flex flex-col shadow-[0_20px_48px_rgba(17,24,39,0.06)]">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-lg font-black text-[#343131] flex items-center gap-2">
                                        <Files size={18} className="text-[#e6c800]" />
                                        {copy.queue} ({files.length})
                                    </h3>
                                    {files.length > 0 && (
                                        <button
                                            onClick={handleConvertAll}
                                            disabled={isProcessing || !files.some(f => f.status === "idle" && !f.error)}
                                            className="px-6 py-3 bg-[#e6c800] text-[#343131] rounded-xl text-xs font-black uppercase tracking-wider hover:-translate-y-0.5 hover:bg-[#c9ad00] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
                                        >
                                            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                                            {copy.startConversion}
                                        </button>
                                    )}
                                </div>

                                <div className="flex-1 space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {files.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-[#343131]/30">
                                            <div className="w-20 h-20 bg-[#fafafc] rounded-2xl flex items-center justify-center mb-4 border border-[#343131]/[0.06]">
                                                <FileIcon size={36} className="opacity-40" />
                                            </div>
                                            <p className="text-[11px] font-bold uppercase tracking-wider">{copy.addFile}</p>
                                            <p className="text-[10px] text-[#343131]/40 mt-1">{copy.dragDocx}</p>
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
                                                    className="bg-[#fafafc] border border-[#343131]/[0.06] rounded-xl p-4 flex items-center justify-between group hover:border-[#343131]/[0.1] transition-colors"
                                                >
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${f.status === "success" ? "bg-emerald-500/10 text-emerald-600" :
                                                            f.status === "error" ? "bg-red-500/10 text-red-600" :
                                                                f.status === "converting" ? "bg-[#e6c800]/10 text-[#e6c800]" :
                                                                    "bg-white border border-[#343131]/[0.08] text-[#343131]/50"
                                                            }`}>
                                                            {f.status === "converting" ? <Loader2 size={18} className="animate-spin" /> :
                                                                f.status === "success" ? <CheckCircle2 size={18} /> :
                                                                    f.status === "error" ? <AlertCircle size={18} /> :
                                                                        <FileIcon size={18} />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[13px] font-bold text-[#343131] truncate">{f.file.name}</p>
                                                            <p className={`text-[10px] font-bold uppercase tracking-wider ${f.status === "error" ? "text-red-600" : "text-[#343131]/50"}`}>
                                                                {f.status === "error" ? (f.error || copy.conversionFailed) : f.status === "success" ? (
                                                                    [f.resultSize != null && `${(f.resultSize / 1024).toFixed(1)} KB`, f.conversionTimeMs != null && `${(f.conversionTimeMs / 1000).toFixed(1)} ${isTr ? "sn" : "sec"}`].filter(Boolean).join(" • ") || copy.completed
                                                                ) : f.status === "converting" ? copy.converting : copy.pending}
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
                                                                <Download size={14} /> {copy.download}
                                                            </a>
                                                        )}
                                                        <button
                                                            disabled={isProcessing}
                                                            onClick={() => {
                                                                if (f.resultUrl) window.URL.revokeObjectURL(f.resultUrl);
                                                                removeFile(f.id);
                                                            }}
                                                            className="p-2 text-[#343131]/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    )}
                                </div>

                                <div className="mt-auto pt-6 border-t border-[#343131]/[0.06] text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#343131]/40">
                                        {copy.footer}
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
