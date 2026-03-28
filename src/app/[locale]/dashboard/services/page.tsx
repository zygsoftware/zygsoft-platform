"use client";

import { useEffect, useState, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
    Package,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    Layers,
    Globe,
    FileText,
    HeadphonesIcon,
    RefreshCw,
    Zap,
    CreditCard,
    LayoutGrid,
    CalendarDays,
    ArrowUpRight
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────── */

type DerivedStatus = "active" | "expired" | "pending_approval" | "payment_rejected" | "inactive";

type ServiceItem = {
    subscriptionId: string;
    productId: string;
    productName: string;
    productDescription: string;
    productSlug: string;
    productCategory: string;
    productPrice: number;
    subscriptionStatus: string;
    derivedStatus: DerivedStatus;
    endsAt: string | null;
    startedAt: string;
    latestPayment: {
        status: string;
        amount: number;
        createdAt: string;
    } | null;
};

/* ── Status config ─────────────────────────────────────────────── */

const STATUS_THEME: Record<DerivedStatus, {
    theme: "emerald" | "orange" | "amber" | "red" | "slate";
    icon: React.ReactNode;
}> = {
    active: {
        theme: "emerald",
        icon: <CheckCircle2 size={12} />,
    },
    expired: {
        theme: "orange",
        icon: <Clock size={12} />,
    },
    pending_approval: {
        theme: "amber",
        icon: <Clock size={12} />,
    },
    payment_rejected: {
        theme: "red",
        icon: <XCircle size={12} />,
    },
    inactive: {
        theme: "slate",
        icon: <AlertCircle size={12} />,
    },
};

const CATEGORY_STYLE: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
    hukuk:    { icon: <FileText size={20} />,  bg: "bg-indigo-50",   text: "text-indigo-600" },
    web:      { icon: <Globe size={20} />,     bg: "bg-blue-50",     text: "text-blue-600"   },
    software: { icon: <Package size={20} />,   bg: "bg-violet-50",   text: "text-violet-600" },
    tasarim:  { icon: <Layers size={20} />,    bg: "bg-pink-50",     text: "text-pink-600"   },
    default:  { icon: <Package size={20} />,   bg: "bg-[#e6c800]/10",text: "text-[#d4b800]"  },
};

const TOOL_URLS: Record<string, string> = {
    "legal-toolkit":  "/dashboard/tools",
};

/* ── Progress helper ───────────────────────────────────────────── */

