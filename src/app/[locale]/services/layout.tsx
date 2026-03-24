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
        ? "ZYGSOFT offers end-to-end services across web development, social media, brand identity, digital growth strategy, and Google Ads plus Meta Pixel performance setup."
        : "ZYGSOFT; web geliştirme, sosyal medya yönetimi, marka kimliği, dijital büyüme stratejisi ve Google Ads ile Meta Pixel performans kurulumları dahil uçtan uca hizmet sunar.";
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
