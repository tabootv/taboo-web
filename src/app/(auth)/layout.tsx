import { AuthLayout } from '@/components/layout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description:
    'Sign in to your TabooTV account to access premium video content, courses, and connect with creators. Join thousands of members enjoying exclusive streaming content.',
  alternates: {
    canonical: '/sign-in',
  },
  openGraph: {
    title: 'Sign In | TabooTV',
    description:
      'Sign in to your TabooTV account to access premium video content, courses, and connect with creators.',
    type: 'website',
    url: '/sign-in',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign In | TabooTV',
    description:
      'Sign in to your TabooTV account to access premium video content, courses, and connect with creators.',
  },
};

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}
