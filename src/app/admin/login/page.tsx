"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Mail, User, ShieldCheck } from "lucide-react";
import {
    AuthShell,
    AuthFormPanel,
    AuthInput,
    PasswordField,
    AuthHeroPanel,
    AuthStatus,
    AuthActions,
    AuthTabs,
} from "@/components/auth";

type Mode = "login" | "register";

export default function AdminLoginPage() {
    const router = useRouter();
    const reduceMotion = useReducedMotion();
    const [mode, setMode] = useState<Mode>("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });
            if (res?.error) {
                setError("E-posta veya şifre hatalı. Lütfen tekrar deneyin.");
            } else {
                router.push("/admin/dashboard");
                router.refresh();
            }
        } catch {
            setError("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        if (password !== confirmPassword) {
            setError("Şifreler eşleşmiyor.");
            setLoading(false);
            return;
        }
        if (password.length < 8) {
            setError("Şifre en az 8 karakter olmalıdır.");
            setLoading(false);
            return;
        }
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Kayıt başarısız oldu.");
            } else {
                setSuccess("Hesabınız oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz...");
                setTimeout(() => {
                    setMode("login");
                    setSuccess("");
                    setEmail(email);
                    setPassword("");
                }, 2000);
            }
        } catch {
            setError("Bağlantı hatası. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            hero={
                <AuthHeroPanel
                    title="Yönetim Paneli"
                    subtitle="Projelerinizi, blog yazılarınızı ve müşteri bağlantılarınızı tek bir yerden yönetin."
                    icon={<ShieldCheck size={40} strokeWidth={1.5} />}
                    features={[
                        { label: "Projeler", value: "∞" },
                        { label: "Blog", value: "✓" },
                        { label: "API", value: "✓" },
                    ]}
                    footer={
                        <div className="text-white/50 text-[11px] font-bold uppercase tracking-wider">
                            Yalnızca yetkili yöneticiler
                        </div>
                    }
                />
            }
        >
            <AuthFormPanel>
                <div className="lg:hidden mb-8">
                    <Link
                        href="/"
                        className="font-display text-2xl font-black text-[#0a0c10] tracking-tighter focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e6c800] focus-visible:ring-offset-2 rounded"
                    >
                        ZYG<span className="text-[#e6c800]">SOFT</span>
                    </Link>
                </div>

                <AuthTabs
                    tabs={[
                        { id: "login", label: "Giriş Yap" },
                        { id: "register", label: "Kayıt Ol" },
                    ]}
                    active={mode}
                    onChange={(id) => {
                        setMode(id as Mode);
                        setError("");
                        setSuccess("");
                    }}
                />

                <div className="mt-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-display font-black text-[#0a0c10]">
                            {mode === "login" ? "Tekrar hoş geldiniz" : "Hesap oluşturun"}
                        </h1>
                        <p className="text-zinc-600 mt-1.5 text-sm font-medium">
                            {mode === "login"
                                ? "Panelinize erişmek için hesabınıza giriş yapın."
                                : "Yeni bir yönetici hesabı ekleyin. (Mevcut admin oturumu gerekir)"}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6">
                            <AuthStatus type="error">{error}</AuthStatus>
                        </div>
                    )}
                    {success && (
                        <div className="mb-6">
                            <AuthStatus type="success">{success}</AuthStatus>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.form
                            key={mode}
                            initial={reduceMotion ? {} : { opacity: 0, x: mode === "login" ? -12 : 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={reduceMotion ? {} : { opacity: 0, x: mode === "login" ? 12 : -12 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={mode === "login" ? handleLogin : handleRegister}
                            className="space-y-5"
                        >
                            {mode === "register" && (
                                <AuthInput
                                    label="Ad Soyad"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Gürkan Yavuz"
                                    icon={<User size={18} />}
                                />
                            )}

                            <AuthInput
                                label="E-posta"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@zygsoft.com"
                                icon={<Mail size={18} />}
                            />

                            <PasswordField
                                label="Şifre"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={mode === "register" ? "En az 8 karakter" : "••••••••"}
                                forgotLink="/forgot-password"
                            />

                            {mode === "register" && (
                                <PasswordField
                                    label="Şifre tekrar"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Şifrenizi tekrar girin"
                                    error={
                                        confirmPassword && confirmPassword !== password
                                            ? "Şifreler eşleşmiyor"
                                            : undefined
                                    }
                                />
                            )}

                            <AuthActions
                                submitLabel={mode === "login" ? "Giriş Yap" : "Hesap Oluştur"}
                                loading={loading}
                            />
                        </motion.form>
                    </AnimatePresence>
                </div>

                <p className="text-center text-xs text-zinc-500 mt-8 font-medium">
                    Bu panel yalnızca yetkili ZYGSOFT yöneticileri içindir.
                </p>
            </AuthFormPanel>
        </AuthShell>
    );
}
