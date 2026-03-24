"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
    ArrowRight,
    BadgeCheck,
    Building2,
    ChartNoAxesCombined,
    Code2,
    Compass,
    FileText,
    Layers3,
    ShieldCheck,
    Sparkles,
    Users,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BlockReveal, TextReveal } from "@/components/ui/reveal";
import { useLocale } from "next-intl";

export default function About() {
    const locale = useLocale();
    const isEn = locale === "en";

    const copy = isEn
        ? {
              eyebrow: "About ZYGSOFT",
              heroTitle: "A software partner that combines product thinking with execution.",
              heroBody:
                  "We build fast, reliable, conversion-focused digital products for companies that need more than a pretty website. From corporate sites to subscription tools, we focus on clarity, speed, and measurable business value.",
              heroPrimary: "Start a Project",
              heroSecondary: "Explore Digital Products",
              introTitle: "We do not just ship pages. We design business infrastructure.",
              introBody1:
                  "ZYGSOFT is an Antalya-based software and digital product studio. We work with service companies, law offices, growing brands, and teams that need a site, dashboard, tool, or conversion system that actually moves the business forward.",
              introBody2:
                  "Our approach is simple: understand the real workflow, remove friction, then build an experience that is technically solid and commercially useful. We care about clean code, search visibility, performance, and the user's path to action.",
              stats: [
                  { num: "2019", label: "Founded in Antalya" },
                  { num: "B2B", label: "Product-minded delivery" },
                  { num: "Web + SaaS", label: "Core build focus" },
                  { num: "TR / EN", label: "Bilingual growth-ready UX" },
              ],
              pillarsTitle: "What clients work with us for",
              pillars: [
                  {
                      icon: <Code2 size={20} />,
                      title: "Websites that perform",
                      desc: "We build company websites that load fast, rank better, and guide visitors toward contact, demo, or purchase actions.",
                  },
                  {
                      icon: <Layers3 size={20} />,
                      title: "Productized digital tools",
                      desc: "We turn repetitive workflows into practical subscription products, client panels, and internal systems.",
                  },
                  {
                      icon: <ChartNoAxesCombined size={20} />,
                      title: "Conversion-oriented growth",
                      desc: "We connect UX, SEO, analytics, and funnels so the site supports actual growth instead of acting as a brochure.",
                  },
              ],
              processTitle: "How we usually work",
              process: [
                  {
                      step: "01",
                      title: "Understand the business",
                      desc: "We start with goals, bottlenecks, user actions, and the commercial model, not just visual preferences.",
                  },
                  {
                      step: "02",
                      title: "Design a focused structure",
                      desc: "We simplify the page hierarchy, CTA logic, messaging, and product flow before writing code.",
                  },
                  {
                      step: "03",
                      title: "Build for speed and longevity",
                      desc: "We care about maintainable code, responsive layouts, structured content, and operational clarity.",
                  },
                  {
                      step: "04",
                      title: "Measure and improve",
                      desc: "With analytics, search visibility, and user behavior signals in place, we keep improving what matters.",
                  },
              ],
              trustTitle: "Our working principles",
              trustPoints: [
                  {
                      icon: <ShieldCheck size={18} />,
                      title: "Clear communication",
                      desc: "We prefer realistic scope, visible priorities, and honest feedback over overpromising.",
                  },
                  {
                      icon: <Compass size={18} />,
                      title: "Business-first decisions",
                      desc: "We choose what helps the client sell, deliver, or operate better, not what only looks impressive.",
                  },
                  {
                      icon: <BadgeCheck size={18} />,
                      title: "Responsible delivery",
                      desc: "Performance, SEO, accessibility, and maintainability are part of the build, not afterthoughts.",
                  },
                  {
                      icon: <Users size={18} />,
                      title: "Long-term partnership",
                      desc: "We like building systems that can evolve with the business, not one-off pages with no future.",
                  },
              ],
              audienceTitle: "Who this usually fits",
              audience: [
                  "Law offices and legal operations that need document automation and cleaner internal flows.",
                  "Service businesses that want a stronger corporate presence and more qualified leads.",
                  "Founders launching digital products, subscription tools, or client-facing dashboards.",
                  "Teams replacing scattered manual work with structured, measurable digital systems.",
              ],
              ctaTitle: "If the current site looks fine but does not move the business, it is time to rebuild the system behind it.",
              ctaBody:
                  "We can review your structure, user flow, and conversion path together, then turn it into a cleaner and more effective product experience.",
              ctaPrimary: "Contact Us",
              ctaSecondary: "View Services",
          }
        : {
              eyebrow: "Hakkımızda",
              heroTitle: "Ürün bakışını, teknik uygulamayla birleştiren bir yazılım partneri.",
              heroBody:
                  "Güzel görünen ama iş üretmeyen siteler yerine; hızlı çalışan, güven veren ve dönüşüm odaklı dijital ürünler geliştiriyoruz. Kurumsal web sitelerinden abonelikli araçlara kadar odağımız net: hız, açıklık ve ölçülebilir iş değeri.",
              heroPrimary: "Proje Başlat",
              heroSecondary: "Dijital Ürünleri İncele",
              introTitle: "Biz sadece sayfa tasarlamıyoruz. İşin dijital altyapısını kuruyoruz.",
              introBody1:
                  "ZYGSOFT, Antalya merkezli bir yazılım ve dijital ürün stüdyosudur. Hizmet şirketleri, hukuk büroları, büyüyen markalar ve daha sağlam bir site, panel, araç ya da dönüşüm sistemi kurmak isteyen ekiplerle çalışıyoruz.",
              introBody2:
                  "Yaklaşımımız basit: önce gerçek iş akışını anlarız, sonra sürtünmeyi azaltır, en sonunda teknik olarak güçlü ve ticari olarak işe yarayan bir deneyim kurarız. Temiz kod, arama görünürlüğü, performans ve kullanıcının aksiyona giden yolu bizim için temel başlıklardır.",
              stats: [
                  { num: "2019", label: "Antalya'da kuruluş" },
                  { num: "B2B", label: "Ürün odaklı teslim yaklaşımı" },
                  { num: "Web + SaaS", label: "Ana uzmanlık alanı" },
                  { num: "TR / EN", label: "Büyümeye hazır çift dilli UX" },
              ],
              pillarsTitle: "Müşteriler neden bizimle çalışıyor",
              pillars: [
                  {
                      icon: <Code2 size={20} />,
                      title: "Performans üreten web siteleri",
                      desc: "Daha hızlı açılan, daha iyi sıralanan ve ziyaretçiyi iletişime, demoya ya da satın almaya taşıyan siteler kuruyoruz.",
                  },
                  {
                      icon: <Layers3 size={20} />,
                      title: "Ürünleşmiş dijital araçlar",
                      desc: "Tekrarlayan iş akışlarını abonelikli ürünlere, müşteri panellerine ve pratik iç sistemlere dönüştürüyoruz.",
                  },
                  {
                      icon: <ChartNoAxesCombined size={20} />,
                      title: "Dönüşüm odaklı büyüme",
                      desc: "UX, SEO, analitik ve huni mantığını birlikte ele alıyor; sitenin broşür değil büyüme kanalı olmasını hedefliyoruz.",
                  },
              ],
              processTitle: "Genelde nasıl çalışıyoruz",
              process: [
                  {
                      step: "01",
                      title: "İşi ve darboğazı anlarız",
                      desc: "Görsel beğeniden önce hedefe, kullanıcı aksiyonuna, iş modeline ve tıkanan noktaya bakarız.",
                  },
                  {
                      step: "02",
                      title: "Odaklı bir yapı kurarız",
                      desc: "Koddan önce sayfa kurgusunu, mesaj hiyerarşisini, CTA akışını ve ürün yolunu netleştiririz.",
                  },
                  {
                      step: "03",
                      title: "Hızlı ve sürdürülebilir inşa ederiz",
                      desc: "Responsive yapı, temiz kod, içerik düzeni ve operasyonel açıklık teslimatın parçasıdır.",
                  },
                  {
                      step: "04",
                      title: "Ölçer ve geliştiririz",
                      desc: "Analitik, görünürlük ve kullanıcı davranışını izleyip gerçekten etkili olan noktaları büyütürüz.",
                  },
              ],
              trustTitle: "Çalışma prensiplerimiz",
              trustPoints: [
                  {
                      icon: <ShieldCheck size={18} />,
                      title: "Açık iletişim",
                      desc: "Abartılı vaatler yerine gerçekçi kapsam, görünür öncelikler ve dürüst geri bildirim sunarız.",
                  },
                  {
                      icon: <Compass size={18} />,
                      title: "İş odaklı kararlar",
                      desc: "Sadece etkileyici görüneni değil; satışı, teslimatı ya da operasyonu iyileştireni tercih ederiz.",
                  },
                  {
                      icon: <BadgeCheck size={18} />,
                      title: "Sorumlu teslimat",
                      desc: "Performans, SEO, erişilebilirlik ve sürdürülebilirlik sonradan eklenen değil, baştan planlanan konulardır.",
                  },
                  {
                      icon: <Users size={18} />,
                      title: "Uzun vadeli bakış",
                      desc: "Geleceği olmayan tek seferlik sayfalar yerine, iş büyüdükçe gelişebilen sistemler kurmayı severiz.",
                  },
              ],
              audienceTitle: "En çok kimlerle iyi çalışıyoruz",
              audience: [
                  "Belge süreçlerini hızlandırmak ve iç operasyonunu sadeleştirmek isteyen hukuk bürolarıyla.",
                  "Kurumsal görünümünü güçlendirip daha nitelikli talep toplamak isteyen hizmet şirketleriyle.",
                  "Dijital ürün, abonelikli araç ya da müşteri paneli çıkaran kurucularla.",
                  "Dağınık manuel işleri daha ölçülebilir dijital sistemlere dönüştürmek isteyen ekiplerle.",
              ],
              ctaTitle: "Site güzel görünüyor ama iş üretmiyorsa, sadece tasarımı değil sistemi yenilemek gerekir.",
              ctaBody:
                  "İstersen birlikte mevcut yapını, kullanıcı yolunu ve dönüşüm akışını gözden geçirelim; bunu daha net, hızlı ve etkili bir ürün deneyimine çevirelim.",
              ctaPrimary: "İletişime Geç",
              ctaSecondary: "Hizmetleri Gör",
          };

    return (
        <>
            <Header />
            <main style={{ background: "#f9f7f3" }}>
                <section
                    className="relative overflow-hidden pt-36 pb-20 md:pt-40 md:pb-24"
                    style={{ background: "linear-gradient(160deg, #f9f7f3 58%, #efe8d8 100%)" }}
                >
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)",
                            backgroundSize: "40px 40px",
                        }}
                    />
                    <motion.div
                        className="pointer-events-none absolute right-[-10%] top-12 h-72 w-72 rounded-full md:right-10 md:h-96 md:w-96"
                        animate={{ y: [0, -16, 0], scale: [1, 1.04, 1] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        style={{
                            background:
                                "radial-gradient(circle, rgba(230,200,0,0.12) 0%, rgba(230,200,0,0.03) 45%, transparent 72%)",
                        }}
                    />

                    <div className="container mx-auto max-w-7xl px-6 relative z-10">
                        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                            <motion.div
                                initial={{ opacity: 0, y: 36 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="max-w-3xl"
                            >
                                <span className="section-label">{copy.eyebrow}</span>
                                <h1
                                    className="mt-4 font-display font-extrabold text-[#0e0e0e]"
                                    style={{ fontSize: "clamp(38px,5.2vw,76px)", lineHeight: 0.98 }}
                                >
                                    {copy.heroTitle}
                                </h1>
                                <p className="mt-6 max-w-2xl text-base leading-8 text-[#5f5b52] md:text-xl">
                                    {copy.heroBody}
                                </p>
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <Link href="/contact" className="btn-primary inline-flex justify-center">
                                        {copy.heroPrimary} <ArrowRight size={16} />
                                    </Link>
                                    <Link
                                        href="/dijital-urunler"
                                        className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/80 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[#0e0e0e] transition-all hover:border-[#e6c800]/40 hover:bg-white"
                                    >
                                        {copy.heroSecondary}
                                    </Link>
                                </div>
                            </motion.div>

                            <BlockReveal delay={0.12} className="grid grid-cols-2 gap-4">
                                {copy.stats.map((stat, index) => (
                                    <div
                                        key={stat.label}
                                        className={`rounded-2xl border p-5 shadow-sm transition-all hover-glow md:p-6 ${
                                            index === 0 || index === 3
                                                ? "border-[#0e0e0e] bg-[#0e0e0e] text-white"
                                                : "border-black/8 bg-white/80 backdrop-blur"
                                        }`}
                                    >
                                        <p
                                            className={`font-display text-3xl font-extrabold md:text-4xl ${
                                                index === 0 || index === 3 ? "text-[#e6c800]" : "text-[#0e0e0e]"
                                            }`}
                                        >
                                            {stat.num}
                                        </p>
                                        <p className={`mt-1 text-sm leading-6 ${index === 0 || index === 3 ? "text-white/65" : "text-[#7a7468]"}`}>
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </BlockReveal>
                        </div>
                    </div>
                </section>

                <section className="border-y border-black/8 bg-white py-16 md:py-24">
                    <div className="container mx-auto max-w-7xl px-6">
                        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
                            <BlockReveal>
                                <h2
                                    className="font-display font-extrabold text-[#0e0e0e]"
                                    style={{ fontSize: "clamp(30px,3.6vw,52px)", lineHeight: 1.02 }}
                                >
                                    {copy.introTitle}
                                </h2>
                                <p className="mt-6 text-base leading-8 text-[#5d594f] md:text-lg">{copy.introBody1}</p>
                                <p className="mt-5 text-base leading-8 text-[#7a7468] md:text-lg">{copy.introBody2}</p>
                            </BlockReveal>

                            <BlockReveal delay={0.1}>
                                <div className="rounded-[28px] border border-black/8 bg-[#faf7ef] p-6 md:p-8">
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0e0e0e] text-[#e6c800]">
                                            <Building2 size={22} />
                                        </div>
                                        <div>
                                            <p className="font-display text-xl font-bold text-[#0e0e0e]">ZYGSOFT</p>
                                            <p className="text-sm text-[#7c766a]">
                                                {isEn ? "Software, product and conversion systems" : "Yazılım, ürün ve dönüşüm sistemleri"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {copy.audience.map((item) => (
                                            <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/80 p-4">
                                                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e6c800]/20 text-[#0e0e0e]">
                                                    <FileText size={14} />
                                                </div>
                                                <p className="text-sm leading-7 text-[#4f4b43] md:text-[15px]">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </BlockReveal>
                        </div>
                    </div>
                </section>

                <section className="py-16 md:py-24" style={{ background: "#f9f7f3" }}>
                    <div className="container mx-auto max-w-7xl px-6">
                        <BlockReveal className="mb-10 md:mb-14">
                            <TextReveal delay={0.05}>
                                <span className="section-label">{copy.pillarsTitle}</span>
                            </TextReveal>
                        </BlockReveal>
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {copy.pillars.map((pillar, i) => (
                                <BlockReveal key={pillar.title} delay={i * 0.08}>
                                    <motion.article
                                        className="glass rounded-2xl p-7 hover-glow md:p-8"
                                        whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                    >
                                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e6c800]/30 bg-[#e6c800]/15 text-[#0e0e0e]">
                                            {pillar.icon}
                                        </div>
                                        <h3 className="font-display text-2xl font-bold text-[#0e0e0e]">{pillar.title}</h3>
                                        <p className="mt-3 text-sm leading-7 text-[#757063] md:text-[15px]">{pillar.desc}</p>
                                    </motion.article>
                                </BlockReveal>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-[#0e0e0e] py-16 md:py-24">
                    <div className="container mx-auto max-w-7xl px-6">
                        <BlockReveal className="mb-10 md:mb-14">
                            <TextReveal delay={0.05}>
                                <span className="section-label" style={{ color: "#e6c800" }}>
                                    {copy.processTitle}
                                </span>
                            </TextReveal>
                        </BlockReveal>
                        <div className="grid gap-4 md:grid-cols-2">
                            {copy.process.map((item, i) => (
                                <BlockReveal key={item.step} delay={i * 0.08}>
                                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 md:p-7">
                                        <p className="font-display text-sm font-extrabold tracking-[0.22em] text-[#e6c800]">{item.step}</p>
                                        <h3 className="mt-3 font-display text-2xl font-bold text-white">{item.title}</h3>
                                        <p className="mt-3 text-sm leading-7 text-white/65 md:text-[15px]">{item.desc}</p>
                                    </div>
                                </BlockReveal>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="border-y border-black/8 bg-white py-16 md:py-24">
                    <div className="container mx-auto max-w-7xl px-6">
                        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
                            <BlockReveal>
                                <span className="section-label">{copy.trustTitle}</span>
                                <h2
                                    className="mt-4 font-display font-extrabold text-[#0e0e0e]"
                                    style={{ fontSize: "clamp(28px,3.2vw,44px)", lineHeight: 1.04 }}
                                >
                                    {isEn
                                        ? "We prefer clean structure, measurable outcomes and responsible execution."
                                        : "Temiz yapı, ölçülebilir sonuç ve sorumlu teslimat çizgisini koruyoruz."}
                                </h2>
                                <p className="mt-5 max-w-xl text-base leading-8 text-[#696459] md:text-lg">
                                    {isEn
                                        ? "Clients usually come to us when the existing site is slow, scattered, hard to manage, or simply not producing enough qualified action."
                                        : "Müşteriler genelde bize mevcut site yavaşladığında, dağınık hale geldiğinde, yönetimi zorlaştığında ya da yeterince nitelikli aksiyon üretmediğinde geliyor."}
                                </p>
                            </BlockReveal>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {copy.trustPoints.map((point, i) => (
                                    <BlockReveal key={point.title} delay={i * 0.06}>
                                        <div className="rounded-2xl border border-black/8 bg-[#faf7ef] p-5 md:p-6">
                                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0e0e0e] text-[#e6c800]">
                                                {point.icon}
                                            </div>
                                            <h3 className="font-display text-lg font-bold text-[#0e0e0e]">{point.title}</h3>
                                            <p className="mt-2 text-sm leading-7 text-[#716b5f]">{point.desc}</p>
                                        </div>
                                    </BlockReveal>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-16 md:py-24" style={{ background: "#f3f0ea" }}>
                    <div className="container mx-auto max-w-7xl px-6">
                        <BlockReveal>
                            <div className="relative overflow-hidden rounded-[30px] bg-[#0e0e0e] px-6 py-10 text-center md:px-12 md:py-14">
                                <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at top, rgba(230,200,0,0.3), transparent 40%)" }} />
                                <div className="relative z-10 mx-auto max-w-4xl">
                                    <div className="mb-5 flex justify-center">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/8 text-[#e6c800]">
                                            <Sparkles size={26} />
                                        </div>
                                    </div>
                                    <h2
                                        className="font-display font-extrabold text-white"
                                        style={{ fontSize: "clamp(30px,4vw,54px)", lineHeight: 1.02 }}
                                    >
                                        {copy.ctaTitle}
                                    </h2>
                                    <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-white/70 md:text-lg">
                                        {copy.ctaBody}
                                    </p>
                                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                                        <Link href="/contact" className="btn-yellow justify-center">
                                            {copy.ctaPrimary} <ArrowRight size={16} />
                                        </Link>
                                        <Link
                                            href="/services"
                                            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-all hover:bg-white/10"
                                        >
                                            {copy.ctaSecondary}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </BlockReveal>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
