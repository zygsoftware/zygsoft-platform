"use client";

import { useState } from "react";
import { X, Loader2, Zap } from "lucide-react";

const TRIAL_DAYS = 3;
const TRIAL_OPERATIONS_LIMIT = 20;

type TrialStartConfirmModalProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
};

function formatTrialEndDate(): string {
    const end = new Date();
    end.setDate(end.getDate() + TRIAL_DAYS);
    return end.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function TrialStartConfirmModal({ open, onClose, onConfirm }: TrialStartConfirmModalProps) {
    const [loading, setLoading] = useState(false);
    const endDateStr = formatTrialEndDate();

    if (!open) return null;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden"
                role="dialog"
                aria-modal="true"
                aria-labelledby="trial-modal-title"
            >
                <div className="p-7">
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-[#e6c800]/20 flex items-center justify-center shrink-0 border border-[#e6c800]/30">
                            <Zap size={28} className="text-[#b89600]" />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            aria-label="Kapat"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <h2 id="trial-modal-title" className="text-xl font-display font-black text-slate-950 mb-4">
                        3 Günlük Demo Başlatılsın mı?
                    </h2>
                    <div className="space-y-3 text-slate-600 text-sm leading-relaxed mb-6">
                        <p>Demo erişiminiz bu onaydan sonra hemen aktif olacaktır.</p>
                        <ul className="space-y-1.5">
                            <li>• Demo süresi: 3 gün</li>
                            <li>• İşlem limiti: 20 işlem</li>
                            <li>• Demo bitiş tarihi: {endDateStr}</li>
                        </ul>
                        <p className="text-amber-700 font-medium text-xs mt-2">
                            Demo bir kez başlatılır ve geri alınamaz.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-5 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-70"
                        >
                            Vazgeç
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="flex-1 px-5 py-3 rounded-xl font-black bg-[#e6c800] text-slate-950 hover:bg-[#d4b800] transition-colors disabled:opacity-70 inline-flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                "Onaylıyorum, Demoyu Başlat"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
