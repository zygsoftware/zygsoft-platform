import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zygsoft.com";

type Props = { params: Promise<{ slug: string; locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, locale } = await params;
    const isEn = locale === "en";
    const category = await prisma.blogCategory.findFirst({ where: { slug } });
    if (!category) return { title: isEn ? "Category Not Found" : "Kategori Bulunamadı" };

    const title = (isEn ? category.name_en : category.name_tr) + (isEn ? " | Blog" : " | Blog");
    const description =
        (isEn ? category.description_en : category.description_tr)?.slice(0, 160) ||
        (isEn ? `Articles in ${category.name_en}` : `${category.name_tr} kategorisindeki yazılar`);

    const canonical = isEn ? `${SITE_URL}/en/blog/category/${slug}` : `${SITE_URL}/blog/category/${slug}`;

    return {
        title,
        description,
        alternates: {
            canonical,
            languages: {
                tr: `${SITE_URL}/blog/category/${slug}`,
                en: `${SITE_URL}/en/blog/category/${slug}`,
            },
        },
        openGraph: { title, description, url: canonical, type: "website" },
        twitter: { card: "summary_large_image", title, description },
    };
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
