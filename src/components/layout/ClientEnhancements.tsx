"use client";

import dynamic from "next/dynamic";

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
  return (
    <>
      <CustomCursor />
      <Preloader />
      <FloatingWhatsApp />
      <CookieConsentBanner locale={locale} />
    </>
  );
}

