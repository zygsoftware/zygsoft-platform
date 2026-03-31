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
        "/payment": {
            tr: "/odeme",
            en: "/payment",
        },
        "/document-tools": {
            tr: "/hukuk-araclari-paketi",
            en: "/legal-toolkit",
        },
        "/document-tools/appendix-packager": {
            tr: "/ek-klasor-paketleme",
            en: "/appendix-packager",
        },
        "/document-tools/batch-convert": {
            tr: "/toplu-donusturme",
            en: "/batch-converter",
        },
        "/document-tools/doc-to-udf": {
            tr: "/docx-udf-donusturucu",
            en: "/docx-to-udf-converter",
        },
        "/document-tools/image-to-pdf": {
            tr: "/gorsel-pdf-donusturucu",
            en: "/image-to-pdf-converter",
        },
        "/document-tools/ocr-text": {
            tr: "/ocr-metin-cikarma",
            en: "/ocr-text-extraction",
        },
        "/document-tools/pdf-compress": {
            tr: "/pdf-sikistirma",
            en: "/pdf-compressor",
        },
        "/document-tools/pdf-merge": {
            tr: "/pdf-birlestirme",
            en: "/pdf-merger",
        },
        "/document-tools/pdf-split": {
            tr: "/pdf-bolme",
            en: "/pdf-splitter",
        },
        "/document-tools/pdf-to-image": {
            tr: "/pdf-gorsele-donustur",
            en: "/pdf-to-image-converter",
        },
        "/document-tools/pdf-to-word": {
            tr: "/pdf-worde-donustur",
            en: "/pdf-to-word-converter",
        },
        "/document-tools/tiff-to-pdf": {
            tr: "/tiff-pdf-donusturucu",
            en: "/tiff-to-pdf-converter",
        },

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
            tr: "/panel/odeme-akisi",
            en: "/dashboard/checkout",
        },
        "/dashboard/payments": {
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
            tr: "/panel/belge-merkezi",
            en: "/dashboard/document-tools",
        },
        "/dashboard/tools/appendix-packager": {
            tr: "/panel/ek-klasor-paketleme",
            en: "/dashboard/appendix-packager",
        },
        "/dashboard/tools/batch-convert": {
            tr: "/panel/toplu-donusturme",
            en: "/dashboard/batch-converter",
        },
        "/dashboard/tools/doc-to-udf": {
            tr: "/panel/docx-udf-donusturucu",
            en: "/dashboard/docx-to-udf-converter",
        },
        "/dashboard/tools/image-to-pdf": {
            tr: "/panel/gorsel-pdf-donusturucu",
            en: "/dashboard/image-to-pdf-converter",
        },
        "/dashboard/tools/ocr-text": {
            tr: "/panel/ocr-metin-cikarma",
            en: "/dashboard/ocr-text-extraction",
        },
        "/dashboard/tools/pdf-compress": {
            tr: "/panel/pdf-sikistirma",
            en: "/dashboard/pdf-compressor",
        },
        "/dashboard/tools/pdf-merge": {
            tr: "/panel/pdf-birlestirme",
            en: "/dashboard/pdf-merger",
        },
        "/dashboard/tools/pdf-split": {
            tr: "/panel/pdf-bolme",
            en: "/dashboard/pdf-splitter",
        },
        "/dashboard/tools/pdf-to-image": {
            tr: "/panel/pdf-gorsele-donustur",
            en: "/dashboard/pdf-to-image-converter",
        },
        "/dashboard/tools/pdf-to-word": {
            tr: "/panel/pdf-worde-donustur",
            en: "/dashboard/pdf-to-word-converter",
        },
        "/dashboard/tools/tiff-to-pdf": {
            tr: "/panel/tiff-pdf-donusturucu",
            en: "/dashboard/tiff-to-pdf-converter",
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
