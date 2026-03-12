import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zygsoft.com";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const isEn = locale === "en";

    const title = isEn ? "Blog & Insights" : "Blog & İçgörüler";
    const description = isEn
        ? "Explore ZYGSOFT's blog: in-depth articles on software development, web design, digital marketing, and technology trends from our expert team."
        : "ZYGSOFT Blog'unu keşfedin: yazılım geliştirme, web tasarımı, dijital pazarlama ve teknoloji trendlerine dair ekibimizden derinlemesine makaleler.";
    const canonical = isEn ? `${SITE_URL}/en/blog` : `${SITE_URL}/blog`;

    return {
        title,
        description,
        alternates: {
            canonical,
            languages: { tr: `${SITE_URL}/blog`, en: `${SITE_URL}/en/blog` },
        },
        openGraph: {
            title: `${title} | ZYGSOFT`,
            description,
            url: canonical,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | ZYGSOFT`,
            description,
        },
    };
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
