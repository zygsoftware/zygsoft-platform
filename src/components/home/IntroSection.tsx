"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { SectionReveal, SectionHeading, SectionContent } from "@/components/ui/SectionReveal";
import { createRevealUp, revealViewport, staggerContainer } from "@/components/ui/motion";

const STATS = [
  { key: "stat1", labelKey: "stat1Label" },
  { key: "stat2", labelKey: "stat2Label" },
  { key: "stat3", labelKey: "stat3Label" },
];

export function IntroSection() {
  const t = useTranslations("Homepage.intro");
  const reducedMotion = !!useReducedMotion();

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(230,200,0,0.04) 0%, transparent 50%)",
        }}
      />
      <div className="container mx-auto px-6 relative z-10">
        <SectionReveal className="max-w-4xl mb-16">
          <SectionHeading>
            <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#343131]/45 mb-5 block">
              {t("tag")}
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-black leading-[0.94] tracking-tighter text-[#343131] mb-6">
              {t("title")}
            </h2>
          </SectionHeading>
          <SectionContent>
            <p className="text-[17px] text-[#343131]/58 font-medium leading-[1.7] max-w-2xl">
              {t("description")}
            </p>
          </SectionContent>
        </SectionReveal>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
        >
          {STATS.map(({ key, labelKey }) => (
            <motion.div
              key={key}
              variants={createRevealUp(reducedMotion, 28, 6)}
              className="text-center md:text-left"
            >
              <p className="text-4xl md:text-5xl font-black text-[#e6c800] mb-2">{t(key)}</p>
              <p className="text-[14px] font-bold text-[#343131]/60 uppercase tracking-[0.2em]">
                {t(labelKey)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
