"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  User,
  CreditCard,
  MessageSquare,
  FileText,
  Package,
  Mail,
  Phone,
  Building,
  Globe,
  Calendar,
  Shield,
  Edit,
  Save,
  Crown,
  UserCheck,
  Send,
  ExternalLink,
  Ban,
  CheckCircle,
  Key,
  Zap,
  RotateCcw,
  Pause,
  Play,
} from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin";

type Sub = { id: string; status: string; endsAt: string | null; product: { name: string; slug: string } };
type Payment = { id: string; amount: number; status: string; createdAt: string; product?: { name: string } | null };
type Ticket = { id: string; subject: string; status: string; createdAt: string };
type BlogComment = { id: string; content: string; created_at: string; post?: { slug: string; title_tr: string; title_en: string } };
type ResetToken = { id: string; createdAt: string; usedAt: string | null; expiresAt: string };

type UserDetail = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  status: string;
  phone: string | null;
  company: string | null;
  locale: string | null;
  notes: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  emailVerified?: boolean;
  trialStatus?: string;
  trialStartedAt?: string | null;
  trialEndsAt?: string | null;
  trialOperationsUsed?: number;
  trialOperationsLimit?: number;
  subscriptions: Sub[];
  payments: Payment[];
  supportTickets: Ticket[];
  blogComments: BlogComment[];
  _count: { blogComments: number; blogLikes: number; supportTickets: number };
  passwordResetTokens?: ResetToken[];
};

