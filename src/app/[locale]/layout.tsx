import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Providers } from "@/components/Providers";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Preloader } from "@/components/layout/Preloader";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { AnimatedMeshBackground } from "@/components/layout/AnimatedMeshBackground";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zygsoft.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: "/brand/favicon.png",
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
      "url": SITE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/brand/logo.png`,
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

  if (!['en', 'tr'].includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <AnimatedMeshBackground />
            <CustomCursor />
            <Preloader />
            <SmoothScroll>
              <div className="flex-1 flex flex-col min-h-0">
                {children}
              </div>
            </SmoothScroll>
            <FloatingWhatsApp />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
