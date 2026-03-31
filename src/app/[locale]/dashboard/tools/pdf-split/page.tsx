"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    UploadCloud,
    ArrowLeft,
    Loader2,
    Download,
    FileText,
    Scissors
} from "lucide-react";
import { Link } from "@/i18n/navigation";
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
    const user = session?.user as Parameters<typeof hasToolAccess>[0];
    const hasSubscription = Boolean(user) && hasToolAccess(user);

    const [splitMode, setSplitMode] = useState<"range" | "chunks">("range");
    const [file, setFile] = useState<File | null>(null);
    const [pageRange, setPageRange] = useState("");
    const [chunkSize, setChunkSize] = useState("100");
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [resultFilename, setResultFilename] = useState("zygsoft_split.pdf");
    const [resultIsZip, setResultIsZip] = useState(false);
    const [resultFileCount, setResultFileCount] = useState<number | null>(null);
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
        if (splitMode === "range" && !pageRange.trim()) {
            setError(tSplit("errorNoPageRange"));
            return;
        }
        if (splitMode === "chunks" && (!chunkSize.trim() || Number.parseInt(chunkSize, 10) < 1)) {
            setError(tSplit("errorNoChunkSize"));
            return;
        }

        setLoading(true);
        setError(null);
        const start = Date.now();

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("splitMode", splitMode);
            if (splitMode === "range") {
                formData.append("pageRange", pageRange.trim());
            } else {
                formData.append("chunkSize", chunkSize.trim());
            }

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
            const contentDisposition = res.headers.get("content-disposition") || "";
            const filenameMatch = contentDisposition.match(/filename="([^"]+)"/i);
            const filename = filenameMatch?.[1] || (splitMode === "chunks" ? "zygsoft_split.zip" : "zygsoft_split.pdf");
            const isZip = (res.headers.get("content-type") || "").includes("zip") || filename.toLowerCase().endsWith(".zip");
            const fileCountHeader = Number.parseInt(res.headers.get("x-zygsoft-file-count") || "", 10);
            const pageCountHeader = Number.parseInt(res.headers.get("x-zygsoft-page-count") || "", 10);
            const downloadUrl = window.URL.createObjectURL(blob);
            setResultUrl(downloadUrl);
            setResultBlob(blob);
            setResultFilename(filename);
            setResultIsZip(isZip);
            setResultFileCount(Number.isFinite(fileCountHeader) ? fileCountHeader : null);
            setConversionTimeMs(Date.now() - start);
            if (isZip) {
                setPageCount(Number.isFinite(pageCountHeader) ? pageCountHeader : null);
            } else {
                const count = await getPdfPageCount(blob);
                setPageCount(count);
            }
        } catch (err: unknown) {
            console.error(err);
            setError(err instanceof Error ? err.message : tSplit("errorGeneric"));
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
        setResultFilename("zygsoft_split.pdf");
        setResultIsZip(false);
        setResultFileCount(null);
        setConversionTimeMs(null);
        setPageCount(null);
    };

    if (!hasSubscription && session?.user) {
        return (
            <div className="relative">
                <div className="max-w-5xl relative z-10">
                    <Link href="/document-tools" className="mb-8 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#343131]/48 transition-colors hover:text-[#343131]">
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
                <Link href="/document-tools" className="mb-8 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#343131]/48 transition-colors hover:text-[#343131]">
                    <ArrowLeft size={16} /> {t("backToHub")}
                </Link>

                <div className="mb-10 border-b border-[#343131]/8 pb-8">
                    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h1 className="mb-3 text-3xl md:text-4xl font-display font-black tracking-tight text-[#343131]">{tSplit("title")}</h1>
                            <p className="max-w-2xl text-[16px] leading-8 text-[#343131]/60">
                                {tSplit("description")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Usage tips */}
                <div className="mb-4 space-y-2">
                    <div className="flex items-start gap-3 rounded-[1.15rem] border border-[#343131]/8 bg-white/72 px-4 py-3 text-sm text-[#343131]/62">
                        <span className="text-amber-500 font-black">•</span>
                        {tSplit("tip1")}
                    </div>
                    <div className="flex items-start gap-3 rounded-[1.15rem] border border-[#343131]/8 bg-white/72 px-4 py-3 text-sm text-[#343131]/62">
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
                            className={`glass rounded-[1.8rem] border-2 border-dashed p-10 text-center cursor-pointer transition-all h-full flex flex-col justify-center items-center relative ${isDragging ? "border-amber-400 bg-amber-50/50 scale-[0.99]" : "border-[#343131]/10 hover:border-[#343131]/16 hover:bg-white"
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
                        <div className="glass rounded-[1.8rem] p-8 h-full flex flex-col">
                            {!resultUrl ? (
                                <>
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-[#0e0e0e] mb-2">
                                            {tSplit("modeLabel")}
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => { setSplitMode("range"); setError(null); }}
                                                className={`rounded-xl border px-4 py-3 text-sm font-black transition-colors ${splitMode === "range"
                                                    ? "border-[#e6c800] bg-[#e6c800]/10 text-[#0e0e0e]"
                                                    : "border-black/10 bg-white text-[#666] hover:bg-slate-50"
                                                    }`}
                                            >
                                                {tSplit("modeRange")}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setSplitMode("chunks"); setError(null); }}
                                                className={`rounded-xl border px-4 py-3 text-sm font-black transition-colors ${splitMode === "chunks"
                                                    ? "border-[#e6c800] bg-[#e6c800]/10 text-[#0e0e0e]"
                                                    : "border-black/10 bg-white text-[#666] hover:bg-slate-50"
                                                    }`}
                                            >
                                                {tSplit("modeChunks")}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        {splitMode === "range" ? (
                                            <>
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
                                            </>
                                        ) : (
                                            <>
                                                <label className="block text-sm font-bold text-[#0e0e0e] mb-2">
                                                    {tSplit("chunkSizeLabel")}
                                                </label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    step={1}
                                                    value={chunkSize}
                                                    onChange={(e) => { setChunkSize(e.target.value); setError(null); }}
                                                    placeholder={tSplit("chunkSizePlaceholder")}
                                                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-[#0e0e0e] text-sm focus:ring-2 focus:ring-[#e6c800] focus:border-transparent focus:outline-none"
                                                />
                                                <p className="mt-2 text-xs text-[#888] font-medium">
                                                    {tSplit("chunkSizeHelp")}
                                                </p>
                                            </>
                                        )}
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
                                            disabled={loading || !file || (splitMode === "range" ? !pageRange.trim() : !chunkSize.trim())}
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
                                        filename={resultFilename}
                                        fileSize={resultBlob.size}
                                        conversionType={resultIsZip ? "PDF Split ZIP" : "PDF Split"}
                                        conversionTimeMs={conversionTimeMs ?? undefined}
                                        fileCount={resultFileCount ?? undefined}
                                        pageCount={pageCount ?? undefined}
                                        fileCountLabel={resultFileCount === 1 ? t("resultPanel.fileCountOne") : t("resultPanel.fileCount")}
                                        pageCountLabel={pageCount === 1 ? t("resultPanel.pageCountOne") : t("resultPanel.pageCount")}
                                        preview={resultIsZip ? undefined : <PdfPreview url={resultUrl} />}
                                        downloadOptions={
                                            <a
                                                href={resultUrl}
                                                download={resultFilename}
                                                className="bg-[#0e0e0e] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2"
                                            >
                                                <Download size={16} /> {tSplit("downloadButton")}
                                            </a>
                                        }
                                        onReset={reset}
                                        successTitle={tSplit("successTitle")}
                                        successDesc={splitMode === "chunks" ? tSplit("successDescChunks") : tSplit("successDesc")}
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
