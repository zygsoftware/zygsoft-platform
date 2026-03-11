import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zygsoft.com";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const isEn = locale === "en";

    const title = isEn ? "Products & Subscriptions" : "Ürünler ve Abonelikler";
    const description = isEn
        ? "Browse ZYGSOFT's software products and subscription plans — including the Legal UDF Toolkit, corporate web packages, and social media management plans."
        : "ZYGSOFT yazılım ürünlerini ve abonelik planlarını inceleyin — Hukuk UDF Dönüştürücü, kurumsal web paketi ve sosyal medya yönetimi planları dahil.";
    const canonical = isEn ? "/en/abonelikler" : "/abonelikler";

    return {
        title,
        description,
        alternates: {
            canonical,
            languages: { tr: "/abonelikler", en: "/en/abonelikler" },
        },
        openGraph: {
            title:       `${title} | ZYGSOFT`,
            description,
            url:         canonical,
            type:        "website",
        },
    };
}

export default async function AboneliklerLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const isEn    = locale === "en";
    const pageUrl = isEn ? `${SITE_URL}/en/abonelikler` : `${SITE_URL}/abonelikler`;

    // Only the UDF toolkit has a known fixed monthly price — other products are quote-based.
    const udfJsonLd = {
        "@context": "https://schema.org",
        "@type":    "Product",
        "@id":      `${pageUrl}#legal-toolkit`,
        "name":     isEn
            ? "Zygsoft Legal UDF Toolkit"
            : "Zygsoft Kapsamlı Hukuk Paketi",
        "description": isEn
            ? "Professional document management platform for lawyers and law firms: UDF conversion, OCR, AI-assisted case summary, KVKK redaction, and e-signature integration."
            : "Avukatlar ve hukuk büroları için profesyonel doküman yönetim platformu: UDF dönüştürme, OCR, yapay zeka ile dava özeti, KVKK sansürleme ve e-imza entegrasyonu.",
        "brand": {
            "@type": "Brand",
            "name":  "ZYGSOFT",
        },
        "offers": {
            "@type":         "Offer",
            "price":         "499",
            "priceCurrency": "TRY",
            "priceSpecification": {
                "@type":         "UnitPriceSpecification",
                "price":         "499",
                "priceCurrency": "TRY",
                "unitText":      "MON",
            },
            "availability": "https://schema.org/InStock",
            "url":          pageUrl,
            "seller": {
                "@type": "Organization",
                "@id":   `${SITE_URL}/#organization`,
                "name":  "ZYGSOFT",
            },
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(udfJsonLd) }}
            />
            {children}
        </>
    );
}
