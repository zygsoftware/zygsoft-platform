"use client";

import { useEffect, useState, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
    Receipt,
    MessageSquare,
    Wrench,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
} from "lucide-react";
import type { TimelineItem } from "@/types/dashboard-timeline";
import { TIMELINE_TOOL_HREFS } from "@/lib/dashboard-timeline-hrefs";

export type TimelineEventType =
    | "payment_submitted"
    | "payment_approved"
    | "payment_rejected"
    | "ticket_created"
    | "ticket_updated"
    | "tool_used";

function slugToCamelKey(slug: string): string {
    return slug
        .split("-")
        .map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
        .join("");
}

function itemToDisplayType(item: TimelineItem): TimelineEventType {
    if (item.kind === "payment") {
        if (item.status === "approved") return "payment_approved";
        if (item.status === "rejected") return "payment_rejected";
        return "payment_submitted";
    }
    if (item.kind === "ticket") {
        return item.variant === "updated" ? "ticket_updated" : "ticket_created";
    }
    return "tool_used";
}

function getEventIcon(type: TimelineEventType) {
    switch (type) {
        case "payment_submitted":
            return Clock;
        case "payment_approved":
            return CheckCircle2;
        case "payment_rejected":
            return XCircle;
        case "ticket_created":
        case "ticket_updated":
            return MessageSquare;
        case "tool_used":
            return Wrench;
        default:
            return Receipt;
    }
}

function getEventIconBg(type: TimelineEventType) {
    switch (type) {
        case "payment_submitted":
            return "bg-amber-50 text-amber-600";
        case "payment_approved":
            return "bg-emerald-50 text-emerald-600";
        case "payment_rejected":
            return "bg-red-50 text-red-600";
        case "ticket_created":
        case "ticket_updated":
            return "bg-violet-50 text-violet-600";
        case "tool_used":
            return "bg-slate-100 text-slate-600";
        default:
            return "bg-slate-100 text-slate-600";
    }
}

type TimelineRow = {
    id: string;
    type: TimelineEventType;
    title: string;
    description: string;
    date: string;
    href?: string;
};

function groupByDate(
    items: TimelineRow[],
    getLabel: (kind: "today" | "yesterday" | "daysAgo", days?: number) => string
) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const groups: {
        label: string;
        rows: { id: string; type: TimelineEventType; title: string; description: string; date: string; href?: string }[];
    }[] = [];
    let currentLabel = "";
    let currentRows: TimelineRow[] = [];

    for (const row of items) {
        const d = new Date(row.date);
        const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        let label: string;
        if (dStart.getTime() >= todayStart.getTime()) {
            label = getLabel("today");
        } else if (dStart.getTime() >= yesterdayStart.getTime()) {
            label = getLabel("yesterday");
        } else {
            const diffDays = Math.floor((todayStart.getTime() - dStart.getTime()) / 86400000);
            label = getLabel("daysAgo", diffDays);
        }

        if (label !== currentLabel) {
            if (currentRows.length > 0) {
                groups.push({ label: currentLabel, rows: currentRows });
            }
            currentLabel = label;
            currentRows = [row];
        } else {
            currentRows.push(row);
        }
    }
    if (currentRows.length > 0) {
        groups.push({ label: currentLabel, rows: currentRows });
    }
    return groups;
}

