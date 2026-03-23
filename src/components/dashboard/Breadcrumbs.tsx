"use client";

import { Link } from "@/i18n/navigation";
import { useSelectedLayoutSegments } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export function Breadcrumbs() {
    const segments = useSelectedLayoutSegments();
    const t = useTranslations("Dashboard.breadcrumb");

    const crumbs: { href: string; label: string }[] = [];
    let acc = "/dashboard";
    for (const seg of segments) {
        acc = `${acc}/${seg}`;
        // Segment names match App Router folders (internal path), not localized URL slugs
        crumbs.push({ href: acc, label: (t as (k: string) => string)(seg) });
    }

    return (
        <nav className="flex items-center space-x-2 text-sm mb-6 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
            <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-900 transition-colors group"
            >
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-all border border-slate-100">
                    <Home size={14} className="group-hover:scale-110 transition-transform" />
                </div>
                <span className="font-bold text-[13px]">{t("home")}</span>
            </Link>

            {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;
                return (
                    <div key={crumb.href} className="flex items-center space-x-2 shrink-0">
                        <ChevronRight size={14} className="text-slate-300" />
                        {isLast ? (
                            <motion.span
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="font-bold text-slate-950 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 shadow-sm text-[13px]"
                            >
                                {crumb.label}
                            </motion.span>
                        ) : (
                            <Link
                                href={crumb.href}
                                className="font-bold text-slate-400 hover:text-slate-900 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50 text-[13px]"
                            >
                                {crumb.label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
