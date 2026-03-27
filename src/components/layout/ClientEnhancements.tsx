"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const FloatingWhatsApp = dynamic(
  () => import("@/components/layout/FloatingWhatsApp").then((mod) => mod.FloatingWhatsApp),
  { ssr: false },
);
const Preloader = dynamic(
  () => import("@/components/layout/Preloader").then((mod) => mod.Preloader),
  { ssr: false },
);
const CustomCursor = dynamic(
  () => import("@/components/layout/CustomCursor").then((mod) => mod.CustomCursor),
  { ssr: false },
);
const CookieConsentBanner = dynamic(
  () => import("@/components/analytics/CookieConsentBanner").then((mod) => mod.CookieConsentBanner),
  { ssr: false },
);

export function ClientEnhancements({ locale }: { locale: string }) {
  const pathname = usePathname();
  const normalizedPath = pathname?.replace(/^\/en/, "") || "/";
  const isHomepage = normalizedPath === "/";
  const isAuthRoute =
    normalizedPath === "/login" ||
    normalizedPath === "/register" ||
    normalizedPath === "/forgot-password" ||
    normalizedPath === "/reset-password" ||
    normalizedPath === "/verify-email" ||
    normalizedPath === "/verify-email-required" ||
    normalizedPath === "/admin/login";

  return (
    <>
      {!isAuthRoute && !isHomepage && <CustomCursor />}
      {!isAuthRoute && !isHomepage && <Preloader />}
      {!isAuthRoute && <FloatingWhatsApp />}
      {!isAuthRoute && <CookieConsentBanner locale={locale} />}
    </>
  );
}
