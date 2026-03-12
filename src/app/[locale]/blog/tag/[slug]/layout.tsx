import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zygsoft.com";

type Props = { params: Promise<{ slug: string; locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, locale } = await params;
    const isEn = locale === "en";
    const tag = await prisma.blogTag.findFirst({ where: { slug } });
    if (!tag) return { title: isEn ? "Tag Not Found" : "Etiket Bulunamadı" };

    const title = `${tag.name}${isEn ? " | Blog" : " | Blog"}`;
    const description = isEn ? `Posts tagged with ${tag.name}` : `${tag.name} etiketli yazılar`;

    const canonical = isEn ? `${SITE_URL}/en/blog/tag/${slug}` : `${SITE_URL}/blog/tag/${slug}`;

    return {
        title,
        description,
        alternates: {
            canonical,
            languages: {
                tr: `${SITE_URL}/blog/tag/${slug}`,
                en: `${SITE_URL}/en/blog/tag/${slug}`,
            },
        },
        openGraph: { title, description, url: canonical, type: "website" },
        twitter: { card: "summary_large_image", title, description },
    };
}

export default function TagLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
