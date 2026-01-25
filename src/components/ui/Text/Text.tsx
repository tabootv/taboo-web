import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/utils/formatting';
import type { TextVariant } from '@/types';

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: TextVariant;
  as?: 'p' | 'span' | 'div';
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant = 'body', as: Component = 'p', ...props }, ref) => {
    const variants = {
      body: 'text-base leading-7',
      small: 'text-sm leading-6',
      large: 'text-lg leading-8',
      lead: 'text-xl leading-8',
    };

    return (
      <Component
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';
