"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
    ArrowRight,
    BadgeCheck,
    Boxes,
    Check,
    ChevronDown,
    Scale,
    Search,
    SlidersHorizontal,
    Sparkles,
    Store,
    type LucideIcon,
} from "lucide-react";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PaymentModalTrigger } from "@/components/payment/PaymentModalTrigger";
import { PRODUCTS, type ProductSlug } from "@/components/payment/payment-config";

const EASE = [0.22, 1, 0.36, 1] as const;

type SortKey = "featured" | "priceAsc" | "priceDesc" | "name";

type ProductSessionUser = {
    activeProductSlugs?: string[];
};

type CatalogProduct = {
    slug: ProductSlug;
    title: string;
    description: string;
    features: string[];
    price: number;
    priceLabel: string;
    badge: string;
    category: string;
    collection: string;
    highlights: string[];
    href?: string;
    accessHref?: string;
    owned: boolean;
    featuredRank: number;
    icon: LucideIcon;
    previewTitle: string;
    previewText: string;
    previewClassName: string;
};

const PRODUCT_DETAILS: Partial<
    Record<
        ProductSlug,
        {
            href?: string;
            accessHref?: string;
            categoryTr: string;
            categoryEn: string;
            collectionTr: string;
            collectionEn: string;
            badgeTr: string;
            badgeEn: string;
            highlightsTr: string[];
            highlightsEn: string[];
            previewTitleTr: string;
            previewTitleEn: string;
            previewTextTr: string;
            previewTextEn: string;
            icon: LucideIcon;
            previewClassName: string;
        }
    >
> = {
    "legal-toolkit": {
        href: "/dijital-urunler/hukuk-araclari-paketi",
        accessHref: "/document-tools",
        categoryTr: "Belge otomasyonu",
        categoryEn: "Document automation",
        collectionTr: "Hukuk operasyonu",
        collectionEn: "Legal operations",
        badgeTr: "En çok tercih edilen",
        badgeEn: "Best seller",
        highlightsTr: ["11 araç tek lisans", "UYAP uyumlu", "OCR ve PDF akışları"],
        highlightsEn: ["11 tools in one license", "UYAP-ready", "OCR and PDF workflows"],
        previewTitleTr: "Belgeleri daha hızlı hazırlayın ve yönetin",
        previewTitleEn: "Prepare and manage documents faster",
        previewTextTr: "Yüksek frekanslı hukuk operasyonları için tasarlanmış premium araç seti.",
        previewTextEn: "A premium toolkit built for high-frequency legal operations.",
        icon: Scale,
        previewClassName:
            "bg-[radial-gradient(circle_at_top_left,rgba(230,200,0,0.30),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(52,49,49,0.08),transparent_34%),linear-gradient(135deg,#fffdf9_0%,#f6f0e0_48%,#ebe2c9_100%)]",
    },
};

