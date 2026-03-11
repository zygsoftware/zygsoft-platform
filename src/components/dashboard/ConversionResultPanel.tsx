"use client";

import { CheckCircle2 } from "lucide-react";
import { ReactNode } from "react";
import { formatFileSize, formatDuration } from "@/lib/format-utils";

export interface ConversionResultPanelProps {
    filename: string;
    fileSize: number;
    conversionType: string;
    conversionTimeMs?: number;
    fileCount?: number;
    pageCount?: number;
    fileCountLabel?: string;
    pageCountLabel?: string;
    preview?: ReactNode;
    downloadOptions: ReactNode;
    onReset: () => void;
    successTitle: string;
    successDesc: string;
    newButtonLabel: string;
}

export function ConversionResultPanel({
    filename,
    fileSize,
    conversionType,
    conversionTimeMs,
    fileCount,
    pageCount,
    fileCountLabel,
    pageCountLabel,
    preview,
    downloadOptions,
    onReset,
    successTitle,
    successDesc,
    newButtonLabel,
}: ConversionResultPanelProps) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                    <CheckCircle2 size={24} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-display font-black text-[#0e0e0e] mb-1">{successTitle}</h3>
                    <p className="text-sm text-[#888] font-medium mb-3">{successDesc}</p>
                    <div className="flex flex-wrap gap-3 text-xs font-bold text-[#666]">
                        <span className="truncate max-w-[200px]" title={filename}>
                            {filename}
                        </span>
                        <span>{formatFileSize(fileSize)}</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded-lg">{conversionType}</span>
                        {conversionTimeMs != null && (
                            <span>{formatDuration(conversionTimeMs)}</span>
                        )}
                        {fileCount != null && fileCount > 0 && (
                            <span>{fileCount} {fileCountLabel ?? (fileCount === 1 ? "file" : "files")}</span>
                        )}
                        {pageCount != null && pageCount > 0 && (
                            <span>{pageCount} {pageCountLabel ?? (pageCount === 1 ? "page" : "pages")}</span>
                        )}
                    </div>
                </div>
            </div>

            {preview && (
                <div className="flex-1 min-h-[200px] mb-6 rounded-2xl border border-black/5 overflow-hidden bg-slate-50">
                    {preview}
                </div>
            )}

            <div className="flex flex-wrap gap-3 items-center">
                {downloadOptions}
                <button
                    onClick={onReset}
                    className="bg-white border border-black/10 text-[#0e0e0e] px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#f3f1ed] transition-all"
                >
                    {newButtonLabel}
                </button>
            </div>
        </div>
    );
}
