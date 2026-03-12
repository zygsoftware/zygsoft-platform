"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  AuthShell,
  AuthFormPanel,
  AuthHeroPanel,
  AuthStatus,
  AuthActions,
} from "@/components/auth";

type VerifyStatus = "pending" | "success" | "expired" | "invalid";

function VerifyEmailContent() {
  const t = useTranslations("Auth.verifyEmail");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerifyStatus>("pending");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (data.success) {
          setStatus("success");
          const loginPath = locale === "en" ? "/en/login?verified=success" : "/login?verified=success";
          setTimeout(() => router.push(loginPath), 2500);
        } else {
          setStatus((data.error === "expired" ? "expired" : "invalid") as VerifyStatus);
        }
      })
      .catch(() => setStatus("invalid"));
  }, [token, locale, router]);

  const loginPath = locale === "en" ? "/en/login" : "/login";

  if (status === "pending") {
    return (
      <AuthFormPanel>
        <div className="flex items-center justify-center py-16">
          <AuthStatus type="loading" />
        </div>
        <p className="text-center text-zinc-500 text-sm">{t("verifying")}</p>
      </AuthFormPanel>
    );
  }

  if (status === "success") {
    return (
      <AuthFormPanel>
        <div className="mb-8">
          <h1 className="text-2xl font-display font-black text-[#0a0c10] mb-4">
            {t("title")}
          </h1>
          <AuthStatus type="success">{t("success")}</AuthStatus>
        </div>
        <AuthActions footerLinks={[{ href: loginPath, label: t("goToLogin") }]} />
      </AuthFormPanel>
    );
  }

  const message = status === "expired" ? t("expired") : t("invalid");

  return (
    <AuthFormPanel>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-black text-[#0a0c10] mb-4">
          {t("title")}
        </h1>
        <AuthStatus type="error">{message}</AuthStatus>
      </div>
      <AuthActions footerLinks={[{ href: loginPath, label: t("goToLogin") }]} />
    </AuthFormPanel>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthShell
      hero={
        <AuthHeroPanel
          title="E-posta"
          titleAccent="Doğrulama"
          subtitle="Hesabınızı doğrulayın ve tüm özelliklere erişin."
          features={[
            { label: "Güvenli", value: "✓" },
            { label: "Tek Tıklama", value: "✓" },
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
        <VerifyEmailContent />
      </Suspense>
    </AuthShell>
  );
}
