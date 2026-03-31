"use client";

import { Link } from "@/i18n/navigation";
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
            href="/document-tools"
            className="group flex items-center justify-between gap-4 rounded-[1.5rem] border border-[#343131]/8 bg-white/88 p-4 shadow-[0_14px_34px_rgba(17,24,39,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#343131]/14 hover:shadow-[0_18px_44px_rgba(17,24,39,0.07)]"
        >
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f8f7f2] text-[#343131]/54 transition-colors group-hover:text-[#8c7600]">
                    <Wrench size={18} />
                </div>
                <p className="text-sm font-bold text-[#343131]">
                    {t("browseOther")}
                </p>
            </div>
            <ArrowRight size={14} className="shrink-0 text-[#343131]/35 transition-all group-hover:translate-x-0.5 group-hover:text-[#8c7600]" />
        </Link>
    );
}
