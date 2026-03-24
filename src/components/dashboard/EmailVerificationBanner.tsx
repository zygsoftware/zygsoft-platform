"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AlertTriangle, Mail, Loader2 } from "lucide-react";

const RESEND_COOLDOWN_SECONDS = 180;

function getCooldownKey(locale: string) {
  return `zygsoft-verification-resend:${locale}`;
}

interface EmailVerificationBannerProps {
  emailVerified: boolean | Date | null;
  isAdmin: boolean;
}

export function EmailVerificationBanner({ emailVerified, isAdmin }: EmailVerificationBannerProps) {
  const t = useTranslations("Dashboard.verification");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
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

  if (isAdmin || emailVerified) return null;

  const handleResend = async () => {
    if (cooldownLeft > 0) return;

    setLoading(true);
    setSent(false);
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
        window.localStorage.setItem(getCooldownKey(locale), String(expiresAt));
        setCooldownLeft(RESEND_COOLDOWN_SECONDS);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 p-5 rounded-2xl border border-amber-200 bg-amber-50/80 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-start gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h4 className="font-heading font-black text-slate-950 text-sm mb-0.5">
            {t("warningTitle")}
          </h4>
          <p className="text-slate-600 text-sm font-medium">
            {t("warningDesc")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:ml-auto">
        <button
          onClick={handleResend}
          disabled={loading || cooldownLeft > 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 text-[#e6c800] font-black rounded-xl text-sm hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Mail size={16} />
          )}
          {loading ? t("sending") : cooldownLeft > 0 ? `${t("resend")} (${cooldownLabel})` : sent ? t("sent") : t("resend")}
        </button>
      </div>
    </div>
  );
}
