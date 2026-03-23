"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useState } from "react";
import { Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LanguageSwitcher({ isScrolled }: { isScrolled?: boolean }) {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: "tr", label: "Türkçe", flag: "🇹🇷" },
        { code: "en", label: "English", flag: "🇬🇧" },
    ];

    const switchLocale = (newLocale: string) => {
        if (newLocale === locale) {
            setIsOpen(false);
            return;
        }
        // Pathname type includes internal patterns (e.g. [slug]); runtime value is always valid for replace().
        router.replace(pathname as never, { locale: newLocale });
        setIsOpen(false);
    };

    const textClass = isScrolled
        ? "text-slate-700"
        : "text-slate-800";

    return (
        <div className="relative" onMouseLeave={() => setIsOpen(false)}>
            <button
                onMouseEnter={() => setIsOpen(true)}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] rounded-full border border-[#343131]/10 px-3 py-2 bg-white/70 backdrop-blur hover:border-[#e6c800]/60 transition-colors ${textClass}`}
            >
                <Globe size={16} />
                <span className="uppercase">{locale}</span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full pt-4 w-40 z-50"
                    >
                        <div className="bg-white/95 rounded-2xl shadow-2xl border border-[#343131]/10 overflow-hidden py-2 backdrop-blur">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => switchLocale(lang.code)}
                                    className={`flex items-center gap-3 w-full px-5 py-3 text-sm transition-colors hover:bg-[#fafafc] ${locale === lang.code
                                        ? "text-[#343131] font-bold bg-[#e6c800]/10"
                                        : "text-[#343131]/65"
                                        }`}
                                >
                                    <span>{lang.flag}</span>
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
