"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
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

export type TimelineEventType =
    | "payment_submitted"
    | "payment_approved"
    | "payment_rejected"
    | "ticket_created"
    | "ticket_updated"
    | "tool_used";

export type TimelineEvent = {
    id: string;
    type: TimelineEventType;
    title: string;
    description: string;
    date: string;
    href?: string;
};

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

function groupByDate(
    events: TimelineEvent[],
    getLabel: (kind: "today" | "yesterday" | "daysAgo", days?: number) => string
) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const groups: { label: string; events: TimelineEvent[] }[] = [];
    let currentLabel = "";
    let currentEvents: TimelineEvent[] = [];

    for (const e of events) {
        const d = new Date(e.date);
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
            if (currentEvents.length > 0) {
                groups.push({ label: currentLabel, events: currentEvents });
            }
            currentLabel = label;
            currentEvents = [e];
        } else {
            currentEvents.push(e);
        }
    }
    if (currentEvents.length > 0) {
        groups.push({ label: currentLabel, events: currentEvents });
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

export function ActivityTimeline() {
    const t = useTranslations("Dashboard.overview.activity");
    const locale = useLocale();
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTimeline = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/dashboard/timeline");
            if (!res.ok) throw new Error("Zaman çizelgesi alınamadı.");
            const data = await res.json();
            setEvents(data.timeline ?? []);
        } catch (e) {
            setError((e as Error).message ?? "Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTimeline();
    }, [fetchTimeline]);

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm font-medium">Yükleniyor...</span>
            </div>
        );
    }

    if (error) {
        return <p className="text-sm text-amber-600 font-medium py-6">{error}</p>;
    }

    if (events.length === 0) {
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
                        Ödeme Bildirimi
                    </Link>
                    <Link
                        href="/dashboard/support"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-50 text-violet-700 text-xs font-bold hover:bg-violet-100 transition-colors"
                    >
                        <MessageSquare size={14} />
                        Destek Talebi
                    </Link>
                </div>
            </div>
        );
    }

    const getLabel = (kind: "today" | "yesterday" | "daysAgo", days?: number) => {
        if (kind === "today") return t("today");
        if (kind === "yesterday") return t("yesterday");
        return t("daysAgo", { count: days ?? 0 });
    };
    const groups = groupByDate(events, getLabel);

    return (
        <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-100" />

            <div className="space-y-6">
                {groups.map((group) => (
                    <div key={group.label}>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">
                            {group.label}
                        </p>
                        <div className="space-y-2">
                            {group.events.map((event) => {
                                const Icon = getEventIcon(event.type);
                                const iconBg = getEventIconBg(event.type);
                                const content = (
                                    <div className="flex items-start gap-4 group/item">
                                        <div
                                            className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 border-white shadow-sm ${iconBg}`}
                                        >
                                            <Icon size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <p className="text-sm font-bold text-slate-950 truncate group-hover/item:text-[#e6c800] transition-colors">
                                                {event.title}
                                            </p>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                {event.description}
                                            </p>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 shrink-0 pt-1">
                                            {formatTime(event.date, locale)}
                                        </span>
                                    </div>
                                );

                                const wrapperClass =
                                    "block p-4 rounded-xl hover:bg-slate-50 transition-colors";

                                if (event.href) {
                                    return (
                                        <Link
                                            key={event.id}
                                            href={event.href}
                                            className={wrapperClass}
                                        >
                                            {content}
                                        </Link>
                                    );
                                }
                                return (
                                    <div key={event.id} className={wrapperClass}>
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
