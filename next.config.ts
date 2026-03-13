import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/abonelikler", destination: "/dijital-urunler", permanent: true },
      { source: "/en/abonelikler", destination: "/en/dijital-urunler", permanent: true },
      { source: "/en/digital-products", destination: "/en/dijital-urunler", permanent: true },
      { source: "/portfolio", destination: "/projeler", permanent: true },
      { source: "/portfolio/:path*", destination: "/projeler/:path*", permanent: true },
      { source: "/en/portfolio", destination: "/en/projects", permanent: true },
      { source: "/en/portfolio/:path*", destination: "/en/projects/:path*", permanent: true },
    ];
  },
  experimental: {
    // Allow up to 50 MB multipart bodies (multi-file tool uploads)
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default withNextIntl(nextConfig);
