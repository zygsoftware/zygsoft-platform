"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { Zap, Sparkles, CheckCircle2, Cpu, BarChart3, Rocket, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { SolutionsSection } from "@/components/home/SolutionsSection";
import { ContactInquiryForm } from "@/components/forms/ContactInquiryForm";
import { ParticleField } from "@/components/ui/ParticleField";
import { createRevealUp, revealViewport, staggerContainer } from "@/components/ui/motion";
import { BlockReveal, TextReveal } from "@/components/ui/reveal";

const PanelShowcase = dynamic(
  () => import("@/components/home/PanelShowcase").then((mod) => mod.PanelShowcase),
  {
    ssr: false,
    loading: () => <div className="min-h-[720px] w-full bg-[#f5f5f7]" aria-hidden />,
  },
);
const AppStoreShowcase = dynamic(
  () => import("@/components/home/AppStoreShowcase").then((mod) => mod.AppStoreShowcase),
  {
    ssr: false,
    loading: () => <div className="min-h-[760px] w-full bg-[#343131]" aria-hidden />,
  },
);
const HomepageBlogSection = dynamic(
  () => import("@/components/blog/HomepageBlogSection").then((mod) => mod.HomepageBlogSection),
  {
    ssr: false,
    loading: () => <div className="min-h-[520px] w-full bg-[#f3f0ea]" aria-hidden />,
  },
);
const InstagramFeedSection = dynamic(
  () => import("@/components/home/InstagramFeedSection").then((mod) => mod.InstagramFeedSection),
  {
    ssr: false,
    loading: () => <div className="min-h-[420px] w-full bg-white" aria-hidden />,
  },
);

type PartnerPillar = {
  t: string;
  d: string;
};

type ProcessStep = {
  n: string;
  t: string;
  d: string;
};

type WhyChooseUsItem = {
  t: string;
  d: string;
};

const partnerIcons = [BarChart3, Sparkles, Cpu, Rocket];

