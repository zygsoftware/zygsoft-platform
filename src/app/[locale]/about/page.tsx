"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Target, Eye, Heart, Zap, Users, Code2, Globe, Award, ArrowRight } from "lucide-react";
import { useRef } from "react";
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

export default function About() {
    const values = [
        { icon: <Code2 size={20} />, title: "Teknik Mükemmellik", desc: "Her satır kod özenle yazılır. Kalite asla pazarlık konusu değildir." },
        { icon: <Users size={20} />, title: "Müşteri Odaklılık", desc: "Hedefleriniz bizim hedeflerimizdir. Başarınız bizim başarımızdır." },
        { icon: <Zap size={20} />, title: "Hız & Çeviklik", desc: "Değişen ihtiyaçlara hızlı uyum sağlıyor, zamanında teslim ediyoruz." },
        { icon: <Globe size={20} />, title: "Global Bakış Açısı", desc: "Global standartlarla yerel ihtiyaçlara özel çözümler geliştiriyoruz." },
        { icon: <Heart size={20} />, title: "Tutku & Özveri", desc: "İşimize olan tutkumuz her projemize yansır." },
        { icon: <Award size={20} />, title: "Güvenilirlik", desc: "Söz verdiğimizi yaparız. Her zaman, hiç istisnasız." },
    ];

    const team = [
        { name: "Gürkan Y.", role: "Co-Founder & Yazılım Mimarı", initial: "G" },
        { name: "Yazılım Ekibi", role: "Full-Stack Geliştiriciler", initial: "T" },
        { name: "Tasarım Ekibi", role: "UI/UX & Marka Tasarımı", initial: "D" },
    ];

    const milestones = [
        { year: "2019", title: "Kuruluş", desc: "Zygsoft, Antalya'da küçük bir yazılım atölyesi olarak kuruldu." },
        { year: "2020", title: "İlk Büyük Proje", desc: "Hukuki yazılım alanında ilk kurumsal projemizi tamamladık." },
        { year: "2022", title: "SaaS Platformu", desc: "Kendi SaaS uygulamamızı geliştirip yayınladık." },
        { year: "2024", title: "Büyümeye Devam", desc: "30+ müşteri, 50+ proje ve genişleyen ekibimizle büyümeye devam ediyoruz." },
    ];

    return (
        <>
            <Header />
            <main style={{ background: "#f9f7f3" }}>

                {/* ── Hero ── */}
                <section className="pt-48 pb-32 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #f9f7f3 60%, #f0ece0 100%)" }}>
                    <div className="absolute inset-0 pointer-events-none" style={{
                        backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }} />

                    {/* Visual background image with fade */}
                    <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 0.15, x: 0 }}
                            transition={{ duration: 1.2 }}
                            className="w-full h-full"
                        >
                            <img
                                src="file:///Users/gunesai/.gemini/antigravity/brain/f86ca286-fc44-40fe-b0ce-6cf989e2c8b3/team_modern_office_1772719461089.png"
                                alt="Studio"
                                className="w-full h-full object-cover rounded-l-[100px]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#f9f7f3] to-transparent w-full" />
                        </motion.div>
                    </div>

                    <div className="container mx-auto px-6 max-w-7xl relative z-10">
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
                            <span className="section-label">Hakkımızda</span>
                            <h1 className="font-display font-extrabold text-[#0e0e0e] mt-4 mb-8"
                                style={{ fontSize: "clamp(44px,6vw,88px)", lineHeight: 1.03 }}>
                                Vizyonumuz &<br />Tutkumuz
                            </h1>
                            <p className="text-[#666] text-xl leading-relaxed">
                                Antalya merkezli yazılım ve dijital ajansız. Teknoloji ile yaratıcılığı birleştirerek işletmeleri dijital geleceğe hazırlıyoruz.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* ── About Text ── */}
                <section className="py-24 bg-white border-y border-black/8">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                            <AnimIn>
                                <h2 className="font-display font-extrabold text-[#0e0e0e] mb-6" style={{ fontSize: "clamp(28px,3vw,44px)" }}>
                                    Yazılım ve dijital dönüşümde güvenilir ortağınız
                                </h2>
                                <p className="text-[#666] leading-relaxed mb-6">
                                    Zygsoft, 2019'dan bu yana Türkiye'nin önde gelen yazılım şirketleri ve hukuk bürolarına özelleştirilmiş çözümler sunmaktadır. Küçük bir atölyeden başlayan yolculuğumuz, bugün 30'dan fazla mutlu müşteriyle devam etmektedir.
                                </p>
                                <p className="text-[#888] leading-relaxed">
                                    Web geliştirmeden marka kimliğine, kurumsal yazılımlardan dijital pazarlamaya kadar her alanda tam kapsamlı hizmetler sunuyoruz. Teknoloji ve tasarımı harmanlayan yaklaşımımızla, her projeyi başarıya taşıyoruz.
                                </p>
                            </AnimIn>
                            <AnimIn delay={0.15} className="grid grid-cols-2 gap-4">
                                {[
                                    { num: "50+", label: "Tamamlanan Proje" },
                                    { num: "30+", label: "Mutlu Müşteri" },
                                    { num: "5+", label: "Yıllık Deneyim" },
                                    { num: "98%", label: "Memnuniyet Oranı" },
                                ].map((s, i) => (
                                    <motion.div key={i}
                                        className={`p-6 rounded-xl transition-all duration-300 hover-glow backdrop-blur-md ${i % 2 === 0 ? "bg-[#0e0e0e]/90 text-white border border-white/10" : "glass"}`}
                                        whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                                        <p className={`font-display font-extrabold text-4xl mb-1 ${i % 2 === 0 ? "text-[#e6c800]" : "text-[#0e0e0e]"}`}>{s.num}</p>
                                        <p className={`text-sm ${i % 2 === 0 ? "text-white/50" : "text-[#888]"}`}>{s.label}</p>
                                    </motion.div>
                                ))}
                            </AnimIn>
                        </div>
                    </div>
                </section>

                {/* ── Values ── */}
                <section className="py-24" style={{ background: "#f9f7f3" }}>
                    <div className="container mx-auto px-6 max-w-7xl">
                        <AnimIn className="mb-14">
                            <span className="section-label">Değerlerimiz</span>
                            <h2 className="font-display font-extrabold text-[#0e0e0e] mt-2" style={{ fontSize: "clamp(28px,3vw,44px)" }}>
                                Bizi Biz Yapan Değerler
                            </h2>
                        </AnimIn>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {values.map((v, i) => (
                                <AnimIn key={i} delay={i * 0.07}>
                                    <motion.div className="glass p-8 rounded-xl relative overflow-hidden hover-glow"
                                        whileHover={{ y: -6, transition: { duration: 0.2 } }}>
                                        <motion.div className="absolute bottom-0 left-0 h-1 bg-[#e6c800]"
                                            initial={{ width: "0%" }}
                                            whileHover={{ width: "100%" }}
                                            transition={{ duration: 0.35 }} />
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-[#0e0e0e]"
                                            style={{ background: "rgba(230,200,0,0.15)", border: "1px solid rgba(230,200,0,0.3)" }}>
                                            {v.icon}
                                        </div>
                                        <h3 className="font-display font-bold text-[#0e0e0e] text-lg mb-3">{v.title}</h3>
                                        <p className="text-[#888] text-sm leading-relaxed">{v.desc}</p>
                                    </motion.div>
                                </AnimIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Timeline ── */}
                <section className="py-24 bg-[#0e0e0e]">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <AnimIn className="mb-14">
                            <span className="section-label" style={{ color: "#e6c800" }}>Yolculuğumuz</span>
                            <h2 className="font-display font-extrabold text-white mt-2" style={{ fontSize: "clamp(28px,3vw,44px)" }}>
                                Nasıl Büyüdük?
                            </h2>
                        </AnimIn>
                        <div className="relative border-l-2 border-white/10 ml-8 pl-8 space-y-12">
                            {milestones.map((m, i) => (
                                <AnimIn key={i} delay={i * 0.1}>
                                    <div className="relative">
                                        <div className="absolute -left-[41px] w-4 h-4 rounded-full bg-[#e6c800] border-2 border-[#0e0e0e] mt-1" />
                                        <span className="font-display font-extrabold text-[#e6c800] text-sm">{m.year}</span>
                                        <h3 className="font-display font-bold text-white text-xl mt-1 mb-2">{m.title}</h3>
                                        <p className="text-white/50 text-sm leading-relaxed">{m.desc}</p>
                                    </div>
                                </AnimIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Team ── */}
                <section className="py-24" style={{ background: "#f3f0ea" }}>
                    <div className="container mx-auto px-6 max-w-7xl">
                        <AnimIn className="mb-14">
                            <span className="section-label">Ekibimiz</span>
                            <h2 className="font-display font-extrabold text-[#0e0e0e] mt-2" style={{ fontSize: "clamp(28px,3vw,44px)" }}>
                                Sahne Arkasındaki Dahiler
                            </h2>
                        </AnimIn>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {team.map((member, i) => (
                                <AnimIn key={i} delay={i * 0.1}>
                                    <motion.div className="glass p-8 rounded-xl text-center hover-glow"
                                        whileHover={{ y: -6, transition: { duration: 0.25 } }}>
                                        <div className="w-16 h-16 rounded-full bg-[#0e0e0e] flex items-center justify-center mx-auto mb-5 shadow-[0_4px_20px_rgba(230,200,0,0.3)] border border-[#e6c800]/20">
                                            <span className="font-display font-extrabold text-2xl text-[#e6c800]">{member.initial}</span>
                                        </div>
                                        <h3 className="font-display font-bold text-[#0e0e0e] text-lg">{member.name}</h3>
                                        <p className="text-[#888] text-sm mt-1">{member.role}</p>
                                    </motion.div>
                                </AnimIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="py-20" style={{ background: "#f9f7f3" }}>
                    <div className="container mx-auto px-6 max-w-7xl text-center">
                        <AnimIn>
                            <h2 className="font-display font-extrabold text-[#0e0e0e] mb-6" style={{ fontSize: "clamp(32px,4vw,56px)" }}>
                                Birlikte Çalışalım
                            </h2>
                            <p className="text-[#888] text-lg mb-8">Projeniz için ücretsiz danışmanlık alın.</p>
                            <Link href="/contact" className="btn-primary inline-flex">
                                İletişime Geç <ArrowRight size={16} />
                            </Link>
                        </AnimIn>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
