import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://zygsoft.com";

/* Known service slugs */
const SERVICE_SLUGS = [
    "web-ve-uygulama-gelistirme",
    "sosyal-medya-yonetimi",
    "marka-kimligi-ve-grafik-tasarim",
    "dijital-strateji-ve-pazarlama",
    "hedef-kitle-analizi",
];

/* Helper — add both TR (default, no prefix) and EN versions of a path */
function both(
    path: string,
    opts: { changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }
): MetadataRoute.Sitemap {
    return [
        { url: `${BASE}${path}`,      lastModified: new Date(), ...opts },
        { url: `${BASE}/en${path}`,   lastModified: new Date(), ...opts },
    ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    /* ── Static top-level pages ── */
    const staticRoutes: MetadataRoute.Sitemap = [
        ...both("/",             { changeFrequency: "weekly",  priority: 1.0 }),
        ...both("/about",        { changeFrequency: "monthly", priority: 0.8 }),
        ...both("/services",     { changeFrequency: "weekly",  priority: 0.9 }),
        { url: `${BASE}/projeler`,      lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
        { url: `${BASE}/en/projects`,  lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
        ...both("/blog",         { changeFrequency: "weekly",  priority: 0.8 }),
        ...both("/contact",      { changeFrequency: "monthly", priority: 0.7 }),
        ...both("/dijital-urunler",  { changeFrequency: "weekly",  priority: 0.8 }),
        ...both("/dijital-urunler/hukuk-araclari-paketi", { changeFrequency: "weekly", priority: 0.9 }),
        ...both("/terms",        { changeFrequency: "yearly",  priority: 0.3 }),
        ...both("/kvkk",         { changeFrequency: "yearly",  priority: 0.3 }),
    ];

    /* ── Service detail pages ── */
    const serviceRoutes: MetadataRoute.Sitemap = SERVICE_SLUGS.flatMap((slug) =>
        both(`/services/${slug}`, { changeFrequency: "monthly", priority: 0.7 })
    );

    /* ── Dynamic project detail pages ── */
    let projectRoutes: MetadataRoute.Sitemap = [];
    try {
        const projects = await prisma.project.findMany({
            where:  { published: true },
            select: { slug: true, updated_at: true },
        });
        projectRoutes = projects.flatMap((p) => [
            { url: `${BASE}/projeler/${p.slug}`,      lastModified: p.updated_at ?? new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
            { url: `${BASE}/en/projects/${p.slug}`,  lastModified: p.updated_at ?? new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
        ]);
    } catch {
        // Sitemap should not crash if DB is unavailable
    }

    /* ── Dynamic blog post pages ── */
    let blogRoutes: MetadataRoute.Sitemap = [];
    let categoryRoutes: MetadataRoute.Sitemap = [];
    let tagRoutes: MetadataRoute.Sitemap = [];
    try {
        const posts = await prisma.blogPost.findMany({
            where:  { published: true },
            select: { slug: true, updated_at: true },
        });
        blogRoutes = posts.flatMap((post) =>
            both(`/blog/${post.slug}`, { changeFrequency: "monthly", priority: 0.7 })
        ).map((entry, i) => ({
            ...entry,
            lastModified: posts[Math.floor(i / 2)]?.updated_at ?? new Date(),
        }));

        const categories = await prisma.blogCategory.findMany({ select: { slug: true } });
        categoryRoutes = categories.flatMap((c) =>
            both(`/blog/category/${c.slug}`, { changeFrequency: "weekly", priority: 0.6 })
        );

        const tags = await prisma.blogTag.findMany({ select: { slug: true } });
        tagRoutes = tags.flatMap((t) =>
            both(`/blog/tag/${t.slug}`, { changeFrequency: "weekly", priority: 0.5 })
        );
    } catch {
        // Sitemap should not crash the build if DB is unavailable
    }

    return [...staticRoutes, ...serviceRoutes, ...projectRoutes, ...blogRoutes, ...categoryRoutes, ...tagRoutes];
}
