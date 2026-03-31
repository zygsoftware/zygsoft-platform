"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    Download,
    FileArchive,
    FolderPlus,
    Loader2,
    Package2,
    Plus,
    Trash2,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ToolLockedGate } from "@/components/dashboard/ToolLockedGate";
import { ToolPageHint } from "@/components/dashboard/ToolPageHint";
import { hasToolAccess } from "@/lib/trial-access-client";

type AppendixFile = {
    id: string;
    file: File;
};

type AppendixGroup = {
    id: string;
    label: string;
    files: AppendixFile[];
};

type SessionUser = {
    activeProductSlugs?: string[];
    role?: string;
    emailVerified?: boolean | null;
};

function createAppendixGroup(index: number): AppendixGroup {
    return {
        id: Math.random().toString(36).slice(2, 10),
        label: `Ek ${index + 1}`,
        files: [],
    };
}

export default function AppendixPackagerPage() {
    const t = useTranslations("Dashboard.overview.tools");
    const tAppendix = useTranslations("Dashboard.overview.tools.appendixPackager");
    const { data: session } = useSession();
    const user = (session?.user ?? null) as SessionUser | null;
    const hasSubscription = user ? hasToolAccess(user) : false;
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const [appendices, setAppendices] = useState<AppendixGroup[]>([createAppendixGroup(0)]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [maxZipSizeMb, setMaxZipSizeMb] = useState("5");

    const addAppendix = () => {
        setAppendices((prev) => [...prev, createAppendixGroup(prev.length)]);
        setError(null);
    };

    const updateAppendixLabel = (appendixId: string, label: string) => {
        setAppendices((prev) => prev.map((appendix) => (
            appendix.id === appendixId ? { ...appendix, label } : appendix
        )));
    };

    const addFilesToAppendix = (appendixId: string, files: File[]) => {
        const nextFiles = files.map((file) => ({
            id: Math.random().toString(36).slice(2, 10),
            file,
        }));

        setAppendices((prev) => prev.map((appendix) => (
            appendix.id === appendixId
                ? { ...appendix, files: [...appendix.files, ...nextFiles] }
                : appendix
        )));
        setError(null);
    };

    const removeAppendix = (appendixId: string) => {
        setAppendices((prev) => {
            if (prev.length === 1) {
                return [{ ...prev[0], label: prev[0].label, files: [] }];
            }
            return prev.filter((appendix) => appendix.id !== appendixId);
        });
    };

    const removeFileFromAppendix = (appendixId: string, fileId: string) => {
        setAppendices((prev) => prev.map((appendix) => (
            appendix.id === appendixId
                ? { ...appendix, files: appendix.files.filter((file) => file.id !== fileId) }
                : appendix
        )));
    };

    const moveAppendix = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= appendices.length) return;

        setAppendices((prev) => {
            const next = [...prev];
            const [moved] = next.splice(index, 1);
            next.splice(target, 0, moved);
            return next;
        });
    };

    const handlePackage = async () => {
        const nonEmptyAppendices = appendices.filter((appendix) => appendix.files.length > 0);
        if (nonEmptyAppendices.length === 0) {
            setError(tAppendix("errorNoFiles"));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("maxZipSizeMb", maxZipSizeMb);
            formData.append(
                "appendices",
                JSON.stringify(
                    nonEmptyAppendices.map((appendix) => ({
                        id: appendix.id,
                        label: appendix.label,
                        fileIds: appendix.files.map((file) => file.id),
                    }))
                )
            );

            for (const appendix of nonEmptyAppendices) {
                for (const file of appendix.files) {
                    formData.append(`file:${file.id}`, file.file);
                }
            }

            const response = await fetch("/api/tools/appendix-packager", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || tAppendix("errorGeneric"));
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            if (resultUrl) window.URL.revokeObjectURL(resultUrl);
            setResultUrl(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : tAppendix("errorGeneric"));
        } finally {
            setLoading(false);
        }
    };

    const totalFileCount = appendices.reduce((sum, appendix) => sum + appendix.files.length, 0);

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

                <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="mb-3 text-3xl md:text-4xl font-display font-black tracking-tight text-[#343131]">{tAppendix("title")}</h1>
                        <p className="text-[#666] font-medium text-lg max-w-3xl">{tAppendix("description")}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-[#0e0e0e] px-5 py-3 text-sm font-black text-[#e6c800]">
                        <Package2 size={18} />
                        {tAppendix("badge")}
                    </div>
                </div>

                <div className="mb-5 flex flex-col gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-600">
                        {tAppendix("tip1")}
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-600">
                        {tAppendix("tip2")}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-black text-slate-950">{tAppendix("queueTitle")}</h2>
                                <p className="mt-1 text-sm font-medium text-slate-500">{tAppendix("queueSubtitle")}</p>
                            </div>
                            <button
                                type="button"
                                onClick={addAppendix}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#e6c800] px-4 py-3 text-sm font-black text-[#0e0e0e] hover:bg-[#d4b800] transition-colors"
                            >
                                <FolderPlus size={16} />
                                {tAppendix("addAppendix")}
                            </button>
                        </div>

                        <div className="space-y-5">
                            {appendices.map((appendix, index) => (
                                <motion.div
                                    key={appendix.id}
                                    layout
                                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
                                >
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                                            <div className="min-w-[140px]">
                                                <p className="text-sm font-black text-slate-950">{`Ek-${index + 1}`}</p>
                                                <p className="text-xs font-medium text-slate-500">{tAppendix("appendixLabel")}</p>
                                            </div>

                                            <div className="flex-1">
                                                <input
                                                    value={appendix.label}
                                                    onChange={(e) => updateAppendixLabel(appendix.id, e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-[#e6c800]"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => moveAppendix(index, -1)}
                                                    disabled={index === 0}
                                                    className="rounded-xl border border-slate-200 bg-white p-3 text-slate-500 transition-colors hover:text-slate-950 disabled:opacity-40"
                                                >
                                                    <ArrowUp size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveAppendix(index, 1)}
                                                    disabled={index === appendices.length - 1}
                                                    className="rounded-xl border border-slate-200 bg-white p-3 text-slate-500 transition-colors hover:text-slate-950 disabled:opacity-40"
                                                >
                                                    <ArrowDown size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAppendix(appendix.id)}
                                                    className="rounded-xl border border-rose-200 bg-white p-3 text-rose-500 transition-colors hover:bg-rose-50"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{tAppendix("filesInAppendix")}</p>
                                                    <p className="text-xs font-medium text-slate-500">{tAppendix("filesInAppendixHint")}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRefs.current[appendix.id]?.click()}
                                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800 transition-colors"
                                                >
                                                    <Plus size={16} />
                                                    {tAppendix("addFiles")}
                                                </button>
                                                <input
                                                    ref={(node) => {
                                                        fileInputRefs.current[appendix.id] = node;
                                                    }}
                                                    type="file"
                                                    multiple
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files ?? []);
                                                        if (files.length > 0) addFilesToAppendix(appendix.id, files);
                                                        e.currentTarget.value = "";
                                                    }}
                                                    className="hidden"
                                                />
                                            </div>

                                            {appendix.files.length === 0 ? (
                                                <div className="mt-4 rounded-xl bg-slate-50 px-4 py-6 text-center">
                                                    <FileArchive size={26} className="mx-auto mb-3 text-slate-400" />
                                                    <p className="text-sm font-semibold text-slate-500">{tAppendix("emptyAppendix")}</p>
                                                </div>
                                            ) : (
                                                <div className="mt-4 space-y-2">
                                                    {appendix.files.map((file) => (
                                                        <div
                                                            key={file.id}
                                                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                                                        >
                                                            <p className="min-w-0 truncate text-sm font-medium text-slate-700">{file.file.name}</p>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFileFromAppendix(appendix.id, file.id)}
                                                                className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 transition-colors"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-black text-slate-950">{tAppendix("summaryTitle")}</h3>
                            <div className="mt-5 space-y-3">
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                    <span className="text-sm font-medium text-slate-500">{tAppendix("summaryAppendices")}</span>
                                    <span className="text-sm font-black text-slate-950">{appendices.filter((item) => item.files.length > 0).length}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                    <span className="text-sm font-medium text-slate-500">{tAppendix("summaryFiles")}</span>
                                    <span className="text-sm font-black text-slate-950">{totalFileCount}</span>
                                </div>
                                <div className="rounded-xl bg-slate-50 px-4 py-3">
                                    <label className="mb-2 block text-sm font-medium text-slate-500">
                                        {tAppendix("zipLimitLabel")}
                                    </label>
                                    <select
                                        value={maxZipSizeMb}
                                        onChange={(e) => setMaxZipSizeMb(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-950 outline-none transition-colors focus:border-[#e6c800]"
                                    >
                                        <option value="2">2 MB</option>
                                        <option value="5">5 MB</option>
                                        <option value="10">10 MB</option>
                                        <option value="20">20 MB</option>
                                    </select>
                                    <p className="mt-2 text-xs font-medium text-slate-500">
                                        {tAppendix("zipLimitHint")}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handlePackage}
                                disabled={loading || totalFileCount === 0}
                                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0e0e0e] px-5 py-4 text-sm font-black text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Package2 size={18} />}
                                {loading ? tAppendix("packaging") : tAppendix("packageButton")}
                            </button>

                            {resultUrl ? (
                                <a
                                    href={resultUrl}
                                    download="zygsoft_ek_klasoru.zip"
                                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e6c800] px-5 py-4 text-sm font-black text-[#0e0e0e] transition-colors hover:bg-[#d4b800]"
                                >
                                    <Download size={18} />
                                    {tAppendix("downloadButton")}
                                </a>
                            ) : null}

                            {error ? (
                                <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                                    {error}
                                </p>
                            ) : null}
                        </div>

                        <ToolPageHint />
                    </div>
                </div>
            </div>
        </div>
    );
}
