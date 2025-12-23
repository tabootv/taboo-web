import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudfront.net', // CloudFront CDN (drfohxq8ag37r.cloudfront.net)
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com', // S3 buckets
      },
      {
        protocol: 'https',
        hostname: 'app.taboo.tv',
      },
      {
        protocol: 'https',
        hostname: '**.taboo.tv',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**.b-cdn.net', // Bunny CDN
      },
    ],
  },

  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Environment variables available at build time
  env: {
    NEXT_PUBLIC_APP_NAME: 'TabooTV',
  },

  // API Rewrites - proxy API requests to avoid CORS issues
  // Note: Next.js API routes (src/app/api/*) are checked BEFORE rewrites
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://app.taboo.tv/api';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
        // This rewrite only applies if no Next.js API route matches first
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      // Add any redirects here
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ];
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
