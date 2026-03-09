"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, UserPlus, ExternalLink } from "lucide-react";

export default function RegisterPage() {
    const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [agreed, setAgreed] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) { setError("Şifreler eşleşmiyor."); return; }
        if (form.password.length < 6) { setError("Şifre en az 6 karakter olmalıdır."); return; }
        if (!agreed) { setError("Devam etmek için kullanıcı sözleşmesini kabul etmelisiniz."); return; }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/register-customer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Kayıt sırasında hata oluştu."); }
            else { router.push("/login?registered=true"); }
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex bg-[#f9f7f3] selection:bg-[#e6c800] selection:text-[#0e0e0e]">
            {/* Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] mix-blend-overlay" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }} />

            {/* Left decorative panel (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-[40%] flex-col justify-between p-20 bg-[#0e0e0e] relative overflow-hidden">
                <div className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] bg-[#e6c800] opacity-[0.05] blur-[150px]" />

                <Link href="/" className="font-display text-4xl font-black text-white tracking-tighter">
                    ZYG<span className="text-[#e6c800]">SOFT.</span>
                </Link>

                <div className="relative z-10">
                    <h2 className="font-display font-black text-white mb-8 leading-[0.9] tracking-tighter text-7xl">
                        Aramıza <br /><span className="text-[#e6c800]">Katılın.</span>
                    </h2>
                    <p className="text-white/40 text-lg font-medium max-w-sm leading-relaxed">
                        Ücretsiz hesabınızı saniyeler içinde oluşturun ve Zygsoft ekosistemine ilk adımınızı atın.
                    </p>
                </div>

                <div className="flex items-center gap-4 text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">
                    <span>ANTALYA ORIGIN</span>
                    <div className="w-2 h-2 rounded-full bg-[#e6c800]/40" />
                    <span>GLOBAL DELIVERY</span>
                </div>
            </div>

            {/* Right — form section */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-12">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-[500px]"
                >
                    <div className="mb-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-8 h-px bg-[#e6c800]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#e6c800]">KAYIT OL</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter text-[#0e0e0e] mb-4">Yeni Hesap.</h1>
                        <p className="text-[#666] font-medium italic">Bilgilerinizi eksiksiz doldurarak başlayın.</p>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="mb-8 p-5 bg-black border-l-4 border-red-500 text-white text-[11px] font-bold uppercase tracking-widest">
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="group">
                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-[#aaa] mb-2">AD SOYAD</label>
                                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="John Doe"
                                    className="w-full px-6 py-4 bg-white border border-black/5 rounded-none text-sm text-[#0e0e0e] focus:outline-none focus:border-[#e6c800] transition-all font-medium" />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-[#aaa] mb-2">E-POSTA</label>
                                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                    placeholder="john@example.com"
                                    className="w-full px-6 py-4 bg-white border border-black/5 rounded-none text-sm text-[#0e0e0e] focus:outline-none focus:border-[#e6c800] transition-all font-medium" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="group relative">
                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-[#aaa] mb-2">ŞİFRE</label>
                                <input type={showPw ? "text" : "password"} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full px-6 py-4 bg-white border border-black/5 rounded-none text-sm text-[#0e0e0e] focus:outline-none focus:border-[#e6c800] transition-all font-medium" />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-6 top-[42px] text-[#ccc] hover:text-[#0e0e0e]">
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-[#aaa] mb-2">TEKRAR</label>
                                <input type={showPw ? "text" : "password"} required value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full px-6 py-4 bg-white border border-black/5 rounded-none text-sm text-[#0e0e0e] focus:outline-none focus:border-[#e6c800] transition-all font-medium" />
                            </div>
                        </div>

                        {/* KVKK Custom Styled */}
                        <div className="bg-white border border-black/5 p-6 flex items-start gap-4">
                            <input type="checkbox" id="agreed" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                                className="mt-1 w-4 h-4 accent-[#e6c800] grayscale hover:grayscale-0 transition-all cursor-pointer" />
                            <label htmlFor="agreed" className="text-[10px] font-bold text-[#888] leading-relaxed cursor-pointer uppercase tracking-wider">
                                <Link href="/kvkk" target="_blank" className="text-[#0e0e0e] underline decoration-[#e6c800] decoration-2 underline-offset-4 mr-1">KVKK AYDINLATMA METNİ</Link> VE
                                <Link href="/terms" target="_blank" className="text-[#0e0e0e] underline decoration-[#e6c800] decoration-2 underline-offset-4 ml-1">KULLANICI SÖZLEŞMESİNİ</Link> OKUDUM, ONAYLIYORUM.
                            </label>
                        </div>

                        <motion.button type="submit" disabled={loading || !agreed}
                            className="w-full py-6 bg-[#0e0e0e] text-white font-black uppercase tracking-[0.3em] text-[12px] hover:bg-[#e6c800] hover:text-[#0e0e0e] transition-all duration-500 shadow-2xl shadow-black/10 flex items-center justify-center gap-4 group disabled:opacity-50"
                            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <><UserPlus size={18} /> HESABIMI OLUŞTUR</>}
                        </motion.button>
                    </form>

                    <div className="mt-10 pt-10 border-t border-black/5 text-[11px] font-black uppercase tracking-widest text-center">
                        <Link href="/login" className="text-[#aaa] hover:text-[#0e0e0e] transition-colors">
                            ZATEN BİR HESABINIZ VAR MI? <span className="text-[#e6c800]">GİRİŞ YAPIN</span>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
