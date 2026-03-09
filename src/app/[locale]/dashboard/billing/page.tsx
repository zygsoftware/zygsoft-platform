"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Receipt, CheckCircle, UploadCloud, Building, Calendar, ArrowRight, Loader2, Info, AlertCircle } from "lucide-react";

export default function BillingPage() {
    const { data: session } = useSession();
    const t = useTranslations("Dashboard.billing");
    const searchParams = useSearchParams();
    const [productId, setProductId] = useState("");
    const [amount, setAmount] = useState("999");
    const [fileName, setFileName] = useState("");
    const [receiptBase64, setReceiptBase64] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const productDetails: Record<string, { name: string, price: string, desc: string, isFixed: boolean }> = {
        "udf-toolkit": { name: "Hukuk UDF Dönüştürücü", price: "499", desc: "Aylık sınırsız DOCX, PDF ve UDF format dönüştürme aracı erişim lisansı.", isFixed: true },
        "web-dev": { name: "Kurumsal Web Projesi", price: "40000", desc: "Modern, yüksek performanslı ve responsive anahtar teslim web sitesi.", isFixed: false },
        "social-media": { name: "Sosyal Medya Yönetimi", price: "15000", desc: "Aylık profesyonel içerik üretimi, kampanya ve marka yönetimi.", isFixed: true },
        "other": { name: "Diğer / Özel Anlaşma", price: "", desc: "Özel projelendirme, ek servisler veya kurumsal anlaşmalar.", isFixed: false }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        const prod = searchParams.get("product");
        if (prod && productDetails[prod]) {
            setProductId(prod);
            setAmount(productDetails[prod].price);
        }
    }, [searchParams]);

    const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setProductId(val);
        if (productDetails[val] && productDetails[val].isFixed) {
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
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: parseFloat(amount), receiptImage: receiptBase64, productId }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Error");
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError("Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col">
            <main className="flex-1 flex flex-col relative overflow-hidden">
                <div className="container mx-auto max-w-5xl relative z-10">
                    <div className="mb-10">
                        <h1 className="text-3xl font-heading font-black text-slate-950 mb-2">{t("title")}</h1>
                        <p className="text-slate-500 font-medium italic opacity-80">{t("subtitle")}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Bank Info */}
                        <div className="lg:col-span-1 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden group group-hover:border-slate-200 transition-all"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-[1rem] bg-slate-950 shadow-lg flex items-center justify-center text-[#e6c800]">
                                        <Building size={22} />
                                    </div>
                                    <h2 className="text-xl font-heading font-black text-slate-950">{t("bankInfo")}</h2>
                                </div>

                                <div className="space-y-6 text-sm">
                                    <div>
                                        <div className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1.5">{t("bankName")}</div>
                                        <div className="text-slate-950 font-black text-base">Garanti BBVA</div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-50">
                                        <div className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1.5">{t("receiverName")}</div>
                                        <div className="text-slate-950 font-black text-base">Zygsoft Yazılım Çözümleri</div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-50">
                                        <div className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1.5">{t("iban")}</div>
                                        <div className="text-slate-950 font-mono tracking-tighter bg-slate-50 p-4 rounded-xl border border-slate-100 break-all text-[13px] font-black mt-2 select-all">
                                            TR99 0006 2000 0000 0000 0000 00
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-slate-50">
                                        <div className="flex items-start gap-3 bg-blue-50/50 border border-blue-100/50 p-4 rounded-xl text-blue-900 shadow-sm">
                                            <Info size={18} className="mt-0.5 shrink-0 text-blue-500" />
                                            <p className="text-[11px] font-bold leading-relaxed opacity-80">
                                                {t("note")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Notification Form */}
                        <div className="lg:col-span-2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm"
                            >
                                {success ? (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-8 relative border border-emerald-100">
                                            <CheckCircle size={48} className="text-emerald-500" />
                                        </div>
                                        <h3 className="text-3xl font-heading font-black text-slate-950 mb-3">{t("successTitle")}</h3>
                                        <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto text-lg leading-relaxed">
                                            {t("successDesc")}
                                        </p>
                                        <button
                                            onClick={() => { setSuccess(false); setFileName(""); setReceiptBase64(""); }}
                                            className="px-10 py-4 bg-slate-950 text-[#e6c800] font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
                                        >
                                            {t("newNotice")}
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <h2 className="text-2xl font-heading font-black text-slate-950 flex items-center gap-4">
                                            <div className="p-2.5 rounded-xl bg-slate-950 text-[#e6c800] shadow-md">
                                                <Receipt size={22} />
                                            </div>
                                            {t("formTitle")}
                                        </h2>

                                        {error && (
                                            <div className="p-4 bg-red-50 border border-red-100 text-red-600 font-black text-xs rounded-xl flex items-center gap-3">
                                                <AlertCircle size={16} /> {error}
                                            </div>
                                        )}

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                                                    {t("selectProduct")}
                                                </label>
                                                <div className="relative group">
                                                    <select
                                                        required
                                                        value={productId}
                                                        onChange={handleProductChange}
                                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-950 font-black text-sm focus:ring-2 focus:ring-[#e6c800] focus:border-transparent focus:outline-none transition-all appearance-none cursor-pointer group-hover:bg-white"
                                                    >
                                                        <option value="" disabled>{t("placeholder")}</option>
                                                        <option value="udf-toolkit">{t("products.udf_toolkit")}</option>
                                                        <option value="web-dev">{t("products.web_dev")}</option>
                                                        <option value="social-media">{t("products.social_media")}</option>
                                                        <option value="other">{t("products.other")}</option>
                                                    </select>
                                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                        <ArrowRight size={18} className="rotate-90" />
                                                    </div>
                                                </div>

                                                {/* Dynamic Product Detail Card */}
                                                {productId && productDetails[productId] && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="mt-6 p-6 bg-slate-950 rounded-2xl text-white shadow-2xl relative overflow-hidden group"
                                                    >
                                                        <div className="absolute right-[-10%] top-[-20%] w-48 h-48 bg-[#e6c800]/5 blur-2xl rounded-full" />
                                                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                            <div>
                                                                <h4 className="font-heading font-black text-lg text-[#e6c800] mb-1">
                                                                    {productDetails[productId].name}
                                                                </h4>
                                                                <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-md">
                                                                    {productDetails[productId].desc}
                                                                </p>
                                                            </div>
                                                            {productDetails[productId].isFixed && (
                                                                <div className="text-right shrink-0">
                                                                    <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1.5">Miktar</div>
                                                                    <div className="text-3xl font-heading font-black text-white">₺{productDetails[productId].price}</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                                                        {t("amount")}
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">₺</span>
                                                        <input
                                                            type="number"
                                                            required
                                                            value={amount}
                                                            onChange={(e) => setAmount(e.target.value)}
                                                            readOnly={productId ? productDetails[productId]?.isFixed : false}
                                                            className={`w-full pl-12 pr-6 py-4 border rounded-2xl font-black text-sm transition-all ${(productId && productDetails[productId]?.isFixed)
                                                                ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
                                                                : 'bg-white border-slate-200 text-slate-950 focus:ring-2 focus:ring-[#e6c800] focus:border-transparent focus:outline-none shadow-sm'
                                                                }`}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                                                        {t("date")}
                                                    </label>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                        <input
                                                            type="text"
                                                            readOnly
                                                            value={new Date().toLocaleDateString()}
                                                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl text-slate-400 font-black text-sm cursor-not-allowed"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                                                {t("receipt")}
                                            </label>
                                            <label className={`w-full flex-col flex items-center justify-center p-12 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all ${fileName ? 'border-[#e6c800] bg-[#e6c800]/5 ring-4 ring-[#e6c800]/5' : 'border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-white'}`}>
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-colors ${fileName ? 'bg-slate-950 text-[#e6c800]' : 'bg-slate-100 text-slate-300'}`}>
                                                    <UploadCloud size={32} />
                                                </div>
                                                <span className={`text-[15px] font-black mb-1.5 ${fileName ? 'text-slate-950' : 'text-slate-400'}`}>
                                                    {fileName || t("upload")}
                                                </span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{t("formats")}</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*,application/pdf"
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                        </div>

                                        <div className="pt-6">
                                            <button
                                                type="submit"
                                                disabled={loading || !receiptBase64}
                                                className="w-full sm:w-auto px-12 py-5 bg-slate-950 text-[#e6c800] disabled:opacity-30 disabled:grayscale font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-black/20 flex items-center justify-center gap-4 text-sm tracking-widest uppercase"
                                            >
                                                {loading ? (
                                                    <><Loader2 size={20} className="animate-spin" /> {t("sending")}</>
                                                ) : (
                                                    <>{t("submit")} <ArrowRight size={20} /></>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
