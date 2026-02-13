import { execSync } from 'child_process';
import type { NextConfig } from 'next';
import type { Redirect } from 'next/dist/lib/load-custom-routes';

function getGitSha(): string {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Route Redirect Configuration
 *
 * All redirects use HTTP 301 (permanent) to signal search engines
 * that the old URL has permanently moved. This preserves SEO value.
 *
 * Guidelines:
 * - Maximum 1 redirect hop (no chains)
 * - Source routes should be deprecated routes
 * - Destination routes are the canonical routes
 */
const routeRedirects: Redirect[] = [
  // ============================================
  // Legacy Route Redirects
  // ============================================
  {
    source: '/creators/creator-profile/:channel',
    destination: '/creators/:channel',
    permanent: true,
  },
  { source: '/home', destination: '/', permanent: true },

  // ============================================
  // Legacy Platform URL Redirects
  // Maps old /c/, /u/, /v/ short URLs to canonical routes
  // ============================================
  { source: '/c/:handler', destination: '/creators/:handler', permanent: true },
  { source: '/u/:handler', destination: '/profile/:handler', permanent: true },
  { source: '/v/:uuid', destination: '/videos/:uuid', permanent: true },

  // ============================================
  // Auth Route Consolidation (PR 2.2)
  // Canonical: /sign-in, /register
  // ============================================
  { source: '/login', destination: '/sign-in', permanent: true },
  { source: '/signup', destination: '/choose-plan', permanent: true },
  { source: '/sign-up', destination: '/choose-plan', permanent: true },

  // ============================================
  // Content Route Consolidation (PR 2.3)
  // Canonical: /contents/videos, /contents/shorts
  // ============================================
  { source: '/content', destination: '/contents/videos', permanent: true },
  { source: '/content/create', destination: '/contents/videos/create', permanent: true },
  { source: '/content/edit/:path*', destination: '/contents/videos', permanent: true },

  // ============================================
  // Search Route Consolidation (PR 2.4)
  // Canonical: /searches
  // ============================================
  { source: '/search', destination: '/searches', permanent: true },

  // ============================================
  // Account Route Restructuring
  // Canonical: /account, /account/*, /profile
  // ============================================
  { source: '/profile/edit', destination: '/account', permanent: true },
  { source: '/profile/edit/password', destination: '/account/security', permanent: true },
  { source: '/profile/edit/danger', destination: '/account', permanent: true },
  { source: '/profile/subscription', destination: '/account/subscription', permanent: true },
  { source: '/profile/complete', destination: '/account/complete', permanent: true },
  { source: '/profile/settings', destination: '/account', permanent: true },

  // ============================================
  // Community Post Route Migration
  // Canonical: /posts/:id
  // ============================================
  { source: '/community/:id(\\d+)', destination: '/posts/:id', permanent: true },
];

const nextConfig: NextConfig = {
  // Generate build ID from git SHA for observability
  generateBuildId: async () => getGitSha(),

  // Required: PostHog API uses trailing slashes (e.g. /e/), prevent Next.js from redirecting them
  skipTrailingSlashRedirect: true,
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

  // Exclude shaka-player from server-side bundling (client-only library)
  serverExternalPackages: ['shaka-player', 'pino', 'pino-pretty', '@axiomhq/pino'],

  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
    webpackMemoryOptimizations: true,
    // Optimize barrel imports for better tree-shaking (bundle-barrel-imports rule)
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'date-fns',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-visually-hidden',
    ],
  },

  // Environment variables available at build time
  env: {
    NEXT_PUBLIC_APP_NAME: 'TabooTV',
    NEXT_PUBLIC_BUILD_ID: getGitSha(),
  },

  // Redirects - see routeRedirects configuration at top of file
  async redirects() {
    return routeRedirects;
  },

  // Reverse proxy PostHog through our domain to bypass ad blockers
  async rewrites() {
    return [
      {
        source: '/phtv/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/phtv/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
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
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
