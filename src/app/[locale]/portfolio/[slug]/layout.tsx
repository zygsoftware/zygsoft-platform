import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zygsoft.com";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
    const { locale, slug } = await params;
    const isEn = locale === "en";

    const project = await prisma.project.findFirst({
        where: { slug, published: true },
        select: {
            title_tr: true, title_en: true,
            excerpt_tr: true, excerpt_en: true,
            seo_title_tr: true, seo_title_en: true,
            seo_description_tr: true, seo_description_en: true,
            cover_image: true, og_image: true, client_name: true,
            canonical_url: true,
        },
    });

    if (!project) {
        return {
            title: isEn ? "Project Not Found" : "Proje Bulunamadı",
            description: "",
        };
    }

    const title = isEn ? project.title_en : project.title_tr;
    const excerpt = isEn ? project.excerpt_en : project.excerpt_tr;
    const seoTitle = isEn ? (project.seo_title_en || project.title_en) : (project.seo_title_tr || project.title_tr);
    const seoDesc = isEn ? (project.seo_description_en || project.excerpt_en) : (project.seo_description_tr || project.excerpt_tr);
    const description = seoDesc?.slice(0, 160) || excerpt?.slice(0, 160) || "";
    const canonical = project.canonical_url || (isEn ? `${SITE_URL}/en/projects/${slug}` : `${SITE_URL}/projeler/${slug}`);
    const ogImage = project.og_image || project.cover_image || `${SITE_URL}/og-default.png`;

    return {
        title: project.canonical_url ? undefined : `${seoTitle} | ZYGSOFT`,
        description,
        alternates: {
            canonical,
            languages: {
                tr: `/projeler/${slug}`,
                en: `/en/projects/${slug}`,
            },
        },
        openGraph: {
            title:       `${seoTitle} | ZYGSOFT`,
            description,
            url:         canonical,
            type:        "article",
            images:      [{ url: ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`, alt: title, width: 1200, height: 630 }],
        },
        twitter: {
            card:        "summary_large_image",
            title:       `${seoTitle} | ZYGSOFT`,
            description,
            images:      [ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`],
        },
    };
}

export default function PortfolioSlugLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
