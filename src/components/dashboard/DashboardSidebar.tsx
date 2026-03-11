"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Box,
    Briefcase,
    LifeBuoy,
    Settings,
    CreditCard,
    ChevronRight,
    LogOut,
    ArrowLeft,
    Wrench,
} from "lucide-react";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

export function DashboardSidebar() {
    const pathname = usePathname();
    const t = useTranslations("Dashboard.sidebar");

    const menuItems = [
        { name: t("overview"),  href: "/dashboard",          icon: LayoutDashboard },
        { name: t("products"),  href: "/dashboard/products",  icon: Box },
        { name: t("tools"),     href: "/dashboard/tools",     icon: Wrench },
        { name: t("services"),  href: "/dashboard/services",  icon: Briefcase },
        { name: t("support"),   href: "/dashboard/support",   icon: LifeBuoy },
        { name: t("billing"),   href: "/dashboard/billing",   icon: CreditCard },
    ];

    return (
        <aside className="w-72 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col h-screen sticky top-0">
            <div className="p-8">
                <Link href="/" className="flex items-center gap-0 group">
                    <span className="font-display text-2xl font-black tracking-[-0.03em] text-slate-950">
                        ZYG<span className="text-[#e6c800]">SOFT</span>
                    </span>
                </Link>
            </div>

            <div className="px-4 mb-4">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-950 rounded-xl transition-all group font-bold text-[13px] border border-dashed border-slate-200"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span>{t("backToSite")}</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive =
                        item.href === "/dashboard"
                            ? pathname.endsWith("/dashboard")
                            : pathname.includes(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? "bg-[var(--surface-dark)] text-white shadow-sm"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} className={isActive ? "text-[#e6c800]" : "group-hover:text-slate-950"} />
                                <span className="text-[14px] font-bold tracking-tight">{item.name}</span>
                            </div>
                            {isActive && (
                                <motion.div layoutId="sidebar-arrow">
                                    <ChevronRight size={16} className="text-[#e6c800]" />
                                </motion.div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-[var(--border)] space-y-1">
                <Link
                    href="/dashboard/account"
                    className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-950 rounded-xl transition-all group"
                >
                    <Settings size={20} />
                    <span className="text-[14px] font-bold tracking-tight">{t("account")}</span>
                </Link>
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group"
                >
                    <LogOut size={20} />
                    <span className="text-[14px] font-bold tracking-tight">{t("logout")}</span>
                </button>
            </div>
        </aside>
    );
}
