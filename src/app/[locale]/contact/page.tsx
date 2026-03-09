"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Mail, MapPin, Send, ChevronDown, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { useInView } from "framer-motion";
import Link from "next/link";

function AnimIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    return (
        <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay }} className={className}>
            {children}
        </motion.div>
    );
}

const faqs = [
    { q: "Ne kadar sürede proje teslim edilir?", a: "Proje kapsamına bağlı olarak genellikle 2-8 hafta arasında teslim yapılmaktadır. Detaylı bir zaman çizelgesi için bizimle iletişime geçin." },
    { q: "Hangi ödeme yöntemlerini kabul ediyorsunuz?", a: "Banka havalesi, kredi kartı ve kurumsal fatura yöntemlerini kabul ediyoruz. Proje başlangıcında %50 ön ödeme alınmaktadır." },
    { q: "Proje sonrası destek sağlıyor musunuz?", a: "Evet, tüm projelerimiz için 3 ay garanti ve bakım desteği sunuyoruz. Uzun vadeli destek paketlerimiz de mevcuttur." },
    { q: "Uzaktan çalışma yapıyor musunuz?", a: "Evet, Türkiye genelinde ve yurt dışında müşterilere uzaktan hizmet veriyoruz. Antalya'daki müşterilerimize yüz yüze görüşme imkânı da sunuyoruz." },
];

