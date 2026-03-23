"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, MessageSquare, Clock, AlertCircle,
    ArrowRight, Loader2, X, Send, Calendar, CheckCircle2,
    LifeBuoy, ChevronDown, ChevronUp, BookOpen, Zap,
} from "lucide-react";

/* ── Types & config ────────────────────────────────────────────── */

type TicketStatus = "open" | "in_progress" | "answered" | "closed";

type Ticket = {
    id: string;
    subject: string;
    message: string;
    status: TicketStatus;
    ticketCode?: string | null;
    lastRepliedAt?: string | null;
    adminReply?: string | null;
    createdAt: string;
    updatedAt: string;
};

const STATUS_STYLE: Record<TicketStatus, { badge: string; dot: string }> = {
    open:        { badge: "bg-blue-50 text-blue-700 border border-blue-200",           dot: "bg-blue-500"    },
    in_progress: { badge: "bg-amber-50 text-amber-700 border border-amber-200",        dot: "bg-amber-500"   },
    answered:    { badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",  dot: "bg-emerald-500" },
    closed:      { badge: "bg-slate-100 text-slate-500 border border-slate-200",       dot: "bg-slate-400"   },
};

const STATUS_LABEL_KEY: Record<TicketStatus, "statusOpen" | "statusInProgress" | "statusAnswered" | "statusClosed"> = {
    open:        "statusOpen",
    in_progress: "statusInProgress",
    answered:    "statusAnswered",
    closed:      "statusClosed",
};

function StatusBadge({ status }: { status: string }) {
    const t = useTranslations("Dashboard.supportPage");
    const st = (status as TicketStatus) in STATUS_STYLE ? (status as TicketStatus) : "open";
    const cfg = STATUS_STYLE[st];
    const labelKey = STATUS_LABEL_KEY[st];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {t(labelKey)}
        </span>
    );
}

/* ── New ticket form ───────────────────────────────────────────── */

