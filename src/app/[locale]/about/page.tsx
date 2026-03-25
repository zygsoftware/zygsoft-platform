"use client";

import { ArrowRight, BadgeCheck, Building2, Target, Telescope } from "lucide-react";
import { useLocale } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link } from "@/i18n/navigation";
import { BlockReveal } from "@/components/ui/reveal";

type PrincipleCard = {
    title: string;
    body: string;
    icon: React.ReactNode;
};

export default function AboutPage() {
    const locale = useLocale();
    const isEn = locale === "en";

    const copy = isEn
        ? {
              eyebrow: "About ZYGSOFT",
              breadcrumbHome: "Home",
              heroTitle: "About ZYGSOFT",
              heroBody:
                  "ZYGSOFT is an Antalya-based software company focused on websites, digital tools, automation-driven workflows, and conversion-oriented product experiences.",
              heroPrimary: "Contact Us",
              heroSecondary: "View Services",
              companyEyebrow: "About ZYGSOFT",
              companyTitle: "We build the digital layer behind trust, speed, and measurable growth.",
              companyBody1:
                  "Our work spans corporate websites, client-facing panels, subscription-ready digital tools, and operational systems that reduce friction. We prefer clear structure, practical delivery, and product thinking over visual noise.",
              companyBody2:
                  "For us, a strong website or digital platform should explain the business better, create more qualified action, and make the company feel more professional, reliable, and easier to work with.",
              missionEyebrow: "Direction",
              missionTitle: "Mission and vision built on practical execution.",
              principles: [
                  {
                      title: "Mission",
                      body: "To design and build digital systems that create real business value through clearer structure, stronger performance, and more reliable user experience.",
                      icon: <Target size={20} />,
                  },
                  {
                      title: "Vision",
                      body: "To become a trusted software and digital product partner for businesses that want to modernize operations, strengthen brand presence, and scale with better systems.",
                      icon: <Telescope size={20} />,
                  },
              ] as PrincipleCard[],
              founderEyebrow: "Founder",
              founderName: "Gurkan Yavuz",
              founderRole: "Senior Developer",
              founderBody:
                  "Gurkan Yavuz is the founder of ZYGSOFT. His background combines software development, web systems, operational IT thinking, and practical digital execution. This creates a product perspective that focuses not only on how a system looks, but also on how it performs and supports real workflows.",
              founderQuote:
                  "Technology should not only exist as infrastructure. It should shape how a business is perceived, managed, and moved forward.",
              ctaTitle: "If your company needs a clearer digital face and a stronger system behind it, we can build it together.",
              ctaPrimary: "Start a Project",
          }
        : {
              eyebrow: "Hakkımızda",
              breadcrumbHome: "Anasayfa",
              heroTitle: "Hakkımızda",
              heroBody:
                  "ZYGSOFT, Antalya merkezli bir yazılım şirketidir. Kurumsal web siteleri, dijital araçlar, otomasyon odaklı iş akışları ve dönüşüm odaklı ürün deneyimleri geliştiriyoruz.",
              heroPrimary: "İletişime Geç",
              heroSecondary: "Hizmetleri Gör",
              companyEyebrow: "ZYGSOFT Hakkında",
              companyTitle: "Güven, hız ve ölçülebilir büyümenin arkasındaki dijital katmanı kuruyoruz.",
              companyBody1:
                  "Çalışma alanımız; kurumsal web siteleri, müşteri panelleri, abonelik altyapısına uygun dijital araçlar ve operasyonel sürtünmeyi azaltan iç sistemleri kapsar. Görsel gürültü yerine net yapı, pratik teslim ve ürün mantığına önem veriyoruz.",
              companyBody2:
                  "Bize göre iyi bir site ya da dijital platform, işi daha iyi anlatmalı, daha nitelikli aksiyon üretmeli ve markayı daha profesyonel, daha güvenilir ve daha güçlü göstermelidir.",
              missionEyebrow: "Yönümüz",
              missionTitle: "Pratik uygulama üzerine kurulu vizyon ve misyon.",
              principles: [
                  {
                      title: "Misyon",
                      body: "Daha net yapı, daha güçlü performans ve daha güvenilir kullanıcı deneyimi üzerinden işletmelere gerçek değer üreten dijital sistemler tasarlamak ve geliştirmek.",
                      icon: <Target size={20} />,
                  },
                  {
                      title: "Vizyon",
                      body: "Operasyonunu modernize etmek, marka görünümünü güçlendirmek ve daha iyi sistemlerle ölçeklenmek isteyen işletmeler için güvenilir bir yazılım ve dijital ürün partneri olmak.",
                      icon: <Telescope size={20} />,
                  },
              ] as PrincipleCard[],
              founderEyebrow: "Kurucu",
              founderName: "Gürkan Yavuz",
              founderRole: "Senior Developer",
              founderBody:
                  "Gürkan Yavuz, ZYGSOFT'un kurucusudur. Yazılım geliştirme, web sistemleri, operasyonel IT yaklaşımı ve pratik dijital uygulama deneyimini bir araya getirir. Bu yaklaşım, geliştirilen ürünlerin sadece iyi görünmesini değil; hızlı, anlaşılır ve gerçek iş akışına uyumlu çalışmasını hedefler.",
              founderQuote:
                  "Teknoloji sadece arka planda çalışan bir altyapı olmamalı; işletmenin nasıl algılandığını, yönetildiğini ve ileri taşındığını da belirlemelidir.",
              ctaTitle: "Şirketin dijital yüzünü ve arkasındaki sistemi daha güçlü hale getirmek istiyorsan bunu birlikte kurabiliriz.",
              ctaPrimary: "Proje Başlat",
          };

    return (
        <>
            <Header />
            <main className="bg-[#f7f4ec]">
                <section className="relative overflow-hidden border-b border-black/6 bg-[linear-gradient(180deg,#fcfbf6_0%,#f7f4ec_100%)] pt-24 pb-10 md:pt-28 md:pb-12">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.65) 1px, transparent 0)",
                            backgroundSize: "28px 28px",
                        }}
                    />
                    <div className="pointer-events-none absolute left-[-8%] top-4 h-56 w-56 rounded-full bg-[#e6c800]/12 blur-3xl" />

                    <div className="container relative z-10 mx-auto max-w-7xl px-6">
                        <BlockReveal>
                            <div className="max-w-3xl">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#343131]/45">
                                    <Link href="/" className="transition-colors hover:text-[#111111]">
                                        {copy.breadcrumbHome}
                                    </Link>
                                    <span>/</span>
                                    <span>{copy.eyebrow}</span>
                                </div>
                                <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/90 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#343131]/60 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                                    <Building2 size={13} className="text-[#e6c800]" />
                                    {copy.eyebrow}
                                </span>
                                <h1
                                    className="mt-4 max-w-3xl font-display font-extrabold text-[#111111]"
                                    style={{ fontSize: "clamp(28px,3.1vw,42px)", lineHeight: 1.02 }}
                                >
                                    {copy.heroTitle}
                                </h1>
                                <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[#5a564d] md:text-base">
                                    {copy.heroBody}
                                </p>
                                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                    <Link href="/contact" className="btn-primary inline-flex justify-center">
                                        {copy.heroPrimary} <ArrowRight size={16} />
                                    </Link>
                                    <Link
                                        href="/services"
                                        className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/85 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[#0e0e0e] transition-all hover:border-[#e6c800]/40 hover:bg-white"
                                    >
                                        {copy.heroSecondary}
                                    </Link>
                                </div>
                            </div>
                        </BlockReveal>
                    </div>
                </section>

                <section className="py-16 md:py-20">
                    <div className="container mx-auto max-w-7xl px-6">
                        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                            <BlockReveal>
                                <div className="rounded-[30px] border border-black/7 bg-white p-7 shadow-[0_16px_40px_rgba(0,0,0,0.04)] md:p-8">
                                    <span className="section-label">{copy.companyEyebrow}</span>
                                    <h2
                                        className="mt-4 font-display font-extrabold text-[#111111]"
                                        style={{ fontSize: "clamp(28px,3.6vw,48px)", lineHeight: 1.02 }}
                                    >
                                        {copy.companyTitle}
                                    </h2>
                                    <p className="mt-5 text-base leading-8 text-[#5d594f] md:text-lg">{copy.companyBody1}</p>
                                    <p className="mt-4 text-base leading-8 text-[#716c62] md:text-lg">{copy.companyBody2}</p>
                                </div>
                            </BlockReveal>

                            <BlockReveal delay={0.08}>
                                <div className="grid gap-4">
                                    <div className="rounded-[30px] border border-black/7 bg-[#faf7ef] p-7 shadow-[0_20px_50px_rgba(0,0,0,0.06)] md:p-8">
                                        <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#343131]/45">
                                            {copy.missionEyebrow}
                                        </span>
                                        <h3 className="mt-4 text-3xl font-display font-extrabold leading-tight text-[#111111]">
                                            {copy.missionTitle}
                                        </h3>
                                        <div className="mt-6 grid gap-4">
                                            {copy.principles.map((item) => (
                                                <div key={item.title} className="rounded-[24px] border border-black/8 bg-white p-5 shadow-[0_10px_24px_rgba(0,0,0,0.03)]">
                                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#111111] text-[#e6c800]">
                                                        {item.icon}
                                                    </div>
                                                    <h3 className="font-display text-xl font-bold text-[#111111]">{item.title}</h3>
                                                    <p className="mt-2 text-sm leading-7 text-[#5a564d]">{item.body}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </BlockReveal>
                        </div>
                    </div>
                </section>

                <section className="border-y border-black/7 bg-white py-16 md:py-20">
                    <div className="container mx-auto max-w-7xl px-6">
                        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
                            <BlockReveal>
                                <div className="rounded-[30px] border border-black/7 bg-[#faf7ef] p-7 shadow-[0_12px_32px_rgba(0,0,0,0.03)] md:p-8">
                                    <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-[#343131]/45">
                                        {copy.founderEyebrow}
                                    </span>
                                    <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1] text-[#111111]">
                                        {copy.founderName}
                                    </h2>
                                    <div className="mt-4 inline-flex rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-semibold text-[#433f38]">
                                        {copy.founderRole}
                                    </div>
                                </div>
                            </BlockReveal>

                            <div className="grid gap-6">
                                <BlockReveal delay={0.08}>
                                    <div className="rounded-[30px] border border-black/7 bg-white p-7 shadow-[0_12px_32px_rgba(0,0,0,0.03)] md:p-8">
                                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#faf4d4] text-[#111111]">
                                            <BadgeCheck size={20} />
                                        </div>
                                        <p className="text-base leading-8 text-[#59554c] md:text-lg">{copy.founderBody}</p>
                                        <blockquote className="mt-6 rounded-[24px] border border-[#e6c800]/30 bg-[#fffdf5] px-5 py-5 text-base font-medium italic leading-8 text-[#27231e] shadow-[0_10px_24px_rgba(0,0,0,0.02)]">
                                            “{copy.founderQuote}”
                                        </blockquote>
                                    </div>
                                </BlockReveal>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-16 md:py-20">
                    <div className="container mx-auto max-w-7xl px-6">
                        <BlockReveal>
                            <div className="relative overflow-hidden rounded-[32px] border border-black/7 bg-white px-6 py-10 text-center shadow-[0_16px_36px_rgba(0,0,0,0.04)] md:px-12 md:py-14">
                                <div
                                    className="pointer-events-none absolute inset-0 opacity-[0.08]"
                                    style={{ backgroundImage: "radial-gradient(circle at top, rgba(230,200,0,0.45), transparent 42%)" }}
                                />
                                <div className="relative z-10 mx-auto max-w-4xl">
                                    <h2
                                        className="font-display font-extrabold text-[#111111]"
                                        style={{ fontSize: "clamp(28px,3.8vw,50px)", lineHeight: 1.02 }}
                                    >
                                        {copy.ctaTitle}
                                    </h2>
                                    <div className="mt-8 flex justify-center">
                                        <Link href="/contact" className="btn-yellow justify-center">
                                            {copy.ctaPrimary} <ArrowRight size={16} />
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
