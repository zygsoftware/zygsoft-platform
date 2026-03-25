import { defineRouting } from "next-intl/routing";

/**
 * Internal paths (App Router folders under `[locale]/…`) → localized URL segments.
 * - `tr`: Türkçe sluglar (`/panel/…`)
 * - `en`: İngilizce sluglar (`/dashboard/payments` gibi faturalandırmadan farklı isimler)
 */
export const routing = defineRouting({
    locales: ["en", "tr"],
    defaultLocale: "tr",
    localePrefix: "as-needed",
    pathnames: {
        "/portfolio": {
            tr: "/projeler",
            en: "/projects",
        },
        "/portfolio/[slug]": {
            tr: "/projeler/[slug]",
            en: "/projects/[slug]",
        },
        "/blog": { tr: "/blog-haberler", en: "/blog" },
        "/blog/[slug]": { tr: "/blog-haberler/[slug]", en: "/blog/[slug]" },
        "/blog/category/[slug]": { tr: "/blog-haberler/kategori/[slug]", en: "/blog/category/[slug]" },
        "/blog/tag/[slug]": { tr: "/blog-haberler/etiket/[slug]", en: "/blog/tag/[slug]" },
        "/news": { tr: "/haberler", en: "/news" },
        "/news/[slug]": { tr: "/haberler/[slug]", en: "/news/[slug]" },
        "/terms": { tr: "/terms", en: "/terms" },
        "/privacy": { tr: "/privacy", en: "/privacy" },
        "/kvkk": { tr: "/kvkk", en: "/kvkk" },

        /* ── Müşteri paneli (dashboard) ───────────────────────────── */
        "/dashboard": {
            tr: "/panel",
            en: "/dashboard",
        },
        "/dashboard/account": {
            tr: "/panel/hesap",
            en: "/dashboard/profile",
        },
        "/dashboard/billing": {
            tr: "/panel/odemeler",
            en: "/dashboard/payments",
        },
        "/dashboard/products": {
            tr: "/panel/urunler",
            en: "/dashboard/products",
        },
        "/dashboard/services": {
            tr: "/panel/hizmetler",
            en: "/dashboard/services",
        },
        "/dashboard/support": {
            tr: "/panel/destek",
            en: "/dashboard/support",
        },
        "/dashboard/tools": {
            tr: "/panel/araclar",
            en: "/dashboard/tools",
        },
        "/dashboard/tools/appendix-packager": {
            tr: "/panel/araclar/ek-klasoru",
            en: "/dashboard/tools/appendix-packager",
        },
        "/dashboard/tools/batch-convert": {
            tr: "/panel/araclar/toplu-donustur",
            en: "/dashboard/tools/batch-convert",
        },
        "/dashboard/tools/doc-to-udf": {
            tr: "/panel/araclar/docx-udf",
            en: "/dashboard/tools/docx-to-udf",
        },
        "/dashboard/tools/image-to-pdf": {
            tr: "/panel/araclar/gorsel-pdf",
            en: "/dashboard/tools/image-to-pdf",
        },
        "/dashboard/tools/ocr-text": {
            tr: "/panel/araclar/ocr-metin",
            en: "/dashboard/tools/text-extraction",
        },
        "/dashboard/tools/pdf-compress": {
            tr: "/panel/araclar/pdf-sikistir",
            en: "/dashboard/tools/compress-pdf",
        },
        "/dashboard/tools/pdf-merge": {
            tr: "/panel/araclar/pdf-birlestir",
            en: "/dashboard/tools/merge-pdf",
        },
        "/dashboard/tools/pdf-split": {
            tr: "/panel/araclar/pdf-bol",
            en: "/dashboard/tools/split-pdf",
        },
        "/dashboard/tools/pdf-to-image": {
            tr: "/panel/araclar/pdf-gorsel",
            en: "/dashboard/tools/pdf-to-images",
        },
        "/dashboard/tools/pdf-to-word": {
            tr: "/panel/araclar/pdf-word",
            en: "/dashboard/tools/pdf-to-word",
        },
        "/dashboard/tools/tiff-to-pdf": {
            tr: "/panel/araclar/tiff-pdf",
            en: "/dashboard/tools/tiff-to-pdf",
        },
    },
});

/** Helper: projects list path for a locale */
export function getProjectsPath(locale: string): string {
    return locale === "en" ? "/en/projects" : "/projeler";
}

/** Helper: project detail path for a locale */
export function getProjectDetailPath(locale: string, slug: string): string {
    return locale === "en" ? `/en/projects/${slug}` : `/projeler/${slug}`;
}