function getProgress(start: string, end: string | null) {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000); // assume 1 year if undefined
    const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const passedDays = Math.max(0, (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const progress = Math.min(100, Math.max(0, (passedDays / totalDays) * 100));
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return { progress, daysLeft };
}

/* ── Service card (Bento Style) ────────────────────────────────── */

function ServiceCard({ item }: { item: ServiceItem }) {
    const t = useTranslations("Dashboard.servicesPage");
    const locale = useLocale();
    const dateLoc = locale === "en" ? "en-US" : "tr-TR";
    const cfg = STATUS_THEME[item.derivedStatus];
    const catKey = item.productCategory in CATEGORY_STYLE ? item.productCategory : "default";
    const catStyle = CATEGORY_STYLE[catKey] ?? CATEGORY_STYLE.default;
    const categoryLabel = t(`category.${catKey}` as "category.default");
    const toolUrl = TOOL_URLS[item.productSlug];
    const isActive = item.derivedStatus === "active";
    const statusLabel = t(`status.${item.derivedStatus}.label` as "status.active.label");
    
    const { progress, daysLeft } = getProgress(item.startedAt, item.endsAt);
    
    // Theme colors dynamically applied
    const tBgMap = { emerald: "bg-emerald-500", orange: "bg-orange-500", amber: "bg-amber-500", red: "bg-red-500", slate: "bg-slate-500" };
    const tTextMap = { emerald: "text-emerald-700", orange: "text-orange-700", amber: "text-amber-700", red: "text-red-700", slate: "text-slate-700" };
    const tLightBgMap = { emerald: "bg-emerald-50", orange: "bg-orange-50", amber: "bg-amber-50", red: "bg-red-50", slate: "bg-slate-50" };
    const tBorderMap = { emerald: "border-emerald-200", orange: "border-orange-200", amber: "border-amber-200", red: "border-red-200", slate: "border-slate-200" };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`flex flex-col xl:flex-row bg-white rounded-[2rem] border border-[#343131]/10 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_44px_rgba(0,0,0,0.06)] hover:border-[#343131]/20 transition-all duration-300 relative group`}
        >
            {/* Left Content Area */}
            <div className="flex-1 p-8 xl:p-10 relative flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#fafafc] to-white opacity-50 pointer-events-none -z-10" />

                <div>
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg ${tLightBgMap[cfg.theme]} ${tBorderMap[cfg.theme]} border ${tTextMap[cfg.theme]} text-[10px] font-black uppercase tracking-widest`}>
                            {cfg.icon}
                            {statusLabel}
                        </div>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest`}>
                            {categoryLabel}
                        </div>
                    </div>

                    <div className="flex items-start gap-5 mb-8">
                        <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shrink-0 ${catStyle.bg} ${catStyle.text} shadow-inner`}>
                            {catStyle.icon}
                        </div>
                        <div>
                            <h3 className="text-2xl font-display font-black text-[#343131] tracking-tight mb-2 leading-none">
                                {item.productName}
                            </h3>
                            <p className="text-[#343131]/60 text-sm font-medium leading-relaxed">
                                {item.productDescription}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar for Active Subscriptions */}
                {isActive && (
                    <div className="mt-8 border-t border-slate-100 pt-6">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("usagePeriod")}</span>
                            <span className="text-sm font-black text-[#343131]">{t("daysLeft", { count: daysLeft })}</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div 
                                className={`h-full ${tBgMap[cfg.theme]} rounded-full transition-all duration-1000 ease-out`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Right Side Bento Grid Details */}
            <div className="xl:w-[380px] shrink-0 bg-[#fafafc] border-t xl:border-t-0 xl:border-l border-[#343131]/[0.06] p-6 lg:p-8 flex flex-col gap-4">
                
                {/* Price Block */}
                <div className="bg-white border border-[#343131]/[0.06] rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t("priceLabel")}</span>
                        {item.productPrice > 0 ? (
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-display font-black text-[#343131]">₺{item.productPrice.toLocaleString(dateLoc)}</span>
                                <span className="text-[#343131]/40 text-xs font-bold uppercase">/{item.productSlug === "legal-toolkit" ? t("perYear") : t("perMonth")}</span>
                            </div>
                        ) : (
                            <span className="text-lg font-black text-[#343131]">{t("customPricing")}</span>
                        )}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                        <CreditCard size={18} />
                    </div>
                </div>

                {/* Dates Block */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-[#343131]/[0.06] rounded-2xl p-4 shadow-sm">
                        <CalendarDays size={16} className="text-slate-400 mb-2" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t("startDate")}</span>
                        <span className="text-[#343131] text-xs font-bold">{new Date(item.startedAt).toLocaleDateString(dateLoc)}</span>
                    </div>
                    <div className="bg-white border border-[#343131]/[0.06] rounded-2xl p-4 shadow-sm">
                        <Clock size={16} className={`mb-2 ${item.derivedStatus === "expired" ? "text-orange-500" : "text-slate-400"}`} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t("endDate")}</span>
                        <span className={`text-xs font-bold ${item.derivedStatus === "expired" ? "text-orange-600" : "text-[#343131]"}`}>
                            {item.endsAt ? new Date(item.endsAt).toLocaleDateString(dateLoc) : t("unlimited")}
                        </span>
                    </div>
                </div>

                {/* Latest Payment Block */}
                {item.latestPayment && (
                    <div className="bg-white border border-[#343131]/[0.06] rounded-2xl p-4 shadow-sm flex items-center justify-between mt-auto">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t("lastTransaction")}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[#343131] text-xs font-bold">{new Date(item.latestPayment.createdAt).toLocaleDateString(dateLoc)}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-emerald-600 text-xs font-bold">₺{item.latestPayment.amount.toLocaleString(dateLoc)}</span>
                            </div>
                        </div>
                        <ArrowUpRight size={16} className="text-slate-300" />
                    </div>
                )}
                
                {/* Actions */}
                <div className="mt-2 flex flex-col gap-2">
                    {isActive && toolUrl && (
                        <Link
                            href={toolUrl}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#343131] text-[#e6c800] text-xs font-black uppercase tracking-wider hover:bg-[#1a1818] transition-colors shadow-[0_4px_14px_rgba(52,49,49,0.2)]"
                        >
                            <Zap size={14} className="fill-current" />
                            {t("ctaUseTool")}
                        </Link>
                    )}
                    {(item.derivedStatus === "expired" || item.derivedStatus === "payment_rejected" || item.derivedStatus === "inactive") && (
                        <Link
                            href={`/payment?product=${item.productSlug}`}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#e6c800] text-[#343131] text-xs font-black uppercase tracking-wider hover:bg-[#c9ad00] transition-colors shadow-lg shadow-[#e6c800]/20"
                        >
                            <RefreshCw size={14} />
                            {item.derivedStatus === "payment_rejected" ? t("ctaPayAgain") : t("ctaRenew")}
                        </Link>
                    )}
                    <Link
                        href="/dashboard/support"
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 hover:text-[#343131] transition-colors"
                    >
                        <HeadphonesIcon size={14} />
                        {t("ctaSupport")}
                    </Link>
                </div>

            </div>
        </motion.div>
    );
}

/* ── Top Stat Cards ────────────────────────────────────────────── */

function StatCard({ title, value, icon, gradient }: { title: string, value: number, icon: React.ReactNode, gradient: string }) {
    return (
        <div className="bg-white rounded-3xl border border-[#343131]/[0.06] p-6 flex items-center gap-5 shadow-sm">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shrink-0 shadow-inner`}>
                {icon}
            </div>
            <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-3xl font-display font-black text-[#343131]">{value}</p>
            </div>
        </div>
    );
}

