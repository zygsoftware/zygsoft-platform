"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthShell, AuthFormPanel, AuthHeroPanel, AuthActions } from "@/components/auth";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { Mail, Loader2 } from "lucide-react";

const RESEND_COOLDOWN_SECONDS = 180;

function getCooldownKey(locale: string) {
    return `zygsoft-verification-resend:${locale}`;
}

export default function VerifyEmailRequiredPage() {
    const t = useTranslations("Auth.verifyEmailRequired");
    const locale = useLocale();
    useSession();
    const loginPath = locale === "en" ? "/en/login" : "/login";
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const [cooldownLeft, setCooldownLeft] = useState(0);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const key = getCooldownKey(locale);
        const syncCooldown = () => {
            const rawValue = window.localStorage.getItem(key);
            if (!rawValue) {
                setCooldownLeft(0);
                return;
            }

            const expiresAt = Number(rawValue);
            const nextLeft = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
            setCooldownLeft(nextLeft);

            if (nextLeft <= 0) {
                window.localStorage.removeItem(key);
            }
        };

        syncCooldown();
        const interval = window.setInterval(syncCooldown, 1000);
        return () => window.clearInterval(interval);
    }, [locale]);

    const cooldownLabel = useMemo(() => {
        const minutes = Math.floor(cooldownLeft / 60);
        const seconds = cooldownLeft % 60;
        return `${minutes}:${String(seconds).padStart(2, "0")}`;
    }, [cooldownLeft]);

    const handleResend = async () => {
        if (cooldownLeft > 0) return;

        setSending(true);
        setError("");
        try {
            const res = await fetch("/api/auth/send-verification-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ locale: locale === "en" ? "en" : "tr" }),
            });
            const data = await res.json();
            if (res.ok) {
                setSent(true);
                const expiresAt = Date.now() + RESEND_COOLDOWN_SECONDS * 1000;
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(getCooldownKey(locale), String(expiresAt));
                }
                setCooldownLeft(RESEND_COOLDOWN_SECONDS);
            } else {
                setError(data.error || "Bir hata oluştu.");
            }
        } catch {
            setError("Bağlantı hatası.");
        } finally {
            setSending(false);
        }
    };

    return (
        <AuthShell
            hero={
                <AuthHeroPanel
                    title="E-posta"
                    titleAccent="Doğrulama Gerekli"
                    subtitle="Sistemi kullanmak için e-posta adresinizi doğrulamanız gerekiyor."
                    features={[
                        { label: "Güvenli", value: "✓" },
                        { label: "Tek Tıklama", value: "✓" },
                    ]}
                />
            }
        >
            <AuthFormPanel>
                <div className="mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
                        <Mail size={32} className="text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-display font-black text-[#343131] mb-4">
                        {t("title")}
                    </h1>
                    <p className="text-[#343131]/60 text-[15px] leading-relaxed mb-6">
                        {t("message")}
                    </p>
                    {sent && (
                        <p className="text-emerald-600 text-sm font-medium mb-4">
                            {t("sent")}
                        </p>
                    )}
                    {error && (
                        <p className="text-red-600 text-sm font-medium mb-4">{error}</p>
                    )}
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={sending || cooldownLeft > 0}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#e6c800] text-[#343131] font-black uppercase tracking-[0.2em] text-[11px] rounded-xl hover:bg-[#d4b800] disabled:opacity-70 transition-all"
                    >
                        {sending ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Gönderiliyor...
                            </>
                        ) : cooldownLeft > 0 ? (
                            `${t("resendButton")} (${cooldownLabel})`
                        ) : (
                            t("resendButton")
                        )}
                    </button>
                    <p className="mt-4 text-center text-xs font-medium text-[#343131]/45">
                        {locale === "en"
                            ? "You can request a new verification email every 3 minutes."
                            : "Yeni doğrulama e-postasi her 3 dakikada bir gonderilebilir."}
                    </p>
                </div>
                <AuthActions footerLinks={[{ href: loginPath, label: t("backToLogin") }]} />
            </AuthFormPanel>
        </AuthShell>
    );
}
