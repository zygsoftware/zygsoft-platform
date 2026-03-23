"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Clock, CheckCircle2, MessageSquare, ArrowRight, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { ContactInquiryForm } from "@/components/forms/ContactInquiryForm";
import { createRevealUp, revealViewport, staggerContainer } from "@/components/ui/motion";
import Link from "next/link";

type ContactSectionProps = {
  title: string;
  subtitle: string;
};

export function ContactSection({ title, subtitle }: ContactSectionProps) {
  const t = useTranslations("Homepage.contactPanel");
  const reducedMotion = !!useReducedMotion();

  return (
    <section className="py-24 md:py-28 bg-[#fafafc] border-y border-[#343131]/[0.06]">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          {/* Left — form */}
          <div className="lg:col-span-7">
            <ContactInquiryForm title={title} subtitle={subtitle} />
          </div>

          {/* Right — visual block with dashboard preview */}
          <motion.div
            className="lg:col-span-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={revealViewport}
          >
            <motion.div
              variants={createRevealUp(reducedMotion, 32, 8)}
              className="h-full min-h-[420px] rounded-2xl overflow-hidden relative"
            >
              {/* Abstract system illustration / dashboard graphic */}
              <div className="absolute inset-0 bg-[#343131] rounded-2xl">
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: [
                      "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
                      "linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                    ].join(", "),
                    backgroundSize: "24px 24px",
                  }}
                />
                <motion.div
                  className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20"
                  animate={
                    reducedMotion
                      ? { scale: 1, opacity: 0.2 }
                      : {
                          scale: [1, 1.15, 1],
                          opacity: [0.15, 0.25, 0.15],
                        }
                  }
                  transition={{ duration: 8, repeat: reducedMotion ? 0 : Infinity, ease: "easeInOut" }}
                  style={{ background: "radial-gradient(circle, rgba(230,200,0,0.3) 0%, transparent 70%)" }}
                />
                <div className="relative z-10 p-6 md:p-8 lg:p-10 flex flex-col justify-between h-full">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-[#e6c800]/10 border border-[#e6c800]/20 flex items-center justify-center mb-8">
                      <MessageSquare size={28} className="text-[#e6c800]" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-display font-black text-white mb-4 tracking-tight">
                      {t("title")}
                    </h3>
                    <p className="text-white/65 text-[15px] font-medium leading-relaxed mb-8">
                      {t("description")}
                    </p>
                    {/* Mini dashboard preview */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                      {[
                        { icon: Clock, label: "24h", sub: "Yanıt" },
                        { icon: CheckCircle2, label: "Ücretsiz", sub: "Danışmanlık" },
                      ].map(({ icon: Icon, label, sub }) => (
                        <div
                          key={label}
                          className="p-4 rounded-xl bg-white/[0.05] border border-white/10 flex items-center gap-3"
                        >
                          <Icon size={20} className="text-[#e6c800] shrink-0" />
                          <div>
                            <p className="text-white font-bold text-sm">{label}</p>
                            <p className="text-white/50 text-[11px]">{sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Animated flow indicator */}
                    <motion.div
                      className="flex items-center gap-2 text-white/40 text-[12px] font-medium"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={revealViewport}
                      transition={{ delay: 0.3 }}
                    >
                      <Zap size={14} className="text-[#e6c800]/70" />
                      <span>{t("flow")}</span>
                    </motion.div>
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <Link
                      href="/contact"
                      className="group inline-flex items-center gap-2 text-[13px] font-bold text-[#e6c800] hover:text-white transition-colors"
                    >
                      {t("cta")}
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
