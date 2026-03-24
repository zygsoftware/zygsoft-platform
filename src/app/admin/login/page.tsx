"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Mail, ShieldCheck } from "lucide-react";
import {
    AuthShell,
    AuthFormPanel,
    AuthInput,
    PasswordField,
    AuthHeroPanel,
    AuthStatus,
    AuthActions,
} from "@/components/auth";

type SessionUser = {
    role?: string;
};

export default function AdminLoginPage() {
    const reduceMotion = useReducedMotion();
    const router = useRouter();
    const { data: session, status } = useSession();
    const userRole = (session?.user as SessionUser | undefined)?.role;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === "authenticated" && userRole === "admin") {
            router.replace("/admin/dashboard");
        }
    }, [router, status, userRole]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (status === "authenticated" && userRole !== "admin") {
                await signOut({ redirect: false });
            }

            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
                callbackUrl: "/admin/dashboard",
            });

            if (!res) {
                setError("Giris istegi tamamlanamadi. Lutfen tekrar deneyin.");
                return;
            }

            if (res.error) {
                setError("E-posta veya şifre hatalı. Lütfen tekrar deneyin.");
                return;
            }

            if (!res.ok) {
                setError("Giris yapilamadi. Lutfen tekrar deneyin.");
                return;
            }

            window.location.href = res.url || "/admin/dashboard";
        } catch {
            setError("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
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
                        className="font-display text-2xl font-black text-[#343131] tracking-tighter focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e6c800] focus-visible:ring-offset-2 rounded"
                    >
                        ZYG<span className="text-[#e6c800]">SOFT</span>
                    </Link>
                </div>

                <div className="mt-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-display font-black text-[#343131]">Tekrar hoş geldiniz</h1>
                        <p className="text-zinc-600 mt-1.5 text-sm font-medium">
                            Panelinize erişmek için hesabınıza giriş yapın.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6">
                            <AuthStatus type="error">{error}</AuthStatus>
                        </div>
                    )}

                    <motion.form
                        initial={reduceMotion ? {} : { opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleLogin}
                        className="space-y-5"
                    >
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
                            placeholder="••••••••"
                            forgotLink="/forgot-password"
                        />

                        <AuthActions
                            submitLabel="Giriş Yap"
                            loading={loading}
                        />
                    </motion.form>
                </div>

                <p className="text-center text-xs text-zinc-500 mt-8 font-medium">
                    Bu panel yalnızca yetkili ZYGSOFT yöneticileri içindir.
                </p>
            </AuthFormPanel>
        </AuthShell>
    );
}
