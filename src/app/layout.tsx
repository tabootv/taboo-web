import { ErrorBoundary } from '@/shared/components/error-boundary';
import { QueryProvider } from '@/shared/components/providers/query-provider';
import { UploadProvider } from '@/shared/components/providers/upload-provider';
import { GlobalUploadIndicator } from '@/shared/components/upload/GlobalUploadIndicator';
import type { Metadata, Viewport } from 'next';
import { Figtree } from 'next/font/google';
import './globals.css';

const figtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: {
    default: 'TabooTV - Premium Video Streaming Platform',
    template: '%s | TabooTV',
  },
  description:
    'Discover premium video content, educational courses, and connect with creators on TabooTV. Stream exclusive videos, learn from expert creators, and join a vibrant community of content enthusiasts.',
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
    title: 'TabooTV - Premium Video Streaming Platform',
    description:
      'Discover premium video content, educational courses, and connect with creators on TabooTV. Stream exclusive videos, learn from expert creators, and join a vibrant community of content enthusiasts.',
    images: [
      {
        url: '/apple-icon.png',
        width: 180,
        height: 180,
        alt: 'TabooTV Logo',
      },
    ],
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TabooTV - Premium Video Streaming Platform',
    description:
      'Discover premium video content, educational courses, and connect with creators on TabooTV. Stream exclusive videos, learn from expert creators, and join a vibrant community of content enthusiasts.',
    images: ['/apple-icon.png'],
  },
  robots: {
    index: true,
    follow: true,
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
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TabooTV',
    description:
      'Premium video streaming platform offering exclusive content, educational courses, and a vibrant creator community.',
    url: 'https://dev.taboo.tv',
    logo: 'https://dev.taboo.tv/apple-icon.png',
    sameAs: [],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${figtree.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <ErrorBoundary>
          <QueryProvider>
            <UploadProvider>
              {children}
              <GlobalUploadIndicator />
            </UploadProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
