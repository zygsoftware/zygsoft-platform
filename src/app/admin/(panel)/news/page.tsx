"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
  Edit,
  Eye,
  EyeOff,
  FolderOpen,
  Loader2,
  Newspaper,
  Plus,
  Search,
  Send,
  Star,
  StarOff,
  Tag,
  Trash2,
} from "lucide-react";
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

export default function AdminNewsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "yes" | "no">("all");
  const [missingEnFilter, setMissingEnFilter] = useState(false);
  const [missingSeoFilter, setMissingSeoFilter] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "updated" | "popular">("newest");
  const [search, setSearch] = useState("");

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      params.set("all", "true");
      params.set("limit", "200");
      params.set("sort", sortBy === "updated" ? "updated" : sortBy === "popular" ? "popular" : "published");
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/news?${params}`);
      const data = await res.json();
      setPosts(data.posts ?? []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchPosts(), search ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [search, sortBy]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu haberi kalıcı olarak silmek istediğinizden emin misiniz?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/blog/${id}`, { method: "DELETE" });
      fetchPosts();
      toast.success("Haber silindi.");
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
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Kopyalama başarısız");
      }
      const data = await res.json();
      router.push(`/admin/news/edit/${data.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kopyalama başarısız");
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
      if (!res.ok) {
        throw new Error(data.error || "İşlem başarısız.");
      }
      toast.success(action === "publish" ? "Haber yayına alındı." : action === "unpublish" ? "Haber taslağa çekildi." : "Haber güncellendi.");
      fetchPosts();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "İşlem başarısız.");
    } finally {
      setActionId(null);
    }
  };

  const isEnComplete = (post: Post) => !!(post.title_en?.trim() && post.excerpt_en?.trim() && post.content_en?.trim());
  const hasSeo = (post: Post) => !!((post.seo_title_tr?.trim() || post.seo_title_en?.trim()) && (post.seo_description_tr?.trim() || post.seo_description_en?.trim()));

  const filtered = posts.filter((post) => {
    if (statusFilter === "published" && !post.published) return false;
    if (statusFilter === "draft" && post.published) return false;
    if (featuredFilter === "yes" && !post.is_featured) return false;
    if (featuredFilter === "no" && post.is_featured) return false;
    if (missingEnFilter && isEnComplete(post)) return false;
    if (missingSeoFilter && hasSeo(post)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "updated") return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    if (sortBy === "popular") return (b.view_count ?? 0) - (a.view_count ?? 0);
    return new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime();
  });

  const stats = useMemo(() => ({
    total: posts.length,
    published: posts.filter((post) => post.published).length,
    draft: posts.filter((post) => !post.published).length,
    featured: posts.filter((post) => post.is_featured).length,
    totalViews: posts.reduce((sum, post) => sum + (post.view_count ?? 0), 0),
  }), [posts]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Haber Merkezi"
        subtitle="Güncel haberleri üretin, öne çıkarın ve yayın akışını yönetin."
        actions={
          <>
            <Link href="/admin/news/new" className="inline-flex items-center gap-2 bg-[#0e0e0e] hover:bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
              <Plus size={18} /> Yeni Haber
            </Link>
            <Link href="/admin/blog/categories" className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
              <FolderOpen size={18} /> Kategoriler
            </Link>
            <Link href="/admin/blog/tags" className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
              <Tag size={18} /> Etiketler
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <AdminStatsCard label="Toplam Haber" value={stats.total} icon={<Newspaper size={20} />} accent="slate" />
        <AdminStatsCard label="Yayında" value={stats.published} icon={<CheckCircle size={20} />} accent="emerald" />
        <AdminStatsCard label="Taslak" value={stats.draft} icon={<Clock size={20} />} accent="default" />
        <AdminStatsCard label="Toplam Görüntülenme" value={stats.totalViews} icon={<Eye size={20} />} accent="amber" />
      </div>

      <AdminCard className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Başlık veya özet içinde ara..."
              className="w-full rounded-xl border border-slate-200 pl-11 pr-4 py-3 text-sm outline-none focus:border-[#e6c800]/70 focus:ring-2 focus:ring-[#e6c800]/20"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm">
              <option value="all">Tüm durumlar</option>
              <option value="published">Yayında</option>
              <option value="draft">Taslak</option>
            </select>
            <select value={featuredFilter} onChange={(event) => setFeaturedFilter(event.target.value as typeof featuredFilter)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm">
              <option value="all">Tüm öne çıkanlar</option>
              <option value="yes">Sadece öne çıkanlar</option>
              <option value="no">Öne çıkmayanlar</option>
            </select>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm">
              <option value="newest">En yeni</option>
              <option value="updated">Son güncellenen</option>
              <option value="popular">En popüler</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600">
            <input type="checkbox" checked={missingEnFilter} onChange={(event) => setMissingEnFilter(event.target.checked)} />
            İngilizce eksikleri göster
          </label>
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600">
            <input type="checkbox" checked={missingSeoFilter} onChange={(event) => setMissingSeoFilter(event.target.checked)} />
            SEO eksikleri göster
          </label>
        </div>
      </AdminCard>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 size={30} className="animate-spin text-slate-400" />
        </div>
      ) : sorted.length === 0 ? (
        <AdminCard className="p-12 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Newspaper size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Henüz haber yok</h3>
          <p className="mt-2 text-sm text-slate-500">İlk haberi oluşturup haber sitenizin editoryal akışını başlatın.</p>
        </AdminCard>
      ) : (
        <div className="grid gap-5">
          {sorted.map((post) => {
            const title = post.title_tr || post.title_en;
            const excerpt = post.excerpt_tr || post.excerpt_en;

            return (
              <AdminCard key={post.id} className="p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <AdminBadge variant={post.published ? "published" : "draft"} />
                      {post.is_featured && <AdminBadge variant="featured" label="Manşet" />}
                      {!isEnComplete(post) && <AdminBadge variant="pending" label="EN eksik" />}
                      {!hasSeo(post) && <AdminBadge variant="pending" label="SEO eksik" />}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                    <p className="mt-2 line-clamp-2 max-w-4xl text-sm leading-6 text-slate-500">{excerpt}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
                      <span>Slug: /haberler/{post.slug}</span>
                      <span>{post.published_at ? new Date(post.published_at).toLocaleString("tr-TR") : "Yayın tarihi yok"}</span>
                      <span>{post.view_count ?? 0} görüntülenme</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:max-w-[360px] lg:justify-end">
                    <button onClick={() => handleQuickAction(post.id, post.published ? "unpublish" : "publish")} disabled={actionId === post.id} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                      {post.published ? <EyeOff size={16} /> : <Send size={16} />}
                      {post.published ? "Taslağa Al" : "Yayınla"}
                    </button>
                    <button onClick={() => handleQuickAction(post.id, post.is_featured ? "unfeature" : "feature")} disabled={actionId === post.id} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                      {post.is_featured ? <StarOff size={16} /> : <Star size={16} />}
                      {post.is_featured ? "Manşetten Çıkar" : "Manşete Al"}
                    </button>
                    <Link href={`/admin/news/edit/${post.id}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                      <Edit size={16} /> Düzenle
                    </Link>
                    <a href={`/haberler/${post.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                      <Eye size={16} /> Gör
                    </a>
                    <button onClick={() => handleDuplicate(post.id)} disabled={duplicatingId === post.id} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                      {duplicatingId === post.id ? <Loader2 size={16} className="animate-spin" /> : <Copy size={16} />}
                      Kopyala
                    </button>
                    <button onClick={() => handleDelete(post.id)} disabled={deletingId === post.id} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                      {deletingId === post.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      Sil
                    </button>
                  </div>
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}

      <AdminCard className="p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 text-amber-500" />
          <div>
            <h4 className="text-sm font-bold text-slate-900">Editoryal not</h4>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Haberler alanı blogdan tamamen ayrıdır. Buradaki içerikler public tarafta <strong>/haberler</strong> altında yayınlanır ve blog listesinde görünmez.
            </p>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
