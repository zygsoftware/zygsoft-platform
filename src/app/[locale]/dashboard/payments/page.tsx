"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
    ArrowRight,
    CheckCircle2,
    Clock3,
    Loader2,
    ReceiptText,
    RefreshCw,
    XCircle,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

type PaymentStatus = "pending" | "approved" | "rejected" | string;
type SubscriptionStatus = "pending_approval" | "active" | "expired" | "inactive" | string;

type PaymentHistoryItem = {
    id: string;
    amount: number;
    status: PaymentStatus;
    hasReceipt: boolean;
    receiptImage: string | null;
    createdAt: string;
    updatedAt: string;
    product: {
        id: string;
        name: string;
        slug: string;
    } | null;
    subscription: {
        productId: string;
        status: SubscriptionStatus;
        endsAt: string | null;
    } | null;
};

function statusStyles(status: PaymentStatus) {
    switch (status) {
        case "approved":
            return {
                icon: <CheckCircle2 size={14} />,
                className: "border-emerald-100 bg-emerald-50 text-emerald-700",
            };
        case "rejected":
            return {
                icon: <XCircle size={14} />,
                className: "border-red-100 bg-red-50 text-red-700",
            };
        default:
            return {
                icon: <Clock3 size={14} />,
                className: "border-amber-100 bg-amber-50 text-amber-700",
            };
    }
}

export default function DashboardPaymentsPage() {
    const t = useTranslations("Dashboard.paymentsPage");
    const locale = useLocale();
    const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchPayments = useCallback(async (mode: "initial" | "refresh" = "initial") => {
        if (mode === "refresh") {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await fetch("/api/payments/history", { cache: "no-store" });
            if (!response.ok) {
                throw new Error(t("loadError"));
            }

            const data = (await response.json()) as { payments?: PaymentHistoryItem[] };
            setPayments(Array.isArray(data.payments) ? data.payments : []);
            setError("");
        } catch {
            setError(t("loadError"));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [t]);

    useEffect(() => {
        void fetchPayments();
    }, [fetchPayments]);

    const stats = useMemo(() => {
        const pending = payments.filter((item) => item.status === "pending").length;
        const approved = payments.filter((item) => item.status === "approved").length;

        return [
            { label: t("statsTotal"), value: payments.length },
            { label: t("statsPending"), value: pending },
            { label: t("statsApproved"), value: approved },
        ];
    }, [payments, t]);

    const formatDate = (value: string) =>
        new Date(value).toLocaleDateString(locale, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    const formatAmount = (value: number) =>
        new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
            style: "currency",
            currency: "TRY",
            maximumFractionDigits: 0,
        }).format(value);

    const getStatusLabel = (status: PaymentStatus) => {
        if (status === "approved") return t("statusApproved");
        if (status === "rejected") return t("statusRejected");
        return t("statusPending");
    };

    const getSubscriptionLabel = (status?: SubscriptionStatus | null) => {
        if (status === "active") return t("subscriptionActive");
        if (status === "expired") return t("subscriptionExpired");
        if (status === "pending_approval") return t("subscriptionPending");
        return t("subscriptionInactive");
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-3xl font-heading font-black text-slate-950">{t("pageTitle")}</h1>
                    <p className="mt-2 max-w-2xl text-sm font-medium leading-7 text-slate-500">
                        {t("pageSubtitle")}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void fetchPayments("refresh")}
                    disabled={refreshing}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-700 transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {refreshing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                    {refreshing ? t("refreshing") : t("refresh")}
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {stats.map((item) => (
                    <div
                        key={item.label}
                        className="rounded-[1.6rem] border border-slate-200 bg-white px-6 py-5 shadow-sm"
                    >
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                        <p className="mt-3 text-3xl font-heading font-black text-slate-950">{item.value}</p>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[0, 1, 2].map((item) => (
                        <div key={item} className="animate-pulse rounded-[1.8rem] border border-slate-200 bg-white p-7 shadow-sm">
                            <div className="h-5 w-40 rounded bg-slate-100" />
                            <div className="mt-4 h-4 w-64 rounded bg-slate-100" />
                            <div className="mt-6 grid gap-3 md:grid-cols-4">
                                {[0, 1, 2, 3].map((cell) => (
                                    <div key={cell} className="h-16 rounded-2xl bg-slate-100" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="rounded-[1.8rem] border border-red-200 bg-red-50 px-6 py-5 text-sm font-bold text-red-600">
                    {error || t("genericError")}
                </div>
            ) : payments.length === 0 ? (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                        <ReceiptText size={28} />
                    </div>
                    <h2 className="mt-6 text-2xl font-heading font-black text-slate-950">{t("emptyTitle")}</h2>
                    <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-7 text-slate-500">
                        {t("emptyDesc")}
                    </p>
                    <Link
                        href="/dijital-urunler"
                        className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-slate-800"
                    >
                        {t("emptyCta")}
                        <ArrowRight size={14} />
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {payments.map((payment) => {
                        const statusMeta = statusStyles(payment.status);

                        return (
                            <article
                                key={payment.id}
                                className="rounded-[1.9rem] border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                                            {t("product")}
                                        </p>
                                        <h2 className="mt-2 text-2xl font-heading font-black text-slate-950">
                                            {payment.product?.name ?? t("unknownProduct")}
                                        </h2>
                                    </div>

                                    <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] ${statusMeta.className}`}>
                                        {statusMeta.icon}
                                        {getStatusLabel(payment.status)}
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-4">
                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{t("amount")}</p>
                                        <p className="mt-2 text-lg font-black text-slate-950">{formatAmount(payment.amount)}</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-4">
                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{t("createdAt")}</p>
                                        <p className="mt-2 text-sm font-black text-slate-950">{formatDate(payment.createdAt)}</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-4">
                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{t("updatedAt")}</p>
                                        <p className="mt-2 text-sm font-black text-slate-950">{formatDate(payment.updatedAt)}</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-4">
                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{t("subscription")}</p>
                                        <p className="mt-2 text-sm font-black text-slate-950">
                                            {getSubscriptionLabel(payment.subscription?.status)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-sm font-medium text-slate-500">
                                        {payment.hasReceipt && payment.receiptImage ? (
                                            <a
                                                href={payment.receiptImage}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 font-black text-slate-950 transition-colors hover:text-slate-700"
                                            >
                                                <ReceiptText size={16} />
                                                {t("receiptView")}
                                            </a>
                                        ) : (
                                            <span>{t("receiptMissing")}</span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        {payment.status === "rejected" && payment.product?.slug ? (
                                            <Link
                                                href={`/payment?product=${payment.product.slug}`}
                                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-slate-800"
                                            >
                                                {t("retryPayment")}
                                                <ArrowRight size={14} />
                                            </Link>
                                        ) : (
                                            <Link
                                                href={payment.product?.slug ? `/payment?product=${payment.product.slug}` : "/payment"}
                                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-700 transition-colors hover:border-slate-300"
                                            >
                                                {t("openCheckout")}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
