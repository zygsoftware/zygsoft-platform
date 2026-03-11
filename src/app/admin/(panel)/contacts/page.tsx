"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Loader2, Mail, MessageSquare, Phone, Calendar,
    Search, AlertCircle, CheckCircle2, ChevronDown,
    NotebookPen, Save, X, Users, PhoneCall,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────── */

type Status = "new" | "contacted" | "qualified" | "closed";

type ContactEntry = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    subject: string | null;
    message: string;
    status: Status;
    adminNote: string | null;
    createdAt: string;
};

/* ── Status config ──────────────────────────────────────────────── */

const STATUSES: Record<Status, { label: string; badge: string; row: string }> = {
    new:       { label: "Yeni",               badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", row: "bg-emerald-50/25" },
    contacted: { label: "İletişime Geçildi",  badge: "bg-blue-50 text-blue-700 border border-blue-200",         row: "" },
    qualified: { label: "Nitelikli",          badge: "bg-violet-50 text-violet-700 border border-violet-200",   row: "bg-violet-50/20" },
    closed:    { label: "Kapalı",             badge: "bg-slate-100 text-slate-500 border border-slate-200",     row: "" },
};

const STATUS_KEYS = Object.keys(STATUSES) as Status[];

/* ── Stat card ──────────────────────────────────────────────────── */

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
    const bg: Record<string, string> = {
        emerald: "bg-emerald-50 text-emerald-600",
        blue:    "bg-blue-50 text-blue-600",
        violet:  "bg-violet-50 text-violet-600",
        slate:   "bg-slate-100 text-slate-500",
        indigo:  "bg-indigo-50 text-indigo-600",
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

function StatusSelector({ id, current, onSave }: { id: string; current: Status; onSave: (id: string, s: Status) => void }) {
    const cfg = STATUSES[current] ?? STATUSES.new;
    return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
            <select
                value={current}
                onChange={(e) => onSave(id, e.target.value as Status)}
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

/* ── Inline note editor ─────────────────────────────────────────── */

function NoteEditor({ id, note, onSave }: { id: string; note: string | null; onSave: (id: string, note: string) => Promise<void> }) {
    const [editing, setEditing]   = useState(false);
    const [draft,   setDraft]     = useState(note ?? "");
    const [saving,  setSaving]    = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(id, draft);
            setEditing(false);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setDraft(note ?? "");
        setEditing(false);
    };

    if (!editing) {
        return (
            <div className="mt-3">
                {note ? (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Admin Notu</span>
                            <button onClick={() => setEditing(true)} className="text-xs text-amber-600 hover:text-amber-800 font-semibold transition-colors">
                                Düzenle
                            </button>
                        </div>
                        <p className="text-sm text-amber-800 whitespace-pre-wrap">{note}</p>
                    </div>
                ) : (
                    <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium mt-1"
                    >
                        <NotebookPen size={13} /> Not Ekle
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Admin Notu</label>
            <textarea
                autoFocus
                rows={3}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Bu lead hakkında not ekleyin..."
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none transition-all"
            />
            <div className="flex gap-2 mt-2">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    Kaydet
                </button>
                <button
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors"
                >
                    <X size={12} /> İptal
                </button>
            </div>
        </div>
    );
}

/* ── Main page ──────────────────────────────────────────────────── */

export default function AdminContactsPage() {
    const [messages,  setMessages]  = useState<ContactEntry[]>([]);
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState<string | null>(null);
    const [search,    setSearch]    = useState("");
    const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
    const [expanded,  setExpanded]  = useState<string | null>(null);

    /* ── Fetch ── */
    useEffect(() => {
        fetch("/api/admin/contacts")
            .then(async (res) => {
                if (!res.ok) throw new Error("Veriler alınamadı.");
                const data = await res.json();
                setMessages(data.messages ?? []);
            })
            .catch((e) => setError(e.message ?? "Bir hata oluştu."))
            .finally(() => setLoading(false));
    }, []);

    /* ── Optimistic status update ── */
    const handleStatusChange = useCallback(async (id: string, status: Status) => {
        // Optimistic: update local state immediately
        setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status } : m));
        try {
            const res = await fetch("/api/admin/contacts", {
                method:  "PUT",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ id, status }),
            });
            if (!res.ok) throw new Error();
        } catch {
            // Revert on failure
            setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status: m.status } : m));
            alert("Durum güncellenirken bir hata oluştu.");
        }
    }, []);

    /* ── Admin note save ── */
    const handleNoteSave = useCallback(async (id: string, adminNote: string) => {
        const res = await fetch("/api/admin/contacts", {
            method:  "PUT",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ id, adminNote }),
        });
        if (!res.ok) throw new Error("Not kaydedilemedi.");
        setMessages((prev) => prev.map((m) => m.id === id ? { ...m, adminNote: adminNote || null } : m));
    }, []);

    /* ── Filtered list ── */
    const filtered = useMemo(() => {
        return messages.filter((m) => {
            if (statusFilter !== "all" && m.status !== statusFilter) return false;
            if (!search.trim()) return true;
            const q = search.toLowerCase();
            return (
                m.name.toLowerCase().includes(q) ||
                m.email.toLowerCase().includes(q) ||
                (m.subject ?? "").toLowerCase().includes(q) ||
                m.message.toLowerCase().includes(q)
            );
        });
    }, [messages, search, statusFilter]);

    /* ── Stats ── */
    const counts = useMemo(() => ({
        total:     messages.length,
        new:       messages.filter((m) => m.status === "new").length,
        contacted: messages.filter((m) => m.status === "contacted").length,
        qualified: messages.filter((m) => m.status === "qualified").length,
        closed:    messages.filter((m) => m.status === "closed").length,
    }), [messages]);

    /* ── Helpers ── */
    const toggleRow = (id: string) => setExpanded((prev) => prev === id ? null : id);

    /* ─────────────────────────────────────────────────────────── */
    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-start mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">İletişim Talepleri</h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        {loading ? "Yükleniyor..." : `${messages.length} kayıt — ${counts.new} yeni talep`}
                    </p>
                </div>
            </div>

            {/* Stats row */}
            {!loading && !error && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                    <StatCard label="Toplam"              value={counts.total}     icon={<Users size={18} />}         color="indigo"  />
                    <StatCard label="Yeni"                value={counts.new}       icon={<Mail size={18} />}          color="emerald" />
                    <StatCard label="İletişime Geçildi"   value={counts.contacted} icon={<PhoneCall size={18} />}     color="blue"    />
                    <StatCard label="Nitelikli"           value={counts.qualified} icon={<CheckCircle2 size={18} />}  color="violet"  />
                    <StatCard label="Kapalı"              value={counts.closed}    icon={<MessageSquare size={18} />} color="slate"   />
                </div>
            )}

            {/* Filter bar */}
            {!loading && !error && messages.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="İsim, e-posta veya konu ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                    </div>

                    {/* Status filter tabs */}
                    <div className="flex gap-1.5 flex-wrap">
                        {(["all", ...STATUS_KEYS] as const).map((s) => {
                            const isActive = statusFilter === s;
                            const label = s === "all" ? "Tümü" : STATUSES[s].label;
                            const cnt   = s === "all" ? counts.total : counts[s];
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
                    <div className="p-12 text-center flex items-center justify-center gap-3 text-slate-400">
                        <Loader2 size={20} className="animate-spin text-emerald-500" /> Yükleniyor...
                    </div>
                ) : error ? (
                    <div className="p-12 text-center">
                        <AlertCircle size={36} className="mx-auto mb-3 text-red-400" />
                        <p className="text-red-500 font-medium">{error}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <MessageSquare size={32} />
                        </div>
                        <p className="text-slate-500 font-medium text-lg">
                            {search || statusFilter !== "all" ? "Filtrelerle eşleşen kayıt bulunamadı." : "Henüz iletişim talebi yok."}
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
                                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Gönderen</th>
                                        <th className="px-6 py-4">Konu</th>
                                        <th className="px-6 py-4">Mesaj</th>
                                        <th className="px-6 py-4">Durum</th>
                                        <th className="px-6 py-4">Tarih</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((msg) => (
                                        <React.Fragment key={msg.id}>
                                            <tr
                                                onClick={() => toggleRow(msg.id)}
                                                className={`cursor-pointer transition-colors hover:bg-slate-50 ${STATUSES[msg.status]?.row ?? ""}`}
                                            >
                                                {/* Gönderen */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-bold shrink-0">
                                                            {msg.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">{msg.name}</p>
                                                            <p className="text-xs text-slate-500 font-mono">{msg.email}</p>
                                                            {msg.phone && (
                                                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                                    <Phone size={10} /> {msg.phone}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Konu */}
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-700 font-medium">{msg.subject ?? "—"}</span>
                                                </td>
                                                {/* Mesaj preview */}
                                                <td className="px-6 py-4 max-w-xs">
                                                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{msg.message}</p>
                                                </td>
                                                {/* Durum — inline selector */}
                                                <td className="px-6 py-4">
                                                    <StatusSelector
                                                        id={msg.id}
                                                        current={msg.status}
                                                        onSave={handleStatusChange}
                                                    />
                                                </td>
                                                {/* Tarih */}
                                                <td className="px-6 py-4">
                                                    <span className="text-xs text-slate-400 font-mono whitespace-nowrap flex items-center gap-1.5">
                                                        <Calendar size={11} />
                                                        {new Date(msg.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                                                    </span>
                                                    <span className="text-xs text-slate-300 font-mono mt-0.5 block">
                                                        {new Date(msg.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                </td>
                                            </tr>

                                            {/* Expanded detail row */}
                                            {expanded === msg.id && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-5 bg-slate-50/70 border-b border-slate-100">
                                                        <div className="bg-white border border-slate-200 rounded-xl p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                            {msg.message}
                                                        </div>
                                                        <NoteEditor
                                                            id={msg.id}
                                                            note={msg.adminNote}
                                                            onSave={handleNoteSave}
                                                        />
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>

                            <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400 flex justify-between items-center">
                                <span>{filtered.length} / {messages.length} kayıt gösteriliyor</span>
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
                            {filtered.map((msg) => (
                                <div key={msg.id} className={`p-5 transition-colors ${STATUSES[msg.status]?.row ?? ""}`}>
                                    <div
                                        className="flex items-start justify-between gap-3 mb-3 cursor-pointer"
                                        onClick={() => toggleRow(msg.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-bold shrink-0">
                                                {msg.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{msg.name}</p>
                                                <p className="text-xs text-slate-500">{msg.email}</p>
                                            </div>
                                        </div>
                                        <StatusSelector id={msg.id} current={msg.status} onSave={handleStatusChange} />
                                    </div>

                                    {msg.subject && <p className="text-sm font-semibold text-slate-700 mb-1 cursor-pointer" onClick={() => toggleRow(msg.id)}>{msg.subject}</p>}
                                    <p
                                        className={`text-sm text-slate-500 leading-relaxed cursor-pointer ${expanded === msg.id ? "" : "line-clamp-2"}`}
                                        onClick={() => toggleRow(msg.id)}
                                    >
                                        {msg.message}
                                    </p>

                                    {expanded === msg.id && (
                                        <NoteEditor id={msg.id} note={msg.adminNote} onSave={handleNoteSave} />
                                    )}

                                    {msg.phone && (
                                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-2">
                                            <Phone size={10} /> {msg.phone}
                                        </p>
                                    )}
                                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-2">
                                        <Calendar size={10} />
                                        {new Date(msg.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
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
