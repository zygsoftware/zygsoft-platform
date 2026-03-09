"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit, CheckCircle, XCircle, Loader2, Network, X } from "lucide-react";

export default function AdminApis() {
    const [apis, setApis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "", endpoint: "", apiKey: "", status: "active",
    });

    const fetchApis = async () => {
        try {
            const res = await fetch("/api/apis");
            const data = await res.json();
            setApis(data);
        } catch (error) {
            console.error("API'ler yüklenirken hata oluştu", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchApis(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await fetch("/api/apis", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            setIsModalOpen(false);
            setFormData({ name: "", endpoint: "", apiKey: "", status: "active" });
            fetchApis();
        } catch (error) {
            console.error("API bağlantısı eklenirken hata oluştu", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu API bağlantısını kaldırmak istediğinize emin misiniz?")) return;
        setDeletingId(id);
        try {
            await fetch(`/api/apis?id=${id}`, { method: "DELETE" });
            setApis(prev => prev.filter((a: any) => a.id !== id));
        } catch (error) {
            console.error("Silinemedi");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-start mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">API Bağlantıları</h1>
                    <p className="text-slate-500 mt-1 text-sm">Harici servis ve sistem entegrasyonlarınızı yönetin.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/20 shrink-0"
                >
                    <Plus size={18} /> Yeni Bağlantı
                </button>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center flex items-center justify-center gap-3 text-slate-400">
                        <Loader2 size={24} className="animate-spin text-emerald-500" />
                        <span className="font-medium">API'ler Yükleniyor...</span>
                    </div>
                ) : apis.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Network size={32} />
                        </div>
                        <p className="text-slate-500 font-medium text-lg">Tanımlı API bağlantısı bulunmuyor.</p>
                        <p className="text-slate-400 text-sm mt-1">Sistem entegrasyonları için buradan kayıt ekleyin.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Bileşen Adı</th>
                                    <th className="px-6 py-4 hidden sm:table-cell">Endpoint</th>
                                    <th className="px-6 py-4">Durum</th>
                                    <th className="px-6 py-4 hidden md:table-cell">Tarih</th>
                                    <th className="px-6 py-4 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {apis.map((api: any) => (
                                    <tr key={api.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900">{api.name}</p>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <p className="text-xs text-slate-500 font-mono truncate max-w-xs">{api.endpoint}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {api.status === "active" ? (
                                                <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                                    <CheckCircle size={12} /> Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                    <XCircle size={12} /> Pasif
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell text-slate-500 text-sm font-medium">
                                            {new Date(api.createdAt).toLocaleDateString("tr-TR")}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleDelete(api.id)} disabled={deletingId === api.id} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                                                    {deletingId === api.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
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
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h2 className="text-xl font-bold text-slate-900">API Bağlantısı Ekle</h2>
                                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-full transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Bileşen / Servis Adı</label>
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium" placeholder="örn: UDF Toolkit" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">API Endpoint URL</label>
                                    <input type="url" required value={formData.endpoint} onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-mono text-slate-500" placeholder="https://..." />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">API Anahtarı (Opsiyonel)</label>
                                    <input type="password" value={formData.apiKey} onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium" placeholder="••••••••••••" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Durum</label>
                                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium"
                                    >
                                        <option value="active">Aktif</option>
                                        <option value="inactive">Pasif</option>
                                    </select>
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-3">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all text-sm">
                                        İptal
                                    </button>
                                    <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2 text-sm">
                                        {submitting ? <><Loader2 size={16} className="animate-spin" /> Kaydediliyor...</> : "Bağlantıyı Kaydet"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
