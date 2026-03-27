"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, CheckCircle2, Cpu, BarChart3, Rocket, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { SolutionsSection } from "@/components/home/SolutionsSection";
import { ContactSection } from "@/components/home/ContactSection";
import { createRevealUp, revealViewport, staggerContainer } from "@/components/ui/motion";
import { BlockReveal } from "@/components/ui/reveal";

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

const partnerIcons = [BarChart3, Sparkles, Cpu, Rocket];

export default function Home() {
  const t = useTranslations("Homepage");
  const reducedMotion = !!useReducedMotion();

  return (
    <div className="relative min-h-screen bg-white text-[#343131] selection:bg-[#e6c800] selection:text-[#343131] overflow-x-hidden">
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
        <section className="home-snap-section bg-[#fbfaf6] py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_0.85fr] lg:items-end">
              <BlockReveal>
                <div className="max-w-3xl">
                  <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#343131]/10 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[#343131]/58 [font-family:var(--font-button)]">
                    <ShieldCheck size={13} className="text-[#e6c800]" />
                    {t("partnerSection.tag")}
                  </span>
                  <h2
                    className="text-3xl md:text-5xl font-display font-black leading-[1] tracking-tight text-[#1a1715]"
                    dangerouslySetInnerHTML={{ __html: t.raw("partnerSection.title") }}
                  />
                </div>
              </BlockReveal>

              <BlockReveal delay={0.08}>
                <p className="max-w-xl text-[15px] md:text-base font-medium leading-7 text-[#343131]/62">
                  {t("partnerSection.description")}
                </p>
              </BlockReveal>
            </div>

            <motion.div
              className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
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
                    variants={createRevealUp(reducedMotion, 16, 4)}
                    className="rounded-[22px] border border-[#343131]/10 bg-white p-5"
                  >
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#faf4d4] text-[#1a1715]">
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
        </section>

        {/* Transition: off-white → white */}
        <div className="h-12 bg-gradient-to-b from-[#fafafc] to-white" aria-hidden />

        <div className="home-snap-section">
          <SolutionsSection />
        </div>

        {/* Transition: warm light → dark */}
        <div
          className="h-24 md:h-32 lg:h-40"
          style={{
            background:
              "linear-gradient(to bottom, #f7f2e8 0%, #f2ede3 16%, #e8e1d3 34%, #d5cdc0 52%, #a8a097 72%, #6c6660 88%, #343131 100%)",
          }}
          aria-hidden
        />

        {/* ── SECTION 04B: DIGITAL PRODUCTS & UDF FLAGSHIP ────────────────────────── */}
        <div className="home-snap-section">
          <AppStoreShowcase />
        </div>

        {/* ── SECTION 07: INSTAGRAM FEED ────────────────────────── */}
        <InstagramFeedSection />

        {/* Transition: dark → warm editorial */}
        <div className="h-8 bg-gradient-to-b from-[#1d1a19] via-[#645f58] to-[#f3f0ea]" aria-hidden />

        {/* ── SECTION 09: BLOG ────────────────────────── */}
        <div className="home-snap-section">
          <HomepageBlogSection />
        </div>

        {/* Transition: cream → contact surface */}
        <div className="h-6 bg-gradient-to-b from-[#f3f0ea] to-[#fafafc]" aria-hidden />

        {/* ── SECTION 09.5: CONTACT INQUIRY ────────────────────────── */}
        <div className="home-snap-section">
          <ContactSection
            title={t("contactStrip.title")}
            subtitle={t("contactStrip.subtitle")}
          />
        </div>

        {/* Transition: contact → closing CTA */}
        <div
          className="h-10 md:h-12"
          style={{
            background: "linear-gradient(to bottom, #fafafc 0%, #f2eee8 55%, #ede3c1 100%)",
          }}
          aria-hidden
        />

        {/* ── SECTION 10: FINAL CTA ────────────────────────── */}
        <section className="home-snap-section py-20 md:py-24 bg-[#f3f0ea]">
          <div className="container mx-auto px-6">
            <BlockReveal>
              <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#343131]/10 bg-white px-8 py-10 text-center shadow-[0_18px_40px_rgba(0,0,0,0.04)] md:px-12 md:py-14">
                <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#343131]/10 bg-[#faf7ef] px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#343131]/60 [font-family:var(--font-button)]">
                  <ShieldCheck size={13} className="text-[#e6c800]" />
                  {t("ctaSection.tag")}
                </span>
                <h2
                  className="text-3xl md:text-5xl font-display font-black leading-[1] tracking-tight text-[#1a1715] mb-5"
                  dangerouslySetInnerHTML={{ __html: t.raw("ctaSection.title") }}
                />
                <p className="mx-auto max-w-2xl text-[15px] md:text-lg font-medium leading-8 text-[#343131]/62 mb-8">
                  {t("ctaSection.description")}
                </p>

                <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
                  {(["acceleration", "resilience", "precision"] as const).map((key) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-2 rounded-full border border-[#343131]/10 bg-[#fafafc] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#343131]/72 [font-family:var(--font-button)]"
                    >
                      <CheckCircle2 size={13} className="text-[#e6c800]" />
                      {t(`ctaSection.features.${key}.title`)}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link href="/contact" className="home-btn-primary-yellow px-9 py-3.5 font-black uppercase tracking-[0.22em] text-[11px] rounded-xl !text-[#343131] [font-family:var(--font-button)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_16px_48px_rgba(230,200,0,0.2)]">
                    {t("ctaSection.cta") || t("ctaSection.button")}
                  </Link>
                  <Link href="/portfolio" className="inline-flex items-center gap-3 rounded-xl border border-[#343131]/12 bg-[#fafafc] px-6 py-3 text-[11px] font-black uppercase tracking-[0.22em] !text-[#343131] [font-family:var(--font-button)] transition-colors hover:border-[#e6c800]/40 hover:bg-[#fff8da]">
                    <span>{t("ctaSection.ctaSecondary") || "Explore Portfolio"}</span>
                    <div className="w-7 h-px bg-[#343131]/40" />
                  </Link>
                </div>
              </div>
            </BlockReveal>
          </div>
        </section>

      </main >

      <Footer />
    </div >
  );
}