/* ── Skeletons & Empty States ──────────────────────────────────── */

function SkeletonCard() {
    return (
        <div className="flex flex-col xl:flex-row bg-white rounded-[2rem] border border-slate-100 overflow-hidden space-y-4 xl:space-y-0 h-auto xl:h-[360px]">
            <div className="flex-1 p-8 xl:p-10 space-y-6">
                <div className="w-24 h-6 bg-slate-100 animate-pulse rounded-lg" />
                <div className="flex gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl animate-pulse" />
                    <div className="space-y-3 flex-1">
                        <div className="h-6 bg-slate-100 rounded-lg animate-pulse w-1/2" />
                        <div className="h-4 bg-slate-50 rounded-lg animate-pulse w-3/4" />
                    </div>
                </div>
                <div className="w-full h-2 bg-slate-50 animate-pulse rounded-full mt-12" />
            </div>
            <div className="xl:w-[380px] bg-slate-50 p-6 lg:p-8 space-y-4">
                <div className="h-20 bg-slate-100 animate-pulse rounded-2xl" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-slate-100 animate-pulse rounded-2xl" />
                    <div className="h-24 bg-slate-100 animate-pulse rounded-2xl" />
                </div>
                <div className="h-12 bg-slate-200 animate-pulse rounded-xl mt-auto" />
            </div>
        </div>
    );
}

