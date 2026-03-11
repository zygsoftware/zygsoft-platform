"use client";

import { notFound } from "next/navigation";
import { servicesData } from "@/lib/servicesData";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Check, ArrowRight } from "lucide-react";
import { Plus, Minus } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";

function FAQItem({ q, a }: { q: string; a: string }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-black/8 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left group"
            >
                <span className="text-xl font-display font-bold text-[#0e0e0e] group-hover:text-[#e6c800] transition-colors">{q}</span>
                <div className={`w-8 h-8 rounded-full border border-black/10 flex items-center justify-center transition-all ${isOpen ? "bg-[#e6c800] border-[#e6c800] text-[#0e0e0e]" : "text-[#666]"}`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </div>
            </button>
            {isOpen && (
                <div className="pb-8 text-[#666] leading-relaxed max-w-2xl text-lg">
                    {a}
                </div>
            )}
        </div>
    );
}

export default function ServicePage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { slug, locale } = use(params);
    const serviceEntry = servicesData[slug];

    if (!serviceEntry) {
        notFound();
    }

    const lang = locale === "en" ? "en" : "tr";
    const { title, subtitle, content, features, faq: faqs } = serviceEntry[lang];

    return (
        <>
            <Header />
            <main style={{ background: "#f9f7f3" }} className="min-h-screen">

                {/* ── Hero ── */}
                <section
                    className="pt-48 pb-32 relative overflow-hidden"
                    style={{ background: "linear-gradient(160deg, #f9f7f3 60%, #f0ece0 100%)" }}
                >
                    {/* Dot grid */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)",
                            backgroundSize: "40px 40px",
                        }}
                    />

                    {/* Decorative right panel — plain div, no motion */}
                    <div className="absolute right-0 top-0 w-full h-full pointer-events-none flex justify-end">
                        <div className="w-full h-full lg:w-1/2 opacity-10">
                            <div
                                className="w-full h-full"
                                style={{
                                    background:
                                        "radial-gradient(circle at 60% 40%, rgba(230,200,0,0.12) 0%, transparent 50%), linear-gradient(135deg, #e8e3d9 0%, #ddd5bc 100%)",
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#f9f7f3] via-[#f9f7f3]/50 to-transparent lg:block hidden" />
                        </div>
                    </div>

                    <div className="container mx-auto px-6 max-w-7xl relative z-10">
                        <div className="max-w-3xl">
                            <span className="section-label">Hizmet Detayı</span>
                            <h1
                                className="font-display font-extrabold text-[#0e0e0e] mt-4 mb-6"
                                style={{ fontSize: "clamp(36px,5vw,72px)", lineHeight: 1.05 }}
                            >
                                {title}
                            </h1>
                            <p className="text-[#666] text-xl leading-relaxed">{subtitle}</p>
                            <div className="mt-12">
                                <Link href="/contact" className="btn-primary">
                                    Hemen Başlayın <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Content ── */}
                <section className="py-24 bg-white border-y border-black/8">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                            {/* Main Content */}
                            <div className="lg:col-span-8 relative z-10">
                                <h2 className="font-display font-bold text-3xl text-[#0e0e0e] mb-6">
                                    Hizmet Kapsamı
                                </h2>
                                <p className="text-[#666] text-lg leading-relaxed mb-12">{content}</p>

                                <h3 className="font-display font-bold text-2xl text-[#0e0e0e] mb-6">
                                    Bu Hizmetle Neler Kazanırsınız?
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
                                    {features.map((feature, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-4 p-5 bg-[#f9f7f3] border border-black/8 rounded-sm"
                                        >
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                                style={{ background: "#e6c800" }}
                                            >
                                                <Check size={14} className="text-[#0e0e0e]" strokeWidth={3} />
                                            </div>
                                            <span className="text-[#0e0e0e] font-medium leading-relaxed">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* FAQ */}
                                <div className="pt-20 border-t border-black/8">
                                    <h3 className="font-display font-bold text-3xl text-[#0e0e0e] mb-2">
                                        Sıkça Sorulan Sorular
                                    </h3>
                                    <p className="text-[#888] mb-10 text-lg">
                                        Bu hizmet hakkında en çok sorulan sorular ve yanıtları.
                                    </p>
                                    <div className="flex flex-col">
                                        {faqs?.map((faq, idx) => (
                                            <FAQItem key={idx} q={faq.q} a={faq.a} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar CTA */}
                            <div className="lg:col-span-4 relative z-10">
                                <div className="bg-[#0e0e0e] p-10 rounded-sm text-center sticky top-32">
                                    <div className="w-16 h-16 mx-auto bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6">
                                        <span className="text-3xl">👋</span>
                                    </div>
                                    <h3 className="font-display font-bold text-2xl text-white mb-4">
                                        Bu Hizmetle İlgileniyor Musunuz?
                                    </h3>
                                    <p className="text-white/60 mb-8 leading-relaxed">
                                        Kapsam, süreç ve fiyatlandırma hakkında bilgi almak için bize yazın. İlk görüşme ücretsizdir.
                                    </p>
                                    <Link href="/contact" className="btn-yellow w-full justify-center">
                                        Ücretsiz Teklif Alın <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
