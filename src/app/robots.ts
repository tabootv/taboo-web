import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.taboo.tv';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/account/',
        '/studio/',
        '/sign-in',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/compose/',
        '/watchlist',
        '/notifications',
        '/searches',
        '/onboarding/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
