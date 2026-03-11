import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  experimental: {
    // Allow up to 50 MB multipart bodies (multi-file tool uploads)
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default withNextIntl(nextConfig);
