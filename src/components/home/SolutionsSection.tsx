"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { createRevealUp, revealViewport, staggerContainer } from "@/components/ui/motion";
import { servicesData } from "@/lib/servicesData";
import { servicePageMeta, type ServicePlatformKey } from "@/lib/servicePageMeta";
import { ArrowRight, ArrowUpRight, BarChart3, Globe, Megaphone, Palette, Target } from "lucide-react";
import {
  FacebookLogo,
  GoogleAdsLogo,
  InstagramLogo,
  MetaLogo,
  WhatsAppLogo,
} from "./PlatformLogos";

const SERVICE_ORDER = [
  "web-ve-uygulama-gelistirme",
  "sosyal-medya-yonetimi",
  "marka-kimligi-ve-grafik-tasarim",
  "dijital-strateji-ve-pazarlama",
  "google-ads-ve-meta-pixel-reklam-yonetimi",
] as const;

const serviceIcons: Record<(typeof SERVICE_ORDER)[number], React.ReactNode> = {
  "web-ve-uygulama-gelistirme": <Globe size={26} />,
  "sosyal-medya-yonetimi": <Megaphone size={26} />,
  "marka-kimligi-ve-grafik-tasarim": <Palette size={26} />,
  "dijital-strateji-ve-pazarlama": <BarChart3 size={26} />,
  "google-ads-ve-meta-pixel-reklam-yonetimi": <Target size={26} />,
};

const platformIcons: Record<ServicePlatformKey, React.ReactNode> = {
  instagram: <InstagramLogo className="w-4 h-4" />,
  facebook: <FacebookLogo className="w-4 h-4" />,
  meta: <MetaLogo className="w-4 h-4" />,
  "google-ads": <GoogleAdsLogo className="w-4 h-4" />,
  whatsapp: <WhatsAppLogo className="w-4 h-4" />,
};

export function SolutionsSection() {
  const locale = useLocale();
  const lang = locale === "en" ? "en" : "tr";
  const t = useTranslations("Homepage.servicesSection");
  const reducedMotion = !!useReducedMotion();

  const featuredServices = SERVICE_ORDER.map((slug) => {
    const service = servicesData[slug][lang];
    const meta = servicePageMeta[slug][lang];

    return {
      slug,
      title: service.title,
      subtitle: service.subtitle,
      highlight: meta.heroLabel,
      chips: meta.platforms.slice(0, 3),
    };
  });

  return (
    <section className="py-28 md:py-36 bg-[#f7f2e8] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(52,49,49,0.07) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />
      <div className="absolute -top-10 right-0 w-[32rem] h-[32rem] bg-[radial-gradient(circle,rgba(230,200,0,0.16)_0%,transparent_68%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[24rem] h-[24rem] bg-[radial-gradient(circle,rgba(52,49,49,0.08)_0%,transparent_68%)] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-end mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
        >
          <div className="xl:col-span-8">
            <motion.span
              variants={createRevealUp(reducedMotion, 16, 4)}
              className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#343131]/60 mb-6 [font-family:var(--font-button)]"
            >
              {t("tag")}
            </motion.span>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-[0.94] tracking-tighter text-[#343131] mb-6 max-w-4xl"
              dangerouslySetInnerHTML={{ __html: t.raw("title") }}
            />
            <p className="text-[17px] text-[#343131]/58 font-medium leading-[1.75] max-w-2xl">
              {t("description")}
            </p>
          </div>

          <motion.div
            variants={createRevealUp(reducedMotion, 24, 6)}
            className="xl:col-span-4 xl:justify-self-end"
          >
            <div className="rounded-[2rem] border border-black/8 bg-white/85 backdrop-blur p-6 shadow-[0_18px_40px_rgba(0,0,0,0.05)]">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#343131]/40 mb-2 [font-family:var(--font-button)]">
                {lang === "en" ? "What you see here" : "Bu alanda ne var?"}
              </div>
              <p className="text-[#343131] font-medium leading-relaxed">
                {lang === "en"
                  ? "Each service card now surfaces the real platform logic behind the work: strategy, channels, and operating structure."
                  : "Her hizmet kartı artık işin arkasındaki gerçek platform mantığını, stratejik yönünü ve operasyon yapısını daha net gösteriyor."}
              </p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
        >
          {featuredServices.map((service, index) => (
            <motion.div
              key={service.slug}
              variants={createRevealUp(reducedMotion, 32, 8)}
              className={index === 0 ? "xl:col-span-2" : ""}
            >
              <Link href={`/services/${service.slug}`} className="block h-full group">
                <motion.div
                  className="relative h-full overflow-hidden rounded-[2rem] border border-black/8 bg-white/88 backdrop-blur shadow-[0_16px_36px_rgba(0,0,0,0.04)] hover:shadow-[0_28px_60px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
                  whileHover={{ scale: 1.008 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top_right,rgba(230,200,0,0.12)_0%,transparent_58%)]" />
                  <div className="relative z-10 p-7 md:p-8 flex flex-col h-full min-h-[280px]">
                    <div className="flex items-start justify-between gap-5 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#f7f2e8] border border-black/6 flex items-center justify-center text-[#343131] group-hover:bg-[#e6c800]/20 transition-colors">
                          {serviceIcons[service.slug]}
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#343131]/40 mb-1 [font-family:var(--font-button)]">
                            {service.highlight}
                          </div>
                          <div className="text-sm font-bold text-[#343131]/60">
                            {index === 0
                              ? (lang === "en" ? "Featured service" : "Öne çıkan hizmet")
                              : (lang === "en" ? "Professional service" : "Profesyonel hizmet")}
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight size={18} className="text-[#343131]/35 group-hover:text-[#343131] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                    </div>

                    <h3 className="font-display font-black text-2xl md:text-3xl tracking-tight text-[#343131] mb-3">
                      {service.title}
                    </h3>
                    <p className="text-[15px] font-medium leading-relaxed text-[#343131]/58 mb-7 flex-1">
                      {service.subtitle}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-7">
                      {service.chips.map((chip) => (
                        <span
                          key={`${service.slug}-${chip.label}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#343131]/10 bg-[#fcfaf5] px-3 py-1.5 text-[11px] font-bold text-[#343131]/72 [font-family:var(--font-button)]"
                        >
                          {chip.key ? platformIcons[chip.key] : <span className="w-1.5 h-1.5 rounded-full bg-[#e6c800]" />}
                          {chip.label}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center text-sm font-black uppercase tracking-[0.18em] text-[#343131] [font-family:var(--font-button)] group-hover:text-[#c9ad00] transition-colors">
                      {lang === "en" ? "Explore details" : "Detaylı incele"}
                      <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-14 flex justify-center"
          variants={createRevealUp(reducedMotion, 24, 6)}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
        >
          <Link
            href="/services"
            className="group inline-flex items-center gap-3 font-black text-sm uppercase tracking-[0.2em] text-[#343131] [font-family:var(--font-button)] hover:text-[#e6c800] transition-colors"
          >
            {t("viewAll")}
            <div className="w-12 h-px bg-[#343131] group-hover:bg-[#e6c800] group-hover:w-16 transition-all duration-300" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
