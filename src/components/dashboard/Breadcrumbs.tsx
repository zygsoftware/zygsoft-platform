"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export function Breadcrumbs() {
    const pathname = usePathname();
    const t = useTranslations("Dashboard.breadcrumb");

    // Remove locale and split
    const paths = pathname.split("/").filter(p => !["", "tr", "en"].includes(p));

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

            {paths.map((path, index) => {
                const href = `/${paths.slice(0, index + 1).join("/")}`;
                const isLast = index === paths.length - 1;
                const label = t(path) || path;

                // Skip the first "dashboard" if we are already at home
                if (path === "dashboard" && index === 0) return null;

                return (
                    <div key={path} className="flex items-center space-x-2 shrink-0">
                        <ChevronRight size={14} className="text-slate-300" />
                        {isLast ? (
                            <motion.span
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="font-bold text-slate-950 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 shadow-sm text-[13px]"
                            >
                                {label}
                            </motion.span>
                        ) : (
                            <Link
                                href={href}
                                className="font-bold text-slate-400 hover:text-slate-900 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50 text-[13px]"
                            >
                                {label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
