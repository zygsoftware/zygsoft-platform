"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AlertTriangle, Mail, Loader2 } from "lucide-react";

interface EmailVerificationBannerProps {
  emailVerified: boolean | Date | null;
  isAdmin: boolean;
}

export function EmailVerificationBanner({ emailVerified, isAdmin }: EmailVerificationBannerProps) {
  const t = useTranslations("Dashboard.verification");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (isAdmin || emailVerified) return null;

  const handleResend = async () => {
    setLoading(true);
    setSent(false);
    try {
      const res = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: locale === "en" ? "en" : "tr" }),
      });
      const data = await res.json();
      if (res.ok) setSent(true);
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
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 text-[#e6c800] font-black rounded-xl text-sm hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Mail size={16} />
          )}
          {loading ? t("sending") : sent ? t("sent") : t("resend")}
        </button>
      </div>
    </div>
  );
}