function NewTicketForm({ onSuccess, onClose }: { onSuccess: (ticket?: { ticketCode?: string }) => void; onClose: () => void }) {
    const t = useTranslations("Dashboard.supportPage");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) {
            setError(t("errorSubjectMessage"));
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/support", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ subject, message }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(typeof data.error === "string" && data.error ? data.error : t("genericError"));
            } else {
                onSuccess(data.ticket);
            }
        } catch {
            setError(t("connectionError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
        >
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-[#e6c800]">
                        <Send size={15} />
                    </div>
                    <h3 className="text-base font-heading font-black text-slate-950">
                        {t("formTitle")}
                    </h3>
                </div>
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                >
                    <X size={15} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-7 space-y-5">
                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold">
                        <AlertCircle size={15} /> {error}
                    </div>
                )}

                <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                        {t("subjectLabel")}
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder={t("subjectPlaceholder")}
                        maxLength={200}
                        required
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-950 font-bold text-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-300 focus:outline-none transition-all placeholder:text-slate-300"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                        {t("messageLabel")}
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t("messagePlaceholder")}
                        rows={4}
                        required
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-950 font-bold text-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-300 focus:outline-none transition-all placeholder:text-slate-300 resize-none"
                    />
                </div>

                <div className="flex items-center gap-4 pt-1">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-7 py-3 bg-slate-950 text-[#e6c800] font-black rounded-2xl hover:bg-slate-700 active:scale-[0.98] transition-all shadow-lg shadow-black/10 disabled:opacity-40 text-sm"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
                        {loading ? t("submitting") : t("submitTicket")}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {t("cancel")}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}

/* ── Ticket list ───────────────────────────────────────────────── */

function TicketList({ refreshKey, onNew }: { refreshKey: number; onNew: () => void }) {
    const t = useTranslations("Dashboard.supportPage");
    const locale = useLocale();
    const [tickets,  setTickets]  = useState<Ticket[]>([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string | null>(null);

    const fetchTickets = useCallback(() => {
        setLoading(true);
        setError(null);
        fetch("/api/support")
            .then(async (res) => {
                if (!res.ok) throw new Error(t("loadError"));
                const data = await res.json();
                setTickets(data.tickets ?? []);
            })
            .catch((e) => setError(e.message ?? t("genericError")))
            .finally(() => setLoading(false));
    }, [t]);

    useEffect(() => { fetchTickets(); }, [refreshKey, fetchTickets]);

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-3 p-12 text-slate-400">
                <Loader2 size={20} className="animate-spin text-[#e6c800]" />
                <span className="text-sm font-bold">{t("loading")}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-10 text-center">
                <AlertCircle size={24} className="mx-auto mb-3 text-red-400" />
                <p className="text-red-500 font-bold text-sm">{error}</p>
            </div>
        );
    }

    if (tickets.length === 0) {
        return (
            <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <MessageSquare size={26} className="text-slate-200" />
                </div>
                <h4 className="text-base font-heading font-black text-slate-950 mb-2">
                    {t("emptyTitle")}
                </h4>
                <p className="text-slate-400 text-sm font-medium mb-5 max-w-sm mx-auto leading-relaxed">
                    {t("emptyDesc")}
                </p>
                <button
                    onClick={onNew}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 text-[#e6c800] font-black rounded-2xl text-sm hover:bg-slate-700 transition-all shadow-md"
                >
                    <Plus size={15} />
                    {t("emptyCta")}
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Ticket count header */}
            <div className="flex items-center justify-between px-7 py-3 border-b border-slate-50 bg-slate-50/60">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t("ticketCount", { count: tickets.length })}
                </span>
                <span className="text-[10px] text-slate-300 font-mono">
                    {t("newestFirst")}
                </span>
            </div>
            <div className="divide-y divide-slate-50">
                {tickets.map((ticket) => (
                    <div key={ticket.id}>
                        <button
                            onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
                            className="w-full flex items-start gap-4 px-7 py-5 hover:bg-slate-50/70 transition-colors text-left group"
                        >
                            <div className={`
                                w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors
                                ${expanded === ticket.id
                                    ? "bg-slate-950 text-[#e6c800]"
                                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                                }
                            `}>
                                <LifeBuoy size={15} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-3 mb-1.5">
                                    <p className="text-sm font-black text-slate-950 truncate">
                                        {ticket.subject}
                                    </p>
                                    <StatusBadge status={ticket.status} />
                                </div>
                                <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                                    {ticket.ticketCode && (
                                        <span className="font-bold text-[#e6c800]">#{ticket.ticketCode}</span>
                                    )}
                                    <Calendar size={10} />
                                    {new Date(ticket.createdAt).toLocaleDateString(locale, {
                                        day: "numeric", month: "long", year: "numeric",
                                    })}
                                </p>
                            </div>
                            <div className="text-slate-300 shrink-0 mt-1">
                                {expanded === ticket.id
                                    ? <ChevronUp size={15} />
                                    : <ChevronDown size={15} />}
                            </div>
                        </button>

                        {/* Accordion body — toggle-triggered, safe */}
                        <AnimatePresence>
                            {expanded === ticket.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.18 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-7 pb-5 pt-1">
                                        <div className="ml-13 bg-slate-50 rounded-2xl p-5 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap border border-slate-100">
                                            {ticket.message}
                                        </div>
                                        {ticket.adminReply && (
                                            <div className="ml-13 mt-4 p-5 bg-slate-950/5 rounded-2xl border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t("adminReplyTitle")}</p>
                                                {ticket.adminReply}
                                            </div>
                                        )}
                                        <p className="ml-13 mt-2 text-[10px] text-slate-300 font-mono">
                                            {ticket.lastRepliedAt ? t("lastReply") : t("lastUpdate")}
                                            {new Date(ticket.lastRepliedAt || ticket.updatedAt).toLocaleDateString(locale, {
                                                day: "numeric", month: "short", year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Main page ─────────────────────────────────────────────────── */

export default function SupportPage() {
    const t = useTranslations("Dashboard.supportPage");
    const [showForm,    setShowForm]    = useState(false);
    const [refreshKey,  setRefreshKey]  = useState(0);
    const [successTicket, setSuccessTicket] = useState<{ ticketCode?: string } | null>(null);

    const handleSuccess = (ticket?: { ticketCode?: string }) => {
        setShowForm(false);
        setRefreshKey((k) => k + 1);
        if (ticket?.ticketCode) {
            setSuccessTicket(ticket);
            setTimeout(() => setSuccessTicket(null), 8000);
        }
    };

    return (
        <div className="space-y-8">

            {/* ── Header ── */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-black text-slate-950 mb-1.5">
                        {t("pageTitle")}
                    </h1>
                    <p className="text-slate-400 font-medium text-sm">
                        {t("pageSubtitle")}
                    </p>
                </div>

                {/* Toggle button — shows state clearly */}
                <button
                    onClick={() => setShowForm((v) => !v)}
                    className={`
                        inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black
                        transition-all shadow-sm
                        ${showForm
                            ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            : "bg-slate-950 text-white hover:bg-slate-700 shadow-lg shadow-black/10"
                        }
                    `}
                >
                    {showForm ? <X size={16} /> : <Plus size={16} />}
                    {showForm ? t("toggleClose") : t("toggleOpen")}
                </button>
            </div>

            {/* ── Success toast with ticket code ── */}
            <AnimatePresence>
                {successTicket?.ticketCode && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-6 p-5 rounded-2xl border border-emerald-200 bg-emerald-50 flex items-center gap-4"
                    >
                        <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                        <div>
                            <p className="font-black text-slate-950 text-sm">{t("successTitle")}</p>
                            <p className="text-slate-600 text-sm font-mono mt-1">
                                {t("successCode")} <span className="font-black text-[#e6c800]">#{successTicket.ticketCode}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{t("successEmailHint")}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── New ticket form (toggle-triggered animation, safe) ── */}
            <AnimatePresence>
                {showForm && (
                    <NewTicketForm
                        onSuccess={handleSuccess}
                        onClose={() => setShowForm(false)}
                    />
                )}
            </AnimatePresence>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left info column */}
                <div className="lg:col-span-1 space-y-5">

                    {/* Quick tips card */}
                    <div className="bg-slate-950 p-7 rounded-3xl">
                        <div className="w-10 h-10 rounded-xl bg-[#e6c800]/15 border border-[#e6c800]/25 flex items-center justify-center text-[#e6c800] mb-5">
                            <Zap size={18} />
                        </div>
                        <h3 className="text-base font-heading font-black text-white mb-3">
                            {t("quickSolutionsTitle")}
                        </h3>
                        <p className="text-white/50 text-sm font-medium leading-relaxed mb-5">
                            {t("quickSolutionsDesc")}
                        </p>
                        <button className="w-full bg-[#e6c800] text-slate-950 py-3 rounded-xl text-xs font-black hover:bg-white transition-all flex items-center justify-center gap-2">
                            <BookOpen size={14} />
                            {t("documentation")}
                            <ArrowRight size={13} />
                        </button>
                    </div>

                    {/* Response times card */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-5">
                            <Clock size={14} className="text-slate-400" />
                            <h4 className="font-heading font-black text-slate-950 text-sm">
                                {t("responseTimesTitle")}
                            </h4>
                        </div>
                        <div className="space-y-3">
                            {[
                                { labelKey: "responseSoftware" as const, timeKey: "response2h" as const, color: "text-emerald-600" },
                                { labelKey: "responseGeneral" as const, timeKey: "response4h" as const, color: "text-blue-600"    },
                                { labelKey: "responseCustom" as const, timeKey: "response24h" as const, color: "text-violet-600"  },
                            ].map(({ labelKey, timeKey, color }) => (
                                <div
                                    key={labelKey}
                                    className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-b-0"
                                >
                                    <span className="text-sm text-slate-500 font-medium">{t(labelKey)}</span>
                                    <span className={`text-xs font-black ${color}`}>{t(timeKey)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="space-y-3">
                        {[
                            {
                                icon:  <CheckCircle2 size={15} />,
                                titleKey: "tip1Title" as const,
                                descKey: "tip1Desc" as const,
                            },
                            {
                                icon:  <Clock size={15} />,
                                titleKey: "tip2Title" as const,
                                descKey: "tip2Desc" as const,
                            },
                        ].map(({ icon, titleKey, descKey }) => (
                            <div
                                key={titleKey}
                                className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex gap-3 items-start"
                            >
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-slate-100 text-[#e6c800]">
                                    {icon}
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-950 text-xs mb-1">{t(titleKey)}</h5>
                                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                        {t(descKey)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: ticket list */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-50">
                            <h3 className="text-base font-heading font-black text-slate-950 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-[#e6c800]/15 flex items-center justify-center">
                                    <LifeBuoy size={13} className="text-[#e6c800]" />
                                </span>
                                {t("ticketListTitle")}
                            </h3>
                        </div>
                        <TicketList
                            refreshKey={refreshKey}
                            onNew={() => setShowForm(true)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
