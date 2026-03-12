"use client";

import { useState } from "react";
import { Zap, Loader2, ShoppingCart } from "lucide-react";
import Link from "next/link";

type TrialCardProps = {
    trialStatus: string;
    trialEndsAt: string | null;
    trialOperationsUsed: number;
    trialOperationsLimit: number;
    hasSubscription: boolean;
};

function formatTimeLeft(endsAt: string | null): string {
    if (!endsAt) return "";
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return "0 saat";
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    if (days > 0) return `${days} gün ${hours} saat kaldı`;
    return `${hours} saat kaldı`;
}

export function TrialCard({
    trialStatus,
    trialEndsAt,
    trialOperationsUsed,
    trialOperationsLimit,
    hasSubscription,
}: TrialCardProps) {
    const [starting, setStarting] = useState(false);

    if (hasSubscription) return null;

    const handleStartTrial = async () => {
        setStarting(true);
        try {
            const res = await fetch("/api/trial/start", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                window.location.reload();
            } else {
                alert(data.error || "Bir hata oluştu.");
            }
        } catch {
            alert("Bağlantı hatası.");
        } finally {
            setStarting(false);
        }
    };

    if (trialStatus === "none") {
        return (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-50/50 border border-amber-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-950 text-lg">3 Günlük Ücretsiz Demo</h3>
                            <p className="text-slate-600 text-sm mt-0.5">
                                20 işlem hakkı ile tüm belge araçlarını deneyin.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleStartTrial}
                        disabled={starting}
                        className="flex items-center gap-2 px-6 py-3 bg-[#e6c800] text-slate-950 font-black rounded-xl hover:bg-[#d4b800] transition-all disabled:opacity-70 shrink-0"
                    >
                        {starting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Başlatılıyor...
                            </>
                        ) : (
                            "Demo Başlat"
                        )}
                    </button>
                </div>
            </div>
        );
    }

    if (trialStatus === "active") {
        const endDate = trialEndsAt ? new Date(trialEndsAt) : null;
        const now = new Date();
        const totalMs = 3 * 24 * 60 * 60 * 1000;
        const elapsedMs = endDate ? Math.max(0, endDate.getTime() - now.getTime()) : 0;
        const timeRemainingPct = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
        const usageProgress = Math.min(100, (trialOperationsUsed / trialOperationsLimit) * 100);

        return (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-50/50 border border-emerald-200">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-950 text-lg">Demo süreniz aktif</h3>
                        <p className="text-slate-600 text-sm mt-0.5">{formatTimeLeft(trialEndsAt)}</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                            <span>Süre</span>
                            <span>{Math.round(timeRemainingPct)}% kaldı</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-emerald-500 transition-all"
                                style={{ width: `${timeRemainingPct}%` }}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                            <span>İşlem kullanımı</span>
                            <span>{trialOperationsUsed} / {trialOperationsLimit}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-amber-500 transition-all"
                                style={{ width: `${usageProgress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (trialStatus === "expired") {
        return (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-950 text-lg">Demo süreniz sona erdi</h3>
                            <p className="text-slate-600 text-sm mt-0.5">
                                Tam erişim için Hukuk Araçları Paketini satın alın.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/dijital-urunler/hukuk-araclari-paketi"
                        className="flex items-center gap-2 px-6 py-3 bg-[#e6c800] text-slate-950 font-black rounded-xl hover:bg-[#d4b800] transition-all shrink-0"
                    >
                        Paketi Satın Al <ShoppingCart size={18} />
                    </Link>
                </div>
            </div>
        );
    }

    return null;
}
