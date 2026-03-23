"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Code2, Globe, Share2, Workflow, BarChart3, Megaphone, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { createRevealUp, revealViewport, staggerContainer } from "@/components/ui/motion";
import { GoogleAdsLogo, MetaLogo } from "./PlatformLogos";

const SERVICES = [
  {
    id: "custom-software",
    icon: Code2,
    href: "/services/web-ve-uygulama-gelistirme",
    size: "large" as const,
    logo: null,
  },
  {
    id: "web-dev",
    icon: Globe,
    href: "/services/web-ve-uygulama-gelistirme",
    size: "small" as const,
    logo: null,
  },
  {
    id: "social-media",
    icon: Share2,
    href: "/services/sosyal-medya-yonetimi",
    size: "small" as const,
    logo: null,
  },
  {
    id: "automation",
    icon: Workflow,
    href: "/services/web-ve-uygulama-gelistirme",
    size: "large" as const,
    logo: null,
  },
  {
    id: "google-ads",
    icon: BarChart3,
    href: "/services/dijital-strateji-ve-pazarlama",
    size: "small" as const,
    logo: "google",
  },
  {
    id: "meta-ads",
    icon: Megaphone,
    href: "/services/dijital-strateji-ve-pazarlama",
    size: "small" as const,
    logo: "meta",
  },
];

export function SolutionsSection() {
  const t = useTranslations("Homepage.solutions");
  const reducedMotion = !!useReducedMotion();

  return (
    <section className="py-28 md:py-36 bg-white relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, rgba(230,200,0,0.04) 0%, transparent 50%)",
        }}
      />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="max-w-3xl mb-20"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
        >
          <motion.span
            variants={createRevealUp(reducedMotion, 16, 4)}
            className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#343131]/45 mb-6 block"
          >
            {t("tag")}
          </motion.span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-[0.94] tracking-tighter text-[#343131] mb-6">
            {t("titleExpertise")}
          </h2>
          <p className="text-[17px] text-[#343131]/58 font-medium leading-[1.7] max-w-xl">
            {t("description")}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
        >
          {SERVICES.map((service) => {
            const Icon = service.icon;
            const label = t(`items.${service.id}`);
            const desc = t(`items.${service.id}Desc`);
            const isLarge = service.size === "large";

            return (
              <motion.div
                key={service.id}
                variants={createRevealUp(reducedMotion, 32, 8)}
                className={isLarge ? "md:col-span-2" : ""}
              >
                <Link href={service.href} className="block h-full group">
                  <motion.div
                    className="relative overflow-hidden rounded-2xl border border-[#343131]/[0.06] bg-gradient-to-br from-white to-[#fafafc] h-full flex flex-col transition-all duration-300 hover:shadow-[0_24px_56px_rgba(0,0,0,0.1)] hover:border-[#e6c800]/30 hover:-translate-y-1"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#e6c800]/[0.03] to-transparent" />
                    <div className={`p-6 lg:p-8 flex flex-col relative z-10 ${isLarge ? "min-h-[220px] justify-between" : "min-h-[180px]"}`}>
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-[#343131]/[0.04] flex items-center justify-center text-[#343131] group-hover:bg-[#e6c800]/20 group-hover:text-[#343131] transition-colors duration-300 border border-[#343131]/[0.04]">
                            {service.logo === "google" ? (
                              <GoogleAdsLogo className="w-7 h-7" />
                            ) : service.logo === "meta" ? (
                              <MetaLogo className="w-7 h-7" />
                            ) : (
                              <Icon size={26} />
                            )}
                          </div>
                          {service.logo && (
                            <span className="text-[10px] font-bold text-[#343131]/50 uppercase">
                              {service.logo === "google" ? "Google" : "Meta"}
                            </span>
                          )}
                        </div>
                        <ArrowUpRight size={18} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 text-[#343131]" />
                      </div>
                      <h3 className="font-display font-black text-xl lg:text-2xl tracking-tight mb-2 text-[#343131]">
                        {label}
                      </h3>
                      <p className="text-[15px] font-medium leading-relaxed text-[#343131]/55">
                        {desc}
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e6c800] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          className="mt-12 flex justify-center"
          variants={createRevealUp(reducedMotion, 24, 6)}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
        >
          <Link
            href="/services"
            className="group inline-flex items-center gap-3 font-black text-sm uppercase tracking-[0.2em] text-[#343131] hover:text-[#e6c800] transition-colors"
          >
            {t("viewAll")}
            <div className="w-12 h-px bg-[#343131] group-hover:bg-[#e6c800] group-hover:w-16 transition-all duration-300" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
