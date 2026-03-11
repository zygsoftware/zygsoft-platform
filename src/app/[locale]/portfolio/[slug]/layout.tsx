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

    const project = await prisma.project.findUnique({
        where: { slug },
        select: { title: true, description: true, image: true, client: true },
    });

    if (!project) {
        return {
            title: isEn ? "Project Not Found" : "Proje Bulunamadı",
            description: "",
        };
    }

    const canonical = isEn ? `/en/portfolio/${slug}` : `/portfolio/${slug}`;

    const description = project.client
        ? isEn
            ? `${project.title} — ${project.description.slice(0, 120)} | Client: ${project.client} | ZYGSOFT`
            : `${project.title} — ${project.description.slice(0, 120)} | Müşteri: ${project.client} | ZYGSOFT`
        : `${project.title} — ${project.description.slice(0, 140)} | ZYGSOFT`;

    return {
        title: project.title,
        description,
        alternates: {
            canonical,
            languages: {
                tr: `/portfolio/${slug}`,
                en: `/en/portfolio/${slug}`,
            },
        },
        openGraph: {
            title:       `${project.title} | ZYGSOFT`,
            description,
            url:         canonical,
            type:        "article",
            ...(project.image
                ? { images: [{ url: project.image, alt: project.title }] }
                : { images: [{ url: `${SITE_URL}/og-default.png`, width: 1200, height: 630, alt: project.title }] }),
        },
        twitter: {
            card:        "summary_large_image",
            title:       `${project.title} | ZYGSOFT`,
            description,
            images:      project.image ? [project.image] : [`${SITE_URL}/og-default.png`],
        },
    };
}

export default function PortfolioSlugLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
