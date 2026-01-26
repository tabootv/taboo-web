'use client';

import { cn } from '@/shared/utils/formatting';
import type { ButtonSize, ButtonVariant } from '@/types';
import NextLink from 'next/link';
import { AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentProps, forwardRef, Ref } from 'react';

type BaseButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
};

type ButtonAsButton = BaseButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
    external?: never;
  };

type ButtonAsInternalLink = BaseButtonProps &
  Omit<ComponentProps<typeof NextLink>, 'href' | 'className'> & {
    href: string;
    external?: false;
  };

type ButtonAsExternalLink = BaseButtonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    external: true;
  };

export type ButtonProps = ButtonAsButton | ButtonAsInternalLink | ButtonAsExternalLink;

function isExternalLink(href: string | undefined): href is string {
  if (!href) return false;
  return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//');
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', href, external, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      primary: 'bg-[#AB0013] text-white font-bold hover:bg-[#AB0013]/90',
      secondary:
        'border border-solid border-black/[.08] hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]',
      outline: 'border border-white/20 bg-transparent hover:bg-white/10 text-white',
    };

    const sizes = {
      sm: 'h-10 px-4 text-sm',
      md: 'h-12 px-5 text-base',
      lg: 'h-14 px-6 text-lg',
    };

    const classes = cn(baseStyles, variants[variant], sizes[size], className);

    if (href) {
      if (external || isExternalLink(href)) {
        return (
          <a
            ref={ref as Ref<HTMLAnchorElement>}
            href={href}
            className={classes}
            target="_blank"
            rel="noopener noreferrer"
            {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
          >
            {children}
          </a>
        );
      }

      const { href: _, ...linkProps } = props as ComponentProps<typeof NextLink>;
      return (
        <NextLink
          ref={ref as Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          {...linkProps}
        >
          {children}
        </NextLink>
      );
    }

    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        className={classes}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
