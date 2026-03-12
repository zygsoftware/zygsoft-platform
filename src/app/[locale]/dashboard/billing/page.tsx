"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Receipt, CheckCircle, UploadCloud, Building, Calendar,
    ArrowRight, Loader2, Info, AlertCircle, Clock, XCircle,
    Eye, FileText, History, Package, CreditCard, Copy,
} from "lucide-react";

const BANK_IBAN = "TR060006701000000077732201";
const BANK_IBAN_DISPLAY = "TR06 0006 7010 0000 0077 7322 01";

/* ── Types ───────────────────────────────────────────────────────── */

type PaymentRecord = {
    id: string;
    amount: number;
    status: "pending" | "approved" | "rejected";
    hasReceipt: boolean;
    receiptImage: string | null;
    createdAt: string;
    updatedAt: string;
    product: { id: string; name: string; slug: string } | null;
    subscription: { productId: string; status: string; endsAt: string | null } | null;
};

/* ── Status config ───────────────────────────────────────────────── */

const PAYMENT_STATUS: Record<string, { label: string; badge: string; icon: React.ReactNode }> = {
    pending:  {
        label: "İncelemede",
        badge: "bg-amber-50 text-amber-700 border border-amber-200",
        icon:  <Clock size={12} />,
    },
    approved: {
        label: "Onaylandı",
        badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        icon:  <CheckCircle size={12} />,
    },
    rejected: {
        label: "Reddedildi",
        badge: "bg-red-50 text-red-600 border border-red-200",
        icon:  <XCircle size={12} />,
    },
};

const SUB_STATUS: Record<string, { label: string; color: string }> = {
    inactive:         { label: "Pasif",          color: "text-slate-400" },
    pending_approval: { label: "Onay Bekliyor",   color: "text-amber-500" },
    active:           { label: "Aktif Abonelik",  color: "text-emerald-600" },
};

