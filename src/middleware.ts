import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
    locales: ['en', 'tr'],
    defaultLocale: 'tr',
    localePrefix: 'as-needed'
});

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Check for admin routes first, and bypass intl for admin interactions to keep things simple
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");
    const isLoginRoute = req.nextUrl.pathname === "/admin/login";

    if (isAdminRoute || req.nextUrl.pathname.startsWith('/api')) {
        if (isAdminRoute && !isAuthRoute && !isLoginRoute) {
            if (!token) {
                return NextResponse.redirect(new URL("/admin/login", req.url));
            }
            if (req.nextUrl.pathname === "/admin") {
                return NextResponse.redirect(new URL("/admin/dashboard", req.url));
            }
        }
        if (isLoginRoute && token) {
            return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }
        return NextResponse.next();
    }

    // For public website routes, pass it to next-intl
    return intlMiddleware(req);
}

export const config = {
    matcher: ['/((?!api|_next|.*\\..*).*)']
};
