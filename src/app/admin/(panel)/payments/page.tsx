"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Eye, Receipt, Clock, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { AdminPageHeader, AdminCard, AdminEmptyState, AdminBadge } from "@/components/admin";

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
        <div className="space-y-8">
            <AdminPageHeader
                title="Ödeme Onayları"
                subtitle="Müşterilerden gelen HAVALE/EFT dekont bildirimlerini inceleyin."
                actions={
                    <div className="flex items-center gap-3">
                        {pendingCount > 0 && (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60 text-sm font-semibold">
                                <Clock size={16} /> {pendingCount} Bekleyen
                            </span>
                        )}
                        <button onClick={fetchPayments} className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors" title="Yenile">
                            <RefreshCw size={20} />
                        </button>
                    </div>
                }
            />

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-sm">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            <AdminCard padding="none">
                <div className="overflow-x-auto">
                    <table className="admin-table w-full text-left">
                        <thead>
                            <tr>
                                <th>Kullanıcı (E-posta)</th>
                                <th>Tutar</th>
                                <th>Tarih</th>
                                <th>Durum</th>
                                <th>Dekont</th>
                                <th className="text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
                                        <AdminEmptyState
                                            icon={<Receipt size={40} />}
                                            title="Henüz ödeme bildirimi yok"
                                            description="Müşterilerden gelen HAVALE/EFT dekont bildirimleri burada listelenecek."
                                        />
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>
                                            <div className="font-medium text-slate-900">{payment.user?.email || "—"}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">Ürün: {payment.product?.name || "Bilinmiyor"}</div>
                                        </td>
                                        <td className="font-semibold text-slate-900">₺{payment.amount}</td>
                                        <td className="text-sm text-slate-600">{new Date(payment.createdAt).toLocaleDateString("tr-TR")}</td>
                                        <td>
                                            <AdminBadge variant={payment.status === "pending" ? "pending" : payment.status === "approved" ? "approved" : "rejected"} label={payment.status === "pending" ? "Bekliyor" : payment.status === "approved" ? "Onaylandı" : "Reddedildi"} />
                                        </td>
                                        <td>
                                            {payment.receiptImage ? (
                                                <button onClick={() => setSelectedReceipt(payment.receiptImage!)} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                                                    <Eye size={16} /> Görüntüle
                                                </button>
                                            ) : (
                                                <span className="text-sm text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="text-right">
                                            {payment.status === "pending" ? (
                                                <div className="flex justify-end gap-2">
                                                    <button disabled={actionLoading === payment.id} onClick={() => handleAction(payment.id, "approved")} className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50" title="Onayla">
                                                        {actionLoading === payment.id ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                                    </button>
                                                    <button disabled={actionLoading === payment.id} onClick={() => handleAction(payment.id, "rejected")} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50" title="Reddet">
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-400">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </AdminCard>

            {selectedReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setSelectedReceipt(null)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-2xl p-2 shadow-2xl border border-slate-200" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedReceipt(null)} className="absolute -top-4 -right-4 w-10 h-10 bg-white text-slate-900 rounded-full shadow-lg flex items-center justify-center hover:bg-slate-100 transition-colors z-10 border border-slate-200">
                            <X size={20} />
                        </button>
                        <div className="w-full h-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center">
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
