import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zygsoft.com";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const isEn = locale === "en";

    const title = isEn ? "Digital Products" : "Dijital Ürünler";
    const description = isEn
        ? "ZYGSOFT digital products — Legal Tools Suite for document workflows, UYAP conversion, PDF tools, and OCR."
        : "ZYGSOFT dijital ürünleri — belge iş akışları, UYAP dönüştürme, PDF araçları ve OCR için Hukuk Araçları Paketi.";
    const canonical = isEn ? "/en/dijital-urunler" : "/dijital-urunler";

    return {
        title,
        description,
        alternates: {
            canonical,
            languages: { tr: "/dijital-urunler", en: "/en/dijital-urunler" },
        },
        openGraph: {
            title:       `${title} | ZYGSOFT`,
            description,
            url:         canonical,
            type:        "website",
        },
    };
}

export default function DijitalUrunlerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
