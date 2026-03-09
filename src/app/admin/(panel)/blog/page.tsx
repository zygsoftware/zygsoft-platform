"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit, CheckCircle, Clock, Loader2, BookOpen, X } from "lucide-react";

export default function AdminBlog() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: "", slug: "", excerpt: "", content: "", image: "", author: "Gürkan Yavuz", published: false,
    });

    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/blog?all=true");
            const data = await res.json();
            if (Array.isArray(data)) {
                setPosts(data);
            } else if (data.posts) {
                setPosts(data.posts);
            } else {
                setPosts([]);
            }
        } catch (error) {
            console.error("Blog yazıları yüklenirken hata:", error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(); }, []);

    const openCreate = () => {
        setEditingPost(null);
        setFormData({ title: "", slug: "", excerpt: "", content: "", image: "", author: "Gürkan Yavuz", published: false });
        setIsModalOpen(true);
    };

    const openEdit = (post: any) => {
        setEditingPost(post);
        setFormData({ title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, image: post.image || "", author: post.author, published: post.published });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingPost) {
                await fetch(`/api/blog/${editingPost.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
            } else {
                await fetch("/api/blog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
            }
            setIsModalOpen(false);
            fetchPosts();
        } catch (error) {
            console.error("Blog yazısı kaydedilemedi:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu içeriği kalıcı olarak silmek istediğinizden emin misiniz?")) return;
        setDeletingId(id);
        try {
            await fetch(`/api/blog/${id}`, { method: "DELETE" });
            fetchPosts();
        } catch (error) {
            console.error("Blog yazısı silinemedi:", error);
        } finally {
            setDeletingId(null);
        }
    };

    const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9ğüşıöç]+/gi, "-").replace(/^-|-$/g, "").replace(/[ğ]/g, "g").replace(/[ü]/g, "u").replace(/[ş]/g, "s").replace(/[ı]/g, "i").replace(/[ö]/g, "o").replace(/[ç]/g, "c");

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-start mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Blog Yönetimi</h1>
                    <p className="text-slate-500 mt-1 text-sm">Zygsoft içgörüsü ve genel makaleleri yönetin.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/20 shrink-0"
                >
                    <Plus size={18} /> Yeni Yazı
                </button>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center flex items-center justify-center gap-3 text-slate-400">
                        <Loader2 size={24} className="animate-spin text-emerald-500" />
                        <span className="font-medium">Blog Yazıları Yükleniyor...</span>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <BookOpen size={32} />
                        </div>
                        <p className="text-slate-500 font-medium text-lg">Henüz hiç blog yazısı bulunmuyor.</p>
                        <p className="text-slate-400 text-sm mt-1">Hemen sağ üstten ilk yazınızı ekleyin!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Başlık</th>
                                    <th className="px-6 py-4 hidden sm:table-cell">Yazar</th>
                                    <th className="px-6 py-4">Durum</th>
                                    <th className="px-6 py-4 hidden md:table-cell">Tarih</th>
                                    <th className="px-6 py-4 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {posts.map((post: any) => (
                                    <tr key={post.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900">{post.title}</p>
                                            <p className="text-xs text-slate-400 font-mono mt-1">/blog/{post.slug}</p>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell text-slate-600 font-medium text-sm">
                                            {post.author}
                                        </td>
                                        <td className="px-6 py-4">
                                            {post.published ? (
                                                <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                                    <CheckCircle size={12} /> Yayında
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                    <Clock size={12} /> Taslak
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell text-slate-500 text-sm font-medium">
                                            {new Date(post.createdAt).toLocaleDateString("tr-TR")}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEdit(post)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(post.id)} disabled={deletingId === post.id} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                                                    {deletingId === post.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative z-10"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-3xl shrink-0">
                                <h2 className="text-xl font-bold text-slate-900">{editingPost ? "Yazıyı Düzenle" : "Yeni Blog Yazısı"}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-full transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6">
                                <form id="blog-form" onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Başlık</label>
                                            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium" placeholder="Blog yazısı başlığı" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">URL Slug</label>
                                            <input type="text" required value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-mono text-slate-500" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Özet (Excerpt)</label>
                                        <textarea required rows={2} value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium resize-none" placeholder="Kısa özet..." />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">İçerik (Markdown Destekli)</label>
                                        <textarea required rows={8} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium resize-none" placeholder="Blog içeriği..." />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Görsel (URL)</label>
                                            <input type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium" placeholder="https://..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Yazar</label>
                                            <input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                                        <input type="checkbox" id="published" checked={formData.published} onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                            className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500" />
                                        <div>
                                            <label htmlFor="published" className="text-sm font-bold text-emerald-900 cursor-pointer select-none">Hemen Yayınla</label>
                                            <p className="text-xs text-emerald-700 mt-0.5">Seçilmezse taslak olarak kaydedilir.</p>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="p-6 border-t border-slate-100 flex gap-3 justify-end shrink-0 bg-slate-50/50 rounded-b-3xl">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all text-sm">
                                    İptal
                                </button>
                                <button type="submit" form="blog-form" disabled={submitting} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2 text-sm">
                                    {submitting ? <><Loader2 size={16} className="animate-spin" /> Kaydediliyor...</> : "Kaydet ve Kapat"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
