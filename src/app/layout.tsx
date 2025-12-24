import type { Metadata, Viewport } from 'next';
import { Figtree } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/shared/components/providers';
import { ErrorBoundary } from '@/shared/components/error-boundary';

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
      <body className={`${figtree.variable} antialiased`}>
        <ErrorBoundary>
          <QueryProvider>{children}</QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
