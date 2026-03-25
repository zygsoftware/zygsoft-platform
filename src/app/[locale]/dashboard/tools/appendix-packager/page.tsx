"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    ArrowDown,
    ArrowUp,
    Download,
    FileArchive,
    GripVertical,
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

type QueuedAppendix = {
    id: string;
    file: File;
    label: string;
};

type SessionUser = {
    activeProductSlugs?: string[];
    role?: string;
    emailVerified?: boolean | null;
};

export default function AppendixPackagerPage() {
    const t = useTranslations("Dashboard.overview.tools");
    const tAppendix = useTranslations("Dashboard.overview.tools.appendixPackager");
    const { data: session } = useSession();
    const user = (session?.user ?? null) as SessionUser | null;
    const hasSubscription = user ? hasToolAccess(user) : false;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [items, setItems] = useState<QueuedAppendix[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [maxZipSizeMb, setMaxZipSizeMb] = useState("5");

    const handleFiles = (files: File[]) => {
        const nextItems = files.map((file) => ({
            id: Math.random().toString(36).slice(2, 10),
            file,
            label: file.name.replace(/\.[^/.]+$/, ""),
        }));
        setItems((prev) => [...prev, ...nextItems]);
        setError(null);
    };

    const moveItem = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= items.length) return;

        setItems((prev) => {
            const next = [...prev];
            const [moved] = next.splice(index, 1);
            next.splice(target, 0, moved);
            return next;
        });
    };

    const updateLabel = (id: string, label: string) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, label } : item)));
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const handlePackage = async () => {
        if (items.length === 0) {
            setError(tAppendix("errorNoFiles"));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            items.forEach((item) => formData.append("files", item.file));
            formData.append("labels", JSON.stringify(items.map((item) => item.label)));
            formData.append("maxZipSizeMb", maxZipSizeMb);

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

                <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-4xl font-display font-black text-[#0e0e0e] mb-3">{tAppendix("title")}</h1>
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
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#e6c800] px-4 py-3 text-sm font-black text-[#0e0e0e] hover:bg-[#d4b800] transition-colors"
                            >
                                <Plus size={16} />
                                {tAppendix("addFiles")}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files ?? []);
                                    if (files.length > 0) handleFiles(files);
                                    e.currentTarget.value = "";
                                }}
                                className="hidden"
                            />
                        </div>

                        {items.length === 0 ? (
                            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-8 py-16 text-center">
                                <FileArchive size={34} className="mx-auto mb-4 text-slate-400" />
                                <p className="text-base font-bold text-slate-700">{tAppendix("emptyTitle")}</p>
                                <p className="mt-2 text-sm font-medium text-slate-500">{tAppendix("emptyDescription")}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4"
                                    >
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                                            <div className="flex items-center gap-3 lg:min-w-[180px]">
                                                <div className="rounded-xl bg-white p-2 text-slate-400 shadow-sm">
                                                    <GripVertical size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-950">{`Ek-${index + 1}`}</p>
                                                    <p className="text-xs font-medium text-slate-500">{item.file.name}</p>
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">
                                                    {tAppendix("labelField")}
                                                </label>
                                                <input
                                                    value={item.label}
                                                    onChange={(e) => updateLabel(item.id, e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-[#e6c800]"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => moveItem(index, -1)}
                                                    disabled={index === 0}
                                                    className="rounded-xl border border-slate-200 bg-white p-3 text-slate-500 transition-colors hover:text-slate-950 disabled:opacity-40"
                                                >
                                                    <ArrowUp size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveItem(index, 1)}
                                                    disabled={index === items.length - 1}
                                                    className="rounded-xl border border-slate-200 bg-white p-3 text-slate-500 transition-colors hover:text-slate-950 disabled:opacity-40"
                                                >
                                                    <ArrowDown size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(item.id)}
                                                    className="rounded-xl border border-rose-200 bg-white p-3 text-rose-500 transition-colors hover:bg-rose-50"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-black text-slate-950">{tAppendix("summaryTitle")}</h3>
                            <div className="mt-5 space-y-3">
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                    <span className="text-sm font-medium text-slate-500">{tAppendix("summaryFiles")}</span>
                                    <span className="text-sm font-black text-slate-950">{items.length}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                    <span className="text-sm font-medium text-slate-500">{tAppendix("summaryPattern")}</span>
                                    <span className="text-sm font-black text-slate-950">Ek-1, Ek-2, Ek-3…</span>
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
                                disabled={loading || items.length === 0}
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
