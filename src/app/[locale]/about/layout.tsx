import type { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const isEn = locale === "en";

    const title = isEn ? "About Us" : "Hakkımızda";
    const description = isEn
        ? "Founded in 2019, ZYGSOFT is an Antalya-based software company delivering web development, digital transformation, and automation solutions globally."
        : "2019'da kurulan ZYGSOFT, Antalya merkezli olarak global ölçekte web geliştirme, dijital dönüşüm ve otomasyon çözümleri sunan bir yazılım şirketidir.";
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
