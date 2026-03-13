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
    FolderKanban,
    ExternalLink,
    Star,
    StarOff,
    Search,
    Eye,
    AlertTriangle,
    FolderOpen,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { AdminCard, AdminStatsCard, AdminPageHeader, AdminBadge } from "@/components/admin";

type Project = {
    id: string;
    slug: string;
    title_tr: string;
    title_en: string;
    excerpt_tr: string;
    excerpt_en: string;
    sector: string | null;
    category_id: string | null;
    category: { id: string; name_tr: string; name_en: string; slug: string } | null;
    published: boolean;
    featured: boolean;
    cover_image: string | null;
    seo_title_tr: string | null;
    seo_title_en: string | null;
    seo_description_tr: string | null;
    seo_description_en: string | null;
    cover_image_alt_tr: string | null;
    cover_image_alt_en: string | null;
    updated_at: string;
    published_at: string | null;
};

type Category = { id: string; name_tr: string; name_en: string; slug: string };

export default function AdminProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [actionId, setActionId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
    const [featuredFilter, setFeaturedFilter] = useState<"all" | "yes" | "no">("all");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [missingEnFilter, setMissingEnFilter] = useState(false);
    const [missingSeoFilter, setMissingSeoFilter] = useState(false);
    const [missingAltFilter, setMissingAltFilter] = useState(false);
    const [sortBy, setSortBy] = useState<"newest" | "updated" | "sort_order">("newest");
    const [search, setSearch] = useState("");

    const fetchProjects = async () => {
        try {
            const params = new URLSearchParams();
            params.set("all", "true");
            params.set("limit", "200");
            if (categoryFilter) params.set("category", categoryFilter);
            if (featuredFilter === "yes") params.set("featured", "true");
            if (search.trim()) params.set("search", search.trim());
            params.set("sort", sortBy === "updated" ? "updated" : sortBy === "sort_order" ? "sort_order" : "newest");
            const res = await fetch(`/api/projects?${params}`);
            const data = await res.json();
            setProjects(data.projects ?? []);
        } catch {
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch("/api/projects/categories")
            .then((r) => r.json())
            .then((d) => setCategories(Array.isArray(d) ? d : []))
            .catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        const t = setTimeout(() => fetchProjects(), search ? 300 : 0);
        return () => clearTimeout(t);
    }, [categoryFilter, featuredFilter, sortBy, search]);

    const handleDelete = async (id: string) => {
        if (!confirm("Bu projeyi kalıcı olarak silmek istediğinize emin misiniz?")) return;
        setDeletingId(id);
        try {
            await fetch(`/api/projects/${id}`, { method: "DELETE" });
            fetchProjects();
            toast.success("Proje silindi.");
        } catch {
            toast.error("Silinemedi.");
        } finally {
            setDeletingId(null);
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
                            ? { featured: true }
                            : { featured: false };
            const res = await fetch(`/api/projects/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (res.ok) {
                fetchProjects();
                router.refresh();
                toast.success(action === "publish" ? "Proje yayınlandı." : action === "unpublish" ? "Proje taslağa alındı." : "Güncellendi.");
            } else {
                toast.error(data.error || "İşlem başarısız.");
            }
        } finally {
            setActionId(null);
        }
    };

    const isEnComplete = (p: Project) => !!(p.title_en?.trim() && p.excerpt_en?.trim());
    const hasSeo = (p: Project) =>
        !!(
            (p.seo_title_tr?.trim() || p.seo_title_en?.trim()) &&
            (p.seo_description_tr?.trim() || p.seo_description_en?.trim())
        );
    const hasCoverAlt = (p: Project) => !!(p.cover_image && (p.cover_image_alt_tr?.trim() || p.cover_image_alt_en?.trim()));

    const filtered = projects.filter((p) => {
        if (statusFilter === "published" && !p.published) return false;
        if (statusFilter === "draft" && p.published) return false;
        if (featuredFilter === "yes" && !p.featured) return false;
        if (featuredFilter === "no" && p.featured) return false;
        if (categoryFilter && p.category_id !== categoryFilter) return false;
        if (missingEnFilter && isEnComplete(p)) return false;
        if (missingSeoFilter && hasSeo(p)) return false;
        if (missingAltFilter && hasCoverAlt(p)) return false;
        return true;
    });

    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === "updated") return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        if (sortBy === "sort_order") {
            const ao = (a as any).sort_order ?? 999;
            const bo = (b as any).sort_order ?? 999;
            if (ao !== bo) return ao - bo;
        }
        return new Date(b.published_at || b.updated_at).getTime() - new Date(a.published_at || a.updated_at).getTime();
    });

    const stats = useMemo(
        () => ({
            total: projects.length,
            published: projects.filter((p) => p.published).length,
            draft: projects.filter((p) => !p.published).length,
            featured: projects.filter((p) => p.featured).length,
        }),
        [projects]
    );

    return (
        <div className="space-y-8 min-w-0 w-full max-w-full">
            <AdminPageHeader
                title="Projeler"
                subtitle="Portfolyo ve case study projelerini yönetin."
                actions={
                    <>
                        <Link
                            href="/admin/projects/new"
                            className="inline-flex items-center gap-2 bg-[#0e0e0e] hover:bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
                        >
                            <Plus size={18} /> Yeni Proje Ekle
                        </Link>
                        <Link
                            href="/admin/projects/categories"
                            className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                        >
                            <FolderOpen size={18} /> Kategoriler
                        </Link>
                    </>
                }
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <AdminStatsCard label="Toplam" value={stats.total} icon={<FolderKanban size={20} />} accent="slate" />
                <AdminStatsCard label="Yayında" value={stats.published} icon={<CheckCircle size={20} />} accent="emerald" />
                <AdminStatsCard label="Taslak" value={stats.draft} icon={<Clock size={20} />} accent="default" />
                <AdminStatsCard label="Öne Çıkan" value={stats.featured} icon={<Star size={20} />} accent="violet" />
            </div>

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
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${statusFilter === s ? "bg-[#0e0e0e] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                                >
                                    {s === "all" ? "Tüm Durum" : s === "published" ? "Yayında" : "Taslak"}
                                </button>
                            ))}
                            {(["all", "yes", "no"] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFeaturedFilter(f)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${featuredFilter === f ? "bg-[#0e0e0e] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                                >
                                    {f === "all" ? "Öne Çıkan" : f === "yes" ? "Evet" : "Hayır"}
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
                            <option value="sort_order">Sıra</option>
                        </select>
                        <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" checked={missingEnFilter} onChange={(e) => setMissingEnFilter(e.target.checked)} className="rounded" />
                            <span className="flex items-center gap-1 text-amber-600">
                                <AlertTriangle size={14} /> EN eksik
                            </span>
                        </label>
                        <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" checked={missingSeoFilter} onChange={(e) => setMissingSeoFilter(e.target.checked)} className="rounded" />
                            <span className="flex items-center gap-1 text-amber-600">
                                <AlertTriangle size={14} /> SEO eksik
                            </span>
                        </label>
                        <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" checked={missingAltFilter} onChange={(e) => setMissingAltFilter(e.target.checked)} className="rounded" />
                            <span className="flex items-center gap-1 text-amber-600">
                                <AlertTriangle size={14} /> Görsel alt metni eksik
                            </span>
                        </label>
                    </div>
                </div>
            </AdminCard>

            <AdminCard padding="none" className="min-w-0 w-full max-w-full overflow-hidden">
                {loading ? (
                    <div className="p-16 text-center flex items-center justify-center gap-3 text-slate-400">
                        <Loader2 size={24} className="animate-spin text-[#e6c800]" />
                        <span className="font-medium">Yükleniyor...</span>
                    </div>
                ) : sorted.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <FolderKanban size={32} />
                        </div>
                        <p className="text-slate-500 font-medium text-lg">
                            {filtered.length === 0 && projects.length > 0 ? "Filtrelere uygun proje bulunamadı." : "Henüz proje yok."}
                        </p>
                        {projects.length === 0 && (
                            <Link href="/admin/projects/new" className="inline-flex items-center gap-2 mt-4 text-[#0e0e0e] font-semibold hover:text-[#e6c800] transition-colors">
                                <Plus size={18} /> İlk projeyi ekle
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto w-full max-w-full">
                        <table className="w-full text-sm min-w-[800px]">
                            <thead>
                                <tr className="border-b border-slate-200/80 bg-slate-50/50">
                                    <th className="px-4 py-3 text-left max-w-[280px]">Başlık</th>
                                    <th className="px-4 py-3 w-[100px]">Durum</th>
                                    <th className="px-4 py-3 w-[140px] hidden lg:table-cell">Kategori</th>
                                    <th className="px-4 py-3 w-[100px] hidden md:table-cell">Sektör</th>
                                    <th className="px-4 py-3 w-[80px] text-center hidden md:table-cell">Öne Çıkan</th>
                                    <th className="px-4 py-3 w-[70px] text-center hidden md:table-cell">TR/EN</th>
                                    <th className="px-4 py-3 w-[70px] text-center hidden md:table-cell">SEO</th>
                                    <th className="px-4 py-3 w-[100px] hidden sm:table-cell">Güncelleme</th>
                                    <th className="px-4 py-3 w-[220px] text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sorted.map((project) => (
                                    <tr key={project.id} className={`transition-colors ${!project.published ? "bg-amber-50/50" : ""}`}>
                                        <td className="px-4 py-3 max-w-[280px]">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                                                    {project.cover_image ? (
                                                        <img src={project.cover_image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <FolderKanban size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium text-slate-900 line-clamp-2">{project.title_tr}</div>
                                                    <div className="text-xs text-slate-400 font-mono mt-0.5">/portfolio/{project.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <AdminBadge variant={project.published ? "published" : "draft"} label={project.published ? "Yayında" : "Taslak"} />
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell text-slate-600 text-sm">
                                            {project.category?.name_tr ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell text-slate-600 text-sm">
                                            {project.sector || "—"}
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell text-center">
                                            {project.featured ? <Star size={16} className="text-amber-500 mx-auto fill-amber-500" /> : "—"}
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell text-center">
                                            {isEnComplete(project) ? (
                                                <span className="text-emerald-600">✓</span>
                                            ) : (
                                                <span className="text-amber-600" title="EN eksik">
                                                    <AlertTriangle size={14} />
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell text-center">
                                            {hasSeo(project) ? (
                                                <span className="text-emerald-600">✓</span>
                                            ) : (
                                                <span className="text-amber-600" title="SEO eksik">
                                                    <AlertTriangle size={14} />
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell text-slate-500 text-xs">
                                            {new Date(project.updated_at).toLocaleDateString("tr-TR")}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2 flex-wrap">
                                                <Link href={`/admin/projects/edit/${project.id}`} className="px-3 py-1.5 text-xs rounded-md border border-slate-200 hover:bg-slate-50 font-medium">
                                                    Düzenle
                                                </Link>
                                                <a
                                                    href={project.published ? `/projeler/${project.slug}` : `/admin/projects/preview/${project.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1.5 text-xs rounded-md border border-slate-200 hover:bg-slate-50 font-medium"
                                                >
                                                    Önizle
                                                </a>
                                                {!project.published && (
                                                    <button
                                                        onClick={() => handleQuickAction(project.id, "publish")}
                                                        disabled={actionId === project.id}
                                                        className="px-3 py-1.5 text-xs rounded-md bg-emerald-500 text-white hover:bg-emerald-600 font-medium disabled:opacity-50 flex items-center gap-1"
                                                    >
                                                        {actionId === project.id ? <Loader2 size={12} className="animate-spin" /> : "Yayınla"}
                                                    </button>
                                                )}
                                                {project.published && (
                                                    <button
                                                        onClick={() => handleQuickAction(project.id, "unpublish")}
                                                        disabled={actionId === project.id}
                                                        className="px-3 py-1.5 text-xs rounded-md bg-amber-500 text-white hover:bg-amber-600 font-medium disabled:opacity-50 flex items-center gap-1"
                                                    >
                                                        {actionId === project.id ? <Loader2 size={12} className="animate-spin" /> : "Taslağa Al"}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(project.id)}
                                                    disabled={deletingId === project.id}
                                                    className="px-3 py-1.5 text-xs rounded-md bg-red-500 text-white hover:bg-red-600 font-medium disabled:opacity-50 flex items-center gap-1"
                                                >
                                                    {deletingId === project.id ? <Loader2 size={12} className="animate-spin" /> : "Sil"}
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
                            {sorted.length} / {projects.length} proje gösteriliyor
                        </span>
                    </div>
                )}
            </AdminCard>
        </div>
    );
}
