"use client";

import { useState } from "react";
import { AuthShell, AuthFormPanel, AuthHeroPanel, AuthActions } from "@/components/auth";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { Mail, Loader2 } from "lucide-react";
import { TrialRequestCTA } from "@/components/trial/TrialRequestCTA";

export default function VerifyEmailRequiredPage() {
    const t = useTranslations("Auth.verifyEmailRequired");
    const locale = useLocale();
    const { data: session } = useSession();
    const loginPath = locale === "en" ? "/en/login" : "/login";
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleResend = async () => {
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
                    <h1 className="text-2xl font-display font-black text-[#0a0c10] mb-4">
                        {t("title")}
                    </h1>
                    <p className="text-[#0a0c10]/60 text-[15px] leading-relaxed mb-6">
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
                        disabled={sending}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#e6c800] text-[#0a0c10] font-black uppercase tracking-[0.2em] text-[11px] rounded-xl hover:bg-[#d4b800] disabled:opacity-70 transition-all"
                    >
                        {sending ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Gönderiliyor...
                            </>
                        ) : (
                            t("resendButton")
                        )}
                    </button>
                    {session?.user && (
                        <div className="mt-6 pt-6 border-t border-slate-200">
                            <p className="text-[#0a0c10]/60 text-sm mb-3">Email doğruladıktan sonra 3 günlük demo erişimini başlatabilirsiniz.</p>
                            <TrialRequestCTA
                                emailVerified={false}
                                trialStatus={(session.user as any)?.trialStatus ?? "none"}
                                hasSubscription={false}
                                source="onboarding"
                                compact
                            />
                        </div>
                    )}
                </div>
                <AuthActions footerLinks={[{ href: loginPath, label: t("backToLogin") }]} />
            </AuthFormPanel>
        </AuthShell>
    );
}
