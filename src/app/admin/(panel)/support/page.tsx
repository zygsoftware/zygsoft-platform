"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Loader2, MessageSquare, Search, AlertCircle, Calendar,
    ChevronDown, Users, LifeBuoy, CheckCircle2, Clock, XCircle,
} from "lucide-react";
import { AdminPageHeader, AdminStatsCard, AdminCard, AdminFilterBar, AdminEmptyState, AdminBadge } from "@/components/admin";

/* ── Types ──────────────────────────────────────────────────────── */

type TicketStatus = "open" | "in_progress" | "answered" | "closed";

type TicketEntry = {
    id: string;
    subject: string;
    message: string;
    status: TicketStatus;
    ticketCode?: string | null;
    lastRepliedAt?: string | null;
    adminReply?: string | null;
    createdAt: string;
    user: { id: string; name: string | null; email: string | null };
};

/* ── Status config ──────────────────────────────────────────────── */

const STATUSES: Record<TicketStatus, { label: string; badge: string; row: string }> = {
    open:        { label: "Açık",        badge: "bg-blue-50 text-blue-700 border border-blue-200",          row: "bg-blue-50/20"   },
    in_progress: { label: "İnceleniyor", badge: "bg-amber-50 text-amber-700 border border-amber-200",       row: ""                },
    answered:    { label: "Yanıtlandı",  badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", row: ""                },
    closed:      { label: "Kapalı",      badge: "bg-slate-100 text-slate-500 border border-slate-200",      row: ""                },
};

const STATUS_KEYS = Object.keys(STATUSES) as TicketStatus[];

/* ── Stat card ──────────────────────────────────────────────────── */

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
    const bg: Record<string, string> = {
        indigo:  "bg-indigo-50 text-indigo-600",
        blue:    "bg-blue-50 text-blue-600",
        amber:   "bg-amber-50 text-amber-600",
        emerald: "bg-emerald-50 text-emerald-600",
        slate:   "bg-slate-100 text-slate-500",
    };
    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg[color] ?? bg.slate}`}>{icon}</div>
            <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
            </div>
        </div>
    );
}

/* ── Inline status selector ─────────────────────────────────────── */

function ReplyForm({
    ticket, onSent,
}: { ticket: TicketEntry; onSent: () => void }) {
    const [reply, setReply] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim()) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/support", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: ticket.id, reply: reply.trim(), status: "answered" }),
            });
            if (!res.ok) throw new Error("Gönderilemedi");
            setSuccess(true);
            setReply("");
            onSent();
        } catch {
            setError("Yanıt gönderilirken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Müşteriye gönderilecek yanıtı yazın..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-300 outline-none resize-none"
            />
            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
            {success && <p className="text-emerald-600 text-xs font-bold">Yanıt gönderildi. Bildirim e-postası müşteriye iletildi.</p>}
            <button
                type="submit"
                disabled={loading || !reply.trim()}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 disabled:opacity-50"
            >
                {loading ? "Gönderiliyor..." : "Yanıtla ve E-posta Gönder"}
            </button>
        </form>
    );
}

function StatusSelector({
    id, current, onSave,
}: { id: string; current: TicketStatus; onSave: (id: string, s: TicketStatus) => void }) {
    const cfg = STATUSES[current] ?? STATUSES.open;
    return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
            <select
                value={current}
                onChange={(e) => onSave(id, e.target.value as TicketStatus)}
                className={`appearance-none cursor-pointer pl-2.5 pr-7 py-1 rounded-full text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-400 transition-all ${cfg.badge}`}
            >
                {STATUS_KEYS.map((s) => (
                    <option key={s} value={s}>{STATUSES[s].label}</option>
                ))}
            </select>
            <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-60" />
        </div>
    );
}

/* ── Main page ──────────────────────────────────────────────────── */

export default function AdminSupportPage() {
    const [tickets,      setTickets]      = useState<TicketEntry[]>([]);
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState<string | null>(null);
    const [search,       setSearch]       = useState("");
    const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
    const [expanded,     setExpanded]     = useState<string | null>(null);

    /* ── Fetch ── */
    useEffect(() => {
        fetch("/api/admin/support")
            .then(async (res) => {
                if (!res.ok) throw new Error("Veriler alınamadı.");
                const data = await res.json();
                setTickets(data.tickets ?? []);
            })
            .catch((e) => setError(e.message ?? "Bir hata oluştu."))
            .finally(() => setLoading(false));
    }, []);

    /* ── Optimistic status update ── */
    const handleStatusChange = useCallback(async (id: string, status: TicketStatus) => {
        setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
        try {
            const res = await fetch("/api/admin/support", {
                method:  "PUT",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ id, status }),
            });
            if (!res.ok) throw new Error();
        } catch {
            alert("Durum güncellenirken bir hata oluştu.");
        }
    }, []);

    const refreshTickets = useCallback(() => {
        fetch("/api/admin/support")
            .then(async (res) => {
                if (!res.ok) throw new Error();
                const data = await res.json();
                setTickets(data.tickets ?? []);
            })
            .catch(() => {});
    }, []);

    /* ── Stats ── */
    const counts = useMemo(() => ({
        total:       tickets.length,
        open:        tickets.filter((t) => t.status === "open").length,
        in_progress: tickets.filter((t) => t.status === "in_progress").length,
        answered:    tickets.filter((t) => t.status === "answered").length,
        closed:      tickets.filter((t) => t.status === "closed").length,
    }), [tickets]);

    /* ── Filtered list ── */
    const filtered = useMemo(() => {
        return tickets.filter((t) => {
            if (statusFilter !== "all" && t.status !== statusFilter) return false;
            if (!search.trim()) return true;
            const q = search.toLowerCase();
            return (
                t.subject.toLowerCase().includes(q) ||
                t.message.toLowerCase().includes(q) ||
                (t.user.name ?? "").toLowerCase().includes(q) ||
                (t.user.email ?? "").toLowerCase().includes(q)
            );
        });
    }, [tickets, search, statusFilter]);

    return (
        <div className="space-y-8 min-w-0 w-full max-w-full">
            <AdminPageHeader
                title="Destek Talepleri"
                subtitle={loading ? "Yükleniyor..." : `${tickets.length} kayıt — ${counts.open} açık talep`}
            />

            {/* Stats */}
            {!loading && !error && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <AdminStatsCard label="Toplam" value={counts.total} icon={<Users size={20} />} accent="slate" />
                    <AdminStatsCard label="Açık" value={counts.open} icon={<LifeBuoy size={20} />} accent="slate" />
                    <AdminStatsCard label="İnceleniyor" value={counts.in_progress} icon={<Clock size={20} />} accent="amber" />
                    <AdminStatsCard label="Yanıtlandı" value={counts.answered} icon={<CheckCircle2 size={20} />} accent="emerald" />
                    <AdminStatsCard label="Kapalı" value={counts.closed} icon={<XCircle size={20} />} accent="slate" />
                </div>
            )}

            {/* Filter bar */}
            {!loading && !error && tickets.length > 0 && (
                <AdminCard padding="md">
                    <AdminFilterBar
                        searchPlaceholder="Konu, mesaj veya kullanıcı ara..."
                        searchValue={search}
                        onSearchChange={setSearch}
                        showClear={!!(search || statusFilter !== "all")}
                        onClearFilters={() => { setSearch(""); setStatusFilter("all"); }}
                        filters={
                            <div className="flex gap-2 flex-wrap">
                                {(["all", ...STATUS_KEYS] as const).map((s) => {
                                    const isActive = statusFilter === s;
                                    const label = s === "all" ? "Tümü" : STATUSES[s].label;
                                    const cnt = s === "all" ? counts.total : counts[s as TicketStatus];
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => setStatusFilter(s)}
                                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                                                isActive ? "bg-[#0e0e0e] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                        >
                                            {label}
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-500"}`}>
                                                {cnt}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        }
                    />
                </AdminCard>
            )}

            {/* Table / cards */}
            <AdminCard padding="none" className="min-w-0 w-full max-w-full overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center gap-3 text-slate-400 py-16">
                        <Loader2 size={20} className="animate-spin text-emerald-500" /> Yükleniyor...
                    </div>
                ) : error ? (
                    <div className="py-16 text-center px-8">
                        <AlertCircle size={32} className="mx-auto mb-3 text-red-400" />
                        <p className="text-red-500 font-medium">{error}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <AdminEmptyState
                        icon={<MessageSquare size={40} />}
                        title={search || statusFilter !== "all" ? "Filtrelerle eşleşen kayıt bulunamadı" : "Henüz destek talebi yok"}
                        description={search || statusFilter !== "all" ? "Farklı filtreler deneyin veya filtreleri temizleyin." : "Müşterilerden gelen destek talepleri burada listelenecek."}
                        action={
                            (search || statusFilter !== "all") && (
                                <button
                                    onClick={() => { setSearch(""); setStatusFilter("all"); }}
                                    className="text-sm font-semibold text-[#e6c800] hover:text-[#c9ad00] transition-colors"
                                >
                                    Filtreleri Temizle
                                </button>
                            )
                        }
                    />
                ) : (
                    <>
                        {/* ── Desktop table ── */}
                        <div className="hidden md:block overflow-x-auto w-full max-w-full">
                            <table className="admin-table w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-4">Talep No</th>
                                        <th className="px-6 py-4">Müşteri</th>
                                        <th className="px-6 py-4">Konu</th>
                                        <th className="px-6 py-4">Mesaj</th>
                                        <th className="px-6 py-4">Durum</th>
                                        <th className="px-6 py-4">Tarih</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((t) => (
                                        <React.Fragment key={t.id}>
                                            <tr
                                                onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                                                className={`cursor-pointer transition-colors hover:bg-slate-50 ${STATUSES[t.status]?.row ?? ""}`}
                                            >
                                                {/* Talep No */}
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-mono font-bold text-slate-600">
                                                        {t.ticketCode ? `#${t.ticketCode}` : `#${t.id.slice(-8)}`}
                                                    </span>
                                                </td>
                                                {/* Müşteri */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-bold shrink-0">
                                                            {(t.user.name ?? t.user.email ?? "?").charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">{t.user.name ?? "—"}</p>
                                                            <p className="text-xs text-slate-500 font-mono">{t.user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Konu */}
                                                <td className="px-6 py-4 max-w-[180px]">
                                                    <span className="text-sm font-semibold text-slate-800 line-clamp-1">{t.subject}</span>
                                                </td>
                                                {/* Mesaj preview */}
                                                <td className="px-6 py-4 max-w-xs">
                                                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{t.message}</p>
                                                </td>
                                                {/* Durum — inline selector */}
                                                <td>
                                                    <StatusSelector id={t.id} current={t.status} onSave={handleStatusChange} />
                                                </td>
                                                {/* Tarih */}
                                                <td className="px-6 py-4">
                                                    <span className="text-xs text-slate-400 font-mono whitespace-nowrap flex items-center gap-1.5">
                                                        <Calendar size={11} />
                                                        {new Date(t.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                                                    </span>
                                                    <span className="text-xs text-slate-300 font-mono mt-0.5 block">
                                                        {new Date(t.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                </td>
                                            </tr>

                                            {expanded === t.id && (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-5 bg-slate-50/70 border-b border-slate-100">
                                                        <div className="space-y-4">
                                                            <div className="bg-white border border-slate-200 rounded-xl p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Müşteri Mesajı</p>
                                                                {t.message}
                                                            </div>
                                                            {t.adminReply && (
                                                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2">Admin Yanıtı</p>
                                                                    {t.adminReply}
                                                                </div>
                                                            )}
                                                            <ReplyForm ticket={t} onSent={refreshTickets} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>

                            <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center bg-slate-50/30">
                                <span>{filtered.length} / {tickets.length} kayıt gösteriliyor</span>
                                {(search || statusFilter !== "all") && (
                                    <button
                                        onClick={() => { setSearch(""); setStatusFilter("all"); }}
                                        className="text-[#0e0e0e] hover:text-[#e6c800] font-medium transition-colors"
                                    >
                                        Filtreleri Temizle
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* ── Mobile stacked cards ── */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {filtered.map((t) => (
                                <div
                                    key={t.id}
                                    className={`p-5 transition-colors ${STATUSES[t.status]?.row ?? ""}`}
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-bold shrink-0">
                                                {(t.user.name ?? t.user.email ?? "?").charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{t.user.name ?? "—"}</p>
                                                <p className="text-xs text-slate-500">{t.user.email}</p>
                                            </div>
                                        </div>
                                        <StatusSelector id={t.id} current={t.status} onSave={handleStatusChange} />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-800 mb-1">{t.subject}</p>
                                    <p
                                        className={`text-sm text-slate-500 leading-relaxed cursor-pointer ${expanded === t.id ? "" : "line-clamp-2"}`}
                                        onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                                    >
                                        {t.message}
                                    </p>
                                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-2">
                                        <Calendar size={10} />
                                        {new Date(t.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </AdminCard>
        </div>
    );
}
