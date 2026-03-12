"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Code, Globe, Shield, Zap, Sparkles, MonitorSmartphone, CheckCircle2, Cpu, BarChart3, Users, MessageSquare, Layers, Search, Rocket } from "lucide-react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomepageBlogSection } from "@/components/blog/HomepageBlogSection";
import { AppStoreShowcase } from "@/components/home/AppStoreShowcase";
import { HeroSection } from "@/components/home/HeroSection";
import { PanelShowcase } from "@/components/home/PanelShowcase";
import { ContactInquiryForm } from "@/components/forms/ContactInquiryForm";
import { Magnetic } from "@/components/ui/Magnetic";
import { ParticleField } from "@/components/ui/ParticleField";
import { createRevealUp, revealViewport, staggerContainer } from "@/components/ui/motion";
import { BlockReveal, TextReveal } from "@/components/ui/reveal";

export default function Home() {
  const t = useTranslations("Homepage");
  const containerRef = useRef(null);
  const reducedMotion = !!useReducedMotion();

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

  // Section-based scroll snapping (homepage only, CSS-only, removed on unmount)
  useEffect(() => {
    document.documentElement.classList.add("home-scroll-snap");
    return () => document.documentElement.classList.remove("home-scroll-snap");
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-white text-[#0a0c10] selection:bg-[#e6c800] selection:text-[#0a0c10] overflow-x-hidden">
      <Header />

      <main className="relative z-10">

        <div className="home-snap-section">
          <HeroSection />
        </div>

        {/* ── PRODUCT DEMO: Dashboard Showcase ────────────────────────── */}
        <div className="home-snap-section -mt-8">
          <PanelShowcase />
        </div>

        {/* ── SECTION 02: TRUSTED PARTNER ────────────────────────── */}
        <section className="home-snap-section py-24 md:py-28 bg-[#fafafc] relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mb-16">
              <BlockReveal>
                <TextReveal delay={0.05}>
                  <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#0a0c10]/45 mb-5 block">{t("partnerSection.tag")}</span>
                </TextReveal>
                <TextReveal delay={0.12}>
                  <h2 className="text-4xl md:text-5xl font-display font-black leading-[1.02] tracking-tighter mb-6 text-[#0a0c10]" dangerouslySetInnerHTML={{ __html: t.raw("partnerSection.title") }} />
                </TextReveal>
                <TextReveal delay={0.2}>
                  <p className="text-[#0a0c10]/55 text-[17px] font-medium leading-relaxed max-w-xl">
                    {t("partnerSection.description")}
                  </p>
                </TextReveal>
              </BlockReveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {t.raw("partnerSection.pillars").map((pillar: any, i: number) => (
                <BlockReveal key={i} delay={i * 0.08}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative p-7 bg-white border border-[#0a0c10]/[0.05] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] transition-all duration-300 h-full overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#0a0c10]/0 group-hover:bg-[#0a0c10]/[0.03] rounded-full transition-all duration-400 -translate-y-1/2 translate-x-1/2" />
                    <div className="w-12 h-12 rounded-lg bg-[#fafafc] border border-[#0a0c10]/5 flex items-center justify-center mb-5 group-hover:bg-[#e6c800]/90 group-hover:border-[#e6c800] transition-colors duration-300">
                      {[<BarChart3 size={22} />, <Sparkles size={22} />, <Cpu size={22} />, <Rocket size={22} />][i]}
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-2">{pillar.t}</h3>
                    <p className="text-[#0a0c10]/52 text-[14px] font-medium leading-relaxed">{pillar.d}</p>
                  </motion.div>
                </BlockReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Transition: off-white → white */}
        <div className="h-12 bg-gradient-to-b from-[#fafafc] to-white" aria-hidden />

        {/* ── SECTION 03: SERVICES ────────────────────────── */}
        <section className="home-snap-section py-24 md:py-28 bg-white overflow-hidden relative">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20">
              <BlockReveal className="max-w-3xl">
                <TextReveal delay={0.05}>
                  <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#0a0c10]/45 mb-5 block">{t("servicesSection.tag")}</span>
                </TextReveal>
                <TextReveal delay={0.12}>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-[0.94] tracking-tighter text-[#0a0c10]" dangerouslySetInnerHTML={{ __html: t.raw("servicesSection.title") }} />
                </TextReveal>
              </BlockReveal>
              <BlockReveal delay={0.12} className="max-w-md lg:text-right">
                <TextReveal delay={0.18}>
                  <p className="text-[#0a0c10]/52 text-[17px] font-medium mb-8 max-w-sm">
                    {t("servicesSection.description")}
                  </p>
                </TextReveal>
                <Link href="/services" className="inline-flex items-center gap-4 font-black text-sm uppercase tracking-widest group">
                  {t("servicesSection.viewAll")} <div className="w-12 h-px bg-[#0a0c10] group-hover:w-20 transition-all duration-500" />
                </Link>
              </BlockReveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {Object.entries(t.raw("servicesSection.items")).map(([key, item]: [string, any], i: number) => (
                <BlockReveal key={key} delay={i * 0.08}>
                  <Link href={`/services#${key}`} className="block group">
                    <motion.div
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="relative bg-[#fafafc] border border-[#0a0c10]/[0.05] rounded-xl p-10 h-full overflow-hidden transition-all duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:bg-white"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0c10]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="flex flex-col h-full justify-between relative z-10">
                        <div className="mb-16 flex justify-between items-start">
                          <div className="w-16 h-16 rounded-xl bg-white border border-[#0a0c10]/5 flex items-center justify-center text-[#0a0c10] shadow-[0_1px_2px_rgba(0,0,0,0.04)] group-hover:bg-[#e6c800]/90 group-hover:border-[#e6c800] transition-all duration-300">
                            {[<Globe size={28} />, <Zap size={28} />, <Cpu size={28} />, <Code size={28} />][i]}
                          </div>
                          <div className="w-10 h-10 rounded-full border border-[#0a0c10]/8 flex items-center justify-center group-hover:border-[#e6c800] group-hover:bg-[#e6c800] group-hover:text-[#0a0c10] transition-all duration-300">
                            <ArrowUpRight size={18} className="opacity-50 group-hover:opacity-100 transition-opacity duration-200" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-3 leading-[0.94]">{item.t}</h3>
                          <p className="text-[#0a0c10]/52 text-[15px] font-medium max-w-sm leading-relaxed">{item.d}</p>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </BlockReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Transition: white → dark (neutral gradient, no yellow) */}
        <div
          className="h-24 md:h-28"
          style={{
            background: "linear-gradient(to bottom, #ffffff 0%, #f0f0f2 25%, #d8d8dc 50%, #909098 75%, #2a2c30 90%, #0a0c10 100%)",
          }}
          aria-hidden
        />

        {/* ── SECTION 04: PROCESS ────────────────────────── */}
        <section className="home-snap-section py-24 md:py-28 bg-[#0a0c10] text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <ParticleField variant="dark" count={12} opacity={0.35} />
          </div>
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-24">
              <BlockReveal className="max-w-3xl">
                <TextReveal delay={0.05}>
                  <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-white/45 mb-5 block">{t("processSection.tag")}</span>
                </TextReveal>
                <TextReveal delay={0.12}>
                  <h2 className="text-4xl md:text-5xl font-display font-black leading-[0.94] tracking-tighter uppercase text-white" dangerouslySetInnerHTML={{ __html: t.raw("processSection.title") }} />
                </TextReveal>
              </BlockReveal>
              <BlockReveal delay={0.12} className="max-w-md lg:text-right">
                <TextReveal delay={0.18}>
                  <p className="text-white/45 text-[16px] font-medium italic max-w-sm">
                    {t("processSection.description")}
                  </p>
                </TextReveal>
              </BlockReveal>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={revealViewport}
            >
              <div className="absolute top-1/2 left-0 w-full h-px bg-white/[0.08] hidden lg:block -translate-y-1/2 -z-10" />

              {t.raw("processSection.steps").map((step: any, i: number) => (
                <motion.div key={i} variants={createRevealUp(reducedMotion, 36, 6)}>
                  <motion.div
                    whileHover={{ y: -3, borderColor: "rgba(230,200,0,0.2)", backgroundColor: "rgba(255,255,255,0.05)" }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="home-card-dark group relative rounded-xl p-10 h-full flex flex-col justify-between transition-all duration-300"
                  >
                    <span className="text-5xl font-black text-white/15 group-hover:text-[#e6c800]/40 transition-colors leading-none mb-8">{step.n}</span>
                    <div>
                      <h4 className="text-xl font-black uppercase mb-4 tracking-tight text-white transition-colors">{step.t}</h4>
                      <p className="text-white/65 font-medium transition-colors leading-relaxed text-[15px]">{step.d}</p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Process and AppStore share same dark bg — no divider needed */}

        {/* ── SECTION 04B: DIGITAL PRODUCTS & UDF FLAGSHIP ────────────────────────── */}
        <div className="home-snap-section">
          <AppStoreShowcase />
        </div>

        {/* Transition: dark → light (neutral gradient, cinematic) */}
        <div
          className="h-24 md:h-28"
          style={{
            background: "linear-gradient(to bottom, #0a0c10 0%, #1a1c22 15%, #2a2c32 30%, #50545a 50%, #a8acb0 75%, #e8e8ec 90%, #ffffff 100%)",
          }}
          aria-hidden
        />

        {/* ── SECTION 05: WHY CHOOSE US ────────────────────────── */}
        <section className="home-snap-section py-24 md:py-28 bg-white overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 items-center">
              <div className="lg:col-span-7">
                <BlockReveal>
                  <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#0a0c10]/45 mb-8 block">{t("whyChooseUs.tag")}</span>
                  <h2 className="text-4xl md:text-5xl font-display font-black leading-[0.92] tracking-tighter mb-10 text-[#0a0c10] max-w-xl" dangerouslySetInnerHTML={{ __html: t.raw("whyChooseUs.title") }} />
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-12"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={revealViewport}
                  >
                    {t.raw("whyChooseUs.items").map((item: any, i: number) => (
                      <motion.div
                        key={i}
                        variants={createRevealUp(reducedMotion, 28, 6)}
                        whileHover={{ x: 6 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col gap-5 group p-7 rounded-2xl hover:bg-[#fafafc] transition-all duration-300"
                      >
                        <div className="w-12 h-12 shrink-0 rounded-xl bg-[#0a0c10] flex items-center justify-center text-[#e6c800] shadow-lg">
                          <CheckCircle2 size={22} />
                        </div>
                        <div>
                          <h4 className="text-xl font-black uppercase tracking-tight mb-2 leading-none">{item.t}</h4>
                          <p className="text-[#0a0c10]/48 font-medium leading-relaxed text-[15px] max-w-xs">{item.d}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </BlockReveal>
              </div>

              <div className="lg:col-span-5 relative">
                <BlockReveal delay={0.12} className="relative z-10">
                  <motion.div
                    style={{ y: mousePos.y * 24, x: mousePos.x * 16 }}
                    className="aspect-[4/5] bg-[#0a0c10] rounded-[3rem] overflow-hidden relative shadow-[0_48px_96px_rgba(0,0,0,0.18)] p-10 flex flex-col justify-center gap-10"
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

                    <div className="mt-10 pt-10 border-t border-white/10 flex items-center gap-6">
                      <div className="w-16 h-16 rounded-full bg-[#e6c800] flex items-center justify-center text-[#0a0c10] shadow-[0_0_32px_rgba(230,200,0,0.2)]">
                        <Zap size={32} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/55 block mb-2">Architecture</span>
                        <span className="text-xl md:text-2xl font-black uppercase text-white tracking-tight">High Performance</span>
                      </div>
                    </div>
                  </motion.div>
                </BlockReveal>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-[#0a0c10]/[0.02] blur-[60px] rounded-full -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Transition: white → off-white (Why Choose Us → Capabilities) */}
        <div className="h-8 bg-gradient-to-b from-white to-[#fafafc]" aria-hidden />

        {/* ── SECTION 06: CAPABILITIES (TECH STACK) ────────────────────────── */}
        <section className="home-snap-section py-20 md:py-24 bg-[#fafafc] border-y border-[#0a0c10]/[0.04] overflow-hidden">
          <div className="container mx-auto px-6 mb-16 text-center">
            <BlockReveal>
              <TextReveal delay={0.05}>
                <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#0a0c10]/45 mb-5 block">{t("capabilities.tag")}</span>
              </TextReveal>
              <TextReveal delay={0.12}>
                <h2 className="text-4xl md:text-5xl font-display font-black leading-[0.96] tracking-tighter text-[#0a0c10] uppercase mb-6 max-w-2xl mx-auto">
                  {t("capabilities.title1")}<br />{t("capabilities.title2")}
                </h2>
              </TextReveal>
              <TextReveal delay={0.2}>
                <p className="text-[#0a0c10]/52 text-[17px] font-medium max-w-lg mx-auto">
                  {t("capabilities.desc")}
                </p>
              </TextReveal>
            </BlockReveal>
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

        {/* Transition: off-white → white (Capabilities → Social) */}
        <div className="h-8 bg-gradient-to-b from-[#fafafc] to-white" aria-hidden />

        {/* ── SECTION 07: SOCIAL MEDIA SERVICES ────────────────────────── */}
        <section className="home-snap-section py-24 md:py-28 bg-white">
          <div className="container mx-auto px-6">
            <div className="bg-[#0a0c10] rounded-[2.5rem] md:rounded-[3rem] p-12 md:p-20 overflow-hidden relative shadow-[0_48px_96px_rgba(0,0,0,0.12)]">
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-18 items-center relative z-10 text-white">
                <BlockReveal>
                  <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-white/50 mb-8 block">{t("socialServices.tag")}</span>
                  <h2 className="text-4xl md:text-5xl font-display font-black leading-[0.92] tracking-tight mb-8 text-white uppercase max-w-lg" dangerouslySetInnerHTML={{ __html: t.raw("socialServices.title") }} />
                  <p className="text-white/58 text-[17px] md:text-lg font-medium leading-relaxed max-w-md mb-12">
                    {t("socialServices.desc")}
                  </p>
                  <Magnetic strength={16}>
                    <Link href="/contact" className="home-btn-primary-yellow inline-flex items-center gap-3 px-7 py-3.5 font-black uppercase tracking-[0.22em] text-[11px] rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#e6c800]/20">
                      {t("socialServices.cta")}
                      <div className="w-10 h-px bg-[#0a0c10]" />
                    </Link>
                  </Magnetic>
                </BlockReveal>

                <BlockReveal delay={0.12} className="grid grid-cols-2 gap-5">
                  <motion.div
                    className="contents"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={revealViewport}
                  >
                  {t.raw("socialServices.features").map((feat: string, i: number) => (
                    <motion.div
                      key={i}
                      variants={createRevealUp(reducedMotion, 24, 6)}
                      whileHover={{ y: -3, backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(230,200,0,0.25)" }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="home-card-dark rounded-2xl p-8 transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#e6c800] mb-8">
                        {[<MessageSquare size={28} />, <Globe size={28} />, <BarChart3 size={28} />, <Sparkles size={28} />][i]}
                      </div>
                      <span className="text-[13px] font-black uppercase tracking-[0.12em] leading-snug block text-white">{feat}</span>
                    </motion.div>
                  ))}
                  </motion.div>
                </BlockReveal>
              </div>
            </div>
          </div>
        </section>

        {/* Transition: white → warm neutral (Social → Blog) */}
        <div className="h-12 bg-gradient-to-b from-white via-[#fafafc] to-[#f3f0ea]" aria-hidden />

        {/* ── SECTION 09: BLOG ────────────────────────── */}
        <div className="home-snap-section">
          <HomepageBlogSection />
        </div>

        {/* Transition: cream → off-white (Blog → Contact) */}
        <div className="h-8 bg-gradient-to-b from-[#f3f0ea] to-[#fafafc]" aria-hidden />

        {/* ── SECTION 09.5: CONTACT INQUIRY ────────────────────────── */}
        <section className="home-snap-section py-20 md:py-24 bg-[#fafafc] border-y border-[#0a0c10]/[0.06]">
          <div className="container mx-auto px-6 max-w-5xl">
            <BlockReveal>
              <ContactInquiryForm
                title={t("contactStrip.title")}
                subtitle={t("contactStrip.subtitle")}
              />
            </BlockReveal>
          </div>
        </section>

        {/* Transition: light → dark (Contact → CTA, cinematic) */}
        <div
          className="h-24 md:h-28"
          style={{
            background: "linear-gradient(to bottom, #fafafc 0%, #f0f0f2 20%, #d8d8dc 45%, #909098 70%, #2a2c30 88%, #0a0c10 100%)",
          }}
          aria-hidden
        />

        {/* ── SECTION 10: CINEMATIC CTA ────────────────────────── */}
        <section className="home-snap-section relative py-28 md:py-36 lg:py-40 bg-[#0a0c10] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

          <div className="container mx-auto px-6 relative z-10 text-center">
            <BlockReveal className="flex flex-col items-center">
              <TextReveal delay={0.05}>
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/50 mb-6 block">{t("ctaSection.tag")}</span>
              </TextReveal>
              <TextReveal delay={0.12}>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black leading-[0.94] tracking-tight text-white uppercase mb-10 max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: t.raw("ctaSection.title") }} />
              </TextReveal>

              <TextReveal delay={0.2}>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <Magnetic strength={20}>
                  <Link href="/contact" className="home-btn-primary-yellow group relative px-9 py-3.5 font-black uppercase tracking-[0.22em] text-[11px] rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_16px_48px_rgba(230,200,0,0.2)]">
                    <span className="relative z-10">{t("ctaSection.cta") || t("ctaSection.button")}</span>
                    <div className="absolute inset-0 border border-white/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                </Magnetic>

                <Link href="/portfolio" className="group flex items-center gap-4 text-white/90 font-bold uppercase tracking-[0.24em] text-[11px] hover:text-[#e6c800] transition-colors duration-200">
                  <span>{t("ctaSection.ctaSecondary") || "Explore Portfolio"}</span>
                  <div className="w-8 h-px bg-white/50 group-hover:bg-[#e6c800] group-hover:w-12 transition-all duration-300" />
                </Link>
              </div>
              </TextReveal>
            </BlockReveal>
          </div>
        </section>

      </main >

      <Footer />
    </div >
  );
}
