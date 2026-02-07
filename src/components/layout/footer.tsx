'use client';

import { useHiddenComponentByPage } from '@/hooks/use-hidden-component-page';
import Image from 'next/image';
import Link from 'next/link';

const footerLinks = [
  { name: 'Terms', href: 'https://taboo.tv/terms-conditions' },
  { name: 'Privacy', href: 'https://taboo.tv/privacy-policy' },
  { name: 'Refund', href: 'https://taboo.tv/refund-policy' },
  { name: 'Help', href: 'https://taboo.tv/contact-us' },
];

export function Footer() {
  const isHidden = useHiddenComponentByPage(['/shorts']);

  if (isHidden) return;

  return (
    <footer className="border-t border-border safe-bottom">
      <div className="max-w-7xl mx-auto page-px py-6">
        {/* Contact CTA */}
        <p className="text-center text-sm text-text-secondary mb-4">
          Questions?{' '}
          <Link
            href="https://taboo.tv/contact-us"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-primary hover:text-red-hover transition-colors"
          >
            Contact us
          </Link>
        </p>

        {/* Links - pipe separated */}
        <div className="flex items-center justify-center gap-2 mb-4 text-sm">
          {footerLinks.map((link, index) => (
            <span key={link.name} className="flex items-center gap-2">
              {index > 0 && <span className="text-white/20">|</span>}
              <Link
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-red-primary transition-colors"
              >
                {link.name}
              </Link>
            </span>
          ))}
        </div>

        {/* App Store Badges - single row, smaller */}
        <div className="flex justify-center gap-3 mb-4">
          <Link
            href="https://apps.apple.com/us/app/taboo-tv/id6738045672"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <Image
              src="/images/app-store-badge.svg"
              alt="Download on the App Store"
              width={108}
              height={32}
              className="h-8 w-auto"
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
              width={108}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-text-tertiary">
          &copy; {new Date().getFullYear()} Taboo TV Studios LLC
        </p>
      </div>
    </footer>
  );
}
