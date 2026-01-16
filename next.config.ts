import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Performance optimizations
  reactStrictMode: false, // Disable for smoother animations (prevents double-renders in dev)

  // Image optimization - using remotePatterns instead of deprecated domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Redirect legacy/incorrect routes
  async redirects() {
    return [
      {
        source: '/api/auth/me',
        destination: '/auth/profile',
        permanent: false,
      },
      {
        source: '/api/auth/:path*',
        destination: '/auth/:path*',
        permanent: false,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);

