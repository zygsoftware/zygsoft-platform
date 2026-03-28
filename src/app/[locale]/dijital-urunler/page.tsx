"use client";

import { motion } from "framer-motion";
import {
    ArrowRight,
    Boxes,
    FileText,
    Layers,
    ShieldCheck,
    Sparkles,
    Wand2,
    Zap,
} from "lucide-react";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PaymentModalTrigger } from "@/components/payment/PaymentModalTrigger";
import { PRODUCTS, type ProductSlug } from "@/components/payment/payment-config";

const PRODUCT_DETAILS: Partial<
    Record<
        ProductSlug,
        {
            href?: string;
            accessHref?: string;
            categoryTr: string;
            categoryEn: string;
            badgeTr: string;
            badgeEn: string;
            highlightsTr: string[];
            highlightsEn: string[];
        }
    >
> = {
    "legal-toolkit": {
        href: "/dijital-urunler/hukuk-araclari-paketi",
        accessHref: "/dashboard/tools",
        categoryTr: "Belge otomasyonu",
        categoryEn: "Document automation",
        badgeTr: "Canlı ürün",
        badgeEn: "Live product",
        highlightsTr: ["UYAP uyumlu akış", "OCR ve toplu işlemler", "Yıllık lisans"],
        highlightsEn: ["UYAP-ready workflow", "OCR and bulk actions", "Annual license"],
    },
};

