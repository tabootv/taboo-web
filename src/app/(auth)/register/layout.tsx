import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account',
  description:
    'Join TabooTV and start watching premium video content, educational courses, and connect with creators. Sign up for free and explore exclusive streaming content.',
  alternates: {
    canonical: '/register',
  },
  openGraph: {
    title: 'Create Account | TabooTV',
    description:
      'Join TabooTV and start watching premium video content, educational courses, and connect with creators.',
    type: 'website',
    url: '/register',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create Account | TabooTV',
    description:
      'Join TabooTV and start watching premium video content, educational courses, and connect with creators.',
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
