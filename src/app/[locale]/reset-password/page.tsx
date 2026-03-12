"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  AuthShell,
  AuthFormPanel,
  PasswordField,
  AuthHeroPanel,
  AuthStatus,
  AuthActions,
} from "@/components/auth";

type TokenStatus = "valid" | "expired" | "used" | "invalid";

function ResetPasswordForm() {
  const t = useTranslations("Auth.resetPassword");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null);

  useEffect(() => {
    if (!token) {
      setTokenStatus("invalid");
      return;
    }
    fetch("/api/auth/validate-reset-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => setTokenStatus(data.status ?? "invalid"))
      .catch(() => setTokenStatus("invalid"));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError(t("errorInvalid"));
      return;
    }
    if (password.length < 8) {
      setError(t("errorShort"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("errorMismatch"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("errorInvalid"));
      } else {
        setSuccess(true);
        const loginPath = locale === "en" ? "/en/login?reset=success" : "/login?reset=success";
        setTimeout(() => router.push(loginPath), 2000);
      }
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const loginPath = locale === "en" ? "/en/login" : "/login";

  if (tokenStatus === null) {
    return (
      <AuthFormPanel>
        <div className="flex items-center justify-center py-16">
          <AuthStatus type="loading" />
        </div>
      </AuthFormPanel>
    );
  }

  if (tokenStatus !== "valid") {
    const message =
      tokenStatus === "expired"
        ? (locale === "en" ? "This link has expired. Please request a new password reset." : "Bu bağlantının süresi dolmuş. Lütfen yeni bir şifre sıfırlama talebi oluşturun.")
        : tokenStatus === "used"
          ? (locale === "en" ? "This link has already been used. Please request a new password reset." : "Bu bağlantı zaten kullanılmış. Lütfen yeni bir şifre sıfırlama talebi oluşturun.")
          : (locale === "en" ? "This link is invalid. Please request a new password reset." : "Bu bağlantı geçersiz. Lütfen yeni bir şifre sıfırlama talebi oluşturun.");

    return (
      <AuthFormPanel>
        <div className="mb-8">
          <h1 className="text-2xl font-display font-black text-[#0a0c10] mb-4">
            {t("title")}
          </h1>
          <AuthStatus type="error">{message}</AuthStatus>
        </div>
        <AuthActions footerLinks={[{ href: loginPath, label: t("backToLogin") }]} />
      </AuthFormPanel>
    );
  }

  return (
    <AuthFormPanel>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-px bg-[#e6c800]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#e6c800]">
            YENİ ŞİFRE
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight text-[#0a0c10] mb-2">
          {t("title")}
        </h1>
        <p className="text-zinc-600 text-[14px] font-medium">{t("subtitle")}</p>
      </div>

      {success && (
        <AuthStatus type="success">{t("success")}</AuthStatus>
      )}

      {!success && (
        <>
          {error && (
            <div className="mb-6">
              <AuthStatus type="error">{error}</AuthStatus>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <PasswordField
              label={t("passwordLabel")}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")}
            />
            <PasswordField
              label={t("confirmLabel")}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("confirmPlaceholder")}
              error={
                confirmPassword && confirmPassword !== password
                  ? t("errorMismatch")
                  : undefined
              }
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
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      hero={
        <AuthHeroPanel
          title="Yeni şifre"
          subtitle="Hesabınız için güvenli bir şifre oluşturun"
          features={[
            { label: "Tek Kullanım", value: "✓" },
            { label: "1 Saat Geçerlilik", value: "✓" },
          ]}
        />
      }
    >
      <Suspense
        fallback={
          <AuthFormPanel>
            <div className="flex items-center justify-center py-16">
              <AuthStatus type="loading" />
            </div>
          </AuthFormPanel>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
