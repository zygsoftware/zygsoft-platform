import type { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const isEn = locale === "en";

    const title = isEn ? "Privacy Policy (KVKK)" : "KVKK Aydınlatma Metni";
    const description = isEn
        ? "ZYGSOFT Privacy Policy (KVKK): information on what personal data we collect, how it is processed, your rights under Turkish data protection law, and how to contact us."
        : "ZYGSOFT KVKK Aydınlatma Metni: hangi kişisel verilerin toplandığı, nasıl işlendiği, KVKK kapsamındaki haklarınız ve iletişim bilgileri.";
    const canonical = isEn ? "/en/kvkk" : "/kvkk";

    return {
        title,
        description,
        robots: { index: true, follow: false },
        alternates: {
            canonical,
            languages: { tr: "/kvkk", en: "/en/kvkk" },
        },
        openGraph: {
            title:       `${title} | ZYGSOFT`,
            description,
            url:         canonical,
            type:        "website",
        },
    };
}

export default function KvkkLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
