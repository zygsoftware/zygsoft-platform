"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Check, X, Trash2, Loader2, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { AdminCard, AdminPageHeader } from "@/components/admin";

type Comment = {
  id: string;
  content: string;
  status: string;
  name: string | null;
  email: string | null;
  created_at: string;
  post: { id: string; slug: string; title_tr: string; title_en: string };
  user: { id: string; name: string | null; email: string | null } | null;
};

const STATUS_TABS = [
  { id: "pending" as const, label: "Bekleyen" },
  { id: "approved" as const, label: "Onaylı" },
  { id: "rejected" as const, label: "Reddedilen" },
  { id: "all" as const, label: "Tümü" },
];

export default function AdminBlogCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/blog/comments?${params}`);
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [statusFilter]);

  const handleApprove = async (id: string) => {
    setActioningId(id);
    try {
      await fetch(`/api/blog/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      fetchComments();
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActioningId(id);
    try {
      await fetch(`/api/blog/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      fetchComments();
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;
    setActioningId(id);
    try {
      await fetch(`/api/blog/comments/${id}`, { method: "DELETE" });
      fetchComments();
    } finally {
      setActioningId(null);
    }
  };

  const displayName = (c: Comment) => c.user?.name || c.name || "Anonim";
  const displayEmail = (c: Comment) => c.user?.email || c.email || "";

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200",
    };
    const label: Record<string, string> = {
      approved: "Onaylı",
      rejected: "Reddedildi",
      pending: "Bekliyor",
    };
    return (
      <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-xs font-bold border ${map[status] || "bg-slate-100 text-slate-600"}`}>
        {label[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Yorum Yönetimi"
        subtitle="Blog yorumlarını onaylayın, reddedin veya silin."
        backHref="/admin/blog"
      />

      {/* Status tabs */}
      <AdminCard padding="sm">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                statusFilter === tab.id
                  ? "bg-[#0e0e0e] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </AdminCard>

      {/* Comments list */}
      <AdminCard padding="none">
        {loading ? (
          <div className="p-16 text-center flex items-center justify-center gap-3 text-slate-400">
            <Loader2 size={24} className="animate-spin text-[#e6c800]" />
            <span className="font-medium">Yükleniyor...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
              <MessageSquare size={32} />
            </div>
            <p className="text-slate-500 font-medium text-lg">Bu filtreye uygun yorum yok.</p>
            <Link
              href="/admin/blog"
              className="mt-4 inline-flex items-center gap-2 text-[#0e0e0e] font-semibold hover:text-[#e6c800] transition-colors"
            >
              <ArrowLeft size={18} /> Bloga dön
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {comments.map((c) => (
              <div
                key={c.id}
                className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 font-medium leading-relaxed">{c.content}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span className="font-medium text-slate-700">{displayName(c)}</span>
                    {displayEmail(c) && <span>{displayEmail(c)}</span>}
                    <span>{new Date(c.created_at).toLocaleDateString("tr-TR", { dateStyle: "medium", timeStyle: "short" })}</span>
                  </div>
                  <Link
                    href={`/blog/${c.post.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 mt-2 text-sm text-[#0e0e0e] hover:text-[#e6c800] font-medium transition-colors"
                  >
                    <ExternalLink size={14} />
                    {c.post.title_tr || c.post.title_en}
                  </Link>
                  <div className="mt-2">{statusBadge(c.status)}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {c.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(c.id)}
                        disabled={actioningId === c.id}
                        className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors disabled:opacity-50"
                        title="Onayla"
                      >
                        {actioningId === c.id ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                      </button>
                      <button
                        onClick={() => handleReject(c.id)}
                        disabled={actioningId === c.id}
                        className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                        title="Reddet"
                      >
                        <X size={18} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={actioningId === c.id}
                    className="p-2.5 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors disabled:opacity-50"
                    title="Sil"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
