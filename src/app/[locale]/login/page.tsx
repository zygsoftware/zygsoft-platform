"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Mail } from "lucide-react";
import {
    AuthShell,
    AuthFormPanel,
    AuthInput,
    PasswordField,
    AuthHeroPanel,
    AuthStatus,
    AuthActions,
} from "@/components/auth";

function getForgotPath(locale: string) {
    return locale === "en" ? "/en/forgot-password" : "/forgot-password";
}

function LoginPageContent() {
    const t = useTranslations("Auth.login");
    const locale = useLocale();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resetSuccess, setResetSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (searchParams.get("reset") === "success") {
            setResetSuccess(true);
        }
    }, [searchParams]);

    const registered = searchParams.get("registered") === "true";
    const verified = searchParams.get("verified") === "success";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const result = await signIn("credentials", { email, password, redirect: false });
        if (!result?.ok) {
            setError(t("errorInvalid"));
            setLoading(false);
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <AuthShell
            hero={
                <AuthHeroPanel
                    title="Tekrar hoş geldiniz."
                    titleAccent="Giriş yapın."
                    subtitle="ZYGSOFT ekosistemine giriş yapın ve projelerinizin verimliliğini üst düzeye taşıyın."
                    features={[
                        { label: "Belge Araçları", value: "8+" },
                        { label: "Güvenli Erişim", value: "✓" },
                        { label: "7/24 Panel", value: "✓" },
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
            <AuthFormPanel>
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-px bg-[#e6c800]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#e6c800]">
                            GİRİŞ YAP
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight text-[#0a0c10] mb-2">
                        {t("title")}
                    </h1>
                    <p className="text-zinc-600 text-[14px] font-medium">{t("subtitle")}</p>
                </div>

                <AnimatePresence mode="wait">
                    {(resetSuccess || registered || verified) && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 overflow-hidden"
                        >
                            <AuthStatus type="success">
                                {resetSuccess
                                    ? (locale === "en" ? "Your password has been reset. You can now sign in." : "Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.")
                                    : verified
                                        ? (locale === "en" ? "Your email has been verified. You can now sign in." : "E-posta adresiniz doğrulandı. Giriş yapabilirsiniz.")
                                        : (locale === "en" ? "Account created. Please verify your email address. Check your inbox." : "Hesabınız oluşturuldu. E-posta adresinizi doğrulamanız gerekiyor. Gelen kutunuzu kontrol edin.")}
                            </AuthStatus>
                        </motion.div>
                    )}
                    {error && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 overflow-hidden"
                        >
                            <AuthStatus type="error">{error}</AuthStatus>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                    <PasswordField
                        label={t("passwordLabel")}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        forgotLink={getForgotPath(locale)}
                    />
                    <AuthActions
                        submitLabel={t("submit")}
                        loading={loading}
                        footerLinks={[
                            {
                                href: "/register",
                                label: (
                                    <>
                                        {t("noAccount")} <span className="accent">{t("registerLink")}</span>
                                    </>
                                ),
                            },
                            { href: "/", label: t("backToHome") },
                        ]}
                    />
                </form>
            </AuthFormPanel>
        </AuthShell>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<AuthShell><AuthFormPanel><div className="py-16 text-center"><AuthStatus type="loading" /></div></AuthFormPanel></AuthShell>}>
            <LoginPageContent />
        </Suspense>
    );
}
