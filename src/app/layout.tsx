import { ErrorBoundary } from '@/shared/components/error-boundary';
import { LazyUploadScope } from '@/shared/components/providers/lazy-upload-scope';
import { PostHogProvider } from '@/shared/components/providers/posthog-provider';
import { QueryProvider } from '@/shared/components/providers/query-provider';
import { WebVitalsReporter } from '@/shared/components/providers/web-vitals-reporter';
import type { Metadata, Viewport } from 'next';
import { Figtree } from 'next/font/google';
import './globals.css';

const figtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const SITE_TITLE = 'TabooTV - Premium Video Streaming Platform';
const SITE_DESCRIPTION =
  'Discover premium video content, educational courses, and connect with creators on TabooTV. Stream exclusive videos, learn from expert creators, and join a vibrant community of content enthusiasts.';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://app.taboo.tv'),
  title: {
    default: SITE_TITLE,
    template: '%s | TabooTV',
  },
  description: SITE_DESCRIPTION,
  keywords: ['video', 'streaming', 'courses', 'community', 'creators'],
  authors: [{ name: 'TabooTV' }],
  icons: {
    icon: [
      { url: '/icon-32x.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-16x.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'TabooTV',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.taboo.tv';
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TabooTV',
    description:
      'Premium video streaming platform offering exclusive content, educational courses, and a vibrant creator community.',
    url: appUrl,
    logo: `${appUrl}/apple-icon.png`,
    sameAs: [],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${figtree.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <PostHogProvider>
          <WebVitalsReporter />
          <ErrorBoundary>
            <QueryProvider>
              <LazyUploadScope>{children}</LazyUploadScope>
            </QueryProvider>
          </ErrorBoundary>
        </PostHogProvider>
      </body>
    </html>
  );
}
