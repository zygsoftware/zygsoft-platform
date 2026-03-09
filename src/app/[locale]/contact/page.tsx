"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Mail, MapPin, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";
import { useInView } from "framer-motion";
import { ContactInquiryForm } from "@/components/forms/ContactInquiryForm";
import { useLocale, useTranslations } from "next-intl";

function AnimIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    return (
        <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay }} className={className}>
            {children}
        </motion.div>
    );
}

export default function Contact() {
    const locale = useLocale();
    const t = useTranslations("Contact");
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const faqs = [
        { q: t("faqQ1"), a: t("faqA1") },
        { q: t("faqQ2"), a: t("faqA2") },
        { q: t("faqQ3"), a: t("faqA3") },
    ];

    return (
        <>
            <Header />
            <main style={{ background: "#f9f7f3" }}>

                {/* ── Hero ── */}
                <section className="pt-40 pb-24 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #f9f7f3 60%, #f0ece0 100%)" }}>
                    <div className="absolute inset-0 pointer-events-none" style={{
                        backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }} />
                    <motion.div className="absolute right-20 top-20 w-72 h-72 rounded-full pointer-events-none"
                        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        style={{ background: "radial-gradient(circle, rgba(230,200,0,0.1) 0%, transparent 70%)" }} />
                    <div className="container mx-auto px-6 max-w-7xl">
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                            <span className="section-label">{locale === "tr" ? "Iletisim" : "Contact"}</span>
                            <h1 className="font-display font-extrabold text-[#0e0e0e] mt-4 mb-6"
                                style={{ fontSize: "clamp(38px,5vw,64px)", lineHeight: 1.02 }}>
                                {t("title")}
                            </h1>
                            <p className="text-[#666] text-xl max-w-xl leading-relaxed">
                                {t("subtitle")}
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* ── Main grid ── */}
                <section className="py-24 bg-white border-y border-black/8">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                            {/* Form */}
                            <AnimIn>
                                <ContactInquiryForm
                                    title={t("formTitle")}
                                    subtitle={t("infoDesc")}
                                />
                            </AnimIn>

                            {/* Info */}
                            <AnimIn delay={0.15}>
                                <h2 className="font-display font-bold text-[#0e0e0e] text-2xl mb-8">{t("infoTitle")}</h2>
                                <div className="space-y-5 mb-10">
                                    {[
                                        { icon: <Mail size={18} />, label: t("emailTitle"), value: "info@zygsoft.com", href: "mailto:info@zygsoft.com" },
                                        { icon: <MapPin size={18} />, label: t("officeTitle"), value: t("officeDesc"), href: null },
                                    ].map((item, i) => (
                                        <motion.div key={i} className="flex items-center gap-4 p-5 glass rounded-xl hover-glow"
                                            whileHover={{ x: 4, transition: { duration: 0.2 } }}>
                                            <div className="w-12 h-12 rounded-[10px] bg-[#0e0e0e] flex items-center justify-center text-[#e6c800] shrink-0 shadow-[0_4px_20px_rgba(230,200,0,0.2)] border border-[#e6c800]/20">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-[#888] mb-0.5">{item.label}</p>
                                                {item.href ? (
                                                    <a href={item.href} className="text-[#0e0e0e] font-medium hover:text-[#888] transition-colors">{item.value}</a>
                                                ) : (
                                                    <p className="text-[#0e0e0e] font-medium">{item.value}</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* FAQ */}
                                <h3 className="font-display font-bold text-[#0e0e0e] text-lg mb-5">{t("faqTitle")}</h3>
                                <div className="space-y-3">
                                    {faqs.map((faq, i) => (
                                        <div key={i} className="glass rounded-xl overflow-hidden mb-3 hover-glow transition-all duration-300">
                                            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/40 transition-colors">
                                                <span className="font-medium text-[#0e0e0e] text-sm pr-4">{faq.q}</span>
                                                <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                                    <ChevronDown size={18} className="text-[#888] shrink-0" />
                                                </motion.div>
                                            </button>
                                            <AnimatePresence>
                                                {openFaq === i && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                                                        <div className="px-5 pb-5 text-sm text-[#888] leading-relaxed border-t border-black/6">
                                                            <div className="pt-4">{faq.a}</div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            </AnimIn>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
