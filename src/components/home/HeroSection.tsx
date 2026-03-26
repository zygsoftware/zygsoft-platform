"use client";

import { Link } from "@/i18n/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const DarkVeil = dynamic(() => import("@/components/effects/DarkVeil"), { ssr: false });
const HeroOrbitNetwork = dynamic(
  () => import("@/components/home/HeroOrbitNetwork").then((mod) => mod.HeroOrbitNetwork),
  { ssr: false },
);

export function HeroSection() {
  const t = useTranslations("Homepage.hero");
  const [showEnhancedVisuals, setShowEnhancedVisuals] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateVisualMode = () => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const prefersTouch = window.matchMedia("(pointer: coarse)").matches;

      setShowEnhancedVisuals(isDesktop && !prefersReducedMotion && !prefersTouch);
    };

    const frameId = window.requestAnimationFrame(updateVisualMode);
    window.addEventListener("resize", updateVisualMode);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateVisualMode);
    };
  }, []);

  return (
    <section
      className="relative flex min-h-[100vh] flex-col overflow-hidden bg-[#ffffff]"
      aria-label="Hero"
    >
      {/* DarkVeil: tam ekran, çok düşük opaklık — gri yok, hafif sarı doku */}
      {showEnhancedVisuals ? (
        <div
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            mixBlendMode: "multiply",
            opacity: 0.32,
            filter: "invert(1) sepia(1) saturate(3) brightness(2.5)",
          }}
        >
          <DarkVeil
            hueShift={198}
            noiseIntensity={0}
            scanlineIntensity={0}
            speed={1.1}
            scanlineFrequency={0.5}
            warpAmount={2.35}
          />
        </div>
      ) : null}

      {/* Main content */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center px-6 pb-16 pt-20 lg:min-h-[100vh] lg:px-12 lg:pb-24 lg:pt-28 xl:px-16 2xl:px-24">
        <div className="max-w-[40rem]">
          <p className="mb-8 text-[10px] font-bold uppercase tracking-[0.28em] text-[#343131]/62 lg:mb-10">
            {t("eyebrow")}
          </p>

          <h1 className="mb-8 max-w-[12.5ch] font-display text-[clamp(2rem,3.9vw,4.1rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-[#343131] lg:mb-10 lg:max-w-[13ch] lg:text-[clamp(2.5rem,4vw,4.6rem)]">
            <span className="block font-semibold tracking-[-0.05em]">{t("title1")}</span>
            <span className="mt-1 block font-semibold tracking-[-0.05em]">{t("title2")}</span>
            <span className="mt-1.5 block font-medium tracking-[-0.04em] text-[#e6c800]">
              {t("title3")}
            </span>
          </h1>

          <p className="mb-12 max-w-lg text-[15px] font-medium leading-[1.72] text-[#343131]/64 lg:mb-14 lg:text-[16px]">
            {t("subtext")}
          </p>

          <div className="flex flex-col items-start gap-5 sm:flex-row sm:gap-6">
            <Link
              href="/dijital-urunler/hukuk-araclari-paketi"
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-[#e6c800] px-9 py-4.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#343131] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.02] hover:bg-[#d4b800] active:scale-[0.98]"
            >
              {t("ctaPrimary")}
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/portfolio"
              className="group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl border-2 border-[#343131] px-9 py-4.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#343131] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-white active:scale-[0.98]"
            >
              <span className="absolute inset-0 -translate-x-full bg-[#343131] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0" />
              <span className="relative z-10 flex items-center gap-2.5">
                {t("ctaSecondary")}
                <ArrowRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Sağ: orbital solar sistem */}
      {showEnhancedVisuals ? (
        <div className="absolute inset-y-0 right-0 z-20 hidden w-[58%] lg:block">
          <HeroOrbitNetwork />
        </div>
      ) : null}

      {/* Scroll indicator */}
      <div
        className="group absolute bottom-6 left-6 z-10 flex cursor-default flex-col items-start gap-1.5 lg:bottom-8 lg:left-12 xl:left-16 2xl:left-24"
        aria-hidden
      >
        <span className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#343131]/52 transition-colors duration-300 group-hover:text-[#343131]/72">
          {t("scroll")}
        </span>
        <ChevronDown
          size={16}
          className="animate-hero-scroll text-[#343131]/44"
          aria-hidden
        />
      </div>
    </section>
  );
}
