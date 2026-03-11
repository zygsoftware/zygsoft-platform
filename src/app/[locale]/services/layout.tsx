import type { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const isEn = locale === "en";

    const title = isEn ? "Our Services" : "Hizmetlerimiz";
    const description = isEn
        ? "ZYGSOFT offers end-to-end digital services: web and application development, social media management, brand identity design, digital strategy, and audience analysis."
        : "ZYGSOFT; web ve uygulama geliştirme, sosyal medya yönetimi, marka kimliği tasarımı, dijital strateji ve hedef kitle analizi alanlarında uçtan uca hizmet sunar.";
    const canonical = isEn ? "/en/services" : "/services";

    return {
        title,
        description,
        alternates: {
            canonical,
            languages: { tr: "/services", en: "/en/services" },
        },
        openGraph: {
            title:       `${title} | ZYGSOFT`,
            description,
            url:         canonical,
            type:        "website",
        },
    };
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
