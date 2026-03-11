"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
    Package,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    ArrowRight,
    Loader2,
    Layers,
    Globe,
    FileText,
    HeadphonesIcon,
    RefreshCw,
    ShoppingCart,
    MessageSquare,
    Wrench,
    Calendar,
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

const STATUS_CFG: Record<
    DerivedStatus,
    {
        label:       string;
        badge:       string;
        icon:        React.ReactNode;
        description: string;
        leftBorder:  string;
    }
> = {
    active: {
        label:       "Aktif",
        badge:       "bg-emerald-50 text-emerald-700 border border-emerald-200",
        icon:        <CheckCircle2 size={12} />,
        description: "Aboneliğiniz aktif ve kullanılabilir durumda.",
        leftBorder:  "border-l-emerald-400",
    },
    expired: {
        label:       "Süresi Dolmuş",
        badge:       "bg-orange-50 text-orange-700 border border-orange-200",
        icon:        <Clock size={12} />,
        description: "Aboneliğinizin süresi dolmuş.",
        leftBorder:  "border-l-orange-400",
    },
    pending_approval: {
        label:       "Onay Bekliyor",
        badge:       "bg-amber-50 text-amber-700 border border-amber-200",
        icon:        <Clock size={12} />,
        description: "Ödemeniz inceleniyor, yakında aktifleştirilecek.",
        leftBorder:  "border-l-amber-400",
    },
    payment_rejected: {
        label:       "Ödeme Reddedildi",
        badge:       "bg-red-50 text-red-600 border border-red-200",
        icon:        <XCircle size={12} />,
        description: "Son ödemeniz reddedildi. Tekrar ödeme yapabilirsiniz.",
        leftBorder:  "border-l-red-400",
    },
    inactive: {
        label:       "Pasif",
        badge:       "bg-slate-100 text-slate-500 border border-slate-200",
        icon:        <AlertCircle size={12} />,
        description: "Abonelik henüz aktif değil.",
        leftBorder:  "border-l-slate-300",
    },
};

/* ── Category labels & icons ───────────────────────────────────── */

const CATEGORY_CFG: Record<string, { label: string; icon: React.ReactNode; iconBg: string; iconColor: string }> = {
    hukuk:    { label: "Hukuk Araçları",        icon: <FileText size={16} />,  iconBg: "bg-indigo-50",  iconColor: "text-indigo-600" },
    web:      { label: "Kurumsal Hizmetler",     icon: <Globe size={16} />,     iconBg: "bg-blue-50",    iconColor: "text-blue-600"   },
    software: { label: "Yazılım Çözümleri",      icon: <Package size={16} />,   iconBg: "bg-violet-50",  iconColor: "text-violet-600" },
    tasarim:  { label: "Tasarım",                icon: <Layers size={16} />,    iconBg: "bg-pink-50",    iconColor: "text-pink-600"   },
    default:  { label: "Dijital Ürünler",        icon: <Package size={16} />,   iconBg: "bg-slate-100",  iconColor: "text-slate-600"  },
};

/* ── Tool URL mapping ──────────────────────────────────────────── */

const TOOL_URLS: Record<string, string> = {
    "legal-toolkit":  "/dashboard/tools",
};

/* ── Status badge ──────────────────────────────────────────────── */

function StatusBadge({ status }: { status: DerivedStatus }) {
    const cfg = STATUS_CFG[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
            {cfg.icon}
            {cfg.label}
        </span>
    );
}

/* ── Service card ──────────────────────────────────────────────── */

