"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { TrialRequestCTA } from "@/components/trial/TrialRequestCTA";

type TrialCountdownCardProps = {
    trialStatus: string;
    trialStartedAt: string | null;
    trialEndsAt: string | null;
    trialOperationsUsed: number;
    trialOperationsLimit: number;
    hasSubscription: boolean;
};

const TRIAL_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function getRemainingMs(endsAt: string | null): number {
    if (!endsAt) return 0;
    const end = new Date(endsAt);
    const now = new Date();
    return Math.max(0, end.getTime() - now.getTime());
}

function formatTimeLeft(endsAt: string | null): string {
    const diff = getRemainingMs(endsAt);
    if (diff <= 0) return "0 saat";
    const days = Math.floor(diff / DAY_MS);
    const hours = Math.floor((diff % DAY_MS) / HOUR_MS);
    if (days > 0) return `${days} gün ${hours} saat kaldı`;
    const mins = Math.floor((diff % HOUR_MS) / (60 * 1000));
    if (hours > 0) return `${hours} saat ${mins} dakika kaldı`;
    return `${mins} dakika kaldı`;
}

/** Compact format for header badge: "2g 4s kaldı" */
export function formatTimeLeftCompact(endsAt: string | null): string {
    const diff = getRemainingMs(endsAt);
    if (diff <= 0) return "0s";
    const days = Math.floor(diff / DAY_MS);
    const hours = Math.floor((diff % DAY_MS) / HOUR_MS);
    if (days > 0) return `${days}g ${hours}s kaldı`;
    if (hours > 0) return `${hours}s kaldı`;
    const mins = Math.floor((diff % HOUR_MS) / (60 * 1000));
    return `${mins}dk kaldı`;
}

type TrialCountdownCardPropsWithEmail = TrialCountdownCardProps & { emailVerified?: boolean };

export function TrialCountdownCard({
    trialStatus,
    trialStartedAt,
    trialEndsAt,
    trialOperationsUsed,
    trialOperationsLimit,
    hasSubscription,
    emailVerified = true,
}: TrialCountdownCardPropsWithEmail) {
    if (hasSubscription) return null;

    /* ── trialStatus === "none" ── */
    if (trialStatus === "none") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="p-6 rounded-2xl border border-amber-200"
                style={{ background: "#fafafc" }}
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-[#0a0c10] text-lg">3 Günlük Ücretsiz Demo</h3>
                            <p className="text-slate-600 text-sm mt-0.5">
                                20 işlem hakkı ile tüm belge araçlarını deneyin.
                            </p>
                        </div>
                    </div>
                    <TrialRequestCTA
                        emailVerified={emailVerified}
                        trialStatus={trialStatus}
                        hasSubscription={false}
                        source="dashboard"
                    />
                </div>
            </motion.div>
        );
    }

    /* ── trialStatus === "active" ── */
    if (trialStatus === "active") {
        const remainingMs = getRemainingMs(trialEndsAt);
        const remainingHours = remainingMs / HOUR_MS;
        const timeRemainingPct = Math.min(100, Math.max(0, (remainingMs / TRIAL_DAYS_MS) * 100));
        const usageProgress = Math.min(100, (trialOperationsUsed / trialOperationsLimit) * 100);
        const operationsRemaining = trialOperationsLimit - trialOperationsUsed;

        const isTimeUrgent24h = remainingHours <= 24 && remainingHours > 6;
        const isTimeUrgent6h = remainingHours <= 6;
        const isUsageLow = operationsRemaining <= 5 && operationsRemaining > 0;

        const urgencyStyle = isTimeUrgent6h
            ? "border-amber-300 bg-amber-50/80"
            : isTimeUrgent24h
                ? "border-amber-200 bg-amber-50/50"
                : "border-emerald-200 bg-emerald-50/30";

        const urgencyTitle = isTimeUrgent6h
            ? "Demo sürenizin bitmesine çok az kaldı"
            : isTimeUrgent24h
                ? "Demo süreniz bugün sona eriyor"
                : "Demo süreniz aktif";

        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`p-6 rounded-2xl border ${urgencyStyle}`}
                style={{ background: "#fafafc" }}
            >
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4 mb-4">
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                    isTimeUrgent6h ? "bg-amber-200 text-amber-700" : isTimeUrgent24h ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                                }`}
                            >
                                <Zap size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-[#0a0c10] text-lg">{urgencyTitle}</h3>
                                <p className="text-slate-600 text-sm mt-0.5">{formatTimeLeft(trialEndsAt)}</p>
                                <p className="text-slate-500 text-sm mt-1">
                                    {trialOperationsUsed} / {trialOperationsLimit} işlem kullandınız
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                    <span>Süre</span>
                                    <span>{Math.round(timeRemainingPct)}% kaldı</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${timeRemainingPct}%` }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className={`h-full rounded-full ${
                                            isTimeUrgent6h ? "bg-amber-500" : isTimeUrgent24h ? "bg-amber-400" : "bg-emerald-500"
                                        }`}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                    <span>İşlem kullanımı</span>
                                    <span>{trialOperationsUsed} / {trialOperationsLimit}</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${usageProgress}%` }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className={`h-full rounded-full ${isUsageLow ? "bg-amber-500" : "bg-slate-600"}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {isUsageLow && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-3 text-amber-700 text-sm font-medium"
                                >
                                    Son {operationsRemaining} kullanım hakkınız kaldı
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="lg:shrink-0 lg:self-center">
                        <Link
                            href="/dijital-urunler/hukuk-araclari-paketi"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#e6c800] text-[#0a0c10] font-black rounded-xl hover:bg-[#d4b800] transition-all shadow-sm"
                        >
                            Paketi Etkinleştir
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    }

    /* ── trialStatus === "expired" ── */
    if (trialStatus === "expired") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="p-6 rounded-2xl border border-slate-200"
                style={{ background: "#fafafc" }}
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-[#0a0c10] text-lg">Demo süreniz sona erdi</h3>
                            <p className="text-slate-600 text-sm mt-0.5">
                                Tam erişim için Hukuk Araçları Paketini satın alın.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/dijital-urunler/hukuk-araclari-paketi"
                        className="flex items-center gap-2 px-6 py-3 bg-[#e6c800] text-[#0a0c10] font-black rounded-xl hover:bg-[#d4b800] transition-all shrink-0"
                    >
                        Paketi Satın Al <ShoppingCart size={18} />
                    </Link>
                </div>
            </motion.div>
        );
    }

    return null;
}
