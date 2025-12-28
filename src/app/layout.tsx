import type { Metadata, Viewport } from 'next';
import { Figtree } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/shared/components/providers';
import { ErrorBoundary } from '@/shared/components/error-boundary';
import { ContentProtectionWrapper } from '@/shared/components/content-protection-wrapper';

const figtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: {
    default: 'TabooTV',
    template: '%s | TabooTV',
  },
  description: 'Your destination for premium video content, courses, and community.',
  keywords: ['video', 'streaming', 'courses', 'community', 'creators'],
  authors: [{ name: 'TabooTV' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'TabooTV',
    title: 'TabooTV',
    description: 'Your destination for premium video content, courses, and community.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TabooTV',
    description: 'Your destination for premium video content, courses, and community.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to API for faster loading */}
        <link rel="preconnect" href="https://app.taboo.tv" />
        <link rel="preconnect" href="https://beta.taboo.tv" />
        <link rel="dns-prefetch" href="https://app.taboo.tv" />
        <link rel="dns-prefetch" href="https://beta.taboo.tv" />

        {/* Preconnect to Bunny CDN for faster video/image loading */}
        <link rel="preconnect" href="https://vz-ef3e8794-d5f.b-cdn.net" />
        <link rel="dns-prefetch" href="https://vz-ef3e8794-d5f.b-cdn.net" />
      </head>
      <body className={`${figtree.variable} antialiased`}>
        <ErrorBoundary>
          <QueryProvider>
            <ContentProtectionWrapper>{children}</ContentProtectionWrapper>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
