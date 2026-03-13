import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['en', 'tr'],
    defaultLocale: 'tr',
    localePrefix: 'as-needed',
    pathnames: {
        '/portfolio': {
            tr: '/projeler',
            en: '/projects',
        },
        '/portfolio/[slug]': {
            tr: '/projeler/[slug]',
            en: '/projects/[slug]',
        },
        '/blog': { tr: '/blog', en: '/blog' },
        '/blog/[slug]': { tr: '/blog/[slug]', en: '/blog/[slug]' },
        '/blog/tag/[slug]': { tr: '/blog/tag/[slug]', en: '/blog/tag/[slug]' },
    },
});

/** Helper: projects list path for a locale */
export function getProjectsPath(locale: string): string {
    return locale === 'en' ? '/en/projects' : '/projeler';
}

/** Helper: project detail path for a locale */
export function getProjectDetailPath(locale: string, slug: string): string {
    return locale === 'en' ? `/en/projects/${slug}` : `/projeler/${slug}`;
}
