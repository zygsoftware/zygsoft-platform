import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
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
      {
        source: "/product/udf-donusturucu-toolkit-pro-omur-boyu-lisans",
        destination: "/dijital-urunler/hukuk-araclari-paketi",
        permanent: true,
      },
      {
        source: "/en/product/udf-donusturucu-toolkit-pro-omur-boyu-lisans",
        destination: "/en/dijital-urunler/hukuk-araclari-paketi",
        permanent: true,
      },
      { source: "/favicon.ico", destination: "/icon.png", permanent: true },
      { source: "/favicon.png", destination: "/icon.png", permanent: true },
      { source: "/favicon-32x32.png", destination: "/icon.png", permanent: true },
      { source: "/favicon-16x16.png", destination: "/icon.png", permanent: true },
      { source: "/apple-touch-icon.png", destination: "/icon.png", permanent: true },
      { source: "/apple-touch-icon-precomposed.png", destination: "/icon.png", permanent: true },
      { source: "/site.webmanifest", destination: "/manifest.webmanifest", permanent: true },
      { source: "/portfolio", destination: "/projeler", permanent: true },
      { source: "/portfolio/:path*", destination: "/projeler/:path*", permanent: true },
      { source: "/en/portfolio", destination: "/en/projects", permanent: true },
      { source: "/en/portfolio/:path*", destination: "/en/projects/:path*", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
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
