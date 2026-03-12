"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
    Box,
    Briefcase,
    LifeBuoy,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    Sparkles,
    CreditCard,
    Wrench,
    Receipt,
    MessageSquare,
    ShoppingCart,
    Activity,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { TrialCountdownCard, formatTimeLeftCompact } from "@/components/dashboard/TrialCountdownCard";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { TrialRequestCTA } from "@/components/trial/TrialRequestCTA";
import { hasToolAccess } from "@/lib/trial-access-client";

type Summary = {
    activeProducts: number;
    activeServices: number;
    pendingPayments: number;
    openTickets: number;
};

export default function DashboardPage() {
    const { data: session } = useSession();
    const t = useTranslations("Dashboard.overview");
    const locale = useLocale();
    const user = session?.user as any;
    const activeProductSlugs: string[] = user?.activeProductSlugs || [];

    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSummary = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/dashboard/summary");
            if (!res.ok) throw new Error("Özet alınamadı.");
            const data = await res.json();
            setSummary(data.summary ?? null);
        } catch {
            setSummary(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (session) fetchSummary();
    }, [session, fetchSummary]);

    const hasLegalToolkitAccess = hasToolAccess(user);
    const hasPaidSubscription = activeProductSlugs.includes("legal-toolkit") || user?.role === "admin";

    const stats = [
        {
            name:  t("stats.activeProducts"),
            value: loading ? "—" : String(summary?.activeProducts ?? 0),
            icon:  Box,
            color: "text-blue-600",
            bg:    "bg-blue-50",
            accent: "border-l-blue-400",
        },
        {
            name:  t("stats.activeServices"),
            value: loading ? "—" : String(summary?.activeServices ?? 0),
            icon:  Briefcase,
            color: "text-emerald-600",
            bg:    "bg-emerald-50",
            accent: "border-l-emerald-400",
        },
        {
            name:  t("stats.pendingPayments"),
            value: loading ? "—" : String(summary?.pendingPayments ?? 0),
            icon:  CreditCard,
            color: "text-amber-600",
            bg:    "bg-amber-50",
            accent: "border-l-amber-400",
        },
        {
            name:  t("stats.supportTickets"),
            value: loading ? "—" : String(summary?.openTickets ?? 0),
            icon:  LifeBuoy,
            color: "text-violet-600",
            bg:    "bg-violet-50",
            accent: "border-l-violet-400",
        },
    ];

    const quickActions = [
        { label: t("quickActions.tools"),     href: "/dashboard/tools",     icon: Wrench },
        { label: t("quickActions.billing"),   href: "/dashboard/billing",   icon: Receipt },
        { label: t("quickActions.support"),  href: "/dashboard/support",   icon: MessageSquare },
        { label: t("quickActions.services"), href: "/dashboard/services",   icon: Briefcase },
        { label: t("quickActions.subscriptions"), href: "/dijital-urunler/hukuk-araclari-paketi", icon: ShoppingCart },
    ];

    return (
        <div className="space-y-8">

            {/* ── Welcome header ── */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-black text-slate-950 mb-1.5">
                        {t("welcome")}, {user?.name || user?.email?.split("@")[0]} 👋
                    </h1>
                    <p className="text-slate-400 font-medium text-sm">
                        {t("subtitle")}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {!hasLegalToolkitAccess && (user?.role === "customer" || !user?.role) && (
                        <TrialRequestCTA
                            emailVerified={user?.emailVerified ?? false}
                            trialStatus={user?.trialStatus ?? "none"}
                            hasSubscription={hasLegalToolkitAccess}
                            compact
                            source="dashboard"
                        />
                    )}
                    {!hasLegalToolkitAccess && user?.trialStatus === "active" && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                            <Sparkles size={13} className="text-amber-500" />
                            Demo: {formatTimeLeftCompact(user?.trialEndsAt ?? null)}
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
                        <Sparkles size={13} className="text-amber-500" />
                        Kontrol Panelinize Hoş Geldiniz
                    </div>
                </div>
            </div>

            {/* ── Onboarding checklist (when no subscription & not completed) ── */}
            {!hasLegalToolkitAccess &&
                (user?.role === "customer" || !user?.role) &&
                !user?.onboardingCompleted && (
                    <OnboardingChecklist
                        emailVerified={user?.emailVerified ?? false}
                        trialStatus={user?.trialStatus ?? "none"}
                        trialOperationsUsed={user?.trialOperationsUsed ?? 0}
                        hasSubscription={hasLegalToolkitAccess}
                        onDismiss={() => {}}
                    />
                )}

            {/* ── Trial countdown card (when no subscription) ── */}
            {!hasPaidSubscription && (user?.role === "customer" || !user?.role) && (
                <TrialCountdownCard
                    trialStatus={user?.trialStatus ?? "none"}
                    trialStartedAt={user?.trialStartedAt ?? null}
                    trialEndsAt={user?.trialEndsAt ?? null}
                    trialOperationsUsed={user?.trialOperationsUsed ?? 0}
                    trialOperationsLimit={user?.trialOperationsLimit ?? 20}
                    hasSubscription={hasPaidSubscription}
                    emailVerified={user?.emailVerified ?? false}
                />
            )}

            {/* ── Onboarding strip (context-aware next step) ── */}
            {!loading && summary && (
                (() => {
                    const ap = summary.activeProducts ?? 0;
                    const pp = summary.pendingPayments ?? 0;
                    const ot = summary.openTickets ?? 0;
                    if (pp > 0) {
                        return (
                            <Link
                                href={`/${locale}/dashboard/billing`}
                                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100 hover:bg-amber-100/80 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                        <Clock size={18} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-950">
                                        {t("onboarding.pendingPayment")}
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1 text-amber-700 font-black text-xs group-hover:gap-2 transition-all">
                                    {t("onboarding.pendingPaymentCta")}
                                    <ChevronRight size={14} />
                                </span>
                            </Link>
                        );
                    }
                    if (ot > 0) {
                        return (
                            <Link
                                href={`/${locale}/dashboard/support`}
                                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-violet-50 border border-violet-100 hover:bg-violet-100/80 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 shrink-0">
                                        <MessageSquare size={18} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-950">
                                        {t("onboarding.openTicket")}
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1 text-violet-700 font-black text-xs group-hover:gap-2 transition-all">
                                    {t("onboarding.openTicketCta")}
                                    <ChevronRight size={14} />
                                </span>
                            </Link>
                        );
                    }
                    if (ap === 0) {
                        return (
                            <Link
                                href={locale === "en" ? "/en/dijital-urunler/hukuk-araclari-paketi" : "/dijital-urunler/hukuk-araclari-paketi"}
                                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                        <ShoppingCart size={18} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-950">
                                        {t("onboarding.noProducts")}
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1 text-slate-600 font-black text-xs group-hover:gap-2 transition-all">
                                    {t("onboarding.noProductsCta")}
                                    <ChevronRight size={14} />
                                </span>
                            </Link>
                        );
                    }
                    if (hasLegalToolkitAccess) {
                        return (
                            <Link
                                href={`/${locale}/dashboard/tools`}
                                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/80 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                        <Wrench size={18} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-950">
                                        {t("onboarding.hasTools")}
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-black text-xs group-hover:gap-2 transition-all">
                                    {t("onboarding.hasToolsCta")}
                                    <ChevronRight size={14} />
                                </span>
                            </Link>
                        );
                    }
                    return null;
                })()
            )}

            {/* ── Quick stats (real data) ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className={`
                            card-surface flex items-center justify-between p-5
                            border-l-4 ${stat.accent}
                            cursor-default
                        `}
                    >
                        <div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
                                {stat.name}
                            </p>
                            <h3 className="text-2xl font-display font-black text-slate-950 leading-none">
                                {stat.value}
                            </h3>
                        </div>
                        <div
                            className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}
                        >
                            <stat.icon size={18} />
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Content sections ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Active applications */}
                <div className="card-surface overflow-hidden flex flex-col">
                    <div className="px-7 py-5 border-b border-[var(--border)] flex justify-between items-center">
                        <h2 className="text-base font-display font-black text-slate-950 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                                <Box size={13} className="text-amber-600" />
                            </span>
                            {t("sections.apps")}
                        </h2>
                        <Link
                            href="/dashboard/products"
                            className="text-slate-400 hover:text-slate-950 text-xs font-bold flex items-center gap-1 transition-colors group"
                        >
                            {t("sections.viewAll")}
                            <ArrowUpRight
                                size={13}
                                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                            />
                        </Link>
                    </div>

                    <div className="p-7 flex-1 flex flex-col justify-center">
                        {hasLegalToolkitAccess ? (
                                <div className="
                                flex items-center justify-between gap-4 p-5
                                bg-gradient-to-br from-[#0a0c10] to-[#111318]
                                rounded-2xl border border-slate-700
                                hover:border-slate-600 hover:shadow-lg
                                transition-all duration-200 group
                            ">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100 shrink-0">
                                        <CheckCircle2 size={22} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-white text-sm leading-tight">
                                            Hukuk Araçları Paketi
                                        </h4>
                                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-0.5">
                                            Aktif · Sınırsız Erişim
                                        </p>
                                    </div>
                                </div>
                                <div className="shrink-0 flex flex-col items-end gap-2">
                                    <Link
                                        href="/dashboard/tools/doc-to-udf"
                                        className="px-4 py-2.5 bg-[#e6c800] text-[#0a0c10] rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-white transition-all"
                                    >
                                        {t("sections.start")}
                                    </Link>
                                    <Link
                                        href="/dashboard/tools"
                                        className="text-white/50 text-[10px] font-bold hover:text-white transition-colors"
                                    >
                                        {t("tools.allTools")} →
                                    </Link>
                                </div>
                            </div>
                        ) : activeProductSlugs.length > 0 ? (
                            <div className="flex items-center gap-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <div className="w-10 h-10 bg-white text-emerald-600 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-slate-950 text-sm">
                                        {activeProductSlugs.length} aktif abonelik
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                                        Detayları görmek için Hizmetlerim sayfasına gidin.
                                    </p>
                                </div>
                                <Link
                                    href="/dashboard/services"
                                    className="shrink-0 px-4 py-2 bg-slate-950 text-white text-xs font-black rounded-xl hover:bg-slate-700 transition-colors"
                                >
                                    Görüntüle
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center py-6">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                                    <Box size={20} className="text-slate-200" />
                                </div>
                                <p className="text-slate-400 text-sm font-medium mb-4">
                                    {t("sections.noApps")}
                                </p>
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {!hasLegalToolkitAccess && (user?.role === "customer" || !user?.role) && (
                                        <TrialRequestCTA
                                            emailVerified={user?.emailVerified ?? false}
                                            trialStatus={user?.trialStatus ?? "none"}
                                            hasSubscription={hasLegalToolkitAccess}
                                            source="dashboard"
                                        />
                                    )}
                                    <Link
                                        href={locale === "en" ? "/en/dijital-urunler/hukuk-araclari-paketi" : "/dijital-urunler/hukuk-araclari-paketi"}
                                        className="inline-flex items-center gap-2 bg-slate-950 text-white px-6 py-2.5 rounded-xl text-xs font-black hover:bg-slate-800 transition-all shadow-sm"
                                    >
                                        {t("sections.browseStore")}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Support tickets */}
                <div className="card-surface overflow-hidden flex flex-col">
                    <div className="px-7 py-5 border-b border-[var(--border)] flex justify-between items-center">
                        <h2 className="text-base font-display font-black text-slate-950 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                                <LifeBuoy size={13} className="text-amber-600" />
                            </span>
                            {t("sections.support")}
                        </h2>
                        <Link
                            href="/dashboard/support"
                            className="text-slate-400 hover:text-slate-950 text-xs font-bold flex items-center gap-1 transition-colors group"
                        >
                            {t("sections.viewAll")}
                            <ArrowUpRight
                                size={13}
                                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                            />
                        </Link>
                    </div>

                    <div className="p-7 flex-1 flex flex-col justify-center">
                        {(summary?.openTickets ?? 0) > 0 ? (
                            <div className="flex items-center justify-between gap-4 p-5 bg-violet-50 rounded-2xl border border-violet-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center shrink-0">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-950 text-sm">
                                            {t("sections.openTicketsCount", { count: summary?.openTickets ?? 0 })}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                                            {t("sections.openTicketsHint")}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/dashboard/support"
                                    className="shrink-0 px-4 py-2 bg-slate-950 text-white text-xs font-black rounded-xl hover:bg-slate-700 transition-colors"
                                >
                                    {t("sections.viewAll")}
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-4 text-center">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                                    <Clock size={20} className="text-slate-200" />
                                </div>
                                <p className="text-slate-400 text-sm font-medium mb-4">
                                    {t("sections.noTickets")}
                                </p>
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {!hasLegalToolkitAccess && (user?.role === "customer" || !user?.role) && (
                                        <TrialRequestCTA
                                            emailVerified={user?.emailVerified ?? false}
                                            trialStatus={user?.trialStatus ?? "none"}
                                            hasSubscription={hasLegalToolkitAccess}
                                            compact
                                            source="dashboard"
                                        />
                                    )}
                                    <Link
                                        href={`/${locale}/dashboard/support`}
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-950 text-white text-xs font-black rounded-xl hover:bg-slate-700 transition-colors"
                                    >
                                        {t("sections.newTicket")}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Recent Activity + Quick Actions ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 card-surface overflow-hidden">
                    <div className="px-7 py-5 border-b border-[var(--border)] flex items-center gap-2">
                        <Activity size={16} className="text-slate-500" />
                        <h2 className="text-base font-display font-black text-slate-950">
                            {t("activity.title")}
                        </h2>
                    </div>
                    <div className="p-6">
                        <ActivityTimeline />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card-surface overflow-hidden">
                    <div className="px-7 py-5 border-b border-[var(--border)]">
                        <h2 className="text-base font-display font-black text-slate-950">
                            {t("quickActions.title")}
                        </h2>
                    </div>
                    <div className="p-5 space-y-2">
                        {quickActions.map((action) => (
                            <Link
                                key={action.href}
                                href={action.href}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors text-slate-600">
                                    <action.icon size={16} />
                                </div>
                                <span className="text-sm font-bold text-slate-950 group-hover:text-amber-600 transition-colors">
                                    {action.label}
                                </span>
                                <ArrowUpRight
                                    size={14}
                                    className="ml-auto text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Bottom CTA ── */}
            <div className="bg-[var(--surface-dark)] rounded-2xl p-8 md:p-12 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/[0.03] rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="text-center lg:text-left max-w-xl">
                        <h3 className="text-2xl font-display font-black text-white mb-3 leading-tight">
                            {t("cta.title")}
                        </h3>
                        <p className="text-white/55 font-medium text-base leading-relaxed">
                            {t("cta.desc")}
                        </p>
                    </div>
                    <Link
                        href="/dijital-urunler/hukuk-araclari-paketi"
                        className="
                            bg-[#e6c800] text-slate-950 px-10 py-4 rounded-2xl
                            text-sm font-black hover:bg-white transition-all
                            shadow-sm shrink-0 tracking-wider
                        "
                    >
                        {t("cta.button")}
                    </Link>
                </div>
            </div>
        </div>
    );
}
