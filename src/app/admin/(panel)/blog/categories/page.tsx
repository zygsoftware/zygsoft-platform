"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Loader2, Edit, Check } from "lucide-react";

type Category = { id: string; name_tr: string; name_en: string; slug: string; description_tr?: string | null; description_en?: string | null; _count?: { posts: number } };

export default function AdminBlogCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name_tr: "", name_en: "", slug: "", description_tr: "", description_en: "" });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name_tr: "", name_en: "", slug: "", description_tr: "", description_en: "" });
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = async () => {
        const res = await fetch("/api/blog/categories");
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        fetchCategories().finally(() => setLoading(false));
    }, []);

    const generateSlug = (name: string) =>
        name.toLowerCase().replace(/[^a-z0-9ğüşıöç]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const res = await fetch("/api/blog/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    slug: form.slug || generateSlug(form.name_tr),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Hata");
            setForm({ name_tr: "", name_en: "", slug: "", description_tr: "", description_en: "" });
            fetchCategories();
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (c: Category) => {
        setEditingId(c.id);
        setEditForm({
            name_tr: c.name_tr,
            name_en: c.name_en,
            slug: c.slug,
            description_tr: c.description_tr || "",
            description_en: c.description_en || "",
        });
        setError(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setError(null);
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        setError(null);
        setSubmitting(true);
        try {
            const res = await fetch(`/api/blog/categories/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Güncelleme başarısız");
            setEditingId(null);
            fetchCategories();
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        const cat = categories.find((c) => c.id === id);
        const count = cat?._count?.posts ?? 0;
        if (count > 0) {
            alert(`${cat?.name_tr} kategorisi ${count} yazıda kullanılıyor. Önce yazıların kategorisini değiştirin veya silin.`);
            return;
        }
        if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;
        setDeletingId(id);
        setError(null);
        try {
            const res = await fetch(`/api/blog/categories/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Silme başarısız");
            fetchCategories();
            if (editingId === id) setEditingId(null);
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/blog" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Blog Kategorileri</h1>
                    <p className="text-slate-500 mt-1 text-sm">Kategorileri yönetin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="font-bold text-slate-900 mb-4">Yeni Kategori</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && !editingId && <p className="text-sm text-red-600">{error}</p>}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ad (TR) *</label>
                            <input
                                type="text"
                                required
                                value={form.name_tr}
                                onChange={(e) => setForm((f) => ({ ...f, name_tr: e.target.value, slug: f.slug ? f.slug : generateSlug(e.target.value) }))}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ad (EN) *</label>
                            <input
                                type="text"
                                required
                                value={form.name_en}
                                onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Slug *</label>
                            <input
                                type="text"
                                required
                                value={form.slug}
                                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Açıklama (TR)</label>
                            <textarea rows={2} value={form.description_tr} onChange={(e) => setForm((f) => ({ ...f, description_tr: e.target.value }))} className="w-full px-4 py-2 border border-slate-200 rounded-xl resize-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Açıklama (EN)</label>
                            <textarea rows={2} value={form.description_en} onChange={(e) => setForm((f) => ({ ...f, description_en: e.target.value }))} className="w-full px-4 py-2 border border-slate-200 rounded-xl resize-none" />
                        </div>
                        <button type="submit" disabled={submitting} className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-xl disabled:opacity-50 flex items-center gap-2">
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Ekle
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <h2 className="font-bold text-slate-900 p-6 pb-0">Mevcut Kategoriler</h2>
                    {loading ? (
                        <div className="p-12 flex justify-center"><Loader2 size={24} className="animate-spin text-emerald-500" /></div>
                    ) : categories.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-slate-500 text-sm">Henüz kategori yok.</p>
                    </div>
                    ) : (
                        <ul className="p-6 divide-y divide-slate-100">
                            {categories.map((c) => (
                                <li key={c.id} className="py-4">
                                    {editingId === c.id ? (
                                        <div className="space-y-3">
                                            {error && <p className="text-sm text-red-600">{error}</p>}
                                            <input
                                                type="text"
                                                value={editForm.name_tr}
                                                onChange={(e) => setEditForm((f) => ({ ...f, name_tr: e.target.value }))}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                placeholder="Ad (TR)"
                                            />
                                            <input
                                                type="text"
                                                value={editForm.name_en}
                                                onChange={(e) => setEditForm((f) => ({ ...f, name_en: e.target.value }))}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                placeholder="Ad (EN)"
                                            />
                                            <input
                                                type="text"
                                                value={editForm.slug}
                                                onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                                                placeholder="Slug"
                                            />
                                            <textarea rows={2} value={editForm.description_tr} onChange={(e) => setEditForm((f) => ({ ...f, description_tr: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" placeholder="Açıklama (TR)" />
                                            <textarea rows={2} value={editForm.description_en} onChange={(e) => setEditForm((f) => ({ ...f, description_en: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" placeholder="Açıklama (EN)" />
                                            <div className="flex gap-2">
                                                <button onClick={handleUpdate} disabled={submitting} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium flex items-center gap-1">
                                                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Kaydet
                                                </button>
                                                <button onClick={cancelEdit} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm">İptal</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="font-medium text-slate-900">{c.name_tr}</p>
                                                <p className="text-xs text-slate-500">{c.name_en} · /{c.slug}</p>
                                                {c.description_tr && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description_tr}</p>}
                                                {c._count !== undefined && <span className="text-xs text-slate-400">{c._count.posts} yazı</span>}
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button onClick={() => startEdit(c)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Düzenle">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="Sil">
                                                    {deletingId === c.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
