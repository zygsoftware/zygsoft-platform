"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ShieldCheck, User, Search, Filter, Eye, EyeOff, X, Loader2, Mail, Lock, AlertCircle, Users, Crown, UserCheck } from "lucide-react";

type UserRow = {
    id: string;
    email: string;
    role: string;
    name?: string;
    createdAt?: string;
    _count?: { subscriptions: number; payments: number };
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "customer">("all");
    const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "admin" });
    const [showPw, setShowPw] = useState(false);
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(Array.isArray(data) ? data : data.users ?? []);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        setFormSuccess("");
        if (formData.password !== formData.confirmPassword) {
            setFormError("Şifreler eşleşmiyor.");
            return;
        }
        if (formData.password.length < 6) {
            setFormError("Şifre en az 6 karakter olmalıdır.");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password, role: formData.role }),
            });
            const data = await res.json();
            if (!res.ok) {
                setFormError(data.error || "Hata oluştu.");
            } else {
                setFormSuccess("Kullanıcı başarıyla oluşturuldu!");
                setFormData({ name: "", email: "", password: "", confirmPassword: "", role: "admin" });
                fetchUsers();
                setTimeout(() => { setShowForm(false); setFormSuccess(""); }, 2000);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== id));
            } else {
                alert("Kullanıcı silinemedi.");
            }
        } finally {
            setDeletingId(null);
        }
    };

    const filtered = useMemo(() => {
        return users.filter(u => {
            const matchSearch = u.email.toLowerCase().includes(search.toLowerCase()) ||
                (u.name?.toLowerCase() ?? "").includes(search.toLowerCase());
            const matchRole = roleFilter === "all" || u.role === roleFilter;
            return matchSearch && matchRole;
        });
    }, [users, search, roleFilter]);

    const stats = useMemo(() => ({
        total: users.length,
        admins: users.filter(u => u.role === "admin").length,
        customers: users.filter(u => u.role === "customer").length,
    }), [users]);

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-start mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Kullanıcılar</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Tüm kayıtlı kullanıcıları yönetin</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/20 shrink-0"
                >
                    <Plus size={18} /> Yeni Kullanıcı
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: "Toplam", value: stats.total, icon: <Users size={18} />, color: "blue" },
                    { label: "Admin", value: stats.admins, icon: <Crown size={18} />, color: "violet" },
                    { label: "Müşteri", value: stats.customers, icon: <UserCheck size={18} />, color: "emerald" },
                ].map(stat => (
                    <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color === "blue" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : stat.color === "violet" ? "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                            <p className="text-xs text-slate-500">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -16, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -16, scale: 0.98 }}
                        className="mb-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-lg"
                    >
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="font-semibold text-slate-900 dark:text-white">Yeni Kullanıcı Ekle</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2">
                                <AlertCircle size={16} /> {formError}
                            </div>
                        )}
                        {formSuccess && (
                            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-sm rounded-xl">
                                ✓ {formSuccess}
                            </div>
                        )}

                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Ad Soyad</label>
                                <input type="text" required value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Kullanıcı adı"
                                    className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">E-posta</label>
                                <input type="email" required value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="ornek@email.com"
                                    className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Şifre</label>
                                <div className="relative">
                                    <input type={showPw ? "text" : "password"} required value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="En az 6 karakter"
                                        className="w-full px-3 py-2.5 pr-10 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 transition-all" />
                                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Şifre Tekrar</label>
                                <input type={showPw ? "text" : "password"} required value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="Şifre tekrar"
                                    className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Rol</label>
                                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 transition-all">
                                    <option value="admin">Admin</option>
                                    <option value="customer">Müşteri</option>
                                </select>
                            </div>
                            <div className="flex justify-end items-end gap-3">
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                    İptal
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="px-5 py-2.5 text-sm bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium">
                                    {submitting ? <><Loader2 size={14} className="animate-spin" /> Kaydediliyor...</> : "Kullanıcı Oluştur"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="E-posta veya isim ara..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        {(["all", "admin", "customer"] as const).map(r => (
                            <button key={r}
                                onClick={() => setRoleFilter(r)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${roleFilter === r
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                            >
                                {r === "all" ? "Tümü" : r === "admin" ? "Admin" : "Müşteri"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="p-8 text-center flex items-center justify-center gap-3 text-slate-400">
                        <Loader2 size={20} className="animate-spin text-emerald-500" /> Yükleniyor...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <User size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                        <p className="text-slate-400 font-medium">{search || roleFilter !== "all" ? "Aramanızla eşleşen kullanıcı bulunamadı." : "Henüz kullanıcı yok."}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">Kullanıcı</th>
                                    <th className="px-6 py-4">Rol</th>
                                    <th className="px-6 py-4 hidden sm:table-cell">Üyelik</th>
                                    <th className="px-6 py-4 text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filtered.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 ${user.role === "admin" ? "bg-violet-600" : "bg-emerald-600"}`}>
                                                    {(user.name || user.email).charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    {user.name && <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>}
                                                    <p className={`text-sm ${user.name ? "text-slate-500 dark:text-slate-400" : "font-semibold text-slate-900 dark:text-white"}`}>{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.role === "admin" ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400 border border-violet-100 dark:border-violet-900/30">
                                                    <Crown size={11} /> Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                                                    <UserCheck size={11} /> Müşteri
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <span className="text-xs text-slate-400 font-mono">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                disabled={deletingId === user.id}
                                                className="opacity-0 group-hover:opacity-100 p-2 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-all disabled:opacity-50"
                                                title="Kullanıcıyı Sil"
                                            >
                                                {deletingId === user.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex justify-between items-center">
                            <span>{filtered.length} / {users.length} kullanıcı gösteriliyor</span>
                            {search && <button onClick={() => { setSearch(""); setRoleFilter("all"); }} className="text-emerald-600 hover:text-emerald-700 font-medium">Filtreyi Temizle</button>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