function PaymentStatusBadge({ status }: { status: string }) {
    const cfg = PAYMENT_STATUS[status] ?? PAYMENT_STATUS.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.badge}`}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

function BankInfoBlock() {
    const t = useTranslations("Dashboard.billing");
    const [copied, setCopied] = useState(false);

    const handleCopyIban = async () => {
        try {
            await navigator.clipboard.writeText(BANK_IBAN);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback for older browsers
            const ta = document.createElement("textarea");
            ta.value = BANK_IBAN;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <>
            <div>
                <div className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">
                    {t("bankName")}
                </div>
                <div className="text-slate-950 font-black">YapıKredi Bankası</div>
            </div>
            <div className="pt-4 border-t border-slate-50">
                <div className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">
                    {t("receiverName")}
                </div>
                <div className="text-slate-950 font-black">Gürkan Yavuz</div>
            </div>
            <div className="pt-4 border-t border-slate-50">
                <div className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">
                    {t("iban")}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 text-slate-950 font-mono tracking-tighter bg-slate-50 p-4 rounded-xl border border-slate-100 break-all text-[12px] font-black select-all">
                        {BANK_IBAN_DISPLAY}
                    </div>
                    <button
                        type="button"
                        onClick={handleCopyIban}
                        className="shrink-0 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 text-xs font-bold text-slate-600"
                    >
                        <Copy size={14} />
                        {copied ? "Kopyalandı" : "Kopyala"}
                    </button>
                </div>
            </div>
        </>
    );
}

/* ── Receipt viewer ──────────────────────────────────────────────── */

function ReceiptButton({ src }: { src: string }) {
    const isPdf = src.startsWith("data:application/pdf");
    const handleView = () => {
        const win = window.open();
        if (win) {
            if (isPdf) {
                win.document.write(`<iframe src="${src}" style="width:100%;height:100vh;border:none"></iframe>`);
            } else {
                win.document.write(`<img src="${src}" style="max-width:100%;display:block;margin:auto" />`);
            }
        }
    };
    return (
        <button
            onClick={handleView}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
            {isPdf ? <FileText size={13} /> : <Eye size={13} />}
            {isPdf ? "PDF Görüntüle" : "Dekont Görüntüle"}
        </button>
    );
}

/* ── Payment history ─────────────────────────────────────────────── */

function PaymentHistory({ refreshKey }: { refreshKey: number }) {
    const t = useTranslations("Dashboard.billing");
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch("/api/payments/history")
            .then(async (res) => {
                if (!res.ok) throw new Error("Veriler alınamadı.");
                const data = await res.json();
                setPayments(data.payments ?? []);
            })
            .catch((e) => setError(e.message ?? "Bir hata oluştu."))
            .finally(() => setLoading(false));
    }, [refreshKey]);

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 px-7 py-5 border-b border-slate-50">
                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-[#e6c800] shrink-0">
                    <History size={17} />
                </div>
                <div>
                    <h2 className="text-base font-heading font-black text-slate-950">
                        Ödeme Geçmişi
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Tüm ödeme bildirimleriniz ve durumları
                    </p>
                </div>
                {!loading && !error && (
                    <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
                        {payments.length} kayıt
                    </span>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center gap-3 text-slate-400 py-16">
                    <Loader2 size={20} className="animate-spin text-[#e6c800]" />
                    <span className="text-sm font-bold">Yükleniyor...</span>
                </div>
            ) : error ? (
                <div className="py-16 text-center px-8">
                    <AlertCircle size={28} className="mx-auto mb-3 text-red-400" />
                    <p className="text-red-500 font-bold text-sm">{error}</p>
                </div>
            ) : payments.length === 0 ? (
                <div className="py-16 text-center px-8">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Receipt size={24} className="text-slate-200" />
                    </div>
                    <p className="text-slate-950 font-black text-sm">
                        {t("historyEmptyTitle")}
                    </p>
                    <p className="text-slate-400 text-xs font-medium mt-1.5 max-w-sm mx-auto">
                        {t("historyEmptyDesc")}
                    </p>
                    <Link
                        href="#payment-form"
                        className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-slate-950 text-[#e6c800] text-xs font-black hover:bg-slate-700 transition-colors"
                    >
                        <UploadCloud size={14} />
                        {t("historyEmptyCta")}
                    </Link>
                </div>
            ) : (
                <>
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-7 py-3.5">Ürün / Hizmet</th>
                                    <th className="px-5 py-3.5">Tutar</th>
                                    <th className="px-5 py-3.5">Durum</th>
                                    <th className="px-5 py-3.5">Abonelik</th>
                                    <th className="px-5 py-3.5">Tarih</th>
                                    <th className="px-5 py-3.5">Dekont</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {payments.map((p) => {
                                    const sub    = p.subscription;
                                    const subCfg = sub
                                        ? (SUB_STATUS[sub.status] ?? SUB_STATUS.inactive)
                                        : null;
                                    return (
                                        <tr
                                            key={p.id}
                                            className="hover:bg-slate-50/60 transition-colors"
                                        >
                                            <td className="px-7 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-[#e6c800] shrink-0">
                                                        <Package size={15} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-950">
                                                            {p.product?.name ?? "Ürün Bilinmiyor"}
                                                        </p>
                                                        {p.product?.slug && (
                                                            <p className="text-[10px] text-slate-300 font-mono mt-0.5">
                                                                {p.product.slug}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-5">
                                                <span className="text-sm font-black text-slate-950">
                                                    ₺{p.amount.toLocaleString("tr-TR", { minimumFractionDigits: 0 })}
                                                </span>
                                            </td>
                                            <td className="px-5 py-5">
                                                <PaymentStatusBadge status={p.status} />
                                            </td>
                                            <td className="px-5 py-5">
                                                {subCfg ? (
                                                    <div>
                                                        <span className={`text-xs font-bold ${subCfg.color}`}>
                                                            {subCfg.label}
                                                        </span>
                                                        {sub?.endsAt && (
                                                            <p className="text-[10px] text-slate-300 font-mono mt-0.5">
                                                                {new Date(sub.endsAt).toLocaleDateString("tr-TR")} tarihine kadar
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-300 font-bold">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-5">
                                                <span className="text-xs text-slate-400 font-mono whitespace-nowrap flex items-center gap-1.5">
                                                    <Calendar size={11} />
                                                    {new Date(p.createdAt).toLocaleDateString("tr-TR", {
                                                        day: "numeric", month: "short", year: "numeric",
                                                    })}
                                                </span>
                                                <span className="text-[10px] text-slate-300 font-mono mt-0.5 block">
                                                    {new Date(p.createdAt).toLocaleTimeString("tr-TR", {
                                                        hour: "2-digit", minute: "2-digit",
                                                    })}
                                                </span>
                                            </td>
                                            <td className="px-5 py-5">
                                                {p.receiptImage ? (
                                                    <ReceiptButton src={p.receiptImage} />
                                                ) : (
                                                    <span className="text-xs text-slate-300 font-bold">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile stacked */}
                    <div className="md:hidden divide-y divide-slate-50">
                        {payments.map((p) => {
                            const sub    = p.subscription;
                            const subCfg = sub
                                ? (SUB_STATUS[sub.status] ?? SUB_STATUS.inactive)
                                : null;
                            return (
                                <div key={p.id} className="p-6 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-[#e6c800] shrink-0">
                                                <Package size={15} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-950">
                                                    {p.product?.name ?? "Ürün Bilinmiyor"}
                                                </p>
                                                <p className="text-xs font-black text-slate-700 mt-0.5">
                                                    ₺{p.amount.toLocaleString("tr-TR", { minimumFractionDigits: 0 })}
                                                </p>
                                            </div>
                                        </div>
                                        <PaymentStatusBadge status={p.status} />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-xs">
                                        {subCfg && (
                                            <span className={`font-bold ${subCfg.color}`}>
                                                {subCfg.label}
                                            </span>
                                        )}
                                        <span className="text-slate-400 font-mono flex items-center gap-1">
                                            <Calendar size={10} />
                                            {new Date(p.createdAt).toLocaleDateString("tr-TR", {
                                                day: "numeric", month: "long", year: "numeric",
                                            })}
                                        </span>
                                        {p.receiptImage && <ReceiptButton src={p.receiptImage} />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

/* ── Main page ───────────────────────────────────────────────────── */

export default function BillingPage() {
    const { data: session } = useSession();
    const t = useTranslations("Dashboard.billing");
    const searchParams = useSearchParams();
    const [productId,     setProductId]     = useState("legal-toolkit");
    const [amount,        setAmount]        = useState("3000");
    const [fileName,      setFileName]      = useState("");
    const [receiptBase64, setReceiptBase64] = useState("");
    const [loading,       setLoading]       = useState(false);
    const [success,       setSuccess]       = useState(false);
    const [error,         setError]         = useState("");
    const [historyKey,    setHistoryKey]    = useState(0);

    const productDetails: Record<string, { name: string; price: string; desc: string; isFixed: boolean }> = {
        "legal-toolkit": { name: "Hukuk Araçları Paketi", price: "3000", desc: "Tek yıllık paket. Tüm belge araçları dahil: DOCX→UDF, TIFF→PDF, Görsel→PDF, PDF birleştirme, bölme, OCR ve daha fazlası. Hukuk ve belge iş akışları için.", isFixed: true },
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => setReceiptBase64(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        const prod = searchParams.get("product");
        if (prod && productDetails[prod]) {
            setProductId(prod);
            setAmount(productDetails[prod].price);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setProductId(val);
        if (productDetails[val]?.isFixed) {
            setAmount(productDetails[val].price);
        } else if (val === "other") {
            setAmount("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!receiptBase64 || !productId) {
            setError(t("errorRequired"));
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/payments/notify", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ amount: parseFloat(amount), receiptImage: receiptBase64, productId }),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Error");
            } else {
                setSuccess(true);
                setHistoryKey((k) => k + 1);
            }
        } catch {
            setError("Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl space-y-10">

            {/* ── Page heading ── */}
            <div>
                <h1 className="text-3xl font-heading font-black text-slate-950 mb-1.5">
                    {t("title")}
                </h1>
                <p className="text-slate-400 font-medium text-sm">{t("subtitle")}</p>
            </div>

            {/* ── Upload form section ── */}
            <div id="payment-form">
                {/* Section label */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-[#e6c800]">
                        <CreditCard size={15} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-950">Ödeme Bildirimi</h2>
                        <p className="text-xs text-slate-400 font-medium">
                            Banka transferi sonrası dekontunuzu yükleyin
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Bank info — plain div, no entrance animation */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-7">
                                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-[#e6c800]">
                                    <Building size={18} />
                                </div>
                                <h2 className="text-base font-heading font-black text-slate-950">
                                    {t("bankInfo")}
                                </h2>
                            </div>

                            <div className="space-y-5 text-sm">
                                <BankInfoBlock />
                                <div className="pt-5 border-t border-slate-50">
                                    <div className="flex items-start gap-3 bg-blue-50/60 border border-blue-100/60 p-4 rounded-xl text-blue-900">
                                        <Info size={16} className="mt-0.5 shrink-0 text-blue-500" />
                                        <p className="text-[11px] font-bold leading-relaxed opacity-80">
                                            {t("note")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notification form — plain div */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                            {success ? (
                                <div className="text-center py-10">
                                    <div className="w-20 h-20 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100">
                                        <CheckCircle size={40} className="text-emerald-500" />
                                    </div>
                                    <h3 className="text-2xl font-heading font-black text-slate-950 mb-3">
                                        {t("successTitle")}
                                    </h3>
                                    <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto leading-relaxed">
                                        {t("successDesc")}
                                    </p>
                                    <button
                                        onClick={() => { setSuccess(false); setFileName(""); setReceiptBase64(""); }}
                                        className="px-8 py-3.5 bg-slate-950 text-[#e6c800] font-black rounded-2xl hover:bg-slate-700 transition-all shadow-lg"
                                    >
                                        {t("newNotice")}
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-7">
                                    <h2 className="text-xl font-heading font-black text-slate-950 flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-slate-950 text-[#e6c800]">
                                            <Receipt size={18} />
                                        </div>
                                        {t("formTitle")}
                                    </h2>

                                    {error && (
                                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 font-black text-xs rounded-xl flex items-center gap-3">
                                            <AlertCircle size={15} /> {error}
                                        </div>
                                    )}

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                                                {t("selectProduct")}
                                            </label>
                                            <div className="relative">
                                                <select
                                                    required
                                                    value={productId}
                                                    onChange={handleProductChange}
                                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-950 font-black text-sm focus:ring-2 focus:ring-[#e6c800] focus:border-transparent focus:outline-none transition-all appearance-none cursor-pointer hover:bg-white"
                                                >
                                                    <option value="" disabled>{t("placeholder")}</option>
                                                    <option value="legal-toolkit">{t("products.legal_toolkit")}</option>
                                                </select>
                                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <ArrowRight size={16} className="rotate-90" />
                                                </div>
                                            </div>

                                            {/* Product preview — keep motion here: user-triggered by selection */}
                                            {productId && productDetails[productId] && (
                                                <motion.div
                                                    key={productId}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="mt-4 p-5 bg-slate-950 rounded-2xl text-white relative overflow-hidden"
                                                >
                                                    <div className="absolute right-0 top-0 w-32 h-32 bg-[#e6c800]/5 blur-2xl rounded-full pointer-events-none" />
                                                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div>
                                                            <h4 className="font-heading font-black text-[#e6c800] mb-1">
                                                                {productDetails[productId].name}
                                                            </h4>
                                                            <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-sm">
                                                                {productDetails[productId].desc}
                                                            </p>
                                                        </div>
                                                        {productDetails[productId].isFixed && (
                                                            <div className="text-right shrink-0">
                                                                <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
                                                                    Miktar
                                                                </div>
                                                                <div className="text-2xl font-heading font-black text-white">
                                                                    ₺{productDetails[productId].price}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                                                    {t("amount")}
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₺</span>
                                                    <input
                                                        type="number"
                                                        required
                                                        value={amount}
                                                        onChange={(e) => setAmount(e.target.value)}
                                                        readOnly={productId ? productDetails[productId]?.isFixed : false}
                                                        className={`w-full pl-10 pr-5 py-4 border rounded-2xl font-black text-sm transition-all ${
                                                            (productId && productDetails[productId]?.isFixed)
                                                                ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
                                                                : "bg-white border-slate-200 text-slate-950 focus:ring-2 focus:ring-[#e6c800] focus:border-transparent focus:outline-none"
                                                        }`}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                                                    {t("date")}
                                                </label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={new Date().toLocaleDateString()}
                                                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-50 rounded-2xl text-slate-400 font-black text-sm cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                                            {t("receipt")}
                                        </label>
                                        <label className={`w-full flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${
                                            fileName
                                                ? "border-[#e6c800] bg-[#e6c800]/5"
                                                : "border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-white"
                                        }`}>
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                                                fileName ? "bg-slate-950 text-[#e6c800]" : "bg-slate-100 text-slate-300"
                                            }`}>
                                                <UploadCloud size={28} />
                                            </div>
                                            <span className={`text-sm font-black mb-1 ${fileName ? "text-slate-950" : "text-slate-400"}`}>
                                                {fileName || t("upload")}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                                {t("formats")}
                                            </span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*,application/pdf"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            disabled={loading || !receiptBase64}
                                            className="w-full sm:w-auto px-10 py-4 bg-slate-950 text-[#e6c800] disabled:opacity-30 disabled:grayscale font-black rounded-2xl hover:bg-slate-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-3 text-sm tracking-widest uppercase"
                                        >
                                            {loading ? (
                                                <><Loader2 size={18} className="animate-spin" /> {t("sending")}</>
                                            ) : (
                                                <>{t("submit")} <ArrowRight size={18} /></>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Divider ── */}
            <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">
                    Geçmiş İşlemler
                </span>
                <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* ── Payment history ── */}
            <PaymentHistory refreshKey={historyKey} />
        </div>
    );
}
