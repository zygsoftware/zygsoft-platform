import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
    locales: ['en', 'tr'],
    defaultLocale: 'tr',
    localePrefix: 'as-needed'
});

const VERIFY_EMAIL_REQUIRED_PATHS = ["/dashboard", "/verify-email-required"];
const ALLOWED_UNVERIFIED_PATHS = ["/login", "/register", "/verify-email", "/forgot-password", "/reset-password", "/"];

function pathMatches(pathname: string, patterns: string[]): boolean {
    const normalized = pathname.replace(/^\/en/, "") || "/";
    return patterns.some((p) => normalized === p || normalized.startsWith(p + "/"));
}

function isDashboardOrProtected(pathname: string): boolean {
    const normalized = pathname.replace(/^\/en/, "") || "/";
    return normalized.startsWith("/dashboard");
}

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Check for admin routes first
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

    // Email verification guard: customer users must verify email before using dashboard
    if (token && (token as any).role === "customer" && !(token as any).emailVerified) {
        if (isDashboardOrProtected(req.nextUrl.pathname) && !pathMatches(req.nextUrl.pathname, ["/verify-email-required"])) {
            const locale = req.nextUrl.pathname.startsWith("/en") ? "/en" : "";
            return NextResponse.redirect(new URL(`${locale}/verify-email-required`, req.url));
        }
    }

    return intlMiddleware(req);
}

export const config = {
    matcher: ['/((?!api|_next|.*\\..*).*)']
};