export default function Home() {
  const t = useTranslations("Homepage");
  const locale = useLocale();
  const isTr = locale === "tr";
  const containerRef = useRef(null);
  const reducedMotion = !!useReducedMotion();

  // Section-based scroll snapping (homepage only, CSS-only, removed on unmount)
  useEffect(() => {
    document.documentElement.classList.add("home-scroll-snap");
    return () => document.documentElement.classList.remove("home-scroll-snap");
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-white text-[#343131] selection:bg-[#e6c800] selection:text-[#343131] overflow-x-hidden">
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
        <section className="home-snap-section relative overflow-hidden bg-[linear-gradient(180deg,#fbfaf6_0%,#f7f6f2_100%)] py-16 md:py-18">
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #343131 1px, transparent 0)", backgroundSize: "28px 28px" }} />
          <div className="absolute left-[-8%] top-6 h-56 w-56 rounded-full bg-[#e6c800]/10 blur-3xl" />

          <div className="container relative z-10 mx-auto px-6">
            <div className="rounded-[34px] border border-[#343131]/[0.06] bg-white/88 p-7 shadow-[0_18px_48px_rgba(0,0,0,0.05)] md:p-9">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_0.9fr] lg:items-end">
                <BlockReveal>
                  <div className="max-w-3xl">
                    <TextReveal delay={0.05}>
                      <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#343131]/[0.08] bg-[#fafafc] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.32em] text-[#343131]/55">
                        <ShieldCheck size={13} className="text-[#e6c800]" />
                        {t("partnerSection.tag")}
                      </span>
                    </TextReveal>
                    <TextReveal delay={0.12}>
                      <h2
                        className="text-3xl font-display font-black leading-[0.98] tracking-[-0.04em] text-[#1a1715] md:text-5xl"
                        dangerouslySetInnerHTML={{ __html: t.raw("partnerSection.title") }}
                      />
                    </TextReveal>
                  </div>
                </BlockReveal>

                <BlockReveal delay={0.16}>
                  <div className="rounded-[26px] border border-[#343131]/[0.06] bg-[#fafafc] p-5">
                    <p className="text-sm font-medium leading-7 text-[#343131]/62 md:text-[15px]">
                      {t("partnerSection.description")}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[
                        isTr ? "Uçtan uca sistem" : "End-to-end systems",
                        isTr ? "Hibrit model" : "Hybrid model",
                        isTr ? "Ölçeklenebilir teslim" : "Scalable delivery",
                      ].map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center gap-2 rounded-full border border-[#343131]/[0.08] bg-white px-3 py-1.5 text-xs font-semibold text-[#343131]/72"
                        >
                          <CheckCircle2 size={13} className="text-[#e6c800]" />
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </BlockReveal>
              </div>

              <motion.div
                className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={revealViewport}
              >
                {(t.raw("partnerSection.pillars") as PartnerPillar[]).map((pillar, i) => {
                  const PillarIcon = partnerIcons[i];

                  return (
                    <motion.div
                      key={pillar.t}
                      variants={createRevealUp(reducedMotion, 20, 4)}
                      className="group rounded-[24px] border border-[#343131]/[0.06] bg-[#fcfcfd] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#e6c800]/40 hover:bg-white hover:shadow-[0_12px_28px_rgba(0,0,0,0.05)]"
                    >
                      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#faf4d4] text-[#1a1715] transition-colors duration-300 group-hover:bg-[#e6c800]">
                        {PillarIcon ? <PillarIcon size={20} /> : null}
                      </div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-[#1a1715]">
                        {pillar.t}
                      </h3>
                      <p className="mt-2 text-sm font-medium leading-6 text-[#343131]/60">
                        {pillar.d}
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Transition: off-white → white */}
        <div className="h-12 bg-gradient-to-b from-[#fafafc] to-white" aria-hidden />

        <div className="home-snap-section">
          <SolutionsSection />
        </div>

        {/* Transition: white → dark (neutral gradient, no yellow) */}
        <div
          className="h-24 md:h-28"
          style={{
            background: "linear-gradient(to bottom, #ffffff 0%, #f0f0f2 25%, #d8d8dc 50%, #909098 75%, #2a2c30 90%, #343131 100%)",
          }}
          aria-hidden
        />

        {/* ── SECTION 04: PROCESS ────────────────────────── */}
        <section className="home-snap-section py-24 md:py-28 bg-[#343131] text-white relative overflow-hidden">
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

              {(t.raw("processSection.steps") as ProcessStep[]).map((step, i) => (
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
            background: "linear-gradient(to bottom, #343131 0%, #1a1c22 15%, #2a2c32 30%, #50545a 50%, #a8acb0 75%, #e8e8ec 90%, #ffffff 100%)",
          }}
          aria-hidden
        />

        {/* ── SECTION 05: WHY CHOOSE US ────────────────────────── */}
        <section className="home-snap-section py-24 md:py-28 bg-white overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 items-center">
              <div className="lg:col-span-7">
                <BlockReveal>
                  <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#343131]/45 mb-8 block">{t("whyChooseUs.tag")}</span>
                  <h2 className="text-4xl md:text-5xl font-display font-black leading-[0.92] tracking-tighter mb-10 text-[#343131] max-w-xl" dangerouslySetInnerHTML={{ __html: t.raw("whyChooseUs.title") }} />
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-12"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={revealViewport}
                  >
                    {(t.raw("whyChooseUs.items") as WhyChooseUsItem[]).map((item, i) => (
                      <motion.div
                        key={i}
                        variants={createRevealUp(reducedMotion, 28, 6)}
                        whileHover={{ x: 6 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col gap-5 group p-7 rounded-2xl hover:bg-[#fafafc] transition-all duration-300"
                      >
                        <div className="w-12 h-12 shrink-0 rounded-xl bg-[#343131] flex items-center justify-center text-[#e6c800] shadow-lg">
                          <CheckCircle2 size={22} />
                        </div>
                        <div>
                          <h4 className="text-xl font-black uppercase tracking-tight mb-2 leading-none">{item.t}</h4>
                          <p className="text-[#343131]/48 font-medium leading-relaxed text-[15px] max-w-xs">{item.d}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </BlockReveal>
              </div>

              <div className="lg:col-span-5 relative">
                <BlockReveal delay={0.12} className="relative z-10">
                  <motion.div
                    className="aspect-[4/5] bg-[#343131] rounded-[3rem] overflow-hidden relative shadow-[0_48px_96px_rgba(0,0,0,0.18)] p-10 flex flex-col justify-center gap-10"
                  >
                    {/* Visual Metric Scene */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    </div>

                    {[
                      { label: t("whyChooseUsPanel.metric1"), val: 98 },
                      { label: t("whyChooseUsPanel.metric2"), val: 100 },
                      { label: t("whyChooseUsPanel.metric3"), val: 99 }
                    ].map((item, idx) => (
                      <div key={idx} className="relative z-10">
                        <div className="flex justify-between font-black text-[10px] uppercase tracking-[0.5em] text-white/40 mb-4">
                          <span>{item.label}</span>
                          <span className="text-[#e6c800]">{item.val}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.val}%` }}
                            transition={{ duration: 2, ease: "easeOut", delay: 0.5 + (idx * 0.2) }}
                            className="h-full bg-gradient-to-r from-[#e6c800] to-white/50"
                          />
                        </div>
                      </div>
                    ))}

                    <div className="mt-10 pt-10 border-t border-white/10 flex items-center gap-6">
                      <div className="w-16 h-16 rounded-full bg-[#e6c800] flex items-center justify-center text-[#343131] shadow-[0_0_32px_rgba(230,200,0,0.2)]">
                        <Zap size={32} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/55 block mb-2">{t("whyChooseUsPanel.architectureEyebrow")}</span>
                        <span className="text-xl md:text-2xl font-black uppercase text-white tracking-tight">{t("whyChooseUsPanel.architectureTitle")}</span>
                      </div>
                    </div>
                  </motion.div>
                </BlockReveal>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-[#343131]/[0.02] blur-[60px] rounded-full -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Transition: white → off-white (Why Choose Us → Capabilities) */}
        <div className="h-8 bg-gradient-to-b from-white to-[#fafafc]" aria-hidden />

        {/* ── SECTION 06: CAPABILITIES (TECH STACK) ────────────────────────── */}
        <section className="home-snap-section py-20 md:py-24 bg-[#fafafc] border-y border-[#343131]/[0.04] overflow-hidden">
          <div className="container mx-auto px-6 mb-16 text-center">
            <BlockReveal>
              <TextReveal delay={0.05}>
                <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#343131]/45 mb-5 block">{t("capabilities.tag")}</span>
              </TextReveal>
              <TextReveal delay={0.12}>
                <h2 className="text-4xl md:text-5xl font-display font-black leading-[0.96] tracking-tighter text-[#343131] uppercase mb-6 max-w-2xl mx-auto">
                  {t("capabilities.title1")}<br />{t("capabilities.title2")}
                </h2>
              </TextReveal>
              <TextReveal delay={0.2}>
                <p className="text-[#343131]/52 text-[17px] font-medium max-w-lg mx-auto">
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

        {/* Transition: off-white → white (Capabilities → Instagram) */}
        <div className="h-8 bg-gradient-to-b from-[#fafafc] to-white" aria-hidden />

        {/* ── SECTION 07: INSTAGRAM FEED ────────────────────────── */}
        <InstagramFeedSection />

        {/* Transition: dark → warm neutral (Instagram → Blog) */}
        <div className="h-12 bg-gradient-to-b from-[#343131] via-[#1a1c22] to-[#f3f0ea]" aria-hidden />

        {/* ── SECTION 09: BLOG ────────────────────────── */}
        <div className="home-snap-section">
          <HomepageBlogSection />
        </div>

        {/* Transition: cream → off-white (Blog → Contact) */}
        <div className="h-8 bg-gradient-to-b from-[#f3f0ea] to-[#fafafc]" aria-hidden />

        {/* ── SECTION 09.5: CONTACT INQUIRY ────────────────────────── */}
        <section className="home-snap-section py-20 md:py-24 bg-[#fafafc] border-y border-[#343131]/[0.06]">
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
            background: "linear-gradient(to bottom, #fafafc 0%, #f0f0f2 20%, #d8d8dc 45%, #909098 70%, #2a2c30 88%, #343131 100%)",
          }}
          aria-hidden
        />

        {/* ── SECTION 10: CINEMATIC CTA ────────────────────────── */}
        <section className="home-snap-section relative py-28 md:py-36 lg:py-40 bg-[#343131] overflow-hidden">
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
                <Link href="/contact" className="home-btn-primary-yellow group relative px-9 py-3.5 font-black uppercase tracking-[0.22em] text-[11px] rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_16px_48px_rgba(230,200,0,0.2)]">
                  <span className="relative z-10">{t("ctaSection.cta") || t("ctaSection.button")}</span>
                  <div className="absolute inset-0 border border-white/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>

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
