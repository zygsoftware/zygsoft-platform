import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zygsoft.com";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "ZYGSOFT",
        short_name: "ZYGSOFT",
        description: "ZYGSOFT yazilim, dijital ajans ve hukuk araclari platformu.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#e6c800",
        icons: [
            {
                src: "/brand/ZYG_Logo_SQR.png",
                sizes: "512x512",
                type: "image/png",
            },
            {
                src: "/brand/favicon.png",
                sizes: "192x192",
                type: "image/png",
            },
        ],
        categories: ["business", "productivity", "legal"],
        id: SITE_URL,
    };
}
