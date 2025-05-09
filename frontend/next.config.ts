import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'variety.com',
        pathname: '/wp-content/**',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 'images.themoviedb.org',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 'movieposters.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.themoviedb.org',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 'image.movieglu.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        pathname: '/images/**',
      }
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@/components', '@/lib'],
  }
};

export default nextConfig;
