"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Mail } from "lucide-react";
import {
  AuthShell,
  AuthFormPanel,
  AuthInput,
  AuthHeroPanel,
  AuthStatus,
  AuthActions,
} from "@/components/auth";

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth.forgotPassword");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("errorInvalid"));
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const loginPath = locale === "en" ? "/en/login" : "/login";

  return (
    <AuthShell
      hero={
        <AuthHeroPanel
          title="Şifremi unuttum"
          subtitle="E-posta adresinizi girin, size güvenli bir şifre sıfırlama bağlantısı gönderelim."
          features={[
            { label: "1 Saat Geçerlilik", value: "✓" },
            { label: "Güvenli Bağlantı", value: "✓" },
          ]}
        />
      }
    >
      <AuthFormPanel>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-[#e6c800]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#e6c800]">
              ŞİFRE SIFIRLAMA
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight text-[#0a0c10] mb-2">
            {t("title")}
          </h1>
          <p className="text-zinc-600 text-[14px] font-medium">{t("subtitle")}</p>
        </div>

        {success && (
          <div className="mb-6 space-y-4">
            <AuthStatus type="success">{t("success")}</AuthStatus>
            <p className="text-sm text-zinc-600">
              {locale === "en"
                ? "Check your inbox and spam folder. The link expires in 1 hour."
                : "Gelen kutunuzu ve spam klasörünüzü kontrol edin. Bağlantı 1 saat içinde geçerliliğini yitirir."}
            </p>
          </div>
        )}

        {!success && (
          <>
            {error && (
              <div className="mb-6">
                <AuthStatus type="error">{error}</AuthStatus>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <AuthInput
                label={t("emailLabel")}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                icon={<Mail size={18} />}
              />
              <AuthActions
                submitLabel={t("submit")}
                loading={loading}
                footerLinks={[{ href: loginPath, label: t("backToLogin") }]}
              />
            </form>
          </>
        )}
      </AuthFormPanel>
    </AuthShell>
  );
}