function ServiceCard({ item }: { item: ServiceItem }) {
    const cfg     = STATUS_CFG[item.derivedStatus];
    const catCfg  = CATEGORY_CFG[item.productCategory] ?? CATEGORY_CFG.default;
    const toolUrl = TOOL_URLS[item.productSlug];
    const isActive = item.derivedStatus === "active";

    const endsAtDate = item.endsAt
        ? new Date(item.endsAt).toLocaleDateString("tr-TR", {
              year: "numeric", month: "long", day: "numeric",
          })
        : null;

    return (
        <div
            className={`
                bg-white rounded-3xl border border-slate-100 shadow-sm
                border-l-4 ${cfg.leftBorder}
                p-6 flex flex-col gap-5
                hover:shadow-md transition-shadow duration-200
            `}
        >
            {/* Header row */}
            <div className="flex items-start gap-4">
                <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${catCfg.iconBg} ${catCfg.iconColor}`}
                >
                    {catCfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-heading font-black text-slate-950 text-base leading-tight">
                            {item.productName}
                        </h3>
                        <StatusBadge status={item.derivedStatus} />
                    </div>
                    <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">
                        {item.productDescription}
                    </p>
                </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] font-semibold text-slate-400 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                <span className="flex items-center gap-1.5">
                    <Calendar size={11} />
                    Başlangıç:{" "}
                    <span className="text-slate-600 font-bold">
                        {new Date(item.startedAt).toLocaleDateString("tr-TR", {
                            year: "numeric", month: "short", day: "numeric",
                        })}
                    </span>
                </span>
                {endsAtDate && (
                    <span className="flex items-center gap-1.5">
                        <Clock size={11} />
                        {item.derivedStatus === "expired" ? "Doldu:" : "Bitiş:"}{" "}
                        <span
                            className={`font-bold ${
                                item.derivedStatus === "expired"
                                    ? "text-orange-600"
                                    : "text-slate-600"
                            }`}
                        >
                            {endsAtDate}
                        </span>
                    </span>
                )}
                {item.productPrice > 0 && (
                    <span className="flex items-center gap-1.5">
                        ₺{item.productPrice.toLocaleString("tr-TR")}{item.productSlug === "legal-toolkit" ? "/yıl" : "/ay"}
                    </span>
                )}
            </div>

            {/* Status note */}
            {cfg.description && (
                <p className="text-xs text-slate-400 font-medium leading-relaxed -mt-2">
                    {cfg.description}
                </p>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-50">
                {isActive && toolUrl && (
                    <Link
                        href={toolUrl}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-black hover:bg-slate-700 transition-colors"
                    >
                        <Wrench size={13} />
                        Aracı Kullan
                    </Link>
                )}
                {(item.derivedStatus === "expired" ||
                    item.derivedStatus === "payment_rejected" ||
                    item.derivedStatus === "inactive") && (
                    <Link
                        href={`/dashboard/billing?product=${item.productSlug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#e6c800] text-slate-950 text-xs font-black hover:bg-[#d4b800] transition-colors"
                    >
                        <RefreshCw size={13} />
                        {item.derivedStatus === "payment_rejected"
                            ? "Tekrar Ödeme Yap"
                            : "Yenile / Aktifleştir"}
                    </Link>
                )}
                {item.derivedStatus === "pending_approval" && (
                    <Link
                        href="/dashboard/billing"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black hover:bg-amber-100 transition-colors"
                    >
                        <Clock size={13} />
                        Ödeme Durumu
                    </Link>
                )}
                <Link
                    href="/dashboard/support"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 text-xs font-bold hover:bg-slate-100 transition-colors"
                >
                    <HeadphonesIcon size={13} />
                    Destek Al
                </Link>
            </div>
        </div>
    );
}

/* ── Skeleton loading card ─────────────────────────────────────── */

function SkeletonCard() {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-slate-100 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded-lg animate-pulse w-2/3" />
                    <div className="h-3 bg-slate-50 rounded-lg animate-pulse w-full" />
                    <div className="h-3 bg-slate-50 rounded-lg animate-pulse w-3/4" />
                </div>
            </div>
            <div className="h-10 bg-slate-50 rounded-2xl animate-pulse" />
            <div className="flex gap-2 pt-1">
                <div className="h-8 w-28 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-8 w-20 bg-slate-50 rounded-xl animate-pulse" />
            </div>
        </div>
    );
}

/* ── Empty state ───────────────────────────────────────────────── */

