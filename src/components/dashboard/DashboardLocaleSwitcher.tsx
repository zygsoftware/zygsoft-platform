"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";

export function DashboardLocaleSwitcher() {
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations("Dashboard.sidebar");

    return (
        <div className="px-4 mb-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                <Globe size={16} className="text-slate-400 shrink-0" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                    {t("language")}
                </span>
                <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 ml-auto">
                    <button
                        type="button"
                        onClick={() => router.replace(pathname as never, { locale: "tr" })}
                        className={`px-2.5 py-1 text-[11px] font-black rounded-md transition-colors ${
                            locale === "tr"
                                ? "bg-[#0e0e0e] text-[#e6c800]"
                                : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                        TR
                    </button>
                    <button
                        type="button"
                        onClick={() => router.replace(pathname as never, { locale: "en" })}
                        className={`px-2.5 py-1 text-[11px] font-black rounded-md transition-colors ${
                            locale === "en"
                                ? "bg-[#0e0e0e] text-[#e6c800]"
                                : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                        EN
                    </button>
                </div>
            </div>
        </div>
    );
}
