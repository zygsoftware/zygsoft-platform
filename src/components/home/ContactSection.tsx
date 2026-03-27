"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Clock, CheckCircle2, MessageSquare, ArrowRight, Zap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ContactInquiryForm } from "@/components/forms/ContactInquiryForm";
import { createRevealUp, revealViewport, staggerContainer } from "@/components/ui/motion";
import Link from "next/link";

type ContactSectionProps = {
  title: string;
  subtitle: string;
};

export function ContactSection({ title, subtitle }: ContactSectionProps) {
  const locale = useLocale();
  const t = useTranslations("Homepage.contactPanel");
  const reducedMotion = !!useReducedMotion();
  const isTr = locale === "tr";

  const quickStats = [
    { icon: Clock, label: "24h", sub: isTr ? "Yanıt" : "Response" },
    { icon: CheckCircle2, label: isTr ? "Ücretsiz" : "Free", sub: isTr ? "Danışmanlık" : "Consultation" },
  ];

  const stages = [
    {
      index: "01",
      title: isTr ? "İhtiyacı Netleştir" : "Clarify the need",
      desc: isTr ? "Hedefi, kapsamı ve doğru hizmet modelini birlikte çıkaralım." : "Define the goal, scope, and right service model together.",
    },
    {
      index: "02",
      title: isTr ? "Hızlı Geri Dönüş" : "Fast response",
      desc: isTr ? "Net teklif, yol haritası ve ilk aksiyon planını kısa sürede iletelim." : "We return quickly with a clear proposal, roadmap, and first action plan.",
    },
    {
      index: "03",
      title: isTr ? "Uygulamaya Geç" : "Move to execution",
      desc: isTr ? "Onay sonrası tasarım, geliştirme ve yayın akışını disiplinli şekilde başlatalım." : "After approval, we launch the design, development, and delivery flow in a disciplined way.",
    },
  ];

  return (
    <section className="py-20 md:py-24 bg-[#fafafc] border-y border-[#343131]/[0.06]">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-7">
            <ContactInquiryForm title={title} subtitle={subtitle} />
          </div>

          <motion.div
            className="lg:col-span-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={revealViewport}
          >
            <motion.div
              variants={createRevealUp(reducedMotion, 32, 8)}
              className="h-full min-h-[420px] rounded-[2rem] border border-[#343131]/10 bg-[#f7f4ee] p-6 md:p-8"
            >
              <div className="flex h-full flex-col">
                <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#343131]/10 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#343131]/60 [font-family:var(--font-button)]">
                  <Zap size={12} className="text-[#e6c800]" />
                  {t("eyebrow")}
                </span>

                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e6c800]/25 bg-[#fff8da] shadow-[0_10px_24px_rgba(230,200,0,0.12)]">
                  <MessageSquare size={26} className="!text-[#b99700]" strokeWidth={2.25} />
                </div>

                <h3 className="text-2xl md:text-[2rem] font-display font-black text-[#1a1715] mb-4 tracking-tight">
                  {t("title")}
                </h3>
                <p className="text-[#343131]/62 text-[15px] font-medium leading-relaxed mb-8">
                  {t("description")}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {quickStats.map(({ icon: Icon, label, sub }) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-[#343131]/10 bg-white px-4 py-4 flex items-center gap-3"
                    >
                      <Icon size={18} className="text-[#c9ad00] shrink-0" />
                      <div>
                        <p className="text-[#1a1715] font-black text-sm [font-family:var(--font-button)]">{label}</p>
                        <p className="text-[#343131]/50 text-[11px]">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  {stages.map((stage) => (
                    <div
                      key={stage.index}
                      className="rounded-2xl border border-[#343131]/10 bg-white px-4 py-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#343131] !text-white text-sm font-black shadow-[0_10px_22px_rgba(52,49,49,0.18)] ring-1 ring-[#343131]/8">
                          {stage.index}
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1a1715] [font-family:var(--font-button)]">
                            {stage.title}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[#343131]/62">
                            {stage.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-8">
                  <Link
                    href="/contact"
                    className="group inline-flex items-center gap-2 text-[13px] font-bold text-[#343131] [font-family:var(--font-button)] hover:text-[#c9ad00] transition-colors"
                  >
                    {t("cta")}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
