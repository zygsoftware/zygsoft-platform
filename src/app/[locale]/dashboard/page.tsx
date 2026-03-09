"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
    Box,
    Briefcase,
    LifeBuoy,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    AlertCircle
} from "lucide-react";
import Link from "next/link";

import { useTranslations } from "next-intl";

export default function DashboardPage() {
    const { data: session } = useSession();
    const t = useTranslations("Dashboard.overview");
    const user = session?.user as any;
    const activeProductSlugs = user?.activeProductSlugs || [];

    const stats = [
        { name: t("stats.activeProducts"), value: activeProductSlugs.length, icon: Box, color: "text-blue-600", bg: "bg-blue-50" },
        { name: t("stats.activeServices"), value: "0", icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50" },
        { name: t("stats.supportTickets"), value: "0", icon: LifeBuoy, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    return (
        <div className="space-y-10">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-display font-black text-slate-950 mb-2">
                    {t("welcome")}, {user?.name || user?.email?.split('@')[0]} 👋
                </h1>
                <p className="text-slate-500 font-medium font-sans italic opacity-80">
                    {t("subtitle")}
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md hover:border-slate-200 transition-all cursor-default"
                    >
                        <div>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{stat.name}</p>
                            <h3 className="text-3xl font-display font-black text-slate-950">{stat.value}</h3>
                        </div>
                        <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <stat.icon size={28} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Applications */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                        <h2 className="text-xl font-display font-black text-slate-950 flex items-center gap-2">
                            <Box size={20} className="text-[#e6c800]" />
                            {t("sections.apps")}
                        </h2>
                        <Link href="/dashboard/products" className="text-slate-500 hover:text-slate-950 text-sm font-bold flex items-center gap-1 transition-colors group">
                            {t("sections.viewAll")} <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                    </div>
                    <div className="p-8 flex-1 flex flex-col justify-center">
                        {activeProductSlugs.includes("udf-toolkit") ? (
                            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[#e6c800]/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-slate-950 text-[#e6c800] rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
                                        <CheckCircle2 size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-950">Hukuk UDF Dönüştürücü</h4>
                                        <p className="text-[11px] text-slate-500 font-black uppercase tracking-wider">Sınırsız Lisans Aktif</p>
                                    </div>
                                </div>
                                <Link href="/dashboard/tools/doc-to-udf" className="bg-white text-slate-950 px-6 py-2.5 rounded-xl text-xs font-black border border-slate-200 hover:bg-slate-950 hover:text-[#e6c800] hover:border-slate-950 transition-all shadow-sm">
                                    {t("sections.start")}
                                </Link>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-slate-400 text-sm font-medium mb-4">{t("sections.noApps")}</p>
                                <Link href="/abonelikler" className="inline-flex items-center gap-2 bg-[#e6c800] text-slate-950 px-8 py-3 rounded-2xl text-sm font-black hover:bg-[#c9ad00] transition-all shadow-xl shadow-[#e6c800]/20 font-display">
                                    {t("sections.browseStore")}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Support Tickets */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                        <h2 className="text-xl font-display font-black text-slate-950 flex items-center gap-2">
                            <LifeBuoy size={20} className="text-[#e6c800]" />
                            {t("sections.support")}
                        </h2>
                        <Link href="/dashboard/support" className="text-slate-500 hover:text-slate-950 text-sm font-bold flex items-center gap-1 transition-colors group">
                            {t("sections.viewAll")} <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                    </div>
                    <div className="p-8 flex-1 flex flex-col justify-center">
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
                                <Clock className="text-slate-200" size={36} />
                            </div>
                            <p className="text-slate-400 text-sm font-medium mb-4">{t("sections.noTickets")}</p>
                            <Link href="/dashboard/support" className="text-slate-950 text-sm font-black border-b-2 border-[#e6c800] hover:text-[#e6c800] transition-colors pb-1">
                                {t("sections.newTicket")}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Billing Alert / CTA */}
            <div className="bg-slate-950 rounded-[3rem] p-8 md:p-14 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-96 h-96 bg-[#e6c800] opacity-5 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:opacity-10 transition-opacity duration-1000" />
                <div className="absolute left-0 bottom-0 w-64 h-64 bg-[#e6c800] opacity-[0.02] rounded-full blur-[80px] -ml-20 -mb-20" />

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="text-center lg:text-left max-w-2xl">
                        <h3 className="text-3xl font-display font-black text-white mb-4 tracking-tight leading-tight">
                            {t("cta.title")}
                        </h3>
                        <p className="text-slate-400 font-medium font-sans text-lg">
                            {t("cta.desc")}
                        </p>
                    </div>
                    <Link href="/abonelikler" className="bg-[#e6c800] text-slate-950 px-12 py-5 rounded-2xl text-[15px] font-black hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#e6c800]/20 font-display shrink-0 tracking-wider">
                        {t("cta.button")}
                    </Link>
                </div>
            </div>
        </div>
    );
}
