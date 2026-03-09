"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, Code, Globe, Shield, Zap, Sparkles, MonitorSmartphone, CheckCircle2, Cpu, BarChart3, Users, MessageSquare, Layers, Search, Rocket } from "lucide-react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlogSlider } from "@/components/home/BlogSlider";
import { Magnetic } from "@/components/ui/Magnetic";
import { GlowBlob } from "@/components/ui/GlowBlob";

import { HeroScene } from "@/components/home/HeroScene";

/* ── AnimIn helper ─────────────────────────────────────────────── */
function AnimIn({ children, className = "", delay = 0, y = 40 }: {
  children: React.ReactNode; className?: string; delay?: number; y?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}>
      {children}
    </motion.div>
  );
}

export default function Home() {
  const t = useTranslations("Homepage");
  const containerRef = useRef(null);
  const heroRef = useRef(null);

  // Mouse Parallax Logic
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-white text-[#0a0c10] selection:bg-[#e6c800] selection:text-[#0a0c10] overflow-x-hidden">
      {/* Premium Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] mix-blend-multiply" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />

      <Header />

      <main className="relative z-10">

        {/* ── SECTION 01: IMMERSIVE 3D HERO ────────────────────────── */}
        <section ref={heroRef} className="relative min-h-screen flex items-center pt-20 pb-20 overflow-hidden bg-white">

          {/* Layer 0: 3D Scene Background */}
          <motion.div
            className="absolute inset-0 z-0 opacity-60"
            style={{
              x: mousePos.x * 20,
              y: mousePos.y * 20,
              scale: 1.05
            }}
          >
            <HeroScene />
          </motion.div>

          {/* Layer 1: Subtle Grid & atmospheric effects */}
          <div className="absolute inset-0 pointer-events-none z-[1]">
            <motion.div
              style={{ x: mousePos.x * 40, y: mousePos.y * 40 }}
              className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'linear-gradient(#0a0c10 1px, transparent 1px), linear-gradient(90deg, #0a0c10 1px, transparent 1px)', backgroundSize: '80px 80px' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/20 to-white" />
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

              {/* Left Column: Messaging */}
              <div className="lg:col-span-8 flex flex-col items-start pt-12">
                <AnimIn delay={0.2} y={15}>
                  <div className="inline-flex items-center gap-3 mb-10 px-6 py-2 bg-[#0a0c10]/5 border border-[#0a0c10]/10 rounded-full backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-[#e6c800] animate-pulse" />
                    <span className="text-[10px] font-black text-[#0a0c10] uppercase tracking-[0.5em]">
                      {t("hero.tag")}
                    </span>
                  </div>
                </AnimIn>

                <div className="relative mb-12">
                  <motion.div
                    style={{ x: mousePos.x * -30, y: mousePos.y * -30 }}
                  >
                    <motion.h1
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                      className="font-display font-black text-[clamp(64px,10vw,160px)] leading-[0.85] tracking-tighter uppercase text-[#0a0c10] mix-blend-darken"
                    >
                      {t("hero.title1")}<br />
                      <span className="text-transparent border-text text-stroke-black opacity-10">{t("hero.title2")}</span><br />
                      <span className="relative">
                        {t("hero.title3")}
                        <motion.span
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ delay: 1, duration: 1.2 }}
                          className="absolute -bottom-2 left-0 h-4 bg-[#e6c800] -z-10"
                        />
                      </span>
                    </motion.h1>
                  </motion.div>
                </div>

                <div className="flex flex-col md:flex-row gap-16 items-start w-full">
                  <AnimIn delay={0.4} y={20} className="max-w-md">
                    <p className="text-xl md:text-2xl text-[#0a0c10]/60 font-medium leading-tight mb-12 tracking-tight">
                      {t("hero.description")}
                    </p>

                    <div className="flex flex-wrap items-center gap-6">
                      <Magnetic strength={20}>
                        <Link href="/contact" className="group relative px-12 py-7 bg-[#0a0c10] text-white font-black uppercase tracking-[0.4em] text-[12px] overflow-hidden rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-black/20">
                          <span className="relative z-10">{t("hero.cta")}</span>
                          <div className="absolute inset-0 bg-[#e6c800] transform translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-expo" />
                        </Link>
                      </Magnetic>

                      <Link href="/services" className="group flex items-center gap-4 px-10 py-7 border-2 border-[#0a0c10]/10 hover:border-[#0a0c10] text-[#0a0c10] font-black uppercase tracking-[0.4em] text-[12px] rounded-2xl transition-all">
                        <span>{t("hero.ctaSecondary")}</span>
                        <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
                      </Link>
                    </div>
                  </AnimIn>

                  {/* Trust indicator layer */}
                  <AnimIn delay={0.6} y={20} className="md:border-l-2 border-[#0a0c10]/5 md:pl-12 flex flex-col gap-8">
                    {[
                      { label: "Client_Satisfaction", value: "99.8%" },
                      { label: "Systems_Automated", value: "250+" },
                      { label: "Digital_Revenue_Growth", value: "4.5x" }
                    ].map((stat, i) => (stat && (
                      <div key={i} className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0a0c10]/30 mb-2">{stat.label}</span>
                        <span className="text-3xl font-black text-[#0a0c10] leading-none">{stat.value}</span>
                      </div>
                    )))}
                  </AnimIn>
                </div>
              </div>

              {/* Bottom Scroll Indicator */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#0a0c10]/40 rotate-90 origin-center translate-y-8">{t("hero.scroll")}</span>
                <motion.div
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-px h-24 bg-gradient-to-b from-[#0a0c10]/40 to-transparent"
                />
              </div>

            </div>
          </div>
        </section>


        {/* ── SECTION 02: TRUSTED PARTNER ────────────────────────── */}
        <section className="py-32 bg-[#fafafc] border-y border-[#0a0c10]/5">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mb-24">
              <AnimIn>
                <span className="text-xs font-black uppercase tracking-[0.4em] text-[#e6c800] mb-6 block">{t("partnerSection.tag")}</span>
                <h2 className="text-5xl md:text-7xl font-display font-black leading-[1] tracking-tighter mb-10 text-[#0a0c10]" dangerouslySetInnerHTML={{ __html: t.raw("partnerSection.title") }} />
                <p className="text-[#0a0c10]/60 text-xl font-medium leading-relaxed max-w-2xl">
                  {t("partnerSection.description")}
                </p>
              </AnimIn>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {t.raw("partnerSection.pillars").map((pillar: any, i: number) => (
                <AnimIn key={i} delay={i * 0.15}>
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="group relative p-10 bg-white border border-[#0a0c10]/5 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all duration-700 h-full overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#e6c800]/0 group-hover:bg-[#e6c800]/5 rounded-full transition-all duration-700 -translate-y-1/2 translate-x-1/2" />
                    <div className="w-16 h-16 rounded-2xl bg-[#fafafc] border border-[#0a0c10]/5 flex items-center justify-center mb-10 group-hover:bg-[#e6c800] group-hover:border-[#e6c800] transition-all duration-500">
                      {[<BarChart3 size={24} />, <Sparkles size={24} />, <Cpu size={24} />, <Rocket size={24} />][i]}
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-4">{pillar.t}</h3>
                    <p className="text-[#0a0c10]/50 font-medium leading-relaxed">{pillar.d}</p>
                  </motion.div>
                </AnimIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 03: SERVICES ────────────────────────── */}
        <section className="py-40 bg-white overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-32">
              <AnimIn className="max-w-3xl">
                <span className="text-xs font-black uppercase tracking-[0.4em] text-[#e6c800] mb-6 block">{t("servicesSection.tag")}</span>
                <h2 className="text-6xl md:text-8xl font-display font-black leading-[0.9] tracking-tighter text-[#0a0c10]" dangerouslySetInnerHTML={{ __html: t.raw("servicesSection.title") }} />
              </AnimIn>
              <AnimIn delay={0.2} className="max-w-md lg:text-right">
                <p className="text-[#0a0c10]/50 text-xl font-medium mb-10">
                  {t("servicesSection.description")}
                </p>
                <Link href="/services" className="inline-flex items-center gap-4 font-black text-sm uppercase tracking-widest group">
                  {t("servicesSection.viewAll")} <div className="w-12 h-px bg-[#0a0c10] group-hover:w-20 transition-all duration-500" />
                </Link>
              </AnimIn>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {Object.entries(t.raw("servicesSection.items")).map(([key, item]: [string, any], i: number) => (
                <AnimIn key={key} delay={i * 0.15}>
                  <Link href={`/services#${key}`} className="block group">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="relative bg-[#fafafc] border border-[#0a0c10]/10 rounded-[3rem] p-16 h-full overflow-hidden transition-all duration-700 hover:shadow-[0_80px_160px_rgba(0,0,0,0.08)] hover:bg-white"
                    >
                      {/* Depth visual background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#e6c800]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                      <div className="flex flex-col h-full justify-between relative z-10">
                        <div className="mb-32 flex justify-between items-start">
                          <div className="w-24 h-24 rounded-[2rem] bg-white border border-[#0a0c10]/5 flex items-center justify-center text-[#0a0c10] shadow-sm group-hover:scale-110 group-hover:bg-[#e6c800] group-hover:border-[#e6c800] transition-all duration-700">
                            {[<Globe size={40} />, <Zap size={40} />, <Cpu size={40} />, <Code size={40} />][i]}
                          </div>
                          <div className="w-16 h-16 rounded-full border-2 border-[#0a0c10]/5 flex items-center justify-center group-hover:border-[#e6c800] group-hover:bg-[#e6c800] group-hover:text-[#0a0c10] transition-all duration-500">
                            <ArrowUpRight size={24} className="opacity-40 group-hover:opacity-100 transition-all" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-5xl font-black uppercase tracking-tighter mb-6 leading-[0.9]">{item.t}</h3>
                          <p className="text-[#0a0c10]/50 text-xl font-medium max-w-sm leading-snug">{item.d}</p>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </AnimIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 04: PROCESS ────────────────────────── */}
        <section className="py-40 bg-[#0a0c10] text-white">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-32">
              <AnimIn className="max-w-3xl">
                <span className="text-xs font-black uppercase tracking-[0.4em] text-[#e6c800] mb-6 block">{t("processSection.tag")}</span>
                <h2 className="text-6xl md:text-8xl font-display font-black leading-[0.9] tracking-tighter uppercase" dangerouslySetInnerHTML={{ __html: t.raw("processSection.title") }} />
              </AnimIn>
              <AnimIn delay={0.2} className="max-w-md lg:text-right">
                <p className="text-white/40 text-lg font-medium italic">
                  {t("processSection.description")}
                </p>
              </AnimIn>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative">
              {/* Connecting line for desktop */}
              <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 hidden lg:block -translate-y-1/2 -z-10" />

              {t.raw("processSection.steps").map((step: any, i: number) => (
                <AnimIn key={i} delay={i * 0.15}>
                  <motion.div
                    whileHover={{ y: -15, backgroundColor: "rgba(255,255,255,1)", color: "#0a0c10" }}
                    className="group relative bg-[#0a0c10] border border-white/10 rounded-[2.5rem] p-12 h-full flex flex-col justify-between transition-all duration-700 shadow-2xl"
                  >
                    <span className="text-7xl font-black text-white/5 group-hover:text-[#e6c800]/20 transition-colors leading-none mb-12">{step.n}</span>
                    <div>
                      <h4 className="text-2xl font-black uppercase mb-6 tracking-tight group-hover:text-[#0a0c10] transition-colors">{step.t}</h4>
                      <p className="text-white/40 group-hover:text-[#0a0c10]/60 font-medium transition-colors leading-relaxed">{step.d}</p>
                    </div>
                  </motion.div>
                </AnimIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 05: WHY CHOOSE US ────────────────────────── */}
        <section className="py-48 bg-white overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
              <div className="lg:col-span-7">
                <AnimIn>
                  <span className="text-xs font-black uppercase tracking-[0.5em] text-[#e6c800] mb-10 block">{t("whyChooseUs.tag")}</span>
                  <h2 className="text-6xl md:text-9xl font-display font-black leading-[0.8] tracking-tighter mb-20 text-[#0a0c10]" dangerouslySetInnerHTML={{ __html: t.raw("whyChooseUs.title") }} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {t.raw("whyChooseUs.items").map((item: any, i: number) => (
                      <motion.div
                        key={i}
                        whileHover={{ x: 10 }}
                        className="flex flex-col gap-6 group p-8 rounded-3xl hover:bg-[#fafafc] transition-all duration-500"
                      >
                        <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#0a0c10] flex items-center justify-center text-[#e6c800] shadow-xl">
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <h4 className="text-2xl font-black uppercase tracking-tight mb-3 leading-none">{item.t}</h4>
                          <p className="text-[#0a0c10]/40 font-medium leading-snug">{item.d}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimIn>
              </div>

              <div className="lg:col-span-5 relative">
                <AnimIn delay={0.3} className="relative z-10">
                  <motion.div
                    style={{ y: mousePos.y * 30, x: mousePos.x * 20 }}
                    className="aspect-[4/5] bg-[#0a0c10] rounded-[4rem] overflow-hidden relative shadow-[0_80px_160px_rgba(0,0,0,0.2)] p-12 flex flex-col justify-center gap-12"
                  >
                    {/* Visual Metric Scene */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    </div>

                    {[88, 55, 98].map((val, idx) => (
                      <div key={idx} className="relative z-10">
                        <div className="flex justify-between font-black text-[10px] uppercase tracking-[0.5em] text-white/40 mb-4">
                          <span>SYSTEM_CORE_0{idx + 1}</span>
                          <span className="text-[#e6c800]">{val}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${val}%` }}
                            transition={{ duration: 2, ease: "easeOut", delay: 0.5 + (idx * 0.2) }}
                            className="h-full bg-gradient-to-r from-[#e6c800] to-white/50"
                          />
                        </div>
                      </div>
                    ))}

                    <div className="mt-12 pt-12 border-t border-white/10 flex items-center gap-8">
                      <div className="w-20 h-20 rounded-full bg-[#e6c800] flex items-center justify-center text-[#0a0c10] shadow-[0_0_50px_rgba(230,200,0,0.3)]">
                        <Zap size={32} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 block mb-2">Architecture</span>
                        <span className="text-2xl font-black uppercase text-white tracking-tighter">High_Performance</span>
                      </div>
                    </div>
                  </motion.div>
                </AnimIn>
                {/* Decorative element behind */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#e6c800]/5 blur-[100px] rounded-full -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 06: CAPABILITIES (TECH STACK) ────────────────────────── */}
        <section className="py-24 bg-[#fafafc] border-y border-[#0a0c10]/5 overflow-hidden">
          <div className="container mx-auto px-6 mb-20 text-center">
            <AnimIn>
              <span className="text-xs font-black uppercase tracking-[0.4em] text-[#e6c800] mb-6 block">{t("capabilities.tag")}</span>
              <h2 className="text-5xl md:text-8xl font-display font-black leading-[0.9] tracking-tighter text-[#0a0c10] uppercase mb-8">
                {t("capabilities.title1")}<br />{t("capabilities.title2")}
              </h2>
              <p className="text-[#0a0c10]/50 text-xl font-medium max-w-xl mx-auto">
                {t("capabilities.desc")}
              </p>
            </AnimIn>
          </div>

          <div className="flex whitespace-nowrap animate-marquee py-10 opacity-30 select-none pointer-events-none">
            {[...Array(2)].map((_, j) => (
              <div key={j} className="flex items-center gap-32 px-16">
                {["NEXT.JS", "REACT", "TYPESCRIPT", "TAILWIND", "NODE.JS", "PYTHON", "AWS", "DOCKER", "MONGODB", "GRAPHQL"].map((tech, i) => (
                  <span key={i} className="text-6xl font-black tracking-tighter">{tech}</span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 07: SOCIAL MEDIA SERVICES ────────────────────────── */}
        <section className="py-40 bg-white">
          <div className="container mx-auto px-6">
            <div className="bg-[#0a0c10] rounded-[4rem] p-16 md:p-32 overflow-hidden relative shadow-[0_120px_240px_rgba(0,0,0,0.2)]">
              {/* Immersive Background Scene Mock */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#e6c800]/20 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/10 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3" />
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1 }} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10 text-white">
                <AnimIn>
                  <span className="text-xs font-black uppercase tracking-[0.5em] text-[#e6c800] mb-10 block">{t("socialServices.tag")}</span>
                  <h2 className="text-6xl md:text-9xl font-display font-black leading-[0.8] tracking-tighter mb-12 text-white uppercase" dangerouslySetInnerHTML={{ __html: t.raw("socialServices.title") }} />
                  <p className="text-white/60 text-xl md:text-2xl font-medium leading-snug max-w-md mb-16">
                    {t("socialServices.desc")}
                  </p>
                  <Magnetic strength={20}>
                    <Link href="/contact" className="inline-flex items-center gap-8 px-12 py-8 bg-[#e6c800] text-[#0a0c10] font-black uppercase tracking-[0.4em] text-[12px] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#e6c800]/20">
                      {t("socialServices.cta")}
                      <div className="w-12 h-px bg-[#0a0c10]" />
                    </Link>
                  </Magnetic>
                </AnimIn>

                <AnimIn delay={0.4} className="grid grid-cols-2 gap-6">
                  {t.raw("socialServices.features").map((feat: string, i: number) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.08)" }}
                      className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 transition-all duration-500"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-[#e6c800] mb-16 shadow-xl">
                        {[<MessageSquare size={28} />, <Globe size={28} />, <BarChart3 size={28} />, <Sparkles size={28} />][i]}
                      </div>
                      <span className="text-md font-black uppercase tracking-widest leading-none block">{feat}</span>
                    </motion.div>
                  ))}
                </AnimIn>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 08: PORTFOLIO PREVIEW ────────────────────────── */}
        <div className="bg-[#fafafc] py-48 overflow-hidden">
          <div className="container mx-auto px-6 mb-32 flex flex-col md:flex-row items-end justify-between gap-12">
            <AnimIn className="max-w-4xl">
              <span className="text-xs font-black uppercase tracking-[0.6em] text-[#e6c800] mb-8 block">{t("portfolioPreview.tag")}</span>
              <h2 className="text-7xl md:text-[10rem] font-display font-black leading-[0.8] tracking-[0.02em] text-[#0a0c10] uppercase" dangerouslySetInnerHTML={{ __html: t.raw("portfolioPreview.title") }} />
            </AnimIn>
            <AnimIn delay={0.2}>
              <Link href="/portfolio" className="btn-secondary group">
                <span className="relative z-10 px-8 py-4 bg-[#0a0c10] text-white rounded-full text-xs font-black tracking-widest inline-block group-hover:bg-[#e6c800] group-hover:text-[#0a0c10] transition-all duration-500">
                  {t("portfolioPreview.exploreMore")}
                </span>
              </Link>
            </AnimIn>
          </div>

          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
              {[1, 2].map((project, i) => (
                <AnimIn key={i} delay={i * 0.2}>
                  <motion.div
                    whileHover={{ y: -20 }}
                    className="group cursor-pointer relative"
                  >
                    <div className="aspect-[16/11] bg-white rounded-[3.5rem] border border-[#0a0c10]/10 overflow-hidden mb-12 relative shadow-[0_40px_100px_rgba(0,0,0,0.05)]">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-8 group-hover:translate-y-0">
                        <div className="px-12 py-6 bg-white rounded-full shadow-2xl text-[10px] font-black uppercase tracking-[0.5em] text-[#0a0c10] hover:bg-[#e6c800] transition-colors">
                          {t("portfolioPreview.viewProject")}
                        </div>
                      </div>
                    </div>
                    <div className="px-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[#e6c800] mb-4 block">Enterprise_Systems // 2025</span>
                      <h3 className="text-5xl font-black uppercase tracking-tighter group-hover:text-[#e6c800] transition-colors leading-[0.9]">{i === 0 ? "Global Logistics Hub" : "AI Driven Analytics"}</h3>
                    </div>
                  </motion.div>
                </AnimIn>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION 09: BLOG SLIDER ────────────────────────── */}
        <section className="py-48 bg-white overflow-hidden">
          <div className="container mx-auto px-6 mb-24 flex flex-col md:flex-row items-end justify-between gap-12">
            <AnimIn className="max-w-2xl">
              <span className="text-xs font-black uppercase tracking-[0.5em] text-[#e6c800] mb-8 block">{t("blogSection.tag")}</span>
              <h2 className="text-6xl md:text-8xl font-display font-black leading-[0.85] tracking-tighter text-[#0a0c10] uppercase">{t("blogSection.latest")}</h2>
            </AnimIn>
            <AnimIn delay={0.2} className="flex items-center gap-10">
              <div className="w-24 h-px bg-[#0a0c10]/10 hidden md:block" />
              <Link href="/blog" className="text-sm font-black uppercase tracking-[0.3em] text-[#0a0c10] hover:text-[#e6c800] transition-colors">{t("blogSection.allPosts")}</Link>
            </AnimIn>
          </div>

          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[1, 2, 3].map((post, i) => (
                <AnimIn key={i} delay={i * 0.15}>
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="group flex flex-col h-full bg-[#fafafc] border border-[#0a0c10]/5 rounded-[3rem] p-10 transition-all duration-700 hover:bg-white hover:shadow-2xl"
                  >
                    <div className="aspect-[4/3] bg-white rounded-[2.5rem] border border-[#0a0c10]/5 mb-10 overflow-hidden relative shadow-sm">
                      <div className="absolute inset-0 bg-[#e6c800]/0 group-hover:bg-[#e6c800]/5 transition-colors duration-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[#0a0c10]/30 mb-6">
                        <span>Digital_Trends</span>
                        <div className="w-1 h-1 rounded-full bg-[#e6c800]" />
                        <span>March 2025</span>
                      </div>
                      <h3 className="text-3xl font-black uppercase tracking-tighter leading-tight group-hover:text-[#e6c800] transition-colors mb-6">Building The Future Of Enterprise Systems</h3>
                      <p className="text-[#0a0c10]/40 font-medium leading-relaxed mb-8">Exploring the intersection of automation and design in modern business infrastructure.</p>
                      <Link href={`/blog/${i}`} className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-[#0a0c10] group-hover:translate-x-4 transition-all duration-500">
                        Read_More
                        <div className="w-8 h-px bg-[#0a0c10] group-hover:w-12 transition-all" />
                      </Link>
                    </div>
                  </motion.div>
                </AnimIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 10: CINEMATIC CTA ────────────────────────── */}
        <section className="relative py-48 lg:py-64 bg-[#0a0c10] overflow-hidden">
          {/* Background Visual Effects */}
          <div className="absolute inset-0 opacity-40">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] border-[0.5px] border-white/5 rounded-full"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c10] via-transparent to-[#0a0c10]" />
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)', backgroundSize: '60px 60px', opacity: 0.05 }} />
          </div>

          <div className="container mx-auto px-6 relative z-10 text-center">
            <AnimIn className="flex flex-col items-center">
              <span className="text-xs font-black uppercase tracking-[0.8em] text-[#e6c800] mb-12 block">{t("ctaSection.tag")}</span>
              <h2 className="text-7xl md:text-[12rem] font-display font-black leading-[0.75] tracking-tighter text-white uppercase mb-20 max-w-6xl mx-auto" dangerouslySetInnerHTML={{ __html: t.raw("ctaSection.title") }} />

              <div className="flex flex-col md:flex-row items-center gap-12">
                <Magnetic strength={30}>
                  <Link href="/contact" className="group relative px-20 py-10 bg-[#e6c800] text-[#0a0c10] font-black uppercase tracking-[0.5em] text-[14px] rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_40px_120px_rgba(230,200,0,0.3)]">
                    <span className="relative z-10">{t("ctaSection.cta") || t("ctaSection.button")}</span>
                    <div className="absolute inset-0 bg-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-expo" />
                  </Link>
                </Magnetic>

                <Link href="/portfolio" className="group flex items-center gap-8 text-white font-black uppercase tracking-[0.4em] text-[12px] hover:text-[#e6c800] transition-colors">
                  <span>{t("ctaSection.ctaSecondary") || "Explore Portfolio"}</span>
                  <div className="w-12 h-px bg-white group-hover:bg-[#e6c800] group-hover:w-20 transition-all duration-500" />
                </Link>
              </div>
            </AnimIn>
          </div>
        </section>

      </main >

      <Footer />
    </div >
  );
}
