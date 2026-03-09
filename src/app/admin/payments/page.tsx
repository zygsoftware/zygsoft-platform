"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Eye, Receipt, Clock, Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";

type Payment = {
    id: string;
    amount: number;
    receiptImage: string;
    status: string;
    createdAt: string;
    user: { email: string; subscriptions: any[] };
    product?: { name: string; slug: string };
};

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/payments");
            const data = await res.json();
            if (data.payments) setPayments(data.payments);
        } catch (error) {
            console.error(error);
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
            if (res.ok) {
                fetchPayments();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    const pendingCount = payments.filter(p => p.status === "pending").length;

    return (
        <div className="p-8">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Ödeme Onayları</h1>
                    <p className="text-slate-500">Müşterilerden gelen HAVALE/EFT dekont bildirimlerini inceleyin.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-amber-100 text-amber-600 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
                        <Clock size={16} /> {pendingCount} Bekleyen
                    </div>
                    <button onClick={fetchPayments} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors">
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
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
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <Receipt className="mx-auto mb-4 text-slate-300" size={32} />
                                        Henüz bir ödeme bildirimi bulunmuyor.
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{payment.user.email}</div>
                                            <div className="text-xs text-slate-500 mt-1">Ürün: {payment.product?.name || "Bilinmiyor"}</div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">
                                            ₺{payment.amount}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(payment.createdAt).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {payment.status === "pending" && <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-lg">Bekliyor</span>}
                                            {payment.status === "approved" && <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-lg">Onaylandı</span>}
                                            {payment.status === "rejected" && <span className="px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-lg">Reddedildi</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedReceipt(payment.receiptImage)}
                                                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                <Eye size={16} /> Görüntüle
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {payment.status === "pending" ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        disabled={actionLoading === payment.id}
                                                        onClick={() => handleAction(payment.id, "approved")}
                                                        className="p-1.5 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-md transition-colors disabled:opacity-50"
                                                        title="Onayla ve Abonelik Başlat"
                                                    >
                                                        {actionLoading === payment.id ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                                    </button>
                                                    <button
                                                        disabled={actionLoading === payment.id}
                                                        onClick={() => handleAction(payment.id, "rejected")}
                                                        className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-md transition-colors disabled:opacity-50"
                                                        title="Reddet"
                                                    >
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

            {/* Receipt Modal */}
            {selectedReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setSelectedReceipt(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-2xl p-2 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedReceipt(null)}
                            className="absolute -top-4 -right-4 w-10 h-10 bg-white text-slate-900 rounded-full shadow-lg flex items-center justify-center hover:bg-slate-100 transition-colors z-10"
                        >
                            <X size={20} />
                        </button>
                        <div className="w-full h-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center">
                            {/* We use standard img because base64 receipts can be tricky with Next Image unconfigured domains */}
                            {selectedReceipt.startsWith('data:image') ? (
                                <img src={selectedReceipt} alt="Dekont" className="max-w-full max-h-[85vh] object-contain" />
                            ) : selectedReceipt.startsWith('data:application/pdf') ? (
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
