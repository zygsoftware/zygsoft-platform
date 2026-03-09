"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

type Mode = "login" | "register";

export default function AdminLoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
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
        <div className="min-h-screen flex">
            {/* Left Panel — Decorative */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-950 flex-col items-center justify-center p-16">
                {/* Animated background */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: "1s" }} />
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-600/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
                </div>

                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

                <div className="relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 mb-12">
                        <span className="text-4xl font-black text-emerald-500">ZYG</span>
                        <span className="text-4xl font-light text-white">SOFT</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                        Dijital dünyayı<br />
                        <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            birlikte yönetelim
                        </span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-sm mx-auto leading-relaxed">
                        Projelerinizi, blog yazılarınızı ve müşteri bağlantılarınızı tek bir yerden yönetin.
                    </p>

                    <div className="mt-16 grid grid-cols-3 gap-6 text-center">
                        {[
                            { label: "Proje", value: "∞" },
                            { label: "Blog Yazısı", value: "✍️" },
                            { label: "API", value: "🔌" },
                        ].map((item) => (
                            <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <div className="text-2xl mb-1">{item.value}</div>
                                <div className="text-xs text-slate-400">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-zinc-50 dark:bg-zinc-950">
                <div className="w-full max-w-md">
                    {/* Logo mobile */}
                    <div className="lg:hidden text-center mb-10">
                        <span className="text-3xl font-black text-emerald-500">ZYG</span>
                        <span className="text-3xl font-light text-zinc-800">SOFT</span>
                    </div>

                    {/* Mode Tabs */}
                    <div className="flex bg-zinc-200 dark:bg-zinc-800 rounded-2xl p-1 mb-8">
                        {(["login", "register"] as Mode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${mode === m
                                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                                    }`}
                            >
                                {m === "login" ? "Giriş Yap" : "Kayıt Ol"}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {mode === "login" ? "Hoş Geldiniz 👋" : "Hesap Oluşturun"}
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
                                    {mode === "login"
                                        ? "Yönetim panelinize erişmek için giriş yapın."
                                        : "Ekibinize yeni bir yönetici hesabı ekleyin."}
                                </p>
                            </div>

                            {/* Error/Success */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-start gap-3"
                                >
                                    <span className="mt-0.5">⚠️</span>
                                    {error}
                                </motion.div>
                            )}
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-5 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm rounded-xl flex items-start gap-3"
                                >
                                    <span className="mt-0.5">✅</span>
                                    {success}
                                </motion.div>
                            )}

                            <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
                                {mode === "register" && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                            Ad Soyad
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Gürkan Yavuz"
                                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        E-posta Adresi
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="gurkanyavuz@zygsoft.com"
                                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        Şifre
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder={mode === "register" ? "En az 8 karakter" : "••••••••"}
                                            className="w-full pl-10 pr-12 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {mode === "register" && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                            Şifre Tekrar
                                        </label>
                                        <div className="relative">
                                            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type={showConfirm ? "text" : "password"}
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Şifrenizi tekrar girin"
                                                className={`w-full pl-10 pr-12 py-3 bg-white dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${confirmPassword && confirmPassword !== password
                                                    ? "border-red-300 dark:border-red-700"
                                                    : "border-slate-200 dark:border-slate-700"
                                                    }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm(!showConfirm)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {confirmPassword && confirmPassword !== password && (
                                            <p className="text-red-500 text-xs mt-1.5">Şifreler eşleşmiyor</p>
                                        )}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 mt-2"
                                >
                                    {loading ? (
                                        <><Loader2 size={16} className="animate-spin" /> {mode === "login" ? "Giriş yapılıyor..." : "Hesap oluşturuluyor..."}</>
                                    ) : (
                                        <>{mode === "login" ? "Giriş Yap" : "Hesap Oluştur"} <ArrowRight size={16} /></>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </AnimatePresence>

                    <p className="text-center text-xs text-slate-400 mt-8">
                        Bu panel yalnızca yetkili Zygsoft yöneticileri içindir.
                    </p>
                </div>
            </div>
        </div>
    );
}
