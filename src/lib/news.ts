export const NEWS_CATEGORY_SLUG = "haberler";

export const NEWS_CATEGORY_DEFAULTS = {
    slug: NEWS_CATEGORY_SLUG,
    name_tr: "Haberler",
    name_en: "News",
    description_tr: "ZYGSOFT ve sektörden güncel haberler",
    description_en: "Latest updates from ZYGSOFT and the industry",
} as const;

export function isNewsCategory(category: { slug?: string | null } | null | undefined): boolean {
    return category?.slug === NEWS_CATEGORY_SLUG;
}
