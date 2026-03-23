import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";

  const title = isEn ? "Privacy Policy" : "Gizlilik Politikası";
  const description = isEn
    ? "ZYGSOFT Privacy Policy: how we collect, use, store and protect personal data on zygsoft.com, cookies, third parties, your rights, and contact details."
    : "ZYGSOFT Gizlilik Politikası: zygsoft.com üzerinde kişisel verilerin toplanması, kullanımı, saklanması, çerezler, üçüncü taraflar, haklarınız ve iletişim.";
  const canonical = isEn ? "/en/privacy" : "/privacy";

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: { tr: "/privacy", en: "/en/privacy" },
    },
    openGraph: {
      title: `${title} | ZYGSOFT`,
      description,
      url: canonical,
      type: "website",
    },
  };
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
