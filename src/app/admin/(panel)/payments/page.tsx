"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Eye, Receipt, Clock, Loader2, RefreshCw, AlertCircle } from "lucide-react";

type Payment = {
    id: string;
    amount: number;
    receiptImage?: string | null;
    status: string;
    createdAt: string;
    user: { email: string | null; subscriptions: any[] };
    product?: { name: string; slug: string } | null;
};

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

    const fetchPayments = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/payments");
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Ödemeler yüklenemedi.");
                setPayments([]);
            } else if (Array.isArray(data.payments)) {
                setPayments(data.payments);
            } else if (Array.isArray(data)) {
                setPayments(data);
            } else {
                setPayments([]);
            }
        } catch {
            setError("Bağlantı hatası. Lütfen tekrar deneyin.");
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleAction = async (paymentId: string, status: "approved" | "rejected") => {
        setActionLoading(paymentId);
        try {
            const res = await fetch("/api/admin/payments", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId, status })
            });
            if (res.ok) fetchPayments();
        } catch {
            console.error("Payments action failed");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-3 p-12 text-slate-500">
                <Loader2 size={24} className="animate-spin text-emerald-500" />
                <span>Yükleniyor...</span>
            </div>
        );
    }

    const pendingCount = payments.filter(p => p.status === "pending").length;

    return (
        <div>
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Ödeme Onayları</h1>
                    <p className="text-slate-500 dark:text-slate-400">Müşterilerden gelen HAVALE/EFT dekont bildirimlerini inceleyin.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
                        <Clock size={16} /> {pendingCount} Bekleyen
                    </div>
                    <button onClick={fetchPayments} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg transition-colors">
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                                <th className="px-6 py-4 font-medium">Kullanıcı (E-posta)</th>
                                <th className="px-6 py-4 font-medium">Tutar</th>
                                <th className="px-6 py-4 font-medium">Tarih</th>
                                <th className="px-6 py-4 font-medium">Durum</th>
                                <th className="px-6 py-4 font-medium">Dekont</th>
                                <th className="px-6 py-4 font-medium text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <Receipt className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={40} />
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Henüz veri yok.</p>
                                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Ödeme bildirimi bulunmuyor.</p>
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900 dark:text-white">{payment.user?.email || "—"}</div>
                                            <div className="text-xs text-slate-500 mt-1">Ürün: {payment.product?.name || "Bilinmiyor"}</div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">₺{payment.amount}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{new Date(payment.createdAt).toLocaleDateString("tr-TR")}</td>
                                        <td className="px-6 py-4">
                                            {payment.status === "pending" && <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg">Bekliyor</span>}
                                            {payment.status === "approved" && <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg">Onaylandı</span>}
                                            {payment.status === "rejected" && <span className="px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg">Reddedildi</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            {payment.receiptImage ? (
                                                <button onClick={() => setSelectedReceipt(payment.receiptImage!)} className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1.5 rounded-lg transition-colors">
                                                    <Eye size={16} /> Görüntüle
                                                </button>
                                            ) : (
                                                <span className="text-sm text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {payment.status === "pending" ? (
                                                <div className="flex justify-end gap-2">
                                                    <button disabled={actionLoading === payment.id} onClick={() => handleAction(payment.id, "approved")} className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 rounded-md transition-colors disabled:opacity-50" title="Onayla">
                                                        {actionLoading === payment.id ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                                    </button>
                                                    <button disabled={actionLoading === payment.id} onClick={() => handleAction(payment.id, "rejected")} className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-md transition-colors disabled:opacity-50" title="Reddet">
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-400">İşlem Tamamlandı</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setSelectedReceipt(null)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative max-w-3xl w-full max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedReceipt(null)} className="absolute -top-4 -right-4 w-10 h-10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors z-10">
                            <X size={20} />
                        </button>
                        <div className="w-full h-full overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                            {selectedReceipt.startsWith("data:image") ? (
                                <img src={selectedReceipt} alt="Dekont" className="max-w-full max-h-[85vh] object-contain" />
                            ) : selectedReceipt.startsWith("data:application/pdf") ? (
                                <iframe src={selectedReceipt} className="w-full h-[85vh] rounded-xl" />
                            ) : (
                                <div className="p-12 text-slate-500 flex flex-col items-center">
                                    <Receipt size={48} className="mb-4 text-slate-300" />
                                    <span>Görüntü desteklenmeyen formatta.</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
