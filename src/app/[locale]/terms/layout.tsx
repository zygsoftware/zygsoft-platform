import type { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const isEn = locale === "en";

    const title = isEn ? "Terms of Service" : "Kullanıcı Sözleşmesi";
    const description = isEn
        ? "Read the ZYGSOFT Terms of Service covering account creation, subscription and payment conditions, usage rules, intellectual property, and liability limitations."
        : "ZYGSOFT Kullanıcı Sözleşmesi'ni okuyun: hesap oluşturma, abonelik ve ödeme koşulları, kullanım kuralları, fikri mülkiyet ve sorumluluk sınırlamaları.";
    const canonical = isEn ? "/en/terms" : "/terms";

    return {
        title,
        description,
        robots: { index: true, follow: false },
        alternates: {
            canonical,
            languages: { tr: "/terms", en: "/en/terms" },
        },
        openGraph: {
            title:       `${title} | ZYGSOFT`,
            description,
            url:         canonical,
            type:        "website",
        },
    };
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
