import type { Metadata } from "next";
import { servicesData } from "@/lib/servicesData";

/* ── Known service metadata ──────────────────────────────────────
   Keyed by slug; each entry has Turkish (tr) and English (en) variants.
   Descriptions are written for indexability without keyword-stuffing.
────────────────────────────────────────────────────────────────── */
const SERVICE_META: Record<string, { tr: { title: string; desc: string }; en: { title: string; desc: string } }> = {
    "web-ve-uygulama-gelistirme": {
        tr: {
            title: "Web ve Uygulama Geliştirme",
            desc:  "Kurumsal web siteleri, SaaS platformları ve mobil uyumlu uygulamalar geliştiriyoruz. Hızlı, güvenli ve ölçeklenebilir dijital çözümler için ZYGSOFT.",
        },
        en: {
            title: "Web and Application Development",
            desc:  "ZYGSOFT builds corporate websites, SaaS platforms, and mobile-ready applications — fast, secure, and scalable digital solutions tailored to your business.",
        },
    },
    "sosyal-medya-yonetimi": {
        tr: {
            title: "Sosyal Medya Yönetimi",
            desc:  "Stratejik ve ölçülebilir sosyal medya yönetimi hizmeti. Instagram, LinkedIn ve diğer platformlarda markanızı güçlendirin — ZYGSOFT dijital ajans.",
        },
        en: {
            title: "Social Media Management",
            desc:  "Strategic, measurable social media management across Instagram, LinkedIn, and more. Grow your brand presence with ZYGSOFT's digital agency services.",
        },
    },
    "marka-kimligi-ve-grafik-tasarim": {
        tr: {
            title: "Marka Kimliği ve Grafik Tasarım",
            desc:  "Unutulmaz logo, kurumsal kimlik ve görsel tasarım hizmetleri. Markanızın özünü yansıtan profesyonel grafik tasarım çözümleri — ZYGSOFT.",
        },
        en: {
            title: "Brand Identity and Graphic Design",
            desc:  "Memorable logos, corporate identity, and visual design services. ZYGSOFT creates professional graphic design solutions that reflect your brand's essence.",
        },
    },
    "dijital-strateji-ve-pazarlama": {
        tr: {
            title: "Dijital Strateji ve Pazarlama",
            desc:  "Veri odaklı dijital büyüme ve performans pazarlaması. SEO, içerik stratejisi ve dijital reklam yönetimiyle markanızı büyütün — ZYGSOFT.",
        },
        en: {
            title: "Digital Strategy and Marketing",
            desc:  "Data-driven digital growth and performance marketing. Scale your brand with SEO, content strategy, and digital advertising managed by ZYGSOFT.",
        },
    },
    "hedef-kitle-analizi": {
        tr: {
            title: "Hedef Kitle Analizi",
            desc:  "Müşterilerinizi yakından tanıyın ve satışlarınızı artırın. Demografik analiz, kullanıcı araştırması ve segment stratejileri — ZYGSOFT.",
        },
        en: {
            title: "Target Audience Analysis",
            desc:  "Understand your customers deeply and grow your sales. Demographic analysis, user research, and segmentation strategies from ZYGSOFT.",
        },
    },
};

const FALLBACK = {
    tr: { title: "Hizmetlerimiz", desc: "ZYGSOFT'un yazılım, tasarım ve dijital pazarlama hizmetleri hakkında bilgi alın." },
    en: { title: "Our Services",  desc: "Learn about ZYGSOFT's software, design, and digital marketing services." },
};

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
    const { locale, slug } = await params;
    const isEn = locale === "en";
    const lang = isEn ? "en" : "tr";

    const entry  = SERVICE_META[slug]?.[lang] ?? FALLBACK[lang];
    const canonical = isEn ? `/en/services/${slug}` : `/services/${slug}`;

    return {
        title:       entry.title,
        description: entry.desc,
        alternates: {
            canonical,
            languages: {
                tr: `/services/${slug}`,
                en: `/en/services/${slug}`,
            },
        },
        openGraph: {
            title:       `${entry.title} | ZYGSOFT`,
            description: entry.desc,
            url:         canonical,
            type:        "website",
        },
    };
}

export default async function ServiceSlugLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale, slug } = await params;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zygsoft.com";
    const isEn = locale === "en";
    const lang = isEn ? "en" : "tr";
    const prefix = isEn ? `${siteUrl}/en` : siteUrl;

    const serviceEntry = servicesData[slug];
    const meta = SERVICE_META[slug]?.[lang] ?? FALLBACK[lang];
    const serviceTitle = serviceEntry?.[lang]?.title ?? meta.title;
    const serviceDesc  = serviceEntry?.[lang]?.subtitle ?? meta.desc;

    const pageUrl     = `${prefix}/services/${slug}`;
    const servicesUrl = `${prefix}/services`;
    const homeUrl     = prefix;

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Service",
                "@id": pageUrl,
                "name": serviceTitle,
                "description": serviceDesc,
                "provider": {
                    "@type": "Organization",
                    "@id": `${siteUrl}/#organization`,
                    "name": "ZYGSOFT",
                },
                "url": pageUrl,
                "areaServed": {
                    "@type": "Country",
                    "name": "Turkey",
                },
                "serviceType": "Software & Digital Services",
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": isEn ? "Home" : "Ana Sayfa",
                        "item": homeUrl,
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": isEn ? "Services" : "Hizmetler",
                        "item": servicesUrl,
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": serviceTitle,
                        "item": pageUrl,
                    },
                ],
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {children}
        </>
    );
}
