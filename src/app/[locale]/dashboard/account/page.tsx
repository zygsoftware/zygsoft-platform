"use client";

import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { User, ShieldCheck, Mail, Calendar, LogOut, ArrowRight, Activity, Receipt, CheckCircle, Clock, LayoutDashboard, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
    const { data: session, status } = useSession();
    const t = useTranslations("Dashboard.account");
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading" || !session) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#e6c800] animate-spin" />
            </div>
        );
    }

    const { user } = session as any;

    return (
        <div className="flex flex-col">
            <main className="flex-1 flex flex-col relative overflow-hidden">
                <div className="container mx-auto max-w-5xl relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
                        <div>
                            <h1 className="text-3xl font-heading font-black text-slate-950 mb-2 flex items-center gap-4">
                                <User className="text-[#e6c800]" size={36} /> {t("title")}
                            </h1>
                            <p className="text-slate-500 font-medium italic opacity-80">{t("subtitle")}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="px-6 py-3 bg-white border border-slate-100 hover:bg-slate-950 hover:text-[#e6c800] hover:border-slate-950 text-slate-950 font-black rounded-2xl flex items-center gap-3 transition-all shadow-sm text-sm"
                            >
                                <LayoutDashboard size={18} /> {t("goToPanel")}
                            </Link>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="px-6 py-3 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 font-black rounded-2xl flex items-center gap-3 transition-all border border-red-100 text-sm"
                            >
                                <LogOut size={18} /> {t("logout")}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Sol Sütun - Kullanıcı Bilgileri */}
                        <div className="lg:col-span-1 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm text-center relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white pointer-events-none" />

                                <div className="relative z-10">
                                    <div className="w-24 h-24 bg-slate-950 rounded-[2rem] flex items-center justify-center text-4xl font-heading font-black text-[#e6c800] mb-8 mx-auto shadow-2xl shadow-black/10 group-hover:scale-105 transition-transform duration-500">
                                        {user?.email?.[0].toUpperCase()}
                                    </div>

                                    <h3 className="text-xl font-heading font-black text-slate-950 mb-8">{t("profileDetails")}</h3>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                                            <Mail size={18} className="text-slate-400 mt-1" />
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5">{t("email")}</p>
                                                <p className="text-sm text-slate-950 font-black break-all">{user?.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                                            <ShieldCheck size={18} className="text-slate-400 mt-1" />
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5">{t("accountType")}</p>
                                                <p className="text-sm text-slate-950 font-black">
                                                    {user?.role === "admin" ? t("admin") : t("customer")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Sağ Sütun - Abonelik Durumu */}
                        <div className="lg:col-span-2 space-y-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-10">
                                    <div>
                                        <h2 className="text-2xl font-heading font-black text-slate-950 mb-2 flex items-center gap-3">
                                            <Activity className="text-[#e6c800]" size={28} />
                                            {t("subsTitle")}
                                        </h2>
                                        <p className="text-slate-500 font-medium text-sm italic opacity-80">{t("subsSubtitle")}</p>
                                    </div>
                                    <Link
                                        href="/abonelikler"
                                        className="px-6 py-3 bg-[#e6c800] text-slate-950 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#e6c800]/20 text-sm flex items-center gap-2"
                                    >
                                        <ArrowRight size={18} className="order-last" /> {t("buyNew")}
                                    </Link>
                                </div>

                                {user?.subscriptions && user.subscriptions.length > 0 ? (
                                    <div className="space-y-4 mb-10">
                                        {user.subscriptions.map((sub: any) => (
                                            <div key={sub.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#e6c800]/30 transition-colors">
                                                <div>
                                                    <p className="text-lg font-heading font-black text-slate-950 mb-1">{sub.product?.name}</p>
                                                    <p className="text-xs text-slate-400 font-bold flex items-center gap-2">
                                                        <Calendar size={14} className="text-[#e6c800]" />
                                                        Bitiş: {sub.endsAt ? new Date(sub.endsAt).toLocaleDateString() : "-"}
                                                    </p>
                                                </div>
                                                <div className="shrink-0">
                                                    {sub.status === "active" && (
                                                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-black uppercase tracking-widest">
                                                            <CheckCircle size={14} /> {t("statusActive")}
                                                        </span>
                                                    )}
                                                    {sub.status === "pending_approval" && (
                                                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 text-xs font-black uppercase tracking-widest">
                                                            <Clock size={14} /> {t("statusPending")}
                                                        </span>
                                                    )}
                                                    {sub.status === "inactive" && (
                                                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-black uppercase tracking-widest">
                                                            <AlertCircle size={14} /> {t("statusInactive")}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center bg-slate-50 rounded-[2rem] border border-slate-100 border-dashed mb-10">
                                        <p className="text-slate-500 font-bold mb-3">{t("noSubs")}</p>
                                        <p className="text-slate-400 text-xs font-medium">{t("noSubsDesc")}</p>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-slate-50">
                                    <Link
                                        href="/dashboard/billing"
                                        className="px-8 py-4 bg-slate-950 text-[#e6c800] font-black rounded-2xl transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 text-sm"
                                    >
                                        <Receipt size={18} /> {t("notifyPayment")}
                                    </Link>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-slate-950 rounded-[2.5rem] p-10 text-white relative overflow-hidden group"
                            >
                                <div className="absolute right-[-5%] top-[-10%] w-64 h-64 bg-[#e6c800]/5 blur-3xl rounded-full group-hover:bg-[#e6c800]/10 transition-all duration-1000" />

                                <h3 className="text-xl font-heading font-black text-white mb-6 flex items-center gap-3">
                                    <ShieldCheck className="text-[#e6c800]" size={24} /> {t("security")}
                                </h3>
                                <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed max-w-xl">
                                    {t("securityDesc")}
                                </p>
                                <Link href="/contact" className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 text-[#e6c800] px-6 py-3 rounded-xl font-black text-xs transition-all border border-white/5">
                                    {t("contactSupport")} <ArrowRight size={14} />
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
