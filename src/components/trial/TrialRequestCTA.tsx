"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { Loader2, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { TrialStartConfirmModal } from "./TrialStartConfirmModal";

type TrialRequestCTAProps = {
    emailVerified: boolean;
    trialStatus: string;
    hasSubscription: boolean;
    compact?: boolean;
    source: "dashboard" | "product-page" | "tool-page" | "onboarding" | "banner";
    className?: string;
};

const btnBase = "inline-flex items-center gap-2 transition-all";
const btnFull = "px-6 py-3 bg-[#e6c800] text-[#0a0c10] font-black rounded-xl hover:bg-[#d4b800]";
const btnCompact = "px-4 py-2 text-xs font-bold bg-[#e6c800] text-[#0a0c10] rounded-lg hover:bg-[#d4b800]";

export function TrialRequestCTA({
    emailVerified,
    trialStatus,
    hasSubscription,
    compact = false,
    source,
    className = "",
}: TrialRequestCTAProps) {
    const { data: session, update: updateSession } = useSession();
    const locale = useLocale();
    const [modalOpen, setModalOpen] = useState(false);

    if (hasSubscription) return null;

    const packageHref = locale === "en" ? "/en/dijital-urunler/hukuk-araclari-paketi" : "/dijital-urunler/hukuk-araclari-paketi";
    const dashboardHref = locale === "en" ? "/en/dashboard" : "/dashboard";
    const verifyHref = locale === "en" ? "/en/verify-email-required" : "/verify-email-required";

    const handleStartTrial = async () => {
        try {
            const res = await fetch("/api/trial/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ source }),
            });
            const data = await res.json();
            if (res.ok) {
                await updateSession();
                toast.success("Demo erişiminiz aktif edildi.");
            } else {
                toast.error(data.error || "Bir hata oluştu.");
                throw new Error(data.error);
            }
        } catch (e) {
            if (!(e instanceof Error) || !e.message.startsWith("Bir hata")) {
                toast.error("Bağlantı hatası.");
            }
            throw e;
        }
    };

    const size = compact ? 14 : 18;
    const cls = `${btnBase} ${compact ? btnCompact : btnFull} ${className}`;

    if (!emailVerified) {
        return (
            <Link href={verifyHref} className={cls}>
                Önce Email Doğrula <ChevronRight size={size} />
            </Link>
        );
    }

    if (trialStatus === "none") {
        return (
            <>
                <button onClick={() => setModalOpen(true)} className={cls}>
                    3 Günlük Demo Başlat <ChevronRight size={size} />
                </button>
                <TrialStartConfirmModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onConfirm={handleStartTrial}
                />
            </>
        );
    }

    if (trialStatus === "active") {
        return (
            <Link href={dashboardHref} className={cls}>
                Demo Aktif — Panele Git <ChevronRight size={size} />
            </Link>
        );
    }

    return (
        <Link href={packageHref} className={cls}>
            Paketi Etkinleştir <ChevronRight size={size} />
        </Link>
    );
}
