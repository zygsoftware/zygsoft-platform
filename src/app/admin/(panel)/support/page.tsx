"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Loader2, MessageSquare, Search, AlertCircle, Calendar,
    ChevronDown, Users, LifeBuoy, CheckCircle2, Clock, XCircle,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────── */

type TicketStatus = "open" | "in_progress" | "answered" | "closed";

type TicketEntry = {
    id: string;
    subject: string;
    message: string;
    status: TicketStatus;
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
        <div>
            {/* Header */}
            <div className="flex justify-between items-start mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Destek Talepleri</h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        {loading ? "Yükleniyor..." : `${tickets.length} kayıt — ${counts.open} açık talep`}
                    </p>
                </div>
            </div>

            {/* Stats */}
            {!loading && !error && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                    <StatCard label="Toplam"      value={counts.total}       icon={<Users size={18} />}      color="indigo"  />
                    <StatCard label="Açık"         value={counts.open}        icon={<LifeBuoy size={18} />}   color="blue"    />
                    <StatCard label="İnceleniyor"  value={counts.in_progress} icon={<Clock size={18} />}      color="amber"   />
                    <StatCard label="Yanıtlandı"   value={counts.answered}    icon={<CheckCircle2 size={18}/>} color="emerald" />
                    <StatCard label="Kapalı"       value={counts.closed}      icon={<XCircle size={18} />}    color="slate"   />
                </div>
            )}

            {/* Filter bar */}
            {!loading && !error && tickets.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Konu, mesaj veya kullanıcı ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                        {(["all", ...STATUS_KEYS] as const).map((s) => {
                            const isActive = statusFilter === s;
                            const label    = s === "all" ? "Tümü" : STATUSES[s].label;
                            const cnt      = s === "all" ? counts.total : counts[s as TicketStatus];
                            return (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                        isActive
                                            ? "bg-slate-900 text-white shadow-sm"
                                            : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                                    }`}
                                >
                                    {label}
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                                        {cnt}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Table / cards */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
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
                    <div className="py-16 text-center px-8">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <MessageSquare size={32} />
                        </div>
                        <p className="text-slate-500 font-medium text-lg">
                            {search || statusFilter !== "all" ? "Filtrelerle eşleşen kayıt bulunamadı." : "Henüz destek talebi yok."}
                        </p>
                        {(search || statusFilter !== "all") && (
                            <button
                                onClick={() => { setSearch(""); setStatusFilter("all"); }}
                                className="mt-3 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                            >
                                Filtreleri Temizle
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* ── Desktop table ── */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    <tr>
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
                                                <td className="px-6 py-4">
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
                                                    <td colSpan={5} className="px-6 py-5 bg-slate-50/70 border-b border-slate-100">
                                                        <div className="bg-white border border-slate-200 rounded-xl p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                            {t.message}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>

                            <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400 flex justify-between items-center">
                                <span>{filtered.length} / {tickets.length} kayıt gösteriliyor</span>
                                {(search || statusFilter !== "all") && (
                                    <button
                                        onClick={() => { setSearch(""); setStatusFilter("all"); }}
                                        className="text-emerald-600 hover:text-emerald-700 font-medium"
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
            </div>
        </div>
    );
}
