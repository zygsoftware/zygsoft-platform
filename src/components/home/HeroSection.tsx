"use client";

import { Link } from "@/i18n/navigation";
import DarkVeil from "@/components/effects/DarkVeil";
import { HeroOrbitNetwork } from "@/components/home/HeroOrbitNetwork";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const NOISE_SVG =
  "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function HeroSection() {
  const t = useTranslations("Homepage.hero");

  return (
    <section
      className="relative flex min-h-[100vh] flex-col overflow-hidden bg-[#ffffff]"
      aria-label="Hero"
    >
      {/* DarkVeil: tam ekran, çok düşük opaklık — gri yok, hafif sarı doku */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          mixBlendMode: "multiply",
          opacity: 0.55,
          filter: "invert(1) sepia(1) saturate(3) brightness(2.5)",
        }}
      >
        <DarkVeil
          hueShift={198}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={1.3}
          scanlineFrequency={0.5}
          warpAmount={3.1}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center px-6 pb-16 pt-20 lg:min-h-[100vh] lg:px-12 lg:pb-24 lg:pt-28 xl:px-16 2xl:px-24">
        <div className="max-w-2xl">
          <p className="mb-8 text-[10px] font-bold uppercase tracking-[0.28em] text-[#343131]/50 lg:mb-10">
            {t("eyebrow")}
          </p>

          <h1 className="mb-10 font-display text-[clamp(2.25rem,5vw,4.25rem)] font-black leading-[0.92] tracking-[-0.02em] text-[#343131] lg:mb-12 lg:text-[clamp(2.75rem,4.2vw,5rem)] lg:tracking-[-0.03em]">
            <span className="block font-black tracking-tight">{t("title1")}</span>
            <span className="mt-0.5 block font-black tracking-tight">{t("title2")}</span>
            <span className="mt-1 block font-extrabold tracking-[0.01em] text-[#e6c800]">
              {t("title3")}
            </span>
          </h1>

          <p className="mb-12 max-w-md text-[15px] font-medium leading-[1.72] text-[#343131]/55 lg:mb-14 lg:text-[16px]">
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
      <div className="absolute inset-y-0 right-0 z-20 hidden w-[58%] lg:block">
        <HeroOrbitNetwork />
      </div>

      {/* Scroll indicator */}
      <div
        className="group absolute bottom-6 left-6 z-10 flex cursor-default flex-col items-start gap-1.5 lg:bottom-8 lg:left-12 xl:left-16 2xl:left-24"
        aria-hidden
      >
        <span className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#343131]/35 transition-colors duration-300 group-hover:text-[#343131]/50">
          {t("scroll")}
        </span>
        <ChevronDown
          size={16}
          className="animate-hero-scroll text-[#343131]/25"
          aria-hidden
        />
      </div>
    </section>
  );
}