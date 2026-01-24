import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password',
  description:
    "Reset your TabooTV account password. Enter your email address and we'll send you a secure link to reset your password and regain access to your account.",
  alternates: {
    canonical: '/forgot-password',
  },
  openGraph: {
    title: 'Reset Password | TabooTV',
    description:
      "Reset your TabooTV account password. Enter your email address and we'll send you a secure link to reset your password.",
    type: 'website',
    url: '/forgot-password',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reset Password | TabooTV',
    description:
      "Reset your TabooTV account password. Enter your email address and we'll send you a secure link to reset your password.",
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
