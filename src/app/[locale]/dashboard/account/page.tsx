"use client";

import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Mail, Calendar, LogOut, ArrowRight, Activity, Receipt, CheckCircle, Clock, LayoutDashboard, Loader2, AlertCircle, Fingerprint, Lock, ShieldAlert, BadgeCheck, KeyRound } from "lucide-react";
import { Link } from "@/i18n/navigation";

type AccountSubscription = {
    id: string;
    status?: string;
    endsAt?: string | null;
    product?: {
        name?: string | null;
    } | null;
};

type AccountUser = {
    name?: string | null;
    email?: string | null;
    role?: string | null;
    emailVerified?: boolean | Date | null;
    subscriptions?: AccountSubscription[];
};

export default function AccountPage() {
    const { data: session, status } = useSession();
    const t = useTranslations("Dashboard.account");
    const router = useRouter();

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading" || !session) {
        return (
            <div className="h-full flex items-center justify-center min-h-[500px]">
                <Loader2 className="w-10 h-10 text-[#e6c800] animate-spin" />
            </div>
        );
    }

    const user = session.user as typeof session.user & AccountUser;

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call for password change
        setTimeout(() => {
            setIsSubmitting(false);
            setPasswordSuccess(true);
            setTimeout(() => {
                setShowPasswordForm(false);
                setPasswordSuccess(false);
                setPasswordData({ current: "", new: "", confirm: "" });
            }, 2000);
        }, 1000);
    };

    return (
        <div className="flex flex-col pb-20">
            <main className="flex-1 flex flex-col relative overflow-hidden">
                <div className="container mx-auto max-w-6xl relative z-10 space-y-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                        {/* Decorative blur */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#e6c800]/10 blur-3xl rounded-full" />
                        
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e6c800]/10 text-yellow-700 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                                <Fingerprint size={12} />
                                {t("profileSecurityBadge")}
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-heading font-black text-slate-900 mb-3 flex items-center gap-4">
                                {t("title")}
                            </h1>
                            <p className="text-slate-500 font-medium max-w-lg">{t("subtitle")}</p>
                        </div>
                        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
                            <Link
                                href="/dashboard"
                                className="flex-1 md:flex-none px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-black rounded-2xl flex justify-center items-center gap-3 transition-all text-sm group"
                            >
                                <LayoutDashboard size={18} className="text-slate-400 group-hover:text-slate-900 transition-colors" /> {t("goToPanel")}
                            </Link>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="flex-1 md:flex-none px-6 py-3.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-black rounded-2xl flex justify-center items-center gap-3 transition-all border border-red-100 text-sm group"
                            >
                                <LogOut size={18} className="group-hover:text-white transition-colors" /> {t("logout")}
                            </button>
                        </div>
                    </div>

                    {/* Bento Grid layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-4 flex flex-col gap-6"
                        >
                            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm text-center relative overflow-hidden group flex-1 flex flex-col justify-center">
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-white pointer-events-none" />
                                
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="relative mb-6 group-hover:scale-105 transition-transform duration-500">
                                        <div className="w-28 h-28 bg-[#e6c800] rounded-full flex items-center justify-center text-4xl font-heading font-black text-slate-900 shadow-2xl shadow-[#e6c800]/20">
                                            {user?.email?.[0].toUpperCase()}
                                        </div>
                                        {user?.role === "admin" && (
                                            <div className="absolute -bottom-2 -right-2 bg-slate-900 text-[#e6c800] p-2 rounded-full border-4 border-white shadow-xl">
                                                <BadgeCheck size={20} />
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-2xl font-heading font-black text-slate-900 mb-1">{user?.name || t("userFallback")}</h3>
                                    <p className="text-slate-400 font-medium mb-8 text-sm">{user?.role === "admin" ? t("admin") : t("customer")}</p>

                                    <div className="w-full space-y-3">
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left transition-colors hover:border-slate-300">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                                                <Mail size={16} className="text-slate-400" />
                                            </div>
                                            <div className="min-w-0 pr-2">
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">{t("email")}</p>
                                                <p className="text-sm text-slate-900 font-bold truncate">{user?.email}</p>
                                            </div>
                                        </div>

                                        <div className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-colors ${
                                            user?.emailVerified
                                                ? "bg-emerald-50/50 border-emerald-100 hover:border-emerald-200"
                                                : "bg-amber-50/50 border-amber-100 hover:border-amber-200"
                                        }`}>
                                            <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${
                                                user?.emailVerified ? "border-emerald-100" : "border-amber-100"
                                            }`}>
                                                <ShieldCheck size={16} className={user?.emailVerified ? "text-emerald-500" : "text-amber-500"} />
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${
                                                    user?.emailVerified ? "text-emerald-600" : "text-amber-600"
                                                }`}>
                                                    {t("emailVerification")}
                                                </p>
                                                <p className={`text-sm font-bold ${
                                                    user?.emailVerified ? "text-emerald-900" : "text-amber-900"
                                                }`}>
                                                    {user?.emailVerified ? t("verified") : t("notVerified")}
                                                </p>
                                            </div>
                                            {(!user?.emailVerified) && (
                                                <button
                                                    onClick={() => router.push('/verify-email')}
                                                    className="px-4 py-2 bg-white text-amber-700 hover:bg-amber-100 hover:text-amber-900 rounded-xl text-[10px] font-black transition-colors uppercase tracking-widest border border-amber-200 shadow-sm shrink-0"
                                                >
                                                    {t("verifyCta")}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-8 flex flex-col gap-6"
                        >
                            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col h-full">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                                    <div>
                                        <h2 className="text-2xl font-heading font-black text-slate-900 mb-2 flex items-center gap-3">
                                            <Activity className="text-[#e6c800]" size={24} />
                                            {t("subsTitle")}
                                        </h2>
                                        <p className="text-slate-500 font-medium text-sm">{t("subsSubtitle")}</p>
                                    </div>
                                    <Link
                                        href="/dijital-urunler"
                                        className="px-5 py-3 bg-[#e6c800] text-slate-900 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#e6c800]/20 text-sm flex items-center gap-2 shrink-0"
                                    >
                                        <ArrowRight size={18} className="order-last" /> {t("buyNew")}
                                    </Link>
                                </div>

                                <div className="flex-1 flex flex-col justify-center">
                                    {user?.subscriptions && user.subscriptions.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {user.subscriptions.map((sub) => (
                                                <div key={sub.id} className="p-6 bg-slate-50/80 rounded-[2rem] border border-slate-100 flex flex-col gap-5 hover:border-[#e6c800]/30 hover:bg-white transition-all group">
                                                    <div className="flex items-start justify-between">
                                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                                                            <Activity size={20} className="text-slate-400 group-hover:text-[#e6c800] transition-colors" />
                                                        </div>
                                                        {sub.status === "active" && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100/50">
                                                                <CheckCircle size={12} /> {t("statusActive")}
                                                            </span>
                                                        )}
                                                        {sub.status === "pending_approval" && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-100/50">
                                                                <Clock size={12} /> {t("statusPending")}
                                                            </span>
                                                        )}
                                                        {sub.status === "inactive" && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-100/50">
                                                                <AlertCircle size={12} /> {t("statusInactive")}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div>
                                                        <p className="text-lg font-heading font-black text-slate-900 mb-1">{sub.product?.name}</p>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                            <Calendar size={14} className="text-slate-400" />
                                                            {t("endsLabel")}: <strong className="text-slate-800">{sub.endsAt ? new Date(sub.endsAt).toLocaleDateString() : "-"}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-10 text-center bg-slate-50/50 rounded-[2rem] border border-slate-200 border-dashed">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                                                <Activity size={24} className="text-slate-300" />
                                            </div>
                                            <p className="text-slate-900 font-black mb-2">{t("noSubs")}</p>
                                            <p className="text-slate-500 text-sm">{t("noSubsDesc")}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-500 hidden sm:block">{t("billingPrompt")}</p>
                                    <Link
                                        href="/payment"
                                        className="px-6 py-3 bg-slate-50 hover:bg-slate-900 hover:text-[#e6c800] !text-black font-black rounded-xl transition-all flex items-center justify-center gap-2 text-xs border border-slate-200 w-full sm:w-auto"
                                    >
                                        <Receipt size={16} /> <span className="!text-slate-900">{t("notifyPayment")}</span>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-12"
                        >
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 lg:p-10 text-white relative overflow-hidden group">
                                {/* Decorative elements */}
                                <div className="absolute right-[-10%] top-[-20%] w-96 h-96 bg-[#e6c800]/10 blur-[80px] rounded-full group-hover:bg-[#e6c800]/20 transition-all duration-1000 ease-out" />
                                <div className="absolute left-[-5%] bottom-[-10%] w-64 h-64 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />

                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
                                    <div className="relative z-10 flex-1 max-w-2xl">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/5 text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
                                            <Lock size={12} className="text-[#e6c800]" />
                                            <span className="text-[#e6c800]">{t("securityBadge")}</span>
                                        </div>
                                        <h3 className="text-2xl lg:text-3xl font-heading font-black text-white mb-4 flex items-center gap-3">
                                            {t("security")}
                                        </h3>
                                        <p className="text-slate-400 text-base font-medium leading-relaxed mb-0">
                                            {t("securityDesc")} {t("securityDescExtra")}
                                        </p>
                                    </div>

                                    {!showPasswordForm && (
                                        <div className="relative z-10 w-full md:w-auto shrink-0 flex flex-col sm:flex-row items-center gap-4">
                                            <button 
                                                onClick={() => setShowPasswordForm(true)}
                                                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 !text-white border border-white/10 px-8 py-4 rounded-2xl font-black text-sm transition-all"
                                            >
                                                <KeyRound size={18} className="text-[#e6c800]" /> <span className="!text-white">{t("changePassword")}</span>
                                            </button>
                                            <Link 
                                                href="/contact" 
                                                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-100 !text-slate-900 px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl hover:scale-105 active:scale-95"
                                            >
                                                <ShieldAlert size={18} className="text-red-500" /> <span className="!text-slate-900">{t("contactSupport")}</span> <ArrowRight size={16} className="text-slate-400" />
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {showPasswordForm && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                            animate={{ opacity: 1, height: "auto", marginTop: 40 }}
                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                            className="relative z-10 overflow-hidden"
                                        >
                                            <form onSubmit={handlePasswordChange} className="bg-slate-950/50 border border-white/10 p-6 md:p-8 rounded-[2rem] max-w-2xl">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h4 className="text-xl font-heading font-black text-white flex items-center gap-3">
                                                        <KeyRound size={20} className="text-[#e6c800]" /> {t("passwordUpdateTitle")}
                                                    </h4>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setShowPasswordForm(false)}
                                                        className="text-slate-400 hover:text-white text-sm font-bold transition-colors"
                                                    >
                                                        {t("cancel")}
                                                    </button>
                                                </div>

                                                {passwordSuccess ? (
                                                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-2xl flex items-center gap-4">
                                                        <CheckCircle size={24} />
                                                        <div>
                                                            <p className="font-black text-emerald-300">{t("passwordUpdatedTitle")}</p>
                                                            <p className="text-sm font-medium">{t("passwordUpdatedDesc")}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t("currentPasswordLabel")}</label>
                                                            <input 
                                                                type="password" 
                                                                required
                                                                value={passwordData.current}
                                                                onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                                                                className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#e6c800] focus:ring-1 focus:ring-[#e6c800] transition-all text-sm"
                                                                placeholder={t("currentPasswordPlaceholder")}
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t("newPasswordLabel")}</label>
                                                                <input 
                                                                    type="password" 
                                                                    required
                                                                    minLength={6}
                                                                    value={passwordData.new}
                                                                    onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                                                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#e6c800] focus:ring-1 focus:ring-[#e6c800] transition-all text-sm"
                                                                    placeholder={t("newPasswordPlaceholder")}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t("confirmPasswordLabel")}</label>
                                                                <input 
                                                                    type="password" 
                                                                    required
                                                                    minLength={6}
                                                                    value={passwordData.confirm}
                                                                    onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                                                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#e6c800] focus:ring-1 focus:ring-[#e6c800] transition-all text-sm"
                                                                    placeholder={t("confirmPasswordPlaceholder")}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="pt-4 flex justify-end">
                                                            <button 
                                                                disabled={isSubmitting || passwordData.new !== passwordData.confirm || passwordData.current === ""}
                                                                type="submit"
                                                                className="bg-[#e6c800] hover:bg-[#ffe000] text-slate-900 disabled:opacity-50 disabled:hover:bg-[#e6c800] px-8 py-3.5 rounded-xl font-black text-sm transition-all flex items-center gap-3"
                                                            >
                                                                {isSubmitting ? (
                                                                    <><Loader2 size={16} className="animate-spin" /> {t("updating")}</>
                                                                ) : (
                                                                    t("updatePassword")
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </form>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
