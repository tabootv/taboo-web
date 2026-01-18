'use client';

import { Logo } from '@/components/ui/logo';
import { useHiddenComponentByPage } from '@/hooks/use-hidden-component-page';
import Image from 'next/image';
import Link from 'next/link';

const footerLinks = [
  { name: 'Customer support', href: 'https://taboo.tv/contact-us' },
  { name: 'Terms and conditions', href: 'https://taboo.tv/terms-&-conditions' },
  { name: 'Privacy policy', href: 'https://taboo.tv/privacy-policy' },
  { name: 'Refund policy', href: 'https://taboo.tv/refund-policy' },
];

export function Footer() {
  const isHidden = useHiddenComponentByPage(['/shorts']);

  if (isHidden) return;

  return (
    <footer className="bg-surface safe-bottom">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" linkTo="/home" />
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-8">
          {footerLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-secondary hover:text-red-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* App Store Badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link
            href="https://apps.apple.com/us/app/taboo-tv/id6738045672"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <Image
              src="/images/app-store-badge.svg"
              alt="Download on the App Store"
              width={135}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          <Link
            href="https://play.google.com/store/apps/details?id=com.tvtaboo&hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <Image
              src="/images/google-play-badge.svg"
              alt="Get it on Google Play"
              width={135}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
        </div>

        {/* Address & Copyright */}
        <div className="text-center pt-8">
          <p className="text-sm text-text-secondary mb-2">Georgia, United States.</p>
          <p className="text-sm text-text-secondary">
            &copy; {new Date().getFullYear()} Taboo Studios LLC
          </p>
        </div>
      </div>
    </footer>
  );
}