function formatTime(iso: string, locale: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString(locale === "en" ? "en-US" : "tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatMoneyAmount(amount: number, locale: string) {
    const loc = locale === "en" ? "en-US" : "tr-TR";
    return `₺${amount.toLocaleString(loc, { minimumFractionDigits: 0 })}`;
}

function mapItemToRow(
    item: TimelineItem,
    t: (key: string, values?: Record<string, string | number | Date>) => string,
    locale: string
): { id: string; type: TimelineEventType; title: string; description: string; date: string; href?: string } {
    const type = itemToDisplayType(item);

    if (item.kind === "payment") {
        const title = item.productName?.trim() || t("unknownProduct");
        const amount = formatMoneyAmount(item.amount, locale);
        const lineKey =
            item.status === "approved"
                ? "paymentLines.approved"
                : item.status === "rejected"
                  ? "paymentLines.rejected"
                  : "paymentLines.pending";
        const description = t(lineKey, { amount });
        return {
            id: item.id,
            type,
            title,
            description,
            date: item.date,
            href: "/dashboard/billing",
        };
    }

    if (item.kind === "ticket") {
        const description = t(`ticketStatus.${item.status}`);
        return {
            id: item.id,
            type,
            title: item.subject,
            description,
            date: item.date,
            href: "/dashboard/support",
        };
    }

    const camel = slugToCamelKey(item.toolSlug);
    const toolKey = `toolEvents.${camel}`;
    const toolTitle =
        item.toolSlug in TIMELINE_TOOL_HREFS ? t(toolKey) : t("toolEvents.generic");
    const href = TIMELINE_TOOL_HREFS[item.toolSlug] ?? "/dashboard/tools";
    return {
        id: item.id,
        type,
        title: toolTitle,
        description: "",
        date: item.date,
        href,
    };
}

export function ActivityTimeline() {
    const t = useTranslations("Dashboard.overview.activity");
    const locale = useLocale();
    const [items, setItems] = useState<TimelineItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTimeline = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/dashboard/timeline");
            if (!res.ok) {
                if (res.status === 401) throw new Error(t("genericError"));
                throw new Error(t("loadError"));
            }
            const data = await res.json();
            setItems(data.timeline ?? []);
        } catch (e) {
            setError((e as Error).message ?? t("genericError"));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchTimeline();
    }, [fetchTimeline]);

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm font-medium">{t("loading")}</span>
            </div>
        );
    }

    if (error) {
        return <p className="text-sm text-amber-600 font-medium py-6">{error}</p>;
    }

    if (items.length === 0) {
        return (
            <div className="py-8 text-center">
                <p className="text-slate-400 text-sm font-medium">{t("empty")}</p>
                <p className="text-slate-300 text-xs font-medium mt-1.5">{t("emptyHint")}</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <Link
                        href="/dashboard/billing"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors"
                    >
                        <Receipt size={14} />
                        {t("ctaBilling")}
                    </Link>
                    <Link
                        href="/dashboard/support"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-50 text-violet-700 text-xs font-bold hover:bg-violet-100 transition-colors"
                    >
                        <MessageSquare size={14} />
                        {t("ctaSupport")}
                    </Link>
                </div>
            </div>
        );
    }

    const rows = items.map((item) => mapItemToRow(item, t, locale));

    const getLabel = (kind: "today" | "yesterday" | "daysAgo", days?: number) => {
        if (kind === "today") return t("today");
        if (kind === "yesterday") return t("yesterday");
        return t("daysAgo", { count: days ?? 0 });
    };
    const groups = groupByDate(rows, getLabel);

    return (
        <div className="relative">
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-100" />

            <div className="space-y-6">
                {groups.map((group) => (
                    <div key={group.label}>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">
                            {group.label}
                        </p>
                        <div className="space-y-2">
                            {group.rows.map((row) => {
                                const Icon = getEventIcon(row.type);
                                const iconBg = getEventIconBg(row.type);
                                const content = (
                                    <div className="flex items-start gap-4 group/item">
                                        <div
                                            className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 border-white shadow-sm ${iconBg}`}
                                        >
                                            <Icon size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <p className="text-sm font-bold text-slate-950 truncate group-hover/item:text-[#e6c800] transition-colors">
                                                {row.title}
                                            </p>
                                            {row.description ? (
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                    {row.description}
                                                </p>
                                            ) : null}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 shrink-0 pt-1">
                                            {formatTime(row.date, locale)}
                                        </span>
                                    </div>
                                );

                                const wrapperClass = "block p-4 rounded-xl hover:bg-slate-50 transition-colors";

                                if (row.href) {
                                    return (
                                        <Link key={row.id} href={row.href} className={wrapperClass}>
                                            {content}
                                        </Link>
                                    );
                                }
                                return (
                                    <div key={row.id} className={wrapperClass}>
                                        {content}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
