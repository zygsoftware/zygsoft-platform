import type { Metadata } from "next";
import localFont from "next/font/local";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Providers } from "@/components/Providers";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { AnimatedMeshBackground } from "@/components/layout/AnimatedMeshBackground";
import { GoogleTag } from "@/components/analytics/GoogleTag";
import { ClientEnhancements } from "@/components/layout/ClientEnhancements";

const linuxLibertine = localFont({
  src: [
    {
      path: "../../linux_libertine/LinLibertine_R.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../linux_libertine/LinLibertine_RI.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../linux_libertine/LinLibertine_RB.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../linux_libertine/LinLibertine_RBI.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-linux-libertine",
  display: "swap",
});

const montserrat = localFont({
  src: [
    {
      path: "../../Montserrat/Montserrat-VariableFont_wght.ttf",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../../Montserrat/Montserrat-Italic-VariableFont_wght.ttf",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-montserrat",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zygsoft.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "500x500" },
      { url: "/favicon.ico", rel: "shortcut icon" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  title: {
    default:  "ZYGSOFT | Antalya Yazılım Şirketi ve Dijital Ajans",
    template: "%s | ZYGSOFT",
  },
  description:
    "Antalya merkezli global hizmet veren yazılım şirketi. Profesyonel web tasarımı, özel yazılım geliştirme, sosyal medya yönetimi ve dijital strateji çözümleri.",
  keywords: [
    "Antalya yazılım şirketi", "Antalya web tasarım", "özel yazılım geliştirme",
    "sosyal medya yönetimi antalya", "ZYGSOFT", "dijital ajans",
  ],
  authors:   [{ name: "ZYGSOFT", url: SITE_URL }],
  creator:   "ZYGSOFT",
  publisher: "ZYGSOFT",
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      }
    : undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true, follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type:            "website",
    locale:          "tr_TR",
    alternateLocale: ["en_US"],
    url:             SITE_URL,
    siteName:        "ZYGSOFT",
    title:           "ZYGSOFT | Antalya Yazılım Şirketi ve Dijital Ajans",
    description:     "Antalya merkezli global hizmet veren yazılım şirketi. Web tasarımı, yazılım geliştirme ve dijital strateji çözümleri.",
    images: [{
      url:    "/og-default.png",
      width:  1200,
      height: 630,
      alt:    "ZYGSOFT — Antalya Yazılım Şirketi",
    }],
  },
  twitter: {
    card:        "summary_large_image",
    site:        "@zygsoft",
    title:       "ZYGSOFT | Antalya Yazılım Şirketi ve Dijital Ajans",
    description: "Antalya merkezli global hizmet veren yazılım şirketi.",
    images:      ["/og-default.png"],
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "tr": `${SITE_URL}/`,
      "en": `${SITE_URL}/en/`,
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      "name": "ZYGSOFT",
      "alternateName": "Zygsoft",
      "url": SITE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/brand/ZYGLogo.png`,
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "info@zygsoft.com",
        "availableLanguage": ["Turkish", "English"],
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Antalya",
        "addressCountry": "TR",
      },
      "foundingDate": "2019",
      "description":
        "Antalya merkezli yazılım şirketi. Kurumsal web geliştirme, SaaS platformları, dijital dönüşüm ve otomasyon çözümleri.",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      "url": SITE_URL,
      "name": "ZYGSOFT",
      "alternateName": "Zygsoft",
      "publisher": { "@id": `${SITE_URL}/#organization` },
      "inLanguage": ["tr-TR", "en-US"],
    },
  ],
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!["en", "tr"].includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="scroll-smooth">
      <body className={`${montserrat.className} ${linuxLibertine.variable} ${montserrat.variable} min-h-screen flex flex-col`}>
        <GoogleTag />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <AnimatedMeshBackground />
            <ClientEnhancements locale={locale} />
            <SmoothScroll>
              <div className="flex-1 flex flex-col min-h-0">
                {children}
              </div>
            </SmoothScroll>
            <SpeedInsights />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