function EmptyState() {
    const t = useTranslations("Dashboard.servicesPage");
    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm px-8 py-20 flex flex-col items-center text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-5 border border-slate-100">
                <Package size={28} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-heading font-black text-slate-950 mb-2">
                {t("emptyTitle")}
            </h3>
            <p className="text-sm text-slate-400 font-medium mb-7 leading-relaxed max-w-sm">
                {t("emptyDesc")}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                    href="/abonelikler"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-950 text-white text-sm font-black hover:bg-slate-700 transition-colors"
                >
                    <ShoppingCart size={14} />
                    {t("emptyCtaPrimary")}
                    <ArrowRight size={14} />
                </Link>
                <Link
                    href="/dashboard/billing"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 text-sm font-bold hover:bg-amber-100 transition-colors"
                >
                    <Clock size={14} />
                    {t("emptyCtaSecondary")}
                </Link>
                <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-50 text-slate-700 border border-slate-100 text-sm font-bold hover:bg-slate-100 transition-colors"
                >
                    <MessageSquare size={14} />
                    {t("emptyCtaContact")}
                </Link>
            </div>
        </div>
    );
}

/* ── Main page ─────────────────────────────────────────────────── */

export default function ServicesPage() {
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState<string | null>(null);

    const fetchServices = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/dashboard/services");
            if (!res.ok) throw new Error("Hizmet bilgileri alınamadı.");
            const data = await res.json();
            setServices(data.services ?? []);
        } catch {
            setError("Hizmetler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchServices(); }, [fetchServices]);

    const grouped     = services.reduce<Record<string, ServiceItem[]>>((acc, item) => {
        const key = item.productCategory || "default";
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});
    const groupEntries = Object.entries(grouped);
    const useGroups    = groupEntries.length > 1;

    const activeCount = services.filter((s) => s.derivedStatus === "active").length;

    return (
        <div className="space-y-8">

            {/* ── Header ── */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-black text-slate-950 mb-1.5">
                        Hizmetlerim
                    </h1>
                    <p className="text-slate-400 font-medium text-sm">
                        Hukuk Araçları Paketi ve diğer abonelikleriniz.
                    </p>
                </div>
                {services.length > 0 && (
                    <div className="flex items-center gap-3">
                        {activeCount > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                                <CheckCircle2 size={12} />
                                {activeCount} aktif
                            </span>
                        )}
                        <button
                            onClick={fetchServices}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 text-xs font-bold hover:bg-slate-100 transition-colors"
                        >
                            <RefreshCw size={13} />
                            Yenile
                        </button>
                    </div>
                )}
            </div>

            {/* ── Loading skeleton ── */}
            {loading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            )}

            {/* ── Error ── */}
            {!loading && error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-5 flex items-center gap-3">
                    <AlertCircle size={18} className="shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {/* ── Empty ── */}
            {!loading && !error && services.length === 0 && <EmptyState />}

            {/* ── Service list ── */}
            {!loading && !error && services.length > 0 && (
                <div className="space-y-10">
                    {useGroups
                        ? groupEntries.map(([category, items]) => {
                              const catCfg = CATEGORY_CFG[category] ?? CATEGORY_CFG.default;
                              return (
                                  <div key={category}>
                                      <div className="flex items-center gap-3 mb-5">
                                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${catCfg.iconBg} ${catCfg.iconColor}`}>
                                              {catCfg.icon}
                                          </div>
                                          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                              {catCfg.label}
                                          </h2>
                                      </div>
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                          {items.map((item) => (
                                              <ServiceCard key={item.subscriptionId} item={item} />
                                          ))}
                                      </div>
                                  </div>
                              );
                          })
                        : (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  {services.map((item) => (
                                      <ServiceCard key={item.subscriptionId} item={item} />
                                  ))}
                              </div>
                          )}
                </div>
            )}

            {/* ── Bottom CTA strip ── */}
            {!loading && !error && (
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="font-heading font-black text-slate-950 text-sm mb-0.5">
                            Hukuk Araçları Paketi'ne Abone Olmak İster Misiniz?
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                            Tek yıllık paket ile tüm belge araçlarına erişin.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/abonelikler"
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-black hover:bg-slate-700 transition-colors"
                        >
                            Paketi İncele
                            <ArrowRight size={13} />
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-200 text-xs font-bold hover:bg-slate-50 transition-colors"
                        >
                            Teklif Al
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
