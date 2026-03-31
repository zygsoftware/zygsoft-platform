"use client";

import { useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import {
    Box,
    FileText,
    Layers,
    FileImage,
    BrainCircuit,
    Gem,
    ArrowRight
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { hasToolAccess } from "@/lib/trial-access-client";
import { isSubscriptionCurrentlyActive } from "@/lib/subscription-utils";

type SessionSubscription = {
    status?: string;
    createdAt?: string;
    endsAt?: string | null;
    product?: {
        slug?: string;
    };
};

type DashboardUser = {
    role?: string;
    activeProductSlugs?: string[];
    subscriptions?: SessionSubscription[];
    trialStatus?: string;
    trialStartedAt?: string | null;
    trialEndsAt?: string | null;
};

const PACKAGES = [
    {
        slug: "legal-toolkit",
        icon: <Layers size={28} />,
        features: [
            { key: "featureUdf" as const, icon: <FileText size={16} /> },
            { key: "featurePdfMerge" as const, icon: <Layers size={16} /> },
            { key: "featureTiffJpg" as const, icon: <FileImage size={16} /> },
            { key: "featureAi" as const, icon: <BrainCircuit size={16} /> },
        ],
    },
];

export default function ProductsPage() {
    const { data: session } = useSession();
    const user = session?.user as DashboardUser | undefined;
    const activeProductSlugs = user?.activeProductSlugs || [];
    const t = useTranslations("Dashboard.productsPage");
    const locale = useLocale();
    const isAdmin = user?.role === "admin";
    const subscriptions = Array.isArray(user?.subscriptions) ? (user.subscriptions as SessionSubscription[]) : [];
    const legalToolkitSubscription = subscriptions.find((subscription) => subscription.product?.slug === "legal-toolkit");
    const hasLegalSubscription =
        activeProductSlugs.includes("legal-toolkit") ||
        isSubscriptionCurrentlyActive(legalToolkitSubscription?.status, legalToolkitSubscription?.endsAt) ||
        isAdmin;
    const hasLegalTrial = !hasLegalSubscription && user?.trialStatus === "active";

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-heading font-black text-slate-950 mb-2">{t("pageTitle")}</h1>
                <p className="text-slate-500 font-medium font-sans">{t("pageSubtitle")}</p>
            </div>

            <div className="max-w-4xl">
                {PACKAGES.map((pkg, idx) => {
                    const isUnlocked = pkg.slug === "legal-toolkit" && (hasLegalSubscription || hasLegalTrial || isAdmin || hasToolAccess(user));
                    const isLocked = !isUnlocked;
                    const subscriptionStartDate = legalToolkitSubscription?.createdAt ? new Date(legalToolkitSubscription.createdAt) : null;
                    const subscriptionEndDate = legalToolkitSubscription?.endsAt ? new Date(legalToolkitSubscription.endsAt) : null;
                    const trialStartDate = user?.trialStartedAt ? new Date(user.trialStartedAt) : null;
                    const trialEndDate = user?.trialEndsAt ? new Date(user.trialEndsAt) : null;
                    const activeStartDate = hasLegalSubscription ? subscriptionStartDate : hasLegalTrial ? trialStartDate : null;
                    const activeEndDate = isAdmin
                        ? null
                        : hasLegalSubscription
                            ? subscriptionEndDate
                            : hasLegalTrial
                                ? trialEndDate
                                : null;
                    const statusLabel = hasLegalSubscription
                        ? t("statusActive")
                        : hasLegalTrial
                            ? t("statusTrial")
                            : t("statusSubscriptionRequired");
                    const statusClass = hasLegalSubscription
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : hasLegalTrial
                            ? "bg-blue-50 text-blue-600 border-blue-100"
                            : "bg-amber-50 text-amber-600 border-amber-100";

                    return (
                        <div key={idx} className="relative group">
                            <div className={`bg-white p-8 md:p-10 rounded-[2.5rem] border transition-all duration-300 shadow-sm ${
                                isLocked ? "border-[#343131]/[0.08]" : "border-[#343131]/10 hover:shadow-xl hover:border-[#e6c800]/50"
                            }`}>
                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Left Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                                                isLocked ? "bg-[#fafafc] text-[#343131]/40 border border-[#343131]/10" : "bg-[#343131] text-[#e6c800]"
                                            }`}>
                                                {pkg.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-display font-black text-[#343131] tracking-tight">{t("legalToolkit.title")}</h3>
                                                <p className="text-[#343131]/40 text-sm font-bold uppercase tracking-widest">{t("legalToolkit.priceInfo")}</p>
                                            </div>
                                        </div>
                                        <p className="text-[#343131]/60 text-[15px] font-medium leading-relaxed max-w-lg mb-6">
                                            {t("legalToolkit.desc")}
                                        </p>

                                        {!isLocked && (
                                            <div className="flex flex-wrap gap-x-8 gap-y-3 mb-8 bg-[#fafafc] border border-[#343131]/[0.04] px-6 py-4 rounded-2xl inline-flex text-sm shadow-[inset_0_2px_10px_rgba(0,0,0,0.01)]">
                                                <div>
                                                    <span className="flex items-center gap-1.5 text-[#343131]/40 font-bold uppercase tracking-widest text-[10px] mb-1">
                                                        {t("startDate")}
                                                    </span>
                                                    <span className="text-[#343131] font-black">
                                                        {activeStartDate
                                                            ? activeStartDate.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })
                                                            : "—"}
                                                    </span>
                                                </div>
                                                <div className="w-[1px] bg-[#343131]/[0.06] hidden sm:block"></div>
                                                <div>
                                                    <span className="flex items-center gap-1.5 text-[#343131]/40 font-bold uppercase tracking-widest text-[10px] mb-1">
                                                        {t("endDate")}
                                                    </span>
                                                    <span className="text-[#343131] font-black">
                                                        {isAdmin
                                                            ? t("adminUnlimited")
                                                            : activeEndDate
                                                                ? activeEndDate.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })
                                                                : "—"}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {!isLocked ? (
                                            <Link href="/document-tools" className="inline-flex items-center gap-2 bg-[#343131] text-[#e6c800] px-8 py-4 rounded-xl text-sm font-black hover:bg-[#1a1818] hover:shadow-lg transition-all">
                                                {t("ctaToolsHub")} <ArrowRight size={18} />
                                            </Link>
                                        ) : (
                                            <Link href="/dijital-urunler/hukuk-araclari-paketi" className="inline-flex items-center gap-2 bg-[#e6c800] text-[#343131] px-8 py-4 rounded-xl text-sm font-black hover:bg-[#c9ad00] hover:shadow-lg shadow-[#e6c800]/20 transition-all">
                                                {t("ctaSubscribe")} <ArrowRight size={18} />
                                            </Link>
                                        )}
                                    </div>

                                    {/* Right Features List */}
                                    <div className="md:w-[320px] shrink-0 bg-[#fafafc] rounded-3xl p-6 border border-[#343131]/[0.04]">
                                        <div className="text-[11px] font-black text-[#343131]/40 uppercase tracking-widest mb-4">{t("packageContents")}</div>
                                        <ul className="space-y-3">
                                            {pkg.features.map((feature, fIdx) => (
                                                <li key={fIdx} className="flex items-center gap-3 text-sm font-medium text-[#343131]/70 bg-white p-3 rounded-xl border border-[#343131]/[0.03] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                                    <span className={`${isLocked ? "text-[#343131]/30" : "text-[#e6c800]"}`}>{feature.icon}</span>
                                                    {t(`legalToolkit.${feature.key}`)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                
                                {/* Status Ribbon */}
                                <div className="absolute top-6 right-6 lg:-right-4 lg:top-8 flex flex-col gap-2">
                                    {!isLocked ? (
                                        <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border shadow-sm text-xs font-black uppercase tracking-wider ${statusClass}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${hasLegalSubscription ? "bg-emerald-500" : "bg-blue-500"}`} />
                                            {statusLabel}
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shadow-sm text-xs font-black uppercase tracking-wider">
                                            <Gem size={14} className="text-amber-500" />
                                            {t("statusSubscriptionRequired")}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    );
                })}
            </div>

            {!(activeProductSlugs.length > 0 || user?.role === "admin" || hasToolAccess(user)) && (
                <div className="max-w-4xl bg-gradient-to-br from-[#343131] to-[#1a1818] rounded-[2.5rem] p-10 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#e6c800]/10 rounded-full blur-[80px] -z-0" />
                    <div className="relative z-10 w-20 h-20 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm shadow-xl">
                        <Box size={32} className="text-[#e6c800]" />
                    </div>
                    <h2 className="relative z-10 text-2xl md:text-3xl font-display font-black mb-4">{t("promoTitle")}</h2>
                    <p className="relative z-10 text-white/60 font-medium mb-8 max-w-lg mx-auto leading-relaxed">
                        {t("promoDesc")}
                    </p>
                    <Link href="/dijital-urunler/hukuk-araclari-paketi" className="relative z-10 inline-flex items-center gap-3 bg-white text-[#343131] px-10 py-4 rounded-xl text-sm font-black hover:bg-[#fafafc] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_12px_40px_rgba(255,255,255,0.1)]">
                        {t("promoCta")} <ArrowRight size={18} />
                    </Link>
                </div>
            )}
        </div>
    );
}