export default function DijitalUrunlerPage() {
    const locale = useLocale();
    const isTr = locale === "tr";
    const prefersReducedMotion = !!useReducedMotion();
    const { data: session } = useSession();
    const sessionUser = session?.user as ProductSessionUser | undefined;
    const activeProductSlugs = sessionUser?.activeProductSlugs ?? [];

    const [query, setQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedAvailability, setSelectedAvailability] = useState<"all" | "owned" | "buy">("all");
    const [sortKey, setSortKey] = useState<SortKey>("featured");

    const copy = isTr
        ? {
              eyebrow: "Dijital mağaza",
              title: "Dijital ürün mağazası",
              desc: "ZYGSOFT dijital ürünlerini temiz, modern ve satın alma odaklı bir mağaza düzeninde keşfedin.",
              heroCta: "Ürünleri İncele",
              heroStatProducts: "ürün",
              heroStatCategories: "kategori",
              heroStatCollection: "küratörlü mağaza",
              toolbarTitle: "Katalog",
              toolbarDesc: "Arayın ve sıralayın.",
              searchPlaceholder: "Ürün veya özellik ara",
              filterTitle: "Filtreler",
              categoryLabel: "Kategori",
              availabilityLabel: "Durum",
              sortLabel: "Sıralama",
              featuredSort: "Öne çıkanlar",
              priceAscSort: "Fiyat: artan",
              priceDescSort: "Fiyat: azalan",
              nameSort: "İsme göre",
              all: "Tümü",
              owned: "Sahip olduklarım",
              buyable: "Satın alınabilir",
              resultLabel: "ürün",
              reset: "Temizle",
              priceLabel: "Fiyat",
              annual: "yıl",
              includes: "Dahil olanlar",
              buyNow: "Satın Al",
              goToProduct: "Ürünü Aç",
              viewDetails: "Detayları Gör",
              active: "Aktif erişim",
              noResultsTitle: "Uygun ürün bulunamadı",
              noResultsDesc: "Aramanızı sadeleştirerek veya filtreleri temizleyerek tekrar deneyin.",
              previewMeta: "Küratörlü koleksiyon",
              ownedStatus: "Hesabınızda aktif",
          }
        : {
              eyebrow: "Digital store",
              title: "Digital product store",
              desc: "Browse ZYGSOFT digital products in a clean, modern storefront designed for faster buying.",
              heroCta: "Browse Products",
              heroStatProducts: "products",
              heroStatCategories: "categories",
              heroStatCollection: "curated store",
              toolbarTitle: "Catalog",
              toolbarDesc: "Search and sort.",
              searchPlaceholder: "Search product or feature",
              filterTitle: "Filters",
              categoryLabel: "Category",
              availabilityLabel: "Status",
              sortLabel: "Sort",
              featuredSort: "Featured",
              priceAscSort: "Price: ascending",
              priceDescSort: "Price: descending",
              nameSort: "Name",
              all: "All",
              owned: "Owned",
              buyable: "Available to buy",
              resultLabel: "products",
              reset: "Clear",
              priceLabel: "Price",
              annual: "year",
              includes: "Included",
              buyNow: "Buy Now",
              goToProduct: "Open Product",
              viewDetails: "View Details",
              active: "Active access",
              noResultsTitle: "No matching products",
              noResultsDesc: "Try simplifying your search or clearing the filters.",
              previewMeta: "Curated collection",
              ownedStatus: "Already active on your account",
          };

    const products: CatalogProduct[] = (Object.entries(PRODUCTS) as [ProductSlug, (typeof PRODUCTS)[ProductSlug]][]).map(
        ([slug, product], index) => {
            const details = PRODUCT_DETAILS[slug];

            return {
                slug,
                title: isTr ? product.titleTr : product.titleEn,
                description: isTr ? product.descTr : product.descEn,
                features: [...(isTr ? product.featuresTr : product.featuresEn)],
                price: product.price,
                priceLabel: `₺${product.price.toLocaleString(isTr ? "tr-TR" : "en-US")}`,
                badge: details ? (isTr ? details.badgeTr : details.badgeEn) : copy.featuredSort,
                category: details ? (isTr ? details.categoryTr : details.categoryEn) : copy.categoryLabel,
                collection: details ? (isTr ? details.collectionTr : details.collectionEn) : copy.previewMeta,
                highlights: details ? [...(isTr ? details.highlightsTr : details.highlightsEn)] : [...(isTr ? product.featuresTr : product.featuresEn)],
                href: details?.href,
                accessHref: details?.accessHref,
                owned: activeProductSlugs.includes(slug),
                featuredRank: index,
                icon: details?.icon ?? Boxes,
                previewTitle: details ? (isTr ? details.previewTitleTr : details.previewTitleEn) : (isTr ? product.titleTr : product.titleEn),
                previewText: details ? (isTr ? details.previewTextTr : details.previewTextEn) : (isTr ? product.descTr : product.descEn),
                previewClassName:
                    details?.previewClassName ??
                    "bg-[radial-gradient(circle_at_top_left,rgba(230,200,0,0.18),transparent_34%),linear-gradient(135deg,#fffdfa_0%,#f8f2e4_55%,#eee3cb_100%)]",
            };
        }
    );

    const categories = Array.from(new Set(products.map((product) => product.category)));
    const normalizedQuery = query.trim().toLocaleLowerCase(isTr ? "tr" : "en");

    let filteredProducts = products.filter((product) => {
        const matchesQuery =
            normalizedQuery.length === 0 ||
            product.title.toLocaleLowerCase(isTr ? "tr" : "en").includes(normalizedQuery) ||
            product.description.toLocaleLowerCase(isTr ? "tr" : "en").includes(normalizedQuery) ||
            product.features.some((feature) => feature.toLocaleLowerCase(isTr ? "tr" : "en").includes(normalizedQuery)) ||
            product.highlights.some((highlight) => highlight.toLocaleLowerCase(isTr ? "tr" : "en").includes(normalizedQuery));
        const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
        const matchesAvailability =
            selectedAvailability === "all" ||
            (selectedAvailability === "owned" && product.owned) ||
            (selectedAvailability === "buy" && !product.owned);

        return matchesQuery && matchesCategory && matchesAvailability;
    });

    filteredProducts = [...filteredProducts].sort((a, b) => {
        if (sortKey === "priceAsc") return a.price - b.price;
        if (sortKey === "priceDesc") return b.price - a.price;
        if (sortKey === "name") return a.title.localeCompare(b.title, isTr ? "tr" : "en");
        return a.featuredRank - b.featuredRank;
    });

    const storeJsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: isTr ? "ZYGSOFT Dijital Ürünler" : "ZYGSOFT Digital Products",
        itemListElement: products.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: product.href ? `https://www.zygsoft.com${product.href}` : "https://www.zygsoft.com/dijital-urunler",
            name: product.title,
        })),
    };

    const resetFilters = () => {
        setQuery("");
        setSelectedCategory("all");
        setSelectedAvailability("all");
        setSortKey("featured");
    };

    return (
        <div className="min-h-screen bg-[#f6f1e8] font-sans text-[#262522] selection:bg-[#e6c800] selection:text-[#262522]">
            <Header />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }} />

            <main className="relative overflow-hidden pb-24 pt-28 md:pt-32">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(230,200,0,0.14),transparent_24%),radial-gradient(circle_at_top_right,rgba(41,40,37,0.08),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.75),rgba(246,241,232,0))]" />
                <div className="pointer-events-none absolute left-1/2 top-28 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-white/40 blur-3xl" />

                <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-6">
                    <section>
                        <motion.div
                            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                            transition={prefersReducedMotion ? undefined : { duration: 0.5, ease: EASE }}
                            className="rounded-[1.8rem] border border-white/20 bg-white/66 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)] backdrop-blur-xl md:p-7"
                        >
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                                <div className="max-w-3xl">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-[#343131]/10 bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#343131]">
                                        <Store size={13} className="text-[#e6c800]" />
                                        {copy.eyebrow}
                                    </div>
                                    <h1 className="mt-4 max-w-3xl text-[clamp(2.1rem,4.4vw,3.8rem)] font-display font-black leading-[0.96] tracking-tight text-[#262522]">
                                        {copy.title}
                                    </h1>
                                    <p className="mt-3 max-w-2xl text-[15px] font-medium leading-7 text-[#343131]/64 md:text-base">
                                        {copy.desc}
                                    </p>
                                </div>

                                <a
                                    href="#catalog"
                                    className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-[#262522] px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.18em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_18px_36px_rgba(38,37,34,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e6c800] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f1e8]"
                                >
                                    <span className="text-white">{copy.heroCta}</span>
                                    <ArrowRight size={16} className="text-white" />
                                </a>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2.5 border-t border-[#343131]/8 pt-5">
                                <div className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#343131]/10 bg-[#faf6ee] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#343131]/68">
                                    <Boxes size={13} className="text-[#e6c800]" />
                                    {products.length} {copy.heroStatProducts}
                                </div>
                                <div className="inline-flex min-h-10 items-center rounded-full border border-[#343131]/10 bg-white/74 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#343131]/62">
                                    {categories.length} {copy.heroStatCategories}
                                </div>
                                <div className="inline-flex min-h-10 items-center rounded-full border border-[#343131]/10 bg-white/74 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#343131]/62">
                                    {copy.heroStatCollection}
                                </div>
                            </div>
                        </motion.div>
                    </section>

                    <section id="catalog" className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                        <aside className="lg:sticky lg:top-28 lg:self-start">
                            <div className="rounded-[2rem] border border-white/20 bg-white/72 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.05)] backdrop-blur-xl md:p-6">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#343131]/46">
                                    <SlidersHorizontal size={13} className="text-[#e6c800]" />
                                    {copy.filterTitle}
                                </div>

                                <div className="mt-5">
                                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#343131]/42">
                                        {copy.categoryLabel}
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {[copy.all, ...categories].map((item) => {
                                            const isActive = (item === copy.all ? "all" : item) === selectedCategory;

                                            return (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    onClick={() => setSelectedCategory(item === copy.all ? "all" : item)}
                                                    className={`inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition-all duration-300 ${
                                                        isActive
                                                            ? "border-[#262522] bg-[#262522] text-white shadow-[0_14px_26px_rgba(38,37,34,0.14)]"
                                                            : "border-[#343131]/10 bg-white/78 text-[#343131]/68 hover:border-[#e6c800]/30 hover:bg-[#faf6ee]"
                                                    }`}
                                                >
                                                    <span className={isActive ? "text-white" : ""}>{item}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#343131]/42">
                                        {copy.availabilityLabel}
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        {[
                                            { value: "all", label: copy.all },
                                            { value: "owned", label: copy.owned },
                                            { value: "buy", label: copy.buyable },
                                        ].map((option) => {
                                            const isActive = selectedAvailability === option.value;

                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => setSelectedAvailability(option.value as "all" | "owned" | "buy")}
                                                    className={`flex min-h-11 w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-[11px] font-black uppercase tracking-[0.16em] transition-all duration-300 ${
                                                        isActive
                                                            ? "border-[#262522] bg-[#262522] text-white shadow-[0_14px_26px_rgba(38,37,34,0.14)]"
                                                            : "border-[#343131]/10 bg-white/78 text-[#343131]/70 hover:border-[#e6c800]/30 hover:bg-[#faf6ee]"
                                                    }`}
                                                >
                                                    <span className={isActive ? "text-white" : ""}>{option.label}</span>
                                                    {isActive ? <BadgeCheck size={14} className="text-[#e6c800]" /> : null}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-[#343131]/10 bg-white/78 px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-[#262522] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e6c800]/30 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e6c800] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                                >
                                    {copy.reset}
                                </button>
                            </div>
                        </aside>

                        <div className="space-y-6">
                            <section className="rounded-[2rem] border border-white/20 bg-white/72 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.05)] backdrop-blur-xl md:p-6">
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#343131]/46">
                                            <Search size={13} className="text-[#e6c800]" />
                                            {copy.toolbarTitle}
                                        </div>
                                        <p className="mt-3 text-sm font-medium leading-6 text-[#343131]/64">{copy.toolbarDesc}</p>
                                    </div>

                                    <div className="inline-flex min-h-11 items-center rounded-full border border-[#343131]/10 bg-[#faf6ee] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#262522]">
                                        {filteredProducts.length} {copy.resultLabel}
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                                    <label className="relative block">
                                        <span className="sr-only">{copy.searchPlaceholder}</span>
                                        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#343131]/38" />
                                        <input
                                            value={query}
                                            onChange={(event) => setQuery(event.target.value)}
                                            placeholder={copy.searchPlaceholder}
                                            className="min-h-12 w-full rounded-2xl border border-[#343131]/10 bg-white/78 py-3 pl-11 pr-4 text-sm font-semibold text-[#262522] outline-none transition-all duration-300 placeholder:text-[#343131]/36 focus:border-[#e6c800]/35 focus:bg-white focus:ring-4 focus:ring-[#e6c800]/12"
                                        />
                                    </label>

                                    <SelectField
                                        ariaLabel={copy.sortLabel}
                                        value={sortKey}
                                        onChange={(value) => setSortKey(value as SortKey)}
                                        options={[
                                            { value: "featured", label: copy.featuredSort },
                                            { value: "priceAsc", label: copy.priceAscSort },
                                            { value: "priceDesc", label: copy.priceDescSort },
                                            { value: "name", label: copy.nameSort },
                                        ]}
                                    />
                                </div>
                            </section>

                            {filteredProducts.length === 0 ? (
                                <section className="rounded-[2rem] border border-[#343131]/8 bg-white/82 px-8 py-14 text-center shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                                    <h2 className="text-2xl font-display font-black text-[#262522]">{copy.noResultsTitle}</h2>
                                    <p className="mx-auto mt-3 max-w-xl text-base font-medium leading-7 text-[#343131]/62">{copy.noResultsDesc}</p>
                                </section>
                            ) : (
                                <section className="grid gap-6 lg:grid-cols-2">
                                    {filteredProducts.map((product, index) => (
                                        <motion.article
                                            key={product.slug}
                                            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
                                            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                                            viewport={prefersReducedMotion ? undefined : { once: true, margin: "-80px" }}
                                            transition={prefersReducedMotion ? undefined : { duration: 0.48, ease: EASE, delay: index * 0.05 }}
                                            className="group overflow-hidden rounded-[2rem] border border-[#343131]/8 bg-white/86 shadow-[0_18px_52px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_80px_rgba(15,23,42,0.1)]"
                                        >
                                            {/* The preview block gives each product a premium visual without depending on external assets. */}
                                            <div className={`relative overflow-hidden p-6 ${product.previewClassName}`}>
                                                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.75),transparent_28%)]" />

                                                <div className="relative flex items-start justify-between gap-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="inline-flex min-h-9 items-center rounded-full border border-[#343131]/10 bg-white/74 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#343131]/72">
                                                            {product.collection}
                                                        </span>
                                                        <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#343131]/10 bg-[#262522] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                                                            <Sparkles size={12} className="text-[#e6c800]" />
                                                            <span className="text-white">{product.badge}</span>
                                                        </span>
                                                    </div>
                                                    <div className="rounded-full border border-[#343131]/10 bg-white/72 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#343131]/62">
                                                        {product.category}
                                                    </div>
                                                </div>

                                                <div className="relative mt-10 flex items-start gap-4">
                                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] bg-[#262522] text-white shadow-[0_18px_40px_rgba(38,37,34,0.18)] transition-transform duration-300 group-hover:scale-[1.03]">
                                                        <product.icon size={30} />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <h2 className="text-[2rem] font-display font-black leading-tight tracking-tight text-[#262522]">
                                                            {product.title}
                                                        </h2>
                                                        <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-[#343131]/68">
                                                            {product.previewText}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
                                                    {product.highlights.slice(0, 3).map((highlight) => (
                                                        <div
                                                            key={highlight}
                                                            className="rounded-[1.15rem] border border-[#343131]/8 bg-white/72 px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-[#343131]/68 shadow-[0_10px_24px_rgba(15,23,42,0.03)]"
                                                        >
                                                            {highlight}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-6">
                                                <div className="flex items-start justify-between gap-4">
                                                    <p className="max-w-xl text-base font-medium leading-7 text-[#343131]/66">
                                                        {product.description}
                                                    </p>
                                                    <div className="shrink-0 rounded-[1.35rem] border border-[#343131]/8 bg-[#faf6ee] px-4 py-3 text-right">
                                                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#343131]/38">
                                                            {copy.priceLabel}
                                                        </div>
                                                        <div className="mt-2 text-[1.9rem] font-display font-black leading-none text-[#262522]">
                                                            {product.priceLabel}
                                                        </div>
                                                        <div className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#343131]/38">
                                                            / {copy.annual}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-5 rounded-[1.6rem] border border-[#343131]/8 bg-[#fcfaf5] p-5">
                                                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#343131]/38">
                                                        {copy.includes}
                                                    </div>
                                                    <div className="mt-4 grid gap-3">
                                                        {product.features.map((feature) => (
                                                            <div
                                                                key={feature}
                                                                className="flex items-start gap-3 border-b border-[#343131]/8 pb-3 last:border-b-0 last:pb-0"
                                                            >
                                                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e6c800]/14 text-[#262522]">
                                                                    <Check size={15} />
                                                                </div>
                                                                <p className="text-sm font-black leading-6 text-[#262522]">{feature}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="inline-flex items-center gap-2 rounded-full border border-[#343131]/10 bg-[#faf6ee] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#343131]/62">
                                                        <BadgeCheck size={14} className="text-[#e6c800]" />
                                                        {product.owned ? copy.ownedStatus : product.previewTitle}
                                                    </div>

                                                    <div className="flex flex-col gap-3 sm:flex-row">
                                                        {product.owned && product.accessHref ? (
                                                            <Link
                                                                href={product.accessHref}
                                                                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-[#262522] px-6 py-4 text-[11px] font-black uppercase tracking-[0.18em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_18px_36px_rgba(38,37,34,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e6c800] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                                                            >
                                                                <span className="text-white">{copy.goToProduct}</span>
                                                                <ArrowRight size={16} className="text-white" />
                                                            </Link>
                                                        ) : (
                                                            <PaymentModalTrigger
                                                                productId={product.slug}
                                                                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-[#262522] px-6 py-4 text-[11px] font-black uppercase tracking-[0.18em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_18px_36px_rgba(38,37,34,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e6c800] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                                                            >
                                                                <span className="text-white">{copy.buyNow}</span>
                                                                <ArrowRight size={16} className="text-white" />
                                                            </PaymentModalTrigger>
                                                        )}

                                                        {product.href ? (
                                                            <Link
                                                                href={product.href}
                                                                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#343131]/10 bg-white px-6 py-4 text-[11px] font-black uppercase tracking-[0.18em] text-[#262522] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e6c800]/32 hover:bg-[#e6c800]/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e6c800] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                                                            >
                                                                {copy.viewDetails}
                                                            </Link>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.article>
                                    ))}
                                </section>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function SelectField({
    ariaLabel,
    value,
    onChange,
    options,
}: {
    ariaLabel: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <label className="relative block">
            <span className="sr-only">{ariaLabel}</span>
            <select
                aria-label={ariaLabel}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="min-h-12 w-full appearance-none rounded-2xl border border-[#343131]/10 bg-white/78 px-4 py-3 pr-10 text-[11px] font-black uppercase tracking-[0.16em] text-[#262522] outline-none transition-all duration-300 focus:border-[#e6c800]/35 focus:bg-white focus:ring-4 focus:ring-[#e6c800]/12"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#343131]/42" />
        </label>
    );
}
