"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Wrench, ArrowRight } from "lucide-react";

/**
 * Hint strip for tool pages: "Browse other tools" link.
 * No recommendation engine — static hint only.
 */
export function ToolPageHint() {
    const t = useTranslations("Dashboard.overview.tools");

    return (
        <Link
            href="/dashboard/tools"
            className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors group"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 shrink-0 group-hover:text-amber-600 transition-colors">
                    <Wrench size={18} />
                </div>
                <p className="text-sm font-bold text-slate-950">
                    {t("browseOther")}
                </p>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
    );
}