export default function Contact() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus("idle");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                setSubmitStatus("success");
                setForm({ name: "", email: "", phone: "", subject: "", message: "" });
            } else {
                setSubmitStatus("error");
            }
        } catch (error) {
            setSubmitStatus("error");
        } finally {
            setIsSubmitting(false);
            if (submitStatus === "success") {
                setTimeout(() => setSubmitStatus("idle"), 5000);
            }
        }
    };

    return (
        <>
            <Header />
            <main style={{ background: "#f9f7f3" }}>

                {/* ── Hero ── */}
                <section className="pt-40 pb-24 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #f9f7f3 60%, #f0ece0 100%)" }}>
                    <div className="absolute inset-0 pointer-events-none" style={{
                        backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }} />
                    <motion.div className="absolute right-20 top-20 w-72 h-72 rounded-full pointer-events-none"
                        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        style={{ background: "radial-gradient(circle, rgba(230,200,0,0.1) 0%, transparent 70%)" }} />
                    <div className="container mx-auto px-6 max-w-7xl">
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                            <span className="section-label">İletişim</span>
                            <h1 className="font-display font-extrabold text-[#0e0e0e] mt-4 mb-6"
                                style={{ fontSize: "clamp(44px,6vw,88px)", lineHeight: 1.03 }}>
                                Bir Projeniz mi Var?
                            </h1>
                            <p className="text-[#666] text-xl max-w-xl leading-relaxed">
                                Birlikte harika bir şeyler üretelim. Formu doldurun, 24 saat içinde geri döneceğiz.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* ── Main grid ── */}
                <section className="py-24 bg-white border-y border-black/8">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                            {/* Form */}
                            <AnimIn>
                                <h2 className="font-display font-bold text-[#0e0e0e] text-2xl mb-8">Mesaj Gönderin</h2>
                                <AnimatePresence mode="wait">
                                    {submitStatus === "success" ? (
                                        <motion.div key="success"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="p-10 text-center border border-black/8 rounded-sm">
                                            <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: "#e6c800" }}>
                                                <Send size={24} className="text-[#0e0e0e]" />
                                            </div>
                                            <h3 className="font-display font-bold text-2xl text-[#0e0e0e] mb-3">Mesajınız İletildi!</h3>
                                            <p className="text-[#888]">En kısa sürede size geri döneceğiz.</p>
                                        </motion.div>
                                    ) : (
                                        <motion.form key="form" onSubmit={handleSubmit} className="space-y-5">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#888] mb-2">Ad Soyad *</label>
                                                    <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                                        placeholder="Adınız Soyadınız"
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-black/10 rounded-xl text-sm text-[#0e0e0e] placeholder-[#aaa] focus:outline-none focus:border-[#e6c800] focus:ring-4 focus:ring-[#e6c800]/20 transition-all" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#888] mb-2">E-posta *</label>
                                                    <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                                        placeholder="ornek@email.com"
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-black/10 rounded-xl text-sm text-[#0e0e0e] placeholder-[#aaa] focus:outline-none focus:border-[#e6c800] focus:ring-4 focus:ring-[#e6c800]/20 transition-all" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-[#888] mb-2">Telefon</label>
                                                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                                    placeholder="+90 5XX XXX XX XX"
                                                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-black/10 rounded-xl text-sm text-[#0e0e0e] placeholder-[#aaa] focus:outline-none focus:border-[#e6c800] focus:ring-4 focus:ring-[#e6c800]/20 transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-[#888] mb-2">Konu *</label>
                                                <select required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-black/10 rounded-xl text-sm text-[#0e0e0e] focus:outline-none focus:border-[#e6c800] focus:ring-4 focus:ring-[#e6c800]/20 transition-all">
                                                    <option value="">Konu seçin</option>
                                                    <option>Web & Uygulama Geliştirme</option>
                                                    <option>Sosyal Medya Yönetimi</option>
                                                    <option>Marka Kimliği & Grafik Tasarım</option>
                                                    <option>Dijital Strateji & Pazarlama</option>
                                                    <option>Hukuki Yazılım</option>
                                                    <option>Diğer</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-[#888] mb-2">Mesaj *</label>
                                                <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                                    placeholder="Projeniz hakkında bize bilgi verin..."
                                                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-black/10 rounded-xl text-sm text-[#0e0e0e] placeholder-[#aaa] focus:outline-none focus:border-[#e6c800] focus:ring-4 focus:ring-[#e6c800]/20 transition-all resize-none" />
                                            </div>
                                            <motion.button type="submit" disabled={isSubmitting}
                                                className="btn-primary w-full justify-center disabled:opacity-70"
                                                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                                {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Gönderiliyor...</> : <><Send size={16} /> Mesaj Gönder</>}
                                            </motion.button>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </AnimIn>

                            {/* Info */}
                            <AnimIn delay={0.15}>
                                <h2 className="font-display font-bold text-[#0e0e0e] text-2xl mb-8">İletişim Bilgileri</h2>
                                <div className="space-y-5 mb-10">
                                    {[
                                        { icon: <Mail size={18} />, label: "E-posta", value: "info@zygsoft.com", href: "mailto:info@zygsoft.com" },
                                        { icon: <MapPin size={18} />, label: "Konum", value: "Antalya, Türkiye", href: null },
                                    ].map((item, i) => (
                                        <motion.div key={i} className="flex items-center gap-4 p-5 glass rounded-xl hover-glow"
                                            whileHover={{ x: 4, transition: { duration: 0.2 } }}>
                                            <div className="w-12 h-12 rounded-[10px] bg-[#0e0e0e] flex items-center justify-center text-[#e6c800] shrink-0 shadow-[0_4px_20px_rgba(230,200,0,0.2)] border border-[#e6c800]/20">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-[#888] mb-0.5">{item.label}</p>
                                                {item.href ? (
                                                    <a href={item.href} className="text-[#0e0e0e] font-medium hover:text-[#888] transition-colors">{item.value}</a>
                                                ) : (
                                                    <p className="text-[#0e0e0e] font-medium">{item.value}</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* FAQ */}
                                <h3 className="font-display font-bold text-[#0e0e0e] text-lg mb-5">Sıkça Sorulan Sorular</h3>
                                <div className="space-y-3">
                                    {faqs.map((faq, i) => (
                                        <div key={i} className="glass rounded-xl overflow-hidden mb-3 hover-glow transition-all duration-300">
                                            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/40 transition-colors">
                                                <span className="font-medium text-[#0e0e0e] text-sm pr-4">{faq.q}</span>
                                                <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                                    <ChevronDown size={18} className="text-[#888] shrink-0" />
                                                </motion.div>
                                            </button>
                                            <AnimatePresence>
                                                {openFaq === i && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                                                        <div className="px-5 pb-5 text-sm text-[#888] leading-relaxed border-t border-black/6">
                                                            <div className="pt-4">{faq.a}</div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            </AnimIn>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
