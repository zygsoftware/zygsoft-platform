"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Eye, EyeOff, UserPlus, Mail } from "lucide-react";
import {
    AuthShell,
    AuthFormPanel,
    AuthInput,
    PasswordField,
    PasswordStrengthMeter,
    AuthHeroPanel,
    AuthStatus,
    AuthActions,
} from "@/components/auth";

export default function RegisterPage() {
    const t = useTranslations("Auth.register");
    const locale = useLocale() as "tr" | "en";
    const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [agreed, setAgreed] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setError(t("errorMismatch"));
            return;
        }
        if (form.password.length < 8) {
            setError(t("errorShort"));
            return;
        }
        if (!agreed) {
            setError(t("errorAgreement"));
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/register-customer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    locale,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Kayıt sırasında hata oluştu.");
            } else {
                const loginPath = locale === "en" ? "/en/login?registered=true" : "/login?registered=true";
                router.push(loginPath);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            hero={
                <AuthHeroPanel
                    title="Aramıza"
                    titleAccent="Katılın."
                    subtitle="Hesabınızı oluşturarak ZYGSOFT araçlarına erişin. Saniyeler içinde kayıt olun."
                    features={[
                        { label: "Ücretsiz Başlangıç", value: "✓" },
                        { label: "Belge Araçları", value: "8+" },
                        { label: "KVKK Uyumlu", value: "✓" },
                    ]}
                    footer={
                        <div className="flex items-center gap-3 text-white/50 text-[11px] font-bold uppercase tracking-wider">
                            <span>ANTALYA</span>
                            <span className="w-1 h-1 rounded-full bg-[#e6c800]/60" />
                            <span>GLOBAL</span>
                        </div>
                    }
                />
            }
        >
            <AuthFormPanel maxWidth="lg">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-px bg-[#e6c800]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#e6c800]">
                            KAYIT OL
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight text-[#0a0c10] mb-2">
                        {t("title")}
                    </h1>
                    <p className="text-zinc-600 text-[14px] font-medium">{t("subtitle")}</p>
                </div>

                {error && (
                    <div className="mb-6">
                        <AuthStatus type="error">{error}</AuthStatus>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <AuthInput
                            label={t("nameLabel")}
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder={t("namePlaceholder")}
                            icon={<UserPlus size={18} />}
                        />
                        <AuthInput
                            label={t("emailLabel")}
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder={t("emailPlaceholder")}
                            icon={<Mail size={18} />}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <PasswordField
                                label={t("passwordLabel")}
                                required
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder={t("passwordPlaceholder")}
                                strength={form.password ? <PasswordStrengthMeter password={form.password} locale={locale} /> : undefined}
                            />
                            <p className="text-[12px] text-zinc-500 mt-1">{t("passwordHint")}</p>
                        </div>
                        <PasswordField
                            label={t("confirmLabel")}
                            required
                            value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            placeholder={t("confirmPlaceholder")}
                            error={
                                form.confirmPassword && form.confirmPassword !== form.password
                                    ? t("confirmError")
                                    : undefined
                            }
                        />
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                        <input
                            type="checkbox"
                            id="agreed"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="mt-1 w-4 h-4 accent-[#e6c800] rounded cursor-pointer focus:ring-2 focus:ring-[#e6c800]/50"
                            aria-describedby="agreed-desc"
                        />
                        <label id="agreed-desc" htmlFor="agreed" className="text-[13px] font-medium text-zinc-700 leading-relaxed cursor-pointer">
                            <Link href="/kvkk" target="_blank" className="text-[#0a0c10] underline underline-offset-2 hover:text-[#e6c800]">
                                {t("kvkkLink")}
                            </Link>
                            {" ve "}
                            <Link href="/terms" target="_blank" className="text-[#0a0c10] underline underline-offset-2 hover:text-[#e6c800]">
                                {t("termsLink")}
                            </Link>
                            {" "}ni okudum, onaylıyorum.
                        </label>
                    </div>

                    <AuthActions
                        submitLabel={t("submit")}
                        loading={loading}
                        disabled={!agreed}
                        footerLinks={[
                            {
                                href: "/login",
                                label: (
                                    <>
                                        {t("hasAccount")} <span className="accent">{t("loginLink")}</span>
                                    </>
                                ),
                            },
                        ]}
                    />
                </form>
            </AuthFormPanel>
        </AuthShell>
    );
}
