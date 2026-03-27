"use client";

import { Link } from "@/i18n/navigation";
import { Zap, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface TrialConversionBannerProps {
    trialStatus: string;
    hasSubscription: boolean;
}

export function TrialConversionBanner({ trialStatus, hasSubscription }: TrialConversionBannerProps) {
    const t = useTranslations("Dashboard.shared.trialBanner");
    if (trialStatus !== "active" || hasSubscription) return null;

    return (
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-[#343131] to-[#111318] border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#e6c800]/20 flex items-center justify-center shrink-0">
                    <Zap size={24} className="text-[#e6c800]" />
                </div>
                <div>
                    <h4 className="font-heading font-black text-white text-sm mb-0.5">
                        {t("title")}
                    </h4>
                    <p className="text-slate-400 text-sm font-medium">
                        {t("desc")}
                    </p>
                </div>
            </div>
            <Link
                href="/dijital-urunler/hukuk-araclari-paketi"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e6c800] text-[#343131] font-black rounded-xl text-sm hover:bg-white transition-all shrink-0"
            >
                {t("cta")}
                <ArrowRight size={16} />
            </Link>
        </div>
    );
}