export default function DijitalUrunlerPage() {
    const locale = useLocale();
    const isTr = locale === "tr";
    const { data: session } = useSession();
    const activeProductSlugs = ((session?.user as { activeProductSlugs?: string[] } | undefined)?.activeProductSlugs ?? []);

    const copy = isTr
        ? {
              badge: "Dijital ürün kataloğu",
              title: "Tek ürüne değil, büyüyen bir ürün ekosistemine hazırlanan mağaza.",
              desc: "Bu alan artık yalnızca Hukuk Araçları Paketi için değil. Yeni dijital ürünler eklendikçe aynı mağaza yapısı içinde listelenecek, satın alınacak ve yönetilecek.",
              primaryCta: "Ürünleri İncele",
              secondaryCta: "Satın Alma Akışı",
              liveTitle: "Canlı ürünler",
              liveDesc: "Şu anda satışta olan ürünler. Yeni ürün eklediğinizde bu alan otomatik olarak genişler.",
              processTitle: "Satın alma ve erişim akışı",
              processDesc: "Her yeni ürün için aynı net satın alma yapısı kullanılabilir.",
              buyNow: "Şimdi Satın Al",
              viewDetails: "Detayları Gör",
              goToProduct: "Ürüne Git",
              comingSoon: "Yakında",
              pricing: "Fiyatı Gör",
              accessLabel: "Erişim",
              annual: "yıllık",
              active: "Aktif ürün",
          }
        : {
              badge: "Digital product catalog",
              title: "A storefront built for a growing product ecosystem, not a single package.",
              desc: "This page is no longer locked to one product. As new digital products are added, they can be listed, sold, and managed through the same storefront structure.",
              primaryCta: "Explore Products",
              secondaryCta: "Purchase Flow",
              liveTitle: "Live products",
              liveDesc: "Products currently available for purchase. This section expands automatically as you add more items.",
              processTitle: "Purchase and access flow",
              processDesc: "The same clean purchase pattern can support every new product you launch.",
              buyNow: "Buy Now",
              viewDetails: "View Details",
              goToProduct: "Open Product",
              comingSoon: "Coming soon",
              pricing: "View Pricing",
              accessLabel: "Access",
              annual: "annual",
              active: "Active product",
          };

    const liveProducts = (Object.entries(PRODUCTS) as [ProductSlug, (typeof PRODUCTS)[ProductSlug]][]).map(([slug, product]) => {
        const details = PRODUCT_DETAILS[slug];
        const owned = activeProductSlugs.includes(slug);

        return {
            slug,
            title: isTr ? product.titleTr : product.titleEn,
            description: isTr ? product.descTr : product.descEn,
            features: isTr ? product.featuresTr : product.featuresEn,
            priceLabel: `₺${product.price.toLocaleString(isTr ? "tr-TR" : "en-US")}`,
            badge: details ? (isTr ? details.badgeTr : details.badgeEn) : copy.active,
            category: details ? (isTr ? details.categoryTr : details.categoryEn) : copy.badge,
            highlights: details ? (isTr ? details.highlightsTr : details.highlightsEn) : (isTr ? product.featuresTr : product.featuresEn),
            href: details?.href,
            accessHref: details?.accessHref,
            owned,
        };
    });

    const storeJsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: isTr ? "ZYGSOFT Dijital Ürünler" : "ZYGSOFT Digital Products",
        itemListElement: liveProducts.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: product.href ? `https://www.zygsoft.com${product.href}` : "https://www.zygsoft.com/dijital-urunler",
            name: product.title,
        })),
    };

    const processItems = isTr
        ? [
              { step: "01", title: "Ürünü seçin", desc: "Katalogtan uygun ürünü inceleyin ve satın alma akışını başlatın.", icon: <Boxes size={22} /> },
              { step: "02", title: "Ödemeyi tamamlayın", desc: "Ödeme popup’ında banka havalesiyle işlemi kısa adımlarda bitirin.", icon: <FileText size={22} /> },
              { step: "03", title: "Onay ve erişim", desc: "Bildirim incelendikten sonra ürün hesabınıza tanımlanır.", icon: <ShieldCheck size={22} /> },
          ]
        : [
              { step: "01", title: "Choose a product", desc: "Review the catalog and start the purchase flow for the right product.", icon: <Boxes size={22} /> },
              { step: "02", title: "Complete payment", desc: "Finish the bank transfer flow in a short modal checkout.", icon: <FileText size={22} /> },
              { step: "03", title: "Approval and access", desc: "After review, the product is assigned to your account.", icon: <ShieldCheck size={22} /> },
          ];

    return (
        <div className="min-h-screen bg-[#fafafc] font-sans text-[#343131] selection:bg-[#e6c800] selection:text-[#343131]">
            <Header />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
            />

            <main className="relative overflow-hidden pb-28 pt-32">
                <div className="pointer-events-none absolute right-0 top-0 h-[700px] w-[700px] translate-x-1/3 -translate-y-1/3 rounded-full bg-gradient-to-bl from-[#e6c800]/8 to-transparent blur-[120px]" />
                <div className="pointer-events-none absolute bottom-0 left-0 h-[540px] w-[540px] -translate-x-1/3 translate-y-1/3 rounded-full bg-gradient-to-tr from-slate-200/70 to-transparent blur-[100px]" />

                <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-24 px-6">
                    <section className="mx-auto max-w-4xl text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#343131]/10 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] shadow-sm">
                                <span className="h-2 w-2 rounded-full bg-[#e6c800]" />
                                {copy.badge}
                            </div>
                            <h1 className="text-4xl font-display font-black leading-[1.05] tracking-tight text-[#343131] md:text-6xl">
                                {copy.title}
                            </h1>
                            <p className="mx-auto mt-6 max-w-3xl text-lg font-medium leading-8 text-[#343131]/64 md:text-xl">
                                {copy.desc}
                            </p>
                            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <a
                                    href="#products"
                                    className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-[#343131] px-7 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-white transition-all hover:scale-[1.02] hover:bg-black active:scale-[0.98]"
                                >
                                    {copy.primaryCta}
                                    <ArrowRight size={16} />
                                </a>
                                <a
                                    href="#purchase-flow"
                                    className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl border border-[#343131]/10 bg-white px-7 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-[#343131] transition-colors hover:border-[#e6c800]/30 hover:bg-[#e6c800]/10"
                                >
                                    {copy.secondaryCta}
                                </a>
                            </div>
                        </motion.div>
                    </section>

                    <section id="products" className="space-y-8">
                        <div className="max-w-3xl">
                            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#343131]/40">{copy.liveTitle}</p>
                            <h2 className="mt-3 text-3xl font-display font-black tracking-tight text-[#343131] md:text-4xl">
                                {copy.liveTitle}
                            </h2>
                            <p className="mt-4 text-base font-medium leading-7 text-[#343131]/64">
                                {copy.liveDesc}
                            </p>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            {liveProducts.map((product, index) => (
                                <motion.article
                                    key={product.slug}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-80px" }}
                                    transition={{ duration: 0.55, delay: index * 0.08 }}
                                    className="group rounded-[2rem] border border-[#343131]/[0.06] bg-white p-8 shadow-[0_16px_48px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-[#343131]/10 bg-[#fafafc] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#343131]/72">
                                            <Sparkles size={12} className="text-[#e6c800]" />
                                            {product.badge}
                                        </div>
                                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#343131]/38">
                                            {product.category}
                                        </div>
                                    </div>

                                    <div className="mt-7 space-y-4">
                                        <div>
                                            <h3 className="text-3xl font-display font-black tracking-tight text-[#343131]">
                                                {product.title}
                                            </h3>
                                            <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-[#343131]/64">
                                                {product.description}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2.5">
                                            {product.highlights.map((highlight) => (
                                                <span
                                                    key={highlight}
                                                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#343131]/8 bg-[#fafafc] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#343131]"
                                                >
                                                    <span className="h-2 w-2 rounded-full bg-[#e6c800]" />
                                                    {highlight}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-3">
                                            {product.features.map((feature) => (
                                                <div
                                                    key={feature}
                                                    className="rounded-[1.35rem] border border-[#343131]/8 bg-[#fcfcfe] px-4 py-4"
                                                >
                                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#343131]/4 text-[#343131]/58">
                                                        {feature.toLowerCase().includes("ocr") ? <Wand2 size={18} /> : feature.toLowerCase().includes("sınırsız") || feature.toLowerCase().includes("unlimited") ? <Zap size={18} /> : <Layers size={18} />}
                                                    </div>
                                                    <p className="text-sm font-black leading-6 text-[#343131]">{feature}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-8 flex flex-col gap-5 border-t border-[#343131]/8 pt-6 lg:flex-row lg:items-end lg:justify-between">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#343131]/38">{copy.pricing}</span>
                                            <span className="text-3xl font-display font-black text-[#343131]">
                                                {product.priceLabel}
                                                <span className="ml-2 text-sm font-bold uppercase tracking-[0.12em] text-[#343131]/42">
                                                    / {copy.annual}
                                                </span>
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-3 sm:flex-row">
                                            {product.owned && product.accessHref ? (
                                                <Link
                                                    href={product.accessHref}
                                                    className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-[#343131] px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all hover:scale-[1.02] hover:bg-black active:scale-[0.98]"
                                                >
                                                    {copy.goToProduct}
                                                    <ArrowRight size={16} />
                                                </Link>
                                            ) : (
                                                <PaymentModalTrigger
                                                    productId={product.slug}
                                                    className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-[#343131] px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all hover:scale-[1.02] hover:bg-black active:scale-[0.98]"
                                                >
                                                    {copy.buyNow}
                                                    <ArrowRight size={16} />
                                                </PaymentModalTrigger>
                                            )}

                                            {product.href ? (
                                                <Link
                                                    href={product.href}
                                                    className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl border border-[#343131]/10 bg-white px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#343131] transition-colors hover:border-[#e6c800]/35 hover:bg-[#e6c800]/10"
                                                >
                                                    {copy.viewDetails}
                                                </Link>
                                            ) : null}
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    </section>

                    <section id="purchase-flow" className="space-y-8">
                        <div className="max-w-3xl">
                            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#343131]/40">{copy.processTitle}</p>
                            <h2 className="mt-3 text-3xl font-display font-black tracking-tight text-[#343131] md:text-4xl">
                                {copy.processTitle}
                            </h2>
                            <p className="mt-4 text-base font-medium leading-7 text-[#343131]/64">
                                {copy.processDesc}
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {processItems.map((item, index) => (
                                <motion.div
                                    key={item.step}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-60px" }}
                                    transition={{ duration: 0.45, delay: index * 0.08 }}
                                    className="rounded-[1.9rem] border border-[#343131]/[0.06] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.04)]"
                                >
                                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fafafc] text-[#343131]/46">
                                        {item.icon}
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#e6c800]">{item.step}</div>
                                    <h3 className="mt-3 text-xl font-black text-[#343131]">{item.title}</h3>
                                    <p className="mt-3 text-sm font-medium leading-7 text-[#343131]/62">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
