"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Mail, MapPin, ChevronDown, Phone, ArrowRight, Clock3, ShieldCheck, Sparkles, ClipboardList } from "lucide-react";
import { useState } from "react";
import { ContactInquiryForm } from "@/components/forms/ContactInquiryForm";
import { useLocale, useTranslations } from "next-intl";
import { BlockReveal } from "@/components/ui/reveal";
import { Link } from "@/i18n/navigation";

export default function Contact() {
    const locale = useLocale();
    const t = useTranslations("Contact");
    const isTr = locale === "tr";
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const faqs = isTr
        ? [
              {
                  q: "Hangi konularda size yazabilirim?",
                  a: "Kurumsal web sitesi, özel yazılım, müşteri paneli, abonelikli dijital ürün, UDF ve belge araçları, marka görünürlüğü, SEO altyapısı, dijital dönüşüm danışmanlığı ve mevcut sistemlerin iyileştirilmesi gibi başlıklarda bize yazabilirsiniz. Eğer talebiniz tam olarak hangi kategoriye girdiğini bilmiyorsa da sorun değil; ihtiyacı birlikte netleştiririz.",
              },
              {
                  q: "İlk görüşme ve ön değerlendirme ücretli mi?",
                  a: "Hayır. İlk değerlendirme, ihtiyaç analizi ve temel yönlendirme ücretsizdir. Amacımız önce problemi doğru anlamak, sonra kapsamı ve en doğru çözüm yolunu netleştirmektir. Teklif almak ya da ön görüşme yapmak sizi herhangi bir yükümlülük altına sokmaz.",
              },
              {
                  q: "Teklif hazırlayabilmeniz için size hangi bilgileri göndermeliyim?",
                  a: "Mümkünse hedefinizi, mevcut durumunuzu, istediğiniz teslim süresini, örnek beğendiğiniz siteleri veya ürünleri ve varsa teknik kısıtlarınızı paylaşın. Net brief verilmesi süreci hızlandırır; ancak elinizde sadece kaba bir fikir varsa da sorun değil. Biz gerekli sorularla kapsamı birlikte çıkarırız.",
              },
              {
                  q: "Ne kadar sürede dönüş yapıyorsunuz?",
                  a: "Çoğu talebe 1 iş günü içinde dönüş yapıyoruz. Daha detaylı keşif gerektiren projelerde ilk yanıt hızlı gelir; kapsamlı teklif veya yol haritası ise projenin niteliğine göre biraz daha uzun sürebilir. Acil konular için e-posta ve telefon üzerinden öncelikli temas kurabilirsiniz.",
              },
              {
                  q: "Sadece yeni proje mi alıyorsunuz, mevcut sistemi de iyileştiriyor musunuz?",
                  a: "Her ikisini de yapıyoruz. Sıfırdan ürün veya web sitesi geliştirebildiğimiz gibi, mevcut sitelerde performans iyileştirmesi, mobil responsive düzenleme, dönüşüm akışı sadeleştirme, panel geliştirme, içerik yapısının güçlendirilmesi ve teknik bakım gibi işlere de destek veriyoruz.",
              },
              {
                  q: "Hukuk araçları paketi ve dijital ürünler için süreç nasıl işliyor?",
                  a: "Ücretsiz hesabınızı oluşturduktan sonra ilgili paketi seçebilir, ödeme bildirimi yapabilir ve onay sonrası paneli kullanmaya başlayabilirsiniz. Ayrıca ihtiyaç duyarsanız ürün seçimi, paket kapsamı ve kullanım senaryoları konusunda da yönlendirme sağlıyoruz.",
              },
              {
                  q: "İletişim formundan gönderdiğim bilgiler güvende mi?",
                  a: "Evet. Bize gönderdiğiniz bilgiler yalnızca talebinize yanıt verebilmek, proje değerlendirmesi yapmak ve gerektiğinde sizinle tekrar iletişime geçmek amacıyla işlenir. Bu bilgiler üçüncü kişilerle paylaşılmaz ve gereksiz şekilde dolaşıma sokulmaz.",
              },
              {
                  q: "Sadece Antalya'daki müşterilerle mi çalışıyorsunuz?",
                  a: "Hayır. Antalya merkezliyiz ancak Türkiye genelindeki ve uygun olduğunda yurt dışındaki müşterilerle de uzaktan çalışabiliyoruz. Süreçlerimizi çevrim içi toplantı, yazılı kapsam yönetimi ve düzenli geri bildirim akışıyla sağlıklı biçimde yürütüyoruz.",
              },
          ]
        : [
              {
                  q: "What can I contact you about?",
                  a: "You can contact us for corporate websites, custom software, customer dashboards, subscription products, UDF and document tools, brand visibility, SEO foundations, digital transformation consulting, or improving an existing system. If you are not sure how to categorize the need yet, that is completely fine; we can define it together.",
              },
              {
                  q: "Is the first consultation and evaluation paid?",
                  a: "No. The initial evaluation, needs review, and first-level guidance are free. Our goal is to understand the problem correctly first, then clarify the right scope and the most suitable solution path. Requesting a quote or having an initial conversation creates no obligation.",
              },
              {
                  q: "What should I send so you can prepare a proposal?",
                  a: "If possible, share your goal, your current situation, desired timeline, examples you like, and any technical constraints. A clear brief helps move faster, but if you only have a rough idea, that is also fine. We can shape the scope together through the right questions.",
              },
              {
                  q: "How fast do you usually respond?",
                  a: "We usually respond within 1 business day. For projects that require a deeper discovery phase, the first reply still comes quickly, while a detailed proposal or roadmap may take a bit longer depending on the scope.",
              },
              {
                  q: "Do you only take new projects, or can you improve an existing system too?",
                  a: "We do both. We can build a product or website from scratch, and we also work on improving existing sites through performance optimization, mobile responsiveness, clearer conversion flow, dashboard enhancements, content structure improvements, and ongoing technical support.",
              },
              {
                  q: "How does the process work for your legal tools and digital products?",
                  a: "After creating your free account, you can choose the relevant package, submit your payment notification, and start using the panel once it is approved. If needed, we can also guide you on package selection, scope, and the most suitable usage scenario.",
              },
              {
                  q: "Is the information I submit through the form secure?",
                  a: "Yes. The information you send is processed only to respond to your request, evaluate the project, and contact you again when needed. It is not shared with third parties and is not circulated beyond what is operationally necessary.",
              },
              {
                  q: "Do you only work with clients in Antalya?",
                  a: "No. We are based in Antalya, but we also work remotely with clients across Turkey and, when appropriate, internationally. We manage the process through online meetings, written scope alignment, and regular feedback loops.",
              },
          ];

    const highlights = isTr
        ? [
              {
                  icon: <Clock3 size={18} />,
                  title: "Hızlı ilk dönüş",
                  desc: "Çoğu mesaja 1 iş günü içinde dönüş yapıyoruz. Acil ve net ihtiyaçlarda süreç daha da hızlanabiliyor.",
              },
              {
                  icon: <ShieldCheck size={18} />,
                  title: "Gizlilik odaklı iletişim",
                  desc: "Gönderdiğiniz bilgiler yalnızca talebinizi değerlendirmek ve size dönüş yapmak için kullanılır.",
              },
              {
                  icon: <ClipboardList size={18} />,
                  title: "Net kapsam çıkarma",
                  desc: "İhtiyaç dağınık olsa bile konuşma sonunda hedefi, kapsamı ve sonraki adımı daha görünür hale getiriyoruz.",
              },
          ]
        : [
              {
                  icon: <Clock3 size={18} />,
                  title: "Fast first response",
                  desc: "We usually respond within 1 business day, and even faster when the request is clear and urgent.",
              },
              {
                  icon: <ShieldCheck size={18} />,
                  title: "Privacy-minded communication",
                  desc: "The information you send is only used to evaluate your request and respond to you properly.",
              },
              {
                  icon: <ClipboardList size={18} />,
                  title: "Clear scope shaping",
                  desc: "Even when the need is still messy, we help turn it into a clearer goal, scope, and next step.",
              },
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
                            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
                                {highlights.map((item) => (
                                    <div key={item.title} className="rounded-2xl border border-black/8 bg-white/75 p-5 backdrop-blur-sm">
                                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0e0e0e] text-[#e6c800]">
                                            {item.icon}
                                        </div>
                                        <h3 className="font-display text-lg font-bold text-[#0e0e0e]">{item.title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-[#777164]">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ── Main grid ── */}
                <section className="py-24 bg-white border-y border-black/8">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                            {/* Form */}
                            <BlockReveal>
                                <ContactInquiryForm
                                    title={t("formTitle")}
                                    subtitle={t("infoDesc")}
                                />
                            </BlockReveal>

                            {/* Info */}
                            <BlockReveal delay={0.12}>
                                <h2 className="font-display font-bold text-[#0e0e0e] text-2xl mb-8">{t("infoTitle")}</h2>
                                <div className="space-y-5 mb-10">
                                    {[
                                        { icon: <Mail size={18} />, label: t("emailTitle"), value: "info@zygsoft.com", href: "mailto:info@zygsoft.com" },
                                        { icon: <Phone size={18} />, label: t("phoneTitle"), value: "+90 542 291 69 12", href: "tel:+905422916912" },
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

                                <div className="mb-10 rounded-2xl border border-black/8 bg-[#0e0e0e] p-6 text-white">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#e6c800]">
                                            <Sparkles size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-display text-xl font-bold">
                                                {isTr ? "Bize yazmadan önce bunları paylaşmanız faydalı olur" : "Helpful details to include before you contact us"}
                                            </h3>
                                        </div>
                                    </div>
                                    <ul className="space-y-3 text-sm leading-7 text-white/75">
                                        <li>{isTr ? "Ne yapmak istediğiniz ya da hangi sorunu çözmeye çalıştığınız" : "What you want to build or what kind of problem you are trying to solve"}</li>
                                        <li>{isTr ? "Varsa mevcut web siteniz, paneliniz veya kullandığınız sistemler" : "Your existing website, dashboard, or current tools if there are any"}</li>
                                        <li>{isTr ? "Beklenen teslim süresi, öncelikler ve varsa teknik kısıtlar" : "Your desired timeline, business priorities, and any technical constraints"}</li>
                                        <li>{isTr ? "Eğer konu dijital ürünse, hangi paket ya da kullanım senaryosuyla ilgilendiğiniz" : "If it is about a digital product, which package or use case you are considering"}</li>
                                    </ul>
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

                                <div className="mt-10 rounded-2xl border border-black/8 bg-[#faf7ef] p-6">
                                    <h3 className="font-display text-2xl font-bold text-[#0e0e0e]">
                                        {isTr ? "Sadece teklif almak için değil, netlik kazanmak için de yazabilirsiniz" : "You can reach out not only for a quote, but also to gain clarity"}
                                    </h3>
                                    <p className="mt-3 text-sm leading-7 text-[#6f685c] md:text-[15px]">
                                        {isTr
                                            ? "Bazen ihtiyaç nettir, bazen sadece problem hissedilir ama çözüm yolu henüz görünmez. Her iki durumda da bize yazabilirsiniz. Gerek yeni bir proje, gerek mevcut sitenin iyileştirilmesi, gerekse dijital ürün seçimi olsun; ilk adımda konuyu birlikte netleştirmek çoğu zaman en büyük kazanımdır."
                                            : "Sometimes the need is clear, and sometimes the problem is obvious but the right solution path is still unclear. In both cases, you can reach out. Whether it is a new build, improving an existing site, or choosing the right digital product, clarifying the problem together is often the most valuable first step."}
                                    </p>
                                    <div className="mt-6">
                                        <Link href="/dijital-urunler" className="btn-primary inline-flex">
                                            {isTr ? "Dijital Ürünleri İncele" : "Explore Digital Products"} <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </BlockReveal>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