const TABS = [
  { id: "overview" as const, label: "Genel Bakış", icon: User },
  { id: "products" as const, label: "Abonelikler", icon: Package },
  { id: "payments" as const, label: "Ödemeler", icon: CreditCard },
  { id: "support" as const, label: "Destek", icon: MessageSquare },
  { id: "blog" as const, label: "Blog Etkileşimi", icon: FileText },
  { id: "notes" as const, label: "Notlar", icon: Edit },
  { id: "security" as const, label: "Güvenlik", icon: Shield },
];

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("overview");
  const [editingOverview, setEditingOverview] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
    status: "",
    phone: "",
    company: "",
    locale: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const fetchUser = () => {
    if (!id) return;
    fetch(`/api/users/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setEditForm({
          name: data.name ?? "",
          email: data.email ?? "",
          role: data.role ?? "customer",
          status: data.status ?? "active",
          phone: data.phone ?? "",
          company: data.company ?? "",
          locale: data.locale ?? "tr",
          notes: data.notes ?? "",
        });
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Güncelleme başarısız");
      setUser((u) => (u ? { ...u, ...editForm } : null));
      setEditingOverview(false);
      setEditingNotes(false);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleTrialAction = async (action: "start" | "reset" | "suspend") => {
    if (!id || !user) return;
    setActionLoading(`trial-${action}`);
    setError(null);
    try {
      const res = await fetch(`/api/users/${id}/trial/${action}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İşlem başarısız");
      fetchUser();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuickAction = async (action: "suspend" | "activate" | "promote" | "demote" | "send-reset") => {
    if (!id || !user) return;
    setActionLoading(action);
    setError(null);
    try {
      if (action === "send-reset") {
        const res = await fetch(`/api/users/${id}/send-reset`, { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gönderilemedi");
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 3000);
      } else {
        const body =
          action === "suspend" ? { status: "suspended" } :
          action === "activate" ? { status: "active" } :
          action === "promote" ? { role: "admin" } :
          { role: "customer" };
        const res = await fetch(`/api/users/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Güncelleme başarısız");
        fetchUser();
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-[#e6c800]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Kullanıcı bulunamadı.</p>
        <Link href="/admin/users" className="mt-4 inline-block text-[#0e0e0e] font-semibold hover:text-[#e6c800] transition-colors">
          Listeye dön
        </Link>
      </div>
    );
  }

  const getInitials = () => (user.name || user.email || "?").charAt(0).toUpperCase();
  const activeSubs = user.subscriptions.filter((s) => s.status === "active");
  const openTickets = user.supportTickets.filter((t) => t.status !== "closed");

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={user.name || user.email || "Kullanıcı"}
        subtitle={user.email ?? undefined}
        backHref="/admin/users"
        actions={
          <div className="flex flex-wrap gap-2">
            {user.status === "suspended" ? (
              <button
                onClick={() => handleQuickAction("activate")}
                disabled={!!actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
              >
                {actionLoading === "activate" ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Aktifleştir
              </button>
            ) : (
              <button
                onClick={() => handleQuickAction("suspend")}
                disabled={!!actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold disabled:opacity-50"
              >
                {actionLoading === "suspend" ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
                Askıya Al
              </button>
            )}
            {user.role !== "admin" && (
              <button
                onClick={() => handleQuickAction("promote")}
                disabled={!!actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium disabled:opacity-50"
              >
                {actionLoading === "promote" ? <Loader2 size={16} className="animate-spin" /> : <Crown size={16} />}
                Admin Yap
              </button>
            )}
            {user.role === "admin" && (
              <button
                onClick={() => handleQuickAction("demote")}
                disabled={!!actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium disabled:opacity-50"
              >
                {actionLoading === "demote" ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                Müşteri Yap
              </button>
            )}
            <button
              onClick={() => handleQuickAction("send-reset")}
              disabled={!!actionLoading || resetSuccess}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium disabled:opacity-50"
            >
              {actionLoading === "send-reset" ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
              {resetSuccess ? "Gönderildi" : "Şifre Sıfırla Gönder"}
            </button>
            {user.role === "customer" && (
              <>
                <button
                  onClick={() => handleTrialAction("start")}
                  disabled={!!actionLoading || user.trialStatus === "active"}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {actionLoading === "trial-start" ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                  Demo Başlat
                </button>
                <button
                  onClick={() => handleTrialAction("reset")}
                  disabled={!!actionLoading || user.trialStatus === "none"}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium disabled:opacity-50"
                >
                  {actionLoading === "trial-reset" ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                  Demo Sıfırla
                </button>
                <button
                  onClick={() => handleTrialAction("suspend")}
                  disabled={!!actionLoading || user.trialStatus !== "active"}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-200 hover:bg-amber-50 text-amber-700 text-sm font-medium disabled:opacity-50"
                >
                  {actionLoading === "trial-suspend" ? <Loader2 size={16} className="animate-spin" /> : <Pause size={16} />}
                  Demo Askıya Al
                </button>
              </>
            )}
          </div>
        }
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <AdminCard className="sticky top-24">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 mb-4">
              {user.image ? (
                <Image src={user.image} alt="" fill className="object-cover" sizes="80px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#0e0e0e] text-[#e6c800] text-2xl font-bold">
                  {getInitials()}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                  user.role === "admin" ? "bg-slate-100 text-slate-700" : user.role === "staff" ? "bg-violet-50 text-violet-700" : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {user.role === "admin" ? <Crown size={11} /> : <UserCheck size={11} />}
                {user.role === "admin" ? "Admin" : user.role === "staff" ? "Staff" : "Müşteri"}
              </span>
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                  user.status === "active" ? "bg-emerald-50 text-emerald-700" : user.status === "suspended" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                }`}
              >
                {user.status === "active" ? "Aktif" : user.status === "suspended" ? "Askıda" : "Beklemede"}
              </span>
            </div>
            <div className="space-y-2 text-sm text-slate-500">
              <p>Kayıt: {new Date(user.createdAt).toLocaleDateString("tr-TR")}</p>
              {user.lastLoginAt && <p>Son giriş: {new Date(user.lastLoginAt).toLocaleDateString("tr-TR")}</p>}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-slate-900">{activeSubs.length}</p>
                <p className="text-xs text-slate-500">Aktif abonelik</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{user._count.supportTickets}</p>
                <p className="text-xs text-slate-500">Destek talebi</p>
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-px">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
                  activeTab === t.id ? "border-[#0e0e0e] text-[#0e0e0e]" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <AdminCard>
              {editingOverview ? (
                <div className="space-y-4">
                  {["name", "email", "role", "status", "phone", "company", "locale"].map((field) => (
                    <div key={field}>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                        {field === "name" ? "Ad Soyad" : field === "email" ? "E-posta" : field === "role" ? "Rol" : field === "status" ? "Durum" : field === "phone" ? "Telefon" : field === "company" ? "Şirket" : "Dil"}
                      </label>
                      {field === "role" ? (
                        <select value={editForm.role} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl">
                          <option value="admin">Admin</option>
                          <option value="staff">Staff</option>
                          <option value="customer">Müşteri</option>
                        </select>
                      ) : field === "status" ? (
                        <select value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl">
                          <option value="active">Aktif</option>
                          <option value="suspended">Askıda</option>
                          <option value="pending">Beklemede</option>
                        </select>
                      ) : field === "locale" ? (
                        <select value={editForm.locale} onChange={(e) => setEditForm((f) => ({ ...f, locale: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl">
                          <option value="tr">Türkçe</option>
                          <option value="en">English</option>
                        </select>
                      ) : (
                        <input
                          type={field === "email" ? "email" : "text"}
                          value={(editForm as Record<string, string>)[field]}
                          onChange={(e) => setEditForm((f) => ({ ...f, [field]: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#e6c800]/30 focus:border-[#e6c800]/50"
                        />
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving} className="px-4 py-2.5 bg-[#0e0e0e] text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50">
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Kaydet
                    </button>
                    <button onClick={() => { setEditingOverview(false); setEditForm({ name: user.name ?? "", email: user.email ?? "", role: user.role, status: user.status, phone: user.phone ?? "", company: user.company ?? "", locale: user.locale ?? "tr", notes: user.notes ?? "" }); }} className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50">İptal</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900">Genel Bilgiler</h3>
                    <button onClick={() => setEditingOverview(true)} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                      <Edit size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                        <Zap size={14} /> Demo Durumu
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-slate-500">Durum</p>
                          <p className="font-medium text-slate-900">{user.trialStatus === "active" ? "Aktif" : user.trialStatus === "expired" ? "Sona erdi" : user.trialStatus === "converted" ? "Dönüştü" : "Yok"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">E-posta Doğr.</p>
                          <p className="font-medium text-slate-900">{user.emailVerified ? "✓ Evet" : "— Hayır"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Başlangıç</p>
                          <p className="font-medium text-slate-900">{user.trialStartedAt ? new Date(user.trialStartedAt).toLocaleDateString("tr-TR") : "—"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Bitiş</p>
                          <p className="font-medium text-slate-900">{user.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString("tr-TR") : "—"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Kullanım</p>
                          <p className="font-medium text-slate-900">{user.trialOperationsUsed ?? 0} / {user.trialOperationsLimit ?? 20}</p>
                        </div>
                      </div>
                    </div>
                    {[
                      { icon: Mail, label: "E-posta", value: user.email ?? "—" },
                      { icon: Phone, label: "Telefon", value: user.phone ?? "—" },
                      { icon: Building, label: "Şirket", value: user.company ?? "—" },
                      { icon: Globe, label: "Dil", value: user.locale === "en" ? "English" : "Türkçe" },
                      { icon: Calendar, label: "Kayıt", value: new Date(user.createdAt).toLocaleDateString("tr-TR") },
                      { icon: Shield, label: "Son giriş", value: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("tr-TR") : "—" },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80">
                        <Icon size={18} className="text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500">{label}</p>
                          <p className="text-slate-700 font-medium">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </AdminCard>
          )}

          {activeTab === "products" && (
            <AdminCard>
              <h3 className="font-bold text-slate-900 mb-4">Abonelikler</h3>
              {user.subscriptions.length === 0 ? (
                <p className="text-slate-500 text-sm py-4">Abonelik bulunamadı.</p>
              ) : (
                <div className="space-y-3">
                  {user.subscriptions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
                      <div>
                        <p className="font-medium text-slate-900">{s.product.name}</p>
                        {s.endsAt && <p className="text-xs text-slate-500 mt-0.5">Bitiş: {new Date(s.endsAt).toLocaleDateString("tr-TR")}</p>}
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                        s.status === "active" ? "bg-emerald-50 text-emerald-700" : s.status === "pending_approval" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {s.status === "active" ? "Aktif" : s.status === "pending_approval" ? "Onay Bekliyor" : "Pasif"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>
          )}

          {activeTab === "payments" && (
            <AdminCard>
              <h3 className="font-bold text-slate-900 mb-4">Ödemeler</h3>
              {user.payments.length === 0 ? (
                <p className="text-slate-500 text-sm py-4">Ödeme kaydı bulunamadı.</p>
              ) : (
                <div className="space-y-3">
                  {user.payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
                      <div>
                        <p className="font-medium text-slate-900">{p.amount} TL</p>
                        {p.product && <p className="text-xs text-slate-500">{p.product.name}</p>}
                        <p className="text-xs text-slate-500">{new Date(p.createdAt).toLocaleDateString("tr-TR")}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                        p.status === "approved" ? "bg-emerald-50 text-emerald-700" : p.status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {p.status === "approved" ? "Onaylı" : p.status === "rejected" ? "Reddedildi" : "Beklemede"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>
          )}

          {activeTab === "support" && (
            <AdminCard>
              <h3 className="font-bold text-slate-900 mb-4">Destek Talepleri</h3>
              {user.supportTickets.length === 0 ? (
                <p className="text-slate-500 text-sm py-4">Destek talebi bulunamadı.</p>
              ) : (
                <div className="space-y-3">
                  {user.supportTickets.map((t) => (
                    <Link key={t.id} href="/admin/support" className="block p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                      <p className="font-medium text-slate-900">{t.subject}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(t.createdAt).toLocaleDateString("tr-TR")} · {t.status === "open" ? "Açık" : t.status === "in_progress" ? "İnceleniyor" : t.status === "answered" ? "Yanıtlandı" : "Kapalı"}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs text-[#e6c800] font-medium mt-2">
                        Destek sayfasına git <ExternalLink size={12} />
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </AdminCard>
          )}

          {activeTab === "blog" && (
            <AdminCard>
              <h3 className="font-bold text-slate-900 mb-4">Blog Etkileşimi</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-2xl font-bold text-slate-900">{user._count.blogComments}</p>
                  <p className="text-sm text-slate-500">Yorum</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-2xl font-bold text-slate-900">{user._count.blogLikes}</p>
                  <p className="text-sm text-slate-500">Beğeni</p>
                </div>
              </div>
              {user.blogComments.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Son Yorumlar</h4>
                  <div className="space-y-3">
                    {user.blogComments.slice(0, 5).map((c) => (
                      <div key={c.id} className="p-3 rounded-xl border border-slate-100 bg-white">
                        <p className="text-sm text-slate-700 line-clamp-2">{c.content}</p>
                        {c.post && (
                          <Link href={`/blog/${c.post.slug}`} className="text-xs text-[#e6c800] font-medium mt-1 inline-flex items-center gap-1">
                            {c.post.title_tr} <ExternalLink size={10} />
                          </Link>
                        )}
                        <p className="text-xs text-slate-400 mt-1">{new Date(c.created_at).toLocaleDateString("tr-TR")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </AdminCard>
          )}

          {activeTab === "notes" && (
            <AdminCard>
              <h3 className="font-bold text-slate-900 mb-4">Admin Notları</h3>
              {editingNotes ? (
                <div className="space-y-4">
                  <textarea
                    rows={6}
                    value={editForm.notes}
                    onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-[#e6c800]/30 focus:border-[#e6c800]/50"
                    placeholder="İç notlar..."
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving} className="px-4 py-2.5 bg-[#0e0e0e] text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50">
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Kaydet
                    </button>
                    <button onClick={() => setEditingNotes(false)} className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50">İptal</button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-slate-700 whitespace-pre-wrap">{user.notes || "Not yok."}</p>
                  <button onClick={() => setEditingNotes(true)} className="mt-4 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                    Düzenle
                  </button>
                </div>
              )}
            </AdminCard>
          )}

          {activeTab === "security" && (
            <AdminCard>
              <h3 className="font-bold text-slate-900 mb-4">Güvenlik</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <p className="text-sm font-medium text-slate-700">Hesap Durumu</p>
                  <p className="text-slate-600 mt-1">{user.status === "active" ? "Hesap aktif." : user.status === "suspended" ? "Hesap askıya alınmış." : "Hesap beklemede."}</p>
                </div>
                {user.passwordResetTokens && user.passwordResetTokens.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Şifre Sıfırlama Geçmişi</p>
                    <div className="space-y-2">
                      {user.passwordResetTokens.map((t) => (
                        <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 text-sm">
                          <span>{new Date(t.createdAt).toLocaleString("tr-TR")}</span>
                          <span className={t.usedAt ? "text-emerald-600" : "text-amber-600"}>
                            {t.usedAt ? "Kullanıldı" : "Beklemede"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleQuickAction("send-reset")}
                    disabled={!!actionLoading || resetSuccess}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium disabled:opacity-50"
                  >
                    {actionLoading === "send-reset" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {resetSuccess ? "E-posta gönderildi" : "Şifre sıfırlama e-postası gönder"}
                  </button>
                </div>
              </div>
            </AdminCard>
          )}
        </div>
      </div>
    </div>
  );
}
