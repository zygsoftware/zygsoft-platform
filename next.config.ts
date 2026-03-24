import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "/api/tools/letterhead": [
      "./python-api/**/*",
      "./tools/udf-converter/**/*",
      "./tools/ocr-text/**/*",
      "./tools/pdf-to-image/**/*",
      "./tools/pdf-to-word/**/*",
      "./tools/pdf-compress/**/*",
      "./tools/tiff-to-pdf/**/*",
      "./tools/requirements-legal.txt",
      "./public/uploads/**/*",
      "./prisma/dev.backup.db",
      "./dev.db",
      "./DEPLOYMENT.md",
      "./UDF-SETUP.md",
    ],
    "/api/tools/udf-convert": [
      "./python-api/**/*",
      "./tools/udf-converter/**/*",
      "./tools/ocr-text/**/*",
      "./tools/pdf-to-image/**/*",
      "./tools/pdf-to-word/**/*",
      "./tools/pdf-compress/**/*",
      "./tools/tiff-to-pdf/**/*",
      "./tools/requirements-legal.txt",
      "./public/uploads/**/*",
      "./prisma/dev.backup.db",
      "./dev.db",
      "./DEPLOYMENT.md",
      "./UDF-SETUP.md",
    ],
  },
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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    // Raise request cloning / proxy limits for large legal-toolkit uploads.
    proxyClientMaxBodySize: "500mb",
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
};

export default withNextIntl(nextConfig);
