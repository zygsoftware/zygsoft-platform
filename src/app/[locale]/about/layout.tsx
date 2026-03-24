import type { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const isEn = locale === "en";

    const title = isEn ? "About ZYGSOFT" : "ZYGSOFT Hakkında";
    const description = isEn
        ? "Learn how ZYGSOFT approaches software, digital products, SEO, performance, and conversion-focused growth for modern businesses."
        : "ZYGSOFT'un yazılım, dijital ürün, SEO, performans ve dönüşüm odaklı büyüme yaklaşımını yakından inceleyin.";
    const canonical = isEn ? "/en/about" : "/about";

    return {
        title,
        description,
        alternates: {
            canonical,
            languages: { tr: "/about", en: "/en/about" },
        },
        openGraph: {
            title:       `${title} | ZYGSOFT`,
            description,
            url:         canonical,
            type:        "website",
        },
    };
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
