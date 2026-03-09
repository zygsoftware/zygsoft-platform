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

export const metadata: Metadata = {
  title: "ZYGSOFT | Antalya Yazılım Şirketi ve Dijital Ajans",
  description:
    "Antalya merkezli global hizmet veren yazılım şirketi. Profesyonel web tasarımı, özel yazılım geliştirme, sosyal medya yönetimi ve dijital strateji çözümleri.",
  keywords: ["Antalya yazılım şirketi", "Antalya web tasarım", "özel yazılım geliştirme", "sosyal medya yönetimi antalya", "ZYGSOFT", "dijital ajans"],
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
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <AnimatedMeshBackground />
            <CustomCursor />
            <Preloader />
            <SmoothScroll>
              <div className="flex-1 flex flex-col">
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
