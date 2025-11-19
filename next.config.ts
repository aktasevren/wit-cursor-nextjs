import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
      {
        protocol: 'https',
        hostname: 'cdn.buymeacoffee.com',
      },
    ],
  },
  // Vercel deployment için optimize edilmiş ayarlar
  experimental: {
    // Serverless functions için optimize
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
