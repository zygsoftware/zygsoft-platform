import type { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const isEn = locale === "en";

    const title = isEn ? "Personal data disclosure (KVKK)" : "KVKK Aydınlatma Metni";
    const description = isEn
        ? "ZYGSOFT: English disclosure under Turkish Law No. 6698 (KVKK)—personal data we process, purposes, transfers, retention, your rights, security, and how to contact us."
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