function EmptyState() {
    const t = useTranslations("Dashboard.servicesPage");
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white rounded-[2.5rem] border border-[#343131]/[0.06] shadow-[0_24px_80px_rgba(0,0,0,0.02)] p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative"
        >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#e6c800]/10 via-[#343131]/5 to-transparent rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
            
            <div className="flex-1 text-center md:text-left z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#fafafc] rounded-2xl mb-6 border border-[#343131]/10 shadow-sm">
                    <LayoutGrid size={28} className="text-[#343131]" />
                </div>
                <h3 className="text-3xl md:text-4xl font-display font-black text-[#343131] mb-6 tracking-tight leading-tight">
                    {t("heroTitle")} <br className="hidden md:block"/> {t("heroSubtitleLine1")}
                </h3>
                <p className="text-[#343131]/60 text-lg font-medium mb-10 leading-relaxed max-w-lg mx-auto md:mx-0">
                    {t("heroSubtitle")}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                    <Link
                        href="/services"
                        className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-xl bg-[#e6c800] text-[#343131] text-sm font-black uppercase tracking-wider hover:bg-[#c9ad00] transition-colors shadow-[0_8px_20px_rgba(230,200,0,0.2)]"
                    >
                        <Package size={16} />
                        {t("exploreServices")}
                    </Link>
                    <Link
                        href="/payment"
                        className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-xl bg-white text-[#343131] border border-[#343131]/10 text-sm font-black uppercase tracking-wider hover:bg-[#fafafc] transition-all"
                    >
                        <CreditCard size={16} />
                        {t("paymentStatus")}
                    </Link>
                </div>
            </div>

            {/* A dummy visual representing what the bento grid looks like when it's full */}
            <div className="hidden lg:flex w-[350px] shrink-0 flex-col gap-4 opacity-70 saturate-50 pointer-events-none rotate-2 scale-95 z-10">
                <div className="bg-[#fafafc] rounded-3xl p-6 border border-[#343131]/10 shadow-sm">
                    <div className="w-10 h-10 bg-slate-200 rounded-lg mb-4" />
                    <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
                <div className="flex gap-4">
                    <div className="flex-1 bg-[#fafafc] rounded-3xl p-6 border border-[#343131]/10 shadow-sm h-32" />
                    <div className="flex-1 bg-white rounded-3xl border border-[#e6c800]/30 shadow-sm h-32 flex items-center justify-center">
                        <ArrowUpRight size={32} className="text-[#e6c800]/50" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/* ── Main page ─────────────────────────────────────────────────── */

export default function ServicesPage() {
    const t = useTranslations("Dashboard.servicesPage");
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState<string | null>(null);

    const fetchServices = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/dashboard/services");
            if (!res.ok) throw new Error("load_failed");
            const data = await res.json();
            setServices(data.services ?? []);
        } catch {
            setError(t("fetchError"));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => { fetchServices(); }, [fetchServices]);

    const activeCount = services.filter((s) => s.derivedStatus === "active").length;
    const expiredCount = services.filter((s) => s.derivedStatus === "expired").length;

    return (
        <div className="space-y-10 lg:space-y-12">

            {/* ── Header Area ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-[#343131] tracking-tight mb-3">
                        {t("pageTitle")}
                    </h1>
                    <p className="text-[#343131]/60 font-medium text-base md:text-lg max-w-2xl leading-relaxed">
                        {t("pageSubtitle")}
                    </p>
                </div>
                <div className="shrink-0">
                    <button
                        onClick={fetchServices}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#343131] border border-[#343131]/10 text-xs font-black uppercase tracking-widest hover:bg-[#fafafc] hover:shadow-sm transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin text-[#e6c800]" : "text-[#343131]/40"} />
                        {loading ? t("refreshing") : t("refresh")}
                    </button>
                </div>
            </div>

            {/* ── Stat Cards Summary ── */}
            {!loading && !error && services.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                    <StatCard 
                        title={t("statsTotal")} 
                        value={services.length} 
                        icon={<Layers size={22} />} 
                        gradient="from-indigo-500 to-indigo-600" 
                    />
                    <StatCard 
                        title={t("statsActive")} 
                        value={activeCount} 
                        icon={<CheckCircle2 size={22} />} 
                        gradient="from-emerald-500 to-emerald-600" 
                    />
                    <StatCard 
                        title={t("statsExpired")} 
                        value={expiredCount} 
                        icon={<AlertCircle size={22} />} 
                        gradient="from-orange-500 to-red-500" 
                    />
                </div>
            )}

            {/* ── Content Area ── */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-transparent grid grid-cols-1 gap-8"
                        >
                            <SkeletonCard />
                            <SkeletonCard />
                        </motion.div>
                    ) : error ? (
                        <motion.div 
                            key="error"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-red-50 border-2 border-red-100 text-red-700 rounded-3xl p-8 flex items-center justify-center gap-4 text-center shadow-sm"
                        >
                            <AlertCircle size={24} className="shrink-0 text-red-500" />
                            <span className="text-lg font-bold">{error}</span>
                        </motion.div>
                    ) : services.length === 0 ? (
                        <motion.div key="empty">
                            <EmptyState />
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 gap-8"
                        >
                            {services.map((item) => (
                                <ServiceCard key={item.subscriptionId} item={item} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Bottom Suggestion Banner ── */}
            {!loading && !error && services.length > 0 && (
                <div className="bg-[#fafafc] border border-[#343131]/[0.04] rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mt-12 overflow-hidden relative group hover:border-[#343131]/10 transition-colors">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-[#e6c800]/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#e6c800]/10 transition-colors duration-500" />
                    
                    <div className="flex items-center gap-6 z-10">
                        <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white border border-slate-100 items-center justify-center shadow-sm shrink-0">
                            <Zap size={28} className="text-[#343131]/20" />
                        </div>
                        <div>
                            <h4 className="font-display font-black text-[#343131] text-xl mb-1">
                                {t("bannerTitle")}
                            </h4>
                            <p className="text-[#343131]/50 font-medium text-sm">
                                {t("bannerDesc")}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 z-10 w-full sm:w-auto">
                        <Link
                            href="/services"
                            className="w-full sm:w-auto text-center px-6 py-3 rounded-xl bg-white border border-[#343131]/10 text-[#343131] text-xs font-black uppercase tracking-widest hover:bg-[#fafafc] hover:border-[#343131]/20 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                        >
                            {t("viewAll")}
                        </Link>
                        <Link
                            href="/dijital-urunler/hukuk-araclari-paketi"
                            className="w-full sm:w-auto text-center px-6 py-3 rounded-xl bg-[#343131] border border-[#343131] text-[#e6c800] text-xs font-black uppercase tracking-widest hover:bg-[#1a1818] transition-all shadow-md"
                        >
                            {t("viewPackage")}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
