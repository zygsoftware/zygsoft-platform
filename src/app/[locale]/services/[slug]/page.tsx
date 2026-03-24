"use client";

import { notFound } from "next/navigation";
import { servicesData } from "@/lib/servicesData";
import { servicePageMeta, type ServicePlatform, type ServicePlatformKey } from "@/lib/servicePageMeta";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
    ArrowRight,
    Check,
    ChevronRight,
    Minus,
    Plus,
    Sparkles,
    BarChart3,
    Layers3,
    ShieldCheck,
} from "lucide-react";
import {
    FacebookLogo,
    GoogleAdsLogo,
    InstagramLogo,
    MetaLogo,
    WhatsAppLogo,
} from "@/components/home/PlatformLogos";
import Link from "next/link";
import { use, useState } from "react";

function FAQItem({ q, a }: { q: string; a: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-black/8 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left group gap-6"
            >
                <span className="text-lg md:text-xl font-display font-bold text-[#0e0e0e] group-hover:text-[#e6c800] transition-colors">
                    {q}
                </span>
                <div className={`w-8 h-8 rounded-full border border-black/10 flex items-center justify-center transition-all shrink-0 ${isOpen ? "bg-[#e6c800] border-[#e6c800] text-[#0e0e0e]" : "text-[#666]"}`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </div>
            </button>
            {isOpen && (
                <div className="pb-8 text-[#666] leading-relaxed max-w-2xl text-base md:text-lg">
                    {a}
                </div>
            )}
        </div>
    );
}

function PlatformBadge({ platform }: { platform: ServicePlatform }) {
    const iconClassName = "w-5 h-5";
    const iconMap: Record<ServicePlatformKey, React.ReactNode> = {
        instagram: <InstagramLogo className={iconClassName} />,
        facebook: <FacebookLogo className={iconClassName} />,
        meta: <MetaLogo className={iconClassName} />,
        "google-ads": <GoogleAdsLogo className={iconClassName} />,
        whatsapp: <WhatsAppLogo className={iconClassName} />,
    };

    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 backdrop-blur px-4 py-2.5 text-[13px] font-bold text-[#343131] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            {platform.key ? iconMap[platform.key] : <span className="w-2 h-2 rounded-full bg-[#e6c800]" />}
            <span>{platform.label}</span>
        </div>
    );
}

export default function ServicePage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { slug, locale } = use(params);
    const serviceEntry = servicesData[slug];
    const metaEntry = servicePageMeta[slug];

    if (!serviceEntry || !metaEntry) {
        notFound();
    }

    const lang = locale === "en" ? "en" : "tr";
    const { title, subtitle, content, features, faq: faqs } = serviceEntry[lang];
    const meta = metaEntry[lang];
    const contactHref = lang === "en" ? "/en/contact" : "/contact";

    return (
        <>
            <Header />
            <main style={{ background: "#f7f2e8" }} className="min-h-screen">
                <section
                    className="pt-40 md:pt-48 pb-24 md:pb-32 relative overflow-hidden"
                    style={{ background: "linear-gradient(160deg, #f7f2e8 0%, #f2ecdf 55%, #ebe2ce 100%)" }}
                >
                    <div
                        className="absolute inset-0 pointer-events-none opacity-50"
                        style={{
                            backgroundImage: "radial-gradient(circle, rgba(52,49,49,0.07) 1px, transparent 1px)",
                            backgroundSize: "34px 34px",
                        }}
                    />
                    <div className="absolute -top-10 -right-10 w-[28rem] h-[28rem] rounded-full bg-[radial-gradient(circle,rgba(230,200,0,0.18)_0%,transparent_65%)] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[24rem] h-[24rem] rounded-full bg-[radial-gradient(circle,rgba(52,49,49,0.08)_0%,transparent_70%)] pointer-events-none" />

                    <div className="container mx-auto px-6 max-w-7xl relative z-10">
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-14 items-start">
                            <div className="xl:col-span-7">
                                <span className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/70 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#343131]/70">
                                    <Sparkles size={14} className="text-[#e6c800]" />
                                    {meta.sectionLabel}
                                </span>
                                <p className="mt-6 text-[11px] font-black uppercase tracking-[0.28em] text-[#343131]/45">
                                    {meta.heroLabel}
                                </p>
                                <h1
                                    className="font-display font-extrabold text-[#0e0e0e] mt-3 mb-6 tracking-tight"
                                    style={{ fontSize: "clamp(40px,5vw,78px)", lineHeight: 0.98 }}
                                >
                                    {title}
                                </h1>
                                <p className="text-[#5d5648] text-lg md:text-xl leading-relaxed max-w-3xl">
                                    {subtitle}
                                </p>

                                <div className="mt-10">
                                    <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#343131]/40 mb-4">
                                        {meta.platformsLabel}
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {meta.platforms.map((platform) => (
                                            <PlatformBadge key={`${slug}-${platform.label}`} platform={platform} />
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-10 flex flex-wrap gap-4">
                                    <Link href={contactHref} className="btn-primary">
                                        {meta.ctaButton} <ArrowRight size={18} />
                                    </Link>
                                    <a
                                        href="#service-faq"
                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-[#343131]/12 bg-white px-6 py-3.5 text-sm font-black uppercase tracking-[0.14em] text-[#343131] hover:border-[#343131]/25 hover:bg-[#fffdf8] transition-colors"
                                    >
                                        FAQ <ChevronRight size={16} />
                                    </a>
                                </div>
                            </div>

                            <div className="xl:col-span-5">
                                <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4">
                                    {meta.stats.map((stat, idx) => {
                                        const icon = idx === 0 ? <BarChart3 size={18} /> : idx === 1 ? <Layers3 size={18} /> : <ShieldCheck size={18} />;
                                        return (
                                            <div
                                                key={`${slug}-${stat.label}`}
                                                className="rounded-[1.75rem] border border-black/8 bg-white/85 backdrop-blur px-6 py-6 shadow-[0_18px_40px_rgba(0,0,0,0.05)]"
                                            >
                                                <div className="flex items-center justify-between gap-4 mb-5">
                                                    <div className="w-11 h-11 rounded-2xl bg-[#f7f2e8] border border-black/6 flex items-center justify-center text-[#343131]">
                                                        {icon}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-display font-black text-[#0e0e0e]">{stat.value}</div>
                                                        <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#343131]/40">{stat.label}</div>
                                                    </div>
                                                </div>
                                                <p className="text-sm leading-relaxed text-[#5d5648]">
                                                    {stat.detail}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-24 bg-white border-y border-black/8">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-14">
                            <div className="xl:col-span-7">
                                <h2 className="font-display font-bold text-3xl md:text-4xl text-[#0e0e0e] mb-6">
                                    {meta.contentTitle}
                                </h2>
                                <p className="text-[#666] text-lg leading-relaxed mb-12">
                                    {content}
                                </p>

                                <div className="rounded-[2rem] bg-[#fcfaf5] border border-black/6 p-8 md:p-10 mb-14">
                                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#343131]/40 mb-3">
                                        {meta.spotlightTitle}
                                    </div>
                                    <p className="text-[#343131] text-lg leading-relaxed font-medium">
                                        {meta.spotlightBody}
                                    </p>
                                </div>

                                <h3 className="font-display font-bold text-2xl md:text-3xl text-[#0e0e0e] mb-6">
                                    {meta.gainsTitle}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
                                    {features.map((feature, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-4 p-5 rounded-[1.4rem] bg-[#f9f7f3] border border-black/8"
                                        >
                                            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-[#e6c800]">
                                                <Check size={15} className="text-[#0e0e0e]" strokeWidth={3} />
                                            </div>
                                            <span className="text-[#0e0e0e] font-medium leading-relaxed">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <h3 className="font-display font-bold text-2xl md:text-3xl text-[#0e0e0e] mb-6">
                                    {meta.deliverablesTitle}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {meta.deliverables.map((item, idx) => (
                                        <div
                                            key={`${slug}-deliverable-${idx}`}
                                            className="rounded-[1.5rem] border border-black/8 bg-white px-5 py-5 shadow-[0_10px_24px_rgba(0,0,0,0.03)]"
                                        >
                                            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#343131]/40 mb-2">
                                                {lang === "en" ? `Deliverable ${idx + 1}` : `Teslim ${idx + 1}`}
                                            </div>
                                            <p className="text-[#343131] leading-relaxed font-medium">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="xl:col-span-5">
                                <div className="sticky top-28 space-y-5">
                                    <div className="rounded-[2rem] bg-[#0e0e0e] p-8 md:p-10 text-white shadow-[0_28px_60px_rgba(0,0,0,0.18)]">
                                        <div className="w-16 h-16 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center mb-6">
                                            <Sparkles size={26} className="text-[#e6c800]" />
                                        </div>
                                        <h3 className="font-display font-bold text-2xl mb-4">
                                            {meta.ctaTitle}
                                        </h3>
                                        <p className="text-white/68 leading-relaxed mb-8">
                                            {meta.ctaBody}
                                        </p>
                                        <Link href={contactHref} className="btn-yellow w-full justify-center">
                                            {meta.ctaButton} <ArrowRight size={16} />
                                        </Link>
                                    </div>

                                    <div className="rounded-[2rem] border border-black/8 bg-[#fcfaf5] p-8">
                                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#343131]/40 mb-3">
                                            {meta.workflowTitle}
                                        </div>
                                        <p className="text-[#5d5648] leading-relaxed">
                                            {meta.workflowIntro}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-24 bg-[#f9f7f3]">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="max-w-3xl mb-12">
                            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#343131]/40 mb-3">
                                {meta.workflowTitle}
                            </div>
                            <h3 className="font-display font-bold text-3xl md:text-4xl text-[#0e0e0e] mb-4">
                                {meta.workflowTitle}
                            </h3>
                            <p className="text-[#666] text-lg leading-relaxed">
                                {meta.workflowIntro}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                            {meta.workflow.map((step, idx) => (
                                <div
                                    key={`${slug}-workflow-${idx}`}
                                    className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_34px_rgba(0,0,0,0.03)]"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-[#f7f2e8] border border-black/6 flex items-center justify-center text-[#0e0e0e] font-display font-black text-lg mb-5">
                                        {String(idx + 1).padStart(2, "0")}
                                    </div>
                                    <h4 className="font-display font-bold text-xl text-[#0e0e0e] mb-3">
                                        {step.title}
                                    </h4>
                                    <p className="text-[#666] leading-relaxed">
                                        {step.body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="service-faq" className="py-24 bg-white border-t border-black/8">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <h3 className="font-display font-bold text-3xl md:text-4xl text-[#0e0e0e] mb-3">
                            {meta.faqTitle}
                        </h3>
                        <p className="text-[#888] mb-10 text-lg">
                            {meta.faqIntro}
                        </p>
                        <div className="flex flex-col">
                            {faqs?.map((faq, idx) => (
                                <FAQItem key={idx} q={faq.q} a={faq.a} />
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
