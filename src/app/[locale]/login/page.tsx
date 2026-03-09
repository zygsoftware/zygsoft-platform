"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight, Lock } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const result = await signIn("credentials", { email, password, redirect: false });
        if (!result?.ok) {
            setError("E-posta veya şifre hatalı. Lütfen tekrar deneyin.");
            setLoading(false);
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="min-h-screen flex bg-[#f9f7f3] selection:bg-[#e6c800] selection:text-[#0e0e0e] relative z-10">
            {/* Noise Overlay — behind content */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] mix-blend-overlay" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }} />

            {/* Left decorative panel (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-[45%] flex-shrink-0 flex-col justify-between p-20 bg-[#0e0e0e] relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-[#e6c800] opacity-[0.07] blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-20%] w-[100%] h-[100%] bg-[#e6c800] opacity-[0.03] blur-[200px]" />

                <Link href="/" className="font-display text-4xl font-black text-white tracking-tighter">
                    ZYG<span className="text-[#e6c800]">SOFT.</span>
                </Link>

                <div className="relative z-10 scale-110 origin-left">
                    <h2 className="font-display font-black text-white mb-8 leading-[0.9] tracking-tighter text-7xl">
                        Yarınları <br /><span className="text-[#e6c800]">Tasarlayın.</span>
                    </h2>
                    <p className="text-white/40 text-lg font-medium max-w-sm leading-relaxed">
                        Zygsoft ekosistemine giriş yapın ve projelerinizin verimliliğini üst düzeye taşıyın.
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0e0e0e] bg-[#222]" />
                        ))}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-white/30">/ TOPLULUĞA KATILIN</span>
                </div>
            </div>

            {/* Right — form section (scrollable when content overflows) */}
            <div className="flex-1 min-h-0 flex items-center justify-center p-8 md:p-12 overflow-y-auto">
                <div className="w-full max-w-[440px] py-4">
                    <div className="mb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-8 h-px bg-[#e6c800]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#e6c800]">GİRİŞ YAP</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter text-[#0e0e0e] mb-4">Hoş Geldiniz.</h1>
                        <p className="text-[#666] font-medium italic">Devam etmek için kimlik bilgilerinizi girin.</p>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="mb-8 p-5 bg-black border-l-4 border-[#e6c800] text-white text-xs font-bold uppercase tracking-widest">
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="group">
                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 mb-2 group-focus-within:text-[#e6c800] transition-colors">E-POSTA ADRESİ</label>
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="w-full px-6 py-4 bg-white border-2 border-zinc-300 rounded-none text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#e6c800] focus:ring-2 focus:ring-[#e6c800]/25 transition-all font-medium" />
                        </div>
                        <div className="group">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 group-focus-within:text-[#e6c800] transition-colors">ŞİFRE</label>
                                <button type="button" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors">UNUTTUM?</button>
                            </div>
                            <div className="relative">
                                <input type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full px-6 py-4 pr-14 bg-white border-2 border-zinc-300 rounded-none text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#e6c800] focus:ring-2 focus:ring-[#e6c800]/25 transition-all font-medium" />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 transition-colors">
                                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <motion.button type="submit" disabled={loading}
                            className="w-full py-6 bg-[#0e0e0e] text-white font-black uppercase tracking-[0.3em] text-[12px] hover:bg-[#e6c800] hover:text-[#0e0e0e] transition-all duration-500 shadow-2xl shadow-black/10 flex items-center justify-center gap-4 group disabled:opacity-70 disabled:cursor-not-allowed"
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Lock size={18} className="group-hover:rotate-12 transition-transform" /> OTURUM AÇ</>}
                        </motion.button>
                    </form>

                    <div className="mt-12 flex flex-col gap-4 text-[11px] font-black uppercase tracking-widest text-zinc-600 text-center">
                        <Link href="/register" className="hover:text-zinc-900 transition-colors">
                            HESABINIZ YOK MU? <span className="text-[#e6c800]">KAYIT OLUN</span>
                        </Link>
                        <Link href="/" className="inline-flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-800 transition-colors">
                            ANA SAYFAYA DÖN
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
