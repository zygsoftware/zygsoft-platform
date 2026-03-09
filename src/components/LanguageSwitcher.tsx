"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
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
        // Replace locale prefix in the pathname
        const currentPath = pathname;
        let newPath = currentPath;
        if (currentPath.startsWith(`/${locale}`)) {
            newPath = currentPath.replace(`/${locale}`, `/${newLocale}`);
        } else if (newLocale !== "tr") {
            newPath = `/${newLocale}${currentPath}`;
        }
        router.push(newPath);
        setIsOpen(false);
    };

    const textClass = isScrolled
        ? "text-slate-600 dark:text-slate-300"
        : "text-slate-100 drop-shadow";

    return (
        <div className="relative" onMouseLeave={() => setIsOpen(false)}>
            <button
                onMouseEnter={() => setIsOpen(true)}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 text-sm font-medium hover:text-emerald-400 transition-colors ${textClass}`}
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
                        <div className="bg-zinc-950 rounded-2xl shadow-2xl shadow-black/60 border border-white/8 overflow-hidden py-2">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => switchLocale(lang.code)}
                                    className={`flex items-center gap-3 w-full px-5 py-3 text-sm transition-colors hover:bg-white/5 ${locale === lang.code
                                        ? "text-emerald-400 font-bold bg-white/5"
                                        : "text-zinc-400"
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
