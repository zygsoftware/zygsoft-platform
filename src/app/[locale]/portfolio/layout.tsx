import type { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const isEn = locale === "en";

    const title = isEn ? "Portfolio" : "Portfolyo";
    const description = isEn
        ? "Explore ZYGSOFT's project portfolio — selected web applications, software platforms, and digital products delivered for clients across Turkey and globally."
        : "ZYGSOFT proje portföyünü keşfedin — Türkiye ve dünya genelindeki müşteriler için hayata geçirilmiş web uygulamaları, yazılım platformları ve dijital ürünler.";
    const canonical = isEn ? "/en/projects" : "/projeler";

    return {
        title,
        description,
        alternates: {
            canonical,
            languages: { tr: "/projeler", en: "/en/projects" },
        },
        openGraph: {
            title:       `${title} | ZYGSOFT`,
            description,
            url:         canonical,
            type:        "website",
        },
    };
}

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
