import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

const nav = createNavigation(routing);
export const { redirect, usePathname, useRouter } = nav;

/** Link with pathnames; use href as string for routes not in pathnames (type assertion) */
export const Link = nav.Link as React.ComponentType<Omit<React.ComponentProps<typeof nav.Link>, 'href'> & { href: React.ComponentProps<typeof nav.Link>['href'] | string }>;
