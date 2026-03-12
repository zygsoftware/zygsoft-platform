"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Trash2,
  User,
  Search,
  Eye,
  EyeOff,
  X,
  Loader2,
  AlertCircle,
  Users,
  Crown,
  UserCheck,
  MessageSquare,
  CreditCard,
  Package,
  Heart,
  FileText,
  Globe,
} from "lucide-react";
import { AdminCard, AdminStatsCard, AdminPageHeader } from "@/components/admin";

type UserRow = {
  id: string;
  email: string | null;
  role: string;
  status?: string;
  name?: string | null;
  image?: string | null;
  phone?: string | null;
  company?: string | null;
  locale?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
  emailVerified?: boolean;
  trialStatus?: string;
  trialStartedAt?: string | null;
  trialEndsAt?: string | null;
  trialOperationsUsed?: number;
  trialOperationsLimit?: number;
  _count?: {
    subscriptions: number;
    payments: number;
    supportTickets: number;
    blogComments: number;
    blogLikes: number;
  };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [localeFilter, setLocaleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  });
  const [showPw, setShowPw] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchDebounced) params.set("search", searchDebounced);
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (localeFilter !== "all") params.set("locale", localeFilter);
      params.set("sort", sortBy);
      const res = await fetch(`/api/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data.users ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchDebounced, roleFilter, statusFilter, localeFilter, sortBy]);

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
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Hata oluştu.");
      } else {
        setFormSuccess("Kullanıcı başarıyla oluşturuldu!");
        setFormData({ name: "", email: "", password: "", confirmPassword: "", role: "admin" });
        fetchUsers();
        setTimeout(() => {
          setShowForm(false);
          setFormSuccess("");
        }, 2000);
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
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error || "Kullanıcı silinemedi.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((u) => u.role === "admin").length,
      staff: users.filter((u) => u.role === "staff").length,
      customers: users.filter((u) => u.role === "customer").length,
      active: users.filter((u) => (u.status ?? "active") === "active").length,
      totalSubs: users.reduce((s, u) => s + (u._count?.subscriptions ?? 0), 0),
      totalTickets: users.reduce((s, u) => s + (u._count?.supportTickets ?? 0), 0),
    }),
    [users]
  );

  const getInitials = (u: UserRow) =>
    (u.name || u.email || "?").charAt(0).toUpperCase();

  const getRoleBadge = (role: string) => {
    if (role === "admin")
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/60">
          <Crown size={11} /> Admin
        </span>
      );
    if (role === "staff")
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200/60">
          <UserCheck size={11} /> Staff
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
        <UserCheck size={11} /> Müşteri
      </span>
    );
  };

  const getTrialBadge = (trialStatus: string) => {
    const s = trialStatus ?? "none";
    if (s === "active")
      return (
        <span className="inline-flex px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          Aktif
        </span>
      );
    if (s === "expired")
      return (
        <span className="inline-flex px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/60">
          Sona erdi
        </span>
      );
    if (s === "converted")
      return (
        <span className="inline-flex px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
          Dönüştü
        </span>
      );
    return (
      <span className="inline-flex px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200/60">
        Yok
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const s = status ?? "active";
    if (s === "active")
      return (
        <span className="inline-flex px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          Aktif
        </span>
      );
    if (s === "suspended")
      return (
        <span className="inline-flex px-2.5 py-0.5 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-200/60">
          Askıda
        </span>
      );
    return (
      <span className="inline-flex px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
        Beklemede
      </span>
    );
  };

  const hasFilters = search || roleFilter !== "all" || statusFilter !== "all" || localeFilter !== "all";

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Kullanıcı Yönetimi"
        subtitle="Tüm kayıtlı kullanıcıları yönetin."
        actions={
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-[#0e0e0e] hover:bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <Plus size={18} /> Yeni Kullanıcı
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <AdminStatsCard label="Toplam" value={stats.total} icon={<Users size={20} />} accent="slate" />
        <AdminStatsCard label="Admin" value={stats.admins} icon={<Crown size={20} />} accent="violet" />
        <AdminStatsCard label="Müşteri" value={stats.customers} icon={<UserCheck size={20} />} accent="emerald" />
        <AdminStatsCard label="Aktif" value={stats.active} icon={<Users size={20} />} accent="emerald" />
        <AdminStatsCard label="Abonelik" value={stats.totalSubs} icon={<Package size={20} />} accent="gold" />
        <AdminStatsCard label="Destek" value={stats.totalTickets} icon={<MessageSquare size={20} />} accent="slate" href="/admin/support" />
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            className="admin-card p-6"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-semibold text-slate-900">Yeni Kullanıcı Ekle</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-2">
                <AlertCircle size={16} /> {formError}
              </div>
            )}
            {formSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">✓ {formSuccess}</div>
            )}
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Kullanıcı adı"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#e6c800]/30 focus:border-[#e6c800]/50 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">E-posta</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ornek@email.com"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#e6c800]/30 focus:border-[#e6c800]/50 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Şifre</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="En az 6 karakter"
                    className="w-full px-3 py-2.5 pr-10 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#e6c800]/30 focus:border-[#e6c800]/50 focus:outline-none transition-all"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Şifre Tekrar</label>
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Şifre tekrar"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#e6c800]/30 focus:border-[#e6c800]/50 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#e6c800]/30 focus:border-[#e6c800]/50 focus:outline-none transition-all"
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="customer">Müşteri</option>
                </select>
              </div>
              <div className="flex justify-end items-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm bg-[#0e0e0e] text-white rounded-xl hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 flex items-center gap-2 font-medium"
                >
                  {submitting ? <><Loader2 size={14} className="animate-spin" /> Kaydediliyor...</> : "Kullanıcı Oluştur"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <AdminCard padding="md">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="İsim veya e-posta ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e6c800]/30 focus:border-[#e6c800]/50 transition-all"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white min-w-[140px]"
            >
              <option value="newest">En Yeni</option>
              <option value="lastLogin">Son Giriş</option>
              <option value="active">En Aktif</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "admin", "staff", "customer"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  roleFilter === r ? "bg-[#0e0e0e] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {r === "all" ? "Tüm Roller" : r === "admin" ? "Admin" : r === "staff" ? "Staff" : "Müşteri"}
              </button>
            ))}
            {(["all", "active", "suspended", "pending"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  statusFilter === s ? "bg-[#0e0e0e] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s === "all" ? "Tüm Durum" : s === "active" ? "Aktif" : s === "suspended" ? "Askıda" : "Beklemede"}
              </button>
            ))}
            {(["all", "tr", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLocaleFilter(l)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  localeFilter === l ? "bg-[#0e0e0e] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Globe size={14} /> {l === "all" ? "Tüm Diller" : l === "tr" ? "TR" : "EN"}
              </button>
            ))}
          </div>
        </div>
      </AdminCard>

      {/* Table */}
      <AdminCard padding="none">
        {loading ? (
          <div className="p-16 text-center flex items-center justify-center gap-3 text-slate-400">
            <Loader2 size={24} className="animate-spin text-[#e6c800]" /> Yükleniyor...
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#e6c800]/10 flex items-center justify-center mx-auto mb-4">
              <User size={40} className="text-[#e6c800]" />
            </div>
            <p className="text-slate-500 font-medium">
              {hasFilters ? "Aramanızla eşleşen kullanıcı bulunamadı." : "Henüz kullanıcı yok."}
            </p>
            {hasFilters && (
              <button
                onClick={() => {
                  setSearch("");
                  setSearchDebounced("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                  setLocaleFilter("all");
                }}
                className="mt-4 text-[#e6c800] font-semibold hover:underline"
              >
                Filtreyi Temizle
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table w-full">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/50">
                  <th className="px-6 py-4">Kullanıcı</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4 hidden md:table-cell">Durum</th>
                  <th className="px-6 py-4 hidden lg:table-cell">Dil</th>
                  <th className="px-6 py-4 hidden xl:table-cell">Şirket</th>
                  <th className="px-6 py-4 hidden sm:table-cell text-center">Abonelik</th>
                  <th className="px-6 py-4 hidden sm:table-cell text-center">Ödeme</th>
                  <th className="px-6 py-4 hidden md:table-cell text-center">Destek</th>
                  <th className="px-6 py-4 hidden lg:table-cell text-center">Blog</th>
                  <th className="px-6 py-4 hidden xl:table-cell">E-posta Doğr.</th>
                  <th className="px-6 py-4 hidden xl:table-cell">Demo</th>
                  <th className="px-6 py-4 hidden lg:table-cell">Kayıt</th>
                  <th className="px-6 py-4 hidden xl:table-cell">Son Giriş</th>
                  <th className="px-6 py-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                          {user.image ? (
                            <Image src={user.image} alt="" fill className="object-cover" sizes="40px" />
                          ) : (
                            <div
                              className={`w-full h-full flex items-center justify-center text-sm font-bold ${
                                user.role === "admin" ? "bg-[#0e0e0e] text-white" : "bg-[#e6c800] text-[#0e0e0e]"
                              }`}
                            >
                              {getInitials(user)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-[#e6c800] transition-colors">
                            {user.name || user.email || "—"}
                          </p>
                          <p className={user.name ? "text-xs text-slate-500" : "text-xs font-medium text-slate-600"}>
                            {user.email ?? "—"}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 hidden md:table-cell">{getStatusBadge(user.status ?? "active")}</td>
                    <td className="px-6 py-4 hidden lg:table-cell text-sm text-slate-600">
                      {user.locale === "en" ? "EN" : user.locale ?? "TR"}
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell text-sm text-slate-600 max-w-[120px] truncate" title={user.company ?? undefined}>
                      {user.company ?? "—"}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell text-center">
                      <span className="text-sm font-medium text-slate-600">{user._count?.subscriptions ?? 0}</span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell text-center">
                      <span className="text-sm font-medium text-slate-600">{user._count?.payments ?? 0}</span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-center">
                      <span className="text-sm font-medium text-slate-600">{user._count?.supportTickets ?? 0}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-center">
                      <span className="text-sm font-medium text-slate-600">
                        {(user._count?.blogComments ?? 0) + (user._count?.blogLikes ?? 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell text-center">
                      <span className={`text-xs font-bold ${user.emailVerified ? "text-emerald-600" : "text-amber-600"}`}>
                        {user.emailVerified ? "✓" : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell">
                      <div className="flex flex-col gap-0.5">
                        {getTrialBadge(user.trialStatus ?? "none")}
                        {user.trialStatus === "active" && (
                          <span className="text-[10px] text-slate-500">
                            {user.trialOperationsUsed ?? 0}
                            /{user.trialOperationsLimit ?? 20}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-sm text-slate-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("tr-TR") : "—"}
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell text-sm text-slate-500">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("tr-TR") : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="inline-flex p-2 text-[#0e0e0e] hover:bg-slate-100 rounded-lg transition-colors font-medium text-sm"
                        title="Detay"
                      >
                        Detay
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={deletingId === user.id}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 ml-1"
                        title="Kullanıcıyı Sil"
                      >
                        {deletingId === user.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center bg-slate-50/30">
              <span>{users.length} kullanıcı gösteriliyor</span>
              {hasFilters && (
                <button
                  onClick={() => {
                    setSearch("");
                    setSearchDebounced("");
                    setRoleFilter("all");
                    setStatusFilter("all");
                    setLocaleFilter("all");
                  }}
                  className="text-[#0e0e0e] hover:text-[#e6c800] font-medium transition-colors"
                >
                  Filtreyi Temizle
                </button>
              )}
            </div>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
