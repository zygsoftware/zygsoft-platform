import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zygsoft.com";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const isEn = locale === "en";

    const title = isEn
        ? "UYAP Document Tools – DOCX → UDF, PDF Merge, OCR | ZYGSOFT"
        : "UYAP Belge Araçları – DOCX → UDF, PDF Birleştirme, OCR | ZYGSOFT";
    const description = isEn
        ? "Document preparation tools for UYAP. DOCX → UDF conversion, PDF merge, OCR text extraction and batch document tools in one package."
        : "UYAP için belge hazırlama araçları. DOCX → UDF dönüştürme, PDF birleştirme, OCR metin çıkarma ve toplu belge araçları tek pakette.";
    const canonical = isEn ? "/en/dijital-urunler/hukuk-araclari-paketi" : "/dijital-urunler/hukuk-araclari-paketi";

    return {
        title,
        description,
        alternates: {
            canonical,
            languages: { tr: "/dijital-urunler/hukuk-araclari-paketi", en: "/en/dijital-urunler/hukuk-araclari-paketi" },
        },
        openGraph: {
            title: `${title}`,
            description,
            url: `${SITE_URL}${canonical}`,
            type: "website",
        },
    };
}

const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Hukuk Araçları Paketi",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "UYAP için belge hazırlama araçları. DOCX → UDF dönüştürme, PDF birleştirme, OCR metin çıkarma ve toplu belge araçları tek pakette.",
    offers: {
        "@type": "Offer",
        price: "3000",
        priceCurrency: "TRY",
        priceValidUntil: "2026-12-31",
    },
    featureList: [
        "DOCX → UDF dönüştürücü",
        "TIFF → PDF",
        "Görsel → PDF",
        "PDF Birleştir",
        "PDF Böl",
        "PDF → Görsel",
        "OCR Metin çıkarma",
        "Toplu belge dönüştürme",
    ],
};

export default function HukukAraclariPaketiLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
            />
            {children}
        </>
    );
}
