"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  Loader2,
  BookOpen,
  ExternalLink,
  FolderOpen,
  Tag,
  MessageSquare,
  Star,
  StarOff,
  Send,
  EyeOff,
  AlertTriangle,
  Search,
  Eye,
  Copy,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { AdminCard, AdminStatsCard, AdminPageHeader, AdminBadge } from "@/components/admin";

type Post = {
  id: string;
  slug: string;
  title_tr: string;
  title_en: string;
  excerpt_tr: string;
  excerpt_en: string;
  content_tr: string;
  content_en: string;
  seo_title_tr: string | null;
  seo_title_en: string | null;
  seo_description_tr: string | null;
  seo_description_en: string | null;
  published: boolean;
  is_featured: boolean;
  allow_comments: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  view_count: number;
  category: { id: string; name_tr: string; name_en: string; slug: string } | null;
  tags: { tag: { id: string; name: string; slug: string } }[];
  _count?: { comments: number; likes: number };
};

type Category = { id: string; name_tr: string; name_en: string; slug: string };

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "yes" | "no">("all");
  const [commentsFilter, setCommentsFilter] = useState<"all" | "on" | "off">("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [missingEnFilter, setMissingEnFilter] = useState(false);
  const [missingSeoFilter, setMissingSeoFilter] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "updated" | "popular">("newest");
  const [search, setSearch] = useState("");

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      params.set("all", "true");
      params.set("limit", "200");
      if (categoryFilter) params.set("category", categoryFilter);
      if (featuredFilter === "yes") params.set("featured", "true");
      if (commentsFilter === "on") params.set("allow_comments", "true");
      if (commentsFilter === "off") params.set("allow_comments", "false");
      params.set("sort", sortBy === "updated" ? "updated" : sortBy === "popular" ? "popular" : "published");
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/blog?${params}`);
      const data = await res.json();
      setPosts(data.posts ?? []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/blog/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchPosts(), search ? 300 : 0);
    return () => clearTimeout(t);
  }, [categoryFilter, featuredFilter, commentsFilter, sortBy, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu içeriği kalıcı olarak silmek istediğinizden emin misiniz?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/blog/${id}`, { method: "DELETE" });
      fetchPosts();
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    setDuplicatingId(id);
    try {
      const res = await fetch("/api/blog/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = `/admin/blog/edit/${data.id}`;
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Kopyalama başarısız");
      }
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleQuickAction = async (id: string, action: "publish" | "unpublish" | "feature" | "unfeature") => {
    setActionId(id);
    try {
      const body =
        action === "publish"
          ? { published: true }
          : action === "unpublish"
            ? { published: false }
            : action === "feature"
              ? { is_featured: true }
              : { is_featured: false };
      const res = await fetch(`/api/blog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        fetchPosts();
        router.refresh();
        toast.success(action === "publish" ? "Yazı yayınlandı." : action === "unpublish" ? "Yazı taslağa alındı." : "Güncellendi.");
      } else {
        toast.error(data.error || "İşlem başarısız.");
      }
    } finally {
      setActionId(null);
    }
  };

  const isEnComplete = (p: Post) => !!(p.title_en?.trim() && p.excerpt_en?.trim() && p.content_en?.trim());
  const hasSeo = (p: Post) =>
    !!(
      (p.seo_title_tr?.trim() || p.seo_title_en?.trim()) &&
      (p.seo_description_tr?.trim() || p.seo_description_en?.trim())
    );

  const filtered = posts.filter((p) => {
    if (statusFilter === "published" && !p.published) return false;
    if (statusFilter === "draft" && p.published) return false;
    if (featuredFilter === "yes" && !p.is_featured) return false;
    if (featuredFilter === "no" && p.is_featured) return false;
    if (commentsFilter === "on" && !p.allow_comments) return false;
    if (commentsFilter === "off" && p.allow_comments) return false;
    if (missingEnFilter && isEnComplete(p)) return false;
    if (missingSeoFilter && hasSeo(p)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "updated") return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    if (sortBy === "popular") return (b.view_count ?? 0) - (a.view_count ?? 0);
    return new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime();
  });

  const stats = useMemo(
    () => ({
      total: posts.length,
      published: posts.filter((p) => p.published).length,
      draft: posts.filter((p) => !p.published).length,
      featured: posts.filter((p) => p.is_featured).length,
      totalViews: posts.reduce((s, p) => s + (p.view_count ?? 0), 0),
      totalComments: posts.reduce((s, p) => s + (p._count?.comments ?? 0), 0),
    }),
    [posts]
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Blog Yönetimi"
        subtitle="Blog yazılarını yönetin, filtreleyin ve düzenleyin."
        actions={
          <>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center gap-2 bg-[#0e0e0e] hover:bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              <Plus size={18} /> Yeni Blog Yazısı
            </Link>
            <Link
              href="/admin/blog/categories"
              className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <FolderOpen size={18} /> Kategoriler
            </Link>
            <Link
              href="/admin/blog/tags"
              className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <Tag size={18} /> Etiketler
            </Link>
            <Link
              href="/admin/blog/comments"
              className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <MessageSquare size={18} /> Yorumlar
            </Link>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <AdminStatsCard
          label="Toplam"
          value={stats.total}
          icon={<BookOpen size={20} />}
          accent="slate"
        />
        <AdminStatsCard
          label="Yayında"
          value={stats.published}
          icon={<CheckCircle size={20} />}
          accent="emerald"
        />
        <AdminStatsCard
          label="Taslak"
          value={stats.draft}
          icon={<Clock size={20} />}
          accent="default"
        />
        <AdminStatsCard
          label="Öne Çıkan"
          value={stats.featured}
          icon={<Star size={20} />}
          accent="violet"
        />
        <AdminStatsCard
          label="Görüntülenme"
          value={stats.totalViews}
          icon={<Eye size={20} />}
          accent="gold"
        />
        <AdminStatsCard
          label="Yorum"
          value={stats.totalComments}
          icon={<MessageSquare size={20} />}
          accent="emerald"
        />
      </div>

      {/* Filter bar */}
      <AdminCard padding="md">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Başlık veya özet ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e6c800]/30 focus:border-[#e6c800]/50 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "published", "draft"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    statusFilter === s
                      ? "bg-[#0e0e0e] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s === "all" ? "Tüm Durum" : s === "published" ? "Yayında" : "Taslak"}
                </button>
              ))}
              {(["all", "yes", "no"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFeaturedFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    featuredFilter === f ? "bg-[#0e0e0e] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f === "all" ? "Öne Çıkan" : f === "yes" ? "Evet" : "Hayır"}
                </button>
              ))}
              {(["all", "on", "off"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCommentsFilter(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    commentsFilter === c ? "bg-[#0e0e0e] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Yorum {c === "all" ? "" : c === "on" ? "Açık" : "Kapalı"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-white min-w-[160px]"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_tr}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-white"
            >
              <option value="newest">En Yeni</option>
              <option value="updated">Son Güncelleme</option>
              <option value="popular">En Çok Görüntülenen</option>
            </select>
            <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={missingEnFilter}
                onChange={(e) => setMissingEnFilter(e.target.checked)}
                className="rounded"
              />
              <span className="flex items-center gap-1 text-amber-600">
                <AlertTriangle size={14} /> EN eksik
              </span>
            </label>
            <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={missingSeoFilter}
                onChange={(e) => setMissingSeoFilter(e.target.checked)}
                className="rounded"
              />
              <span className="flex items-center gap-1 text-amber-600">
                <AlertTriangle size={14} /> SEO eksik
              </span>
            </label>
          </div>
        </div>
      </AdminCard>

      {/* Table */}
      <AdminCard padding="none">
        {loading ? (
          <div className="p-16 text-center flex items-center justify-center gap-3 text-slate-400">
            <Loader2 size={24} className="animate-spin text-[#e6c800]" />
            <span className="font-medium">Yükleniyor...</span>
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
              <BookOpen size={32} />
            </div>
            <p className="text-slate-500 font-medium text-lg">
              {filtered.length === 0 && posts.length > 0
                ? "Filtrelere uygun yazı bulunamadı."
                : "Henüz blog yazısı yok."}
            </p>
            {posts.length === 0 && (
              <Link
                href="/admin/blog/new"
                className="inline-flex items-center gap-2 mt-4 text-[#0e0e0e] font-semibold hover:text-[#e6c800] transition-colors"
              >
                <Plus size={18} /> İlk yazıyı ekle
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/50">
                  <th className="px-4 py-3 text-left max-w-[320px]">Başlık</th>
                  <th className="px-4 py-3 w-[120px]">Durum</th>
                  <th className="px-4 py-3 w-[180px] hidden lg:table-cell">Kategori</th>
                  <th className="px-4 py-3 w-[100px] text-center hidden md:table-cell">Görüntülenme</th>
                  <th className="px-4 py-3 w-[100px] text-center hidden md:table-cell">Yorum</th>
                  <th className="px-4 py-3 w-[100px] text-center hidden md:table-cell">Beğeni</th>
                  <th className="px-4 py-3 w-[220px] text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((post) => (
                  <tr
                    key={post.id}
                    className={`transition-colors ${!post.published ? "bg-amber-50/50" : ""}`}
                  >
                    <td className="px-4 py-3 max-w-[320px]">
                      <div className="max-w-[320px]">
                        <div className="flex items-start gap-2">
                          <div className="font-medium text-sm line-clamp-2 min-w-0 flex-1">
                            {post.title_tr}
                          </div>
                          {!post.published && (
                            <span className="shrink-0 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                              Taslak
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 font-mono">/blog/{post.slug}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 w-[120px]">
                      <AdminBadge variant={post.published ? "published" : "draft"} label={post.published ? "Yayında" : "Taslak"} />
                    </td>
                    <td className="px-4 py-3 w-[180px] hidden lg:table-cell text-slate-600 text-sm">
                      {post.category?.name_tr ?? "—"}
                    </td>
                    <td className="px-4 py-3 w-[100px] text-center hidden md:table-cell text-slate-600 font-medium">
                      {post.view_count ?? 0}
                    </td>
                    <td className="px-4 py-3 w-[100px] text-center hidden md:table-cell text-slate-600 font-medium">
                      {post._count?.comments ?? 0}
                    </td>
                    <td className="px-4 py-3 w-[100px] text-center hidden md:table-cell text-slate-600 font-medium">
                      {post._count?.likes ?? 0}
                    </td>
                    <td className="px-4 py-3 w-[220px] text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <Link
                          href={`/admin/blog/edit/${post.id}`}
                          className="px-3 py-1.5 text-xs rounded-md border border-slate-200 hover:bg-slate-50 font-medium"
                        >
                          Düzenle
                        </Link>
                        <a
                          href={post.published ? `/blog/${post.slug}` : `/admin/blog/preview/${post.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-xs rounded-md border border-slate-200 hover:bg-slate-50 font-medium"
                        >
                          Önizle
                        </a>
                        {!post.published && (
                          <button
                            onClick={() => handleQuickAction(post.id, "publish")}
                            disabled={actionId === post.id}
                            className="px-3 py-1.5 text-xs rounded-md bg-emerald-500 text-white hover:bg-emerald-600 font-medium disabled:opacity-50 flex items-center gap-1"
                          >
                            {actionId === post.id ? <Loader2 size={12} className="animate-spin" /> : (<>Yayınla</>)}
                          </button>
                        )}
                        {post.published && (
                          <button
                            onClick={() => handleQuickAction(post.id, "unpublish")}
                            disabled={actionId === post.id}
                            className="px-3 py-1.5 text-xs rounded-md bg-amber-500 text-white hover:bg-amber-600 font-medium disabled:opacity-50 flex items-center gap-1"
                          >
                            {actionId === post.id ? <Loader2 size={12} className="animate-spin" /> : (<>Taslağa Al</>)}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={deletingId === post.id}
                          className="px-3 py-1.5 text-xs rounded-md bg-red-500 text-white hover:bg-red-600 font-medium disabled:opacity-50 flex items-center gap-1"
                        >
                          {deletingId === post.id ? <Loader2 size={12} className="animate-spin" /> : (<>Sil</>)}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {sorted.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center bg-slate-50/30">
            <span>
              {sorted.length} / {posts.length} yazı gösteriliyor
            </span>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
