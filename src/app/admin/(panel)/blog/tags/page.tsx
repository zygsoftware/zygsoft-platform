"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";

type Tag = { id: string; name: string; slug: string; _count?: { posts: number } };

export default function AdminBlogTagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: "" });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTags = async () => {
        const res = await fetch("/api/blog/tags");
        const data = await res.json();
        setTags(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        fetchTags().finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const res = await fetch("/api/blog/tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: form.name }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Hata");
            setForm({ name: "" });
            fetchTags();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/blog" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Blog Etiketleri</h1>
                    <p className="text-slate-500 mt-1 text-sm">Etiketleri yönetin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="font-bold text-slate-900 mb-4">Yeni Etiket</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ad</label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                                placeholder="örn: UYAP, Hukuk, PDF"
                            />
                        </div>
                        <button type="submit" disabled={submitting} className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-xl disabled:opacity-50 flex items-center gap-2">
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Ekle
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <h2 className="font-bold text-slate-900 p-6 pb-0">Mevcut Etiketler</h2>
                    {loading ? (
                        <div className="p-12 flex justify-center"><Loader2 size={24} className="animate-spin text-emerald-500" /></div>
                    ) : tags.length === 0 ? (
                        <p className="p-6 text-slate-500 text-sm">Henüz etiket yok.</p>
                    ) : (
                        <div className="p-6 flex flex-wrap gap-2">
                            {tags.map((t) => (
                                <span key={t.id} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                                    {t.name}
                                    {t._count && <span className="ml-1 text-slate-400">({t._count.posts})</span>}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
