import type { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const isEn = locale === "en";

    const title = isEn ? "Contact Us" : "İletişim";
    const description = isEn
        ? "Get in touch with the ZYGSOFT team to discuss your project, request a quote, or ask about our software and digital services."
        : "Projenizi konuşmak, teklif almak veya yazılım ve dijital hizmetlerimiz hakkında bilgi almak için ZYGSOFT ekibiyle iletişime geçin.";
    const canonical = isEn ? "/en/contact" : "/contact";

    return {
        title,
        description,
        alternates: {
            canonical,
            languages: { tr: "/contact", en: "/en/contact" },
        },
        openGraph: {
            title:       `${title} | ZYGSOFT`,
            description,
            url:         canonical,
            type:        "website",
        },
    };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
