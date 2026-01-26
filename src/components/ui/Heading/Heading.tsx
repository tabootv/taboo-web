import { cn } from '@/shared/utils/formatting';
import type { HeadingLevel } from '@/types';
import { HTMLAttributes, JSX, createElement } from 'react';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level: HeadingLevel;
  as?: HeadingLevel;
}

export function Heading({ level, as, className, children, ...props }: HeadingProps) {
  const Tag = `h${as || level}` as keyof JSX.IntrinsicElements;

  const styles = {
    1: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight',
    2: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight',
    3: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight',
    4: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold',
    5: 'text-base sm:text-lg md:text-xl font-semibold',
    6: 'text-sm sm:text-base md:text-lg font-semibold',
  };

  return createElement(
    Tag,
    {
      className: cn(styles[level], className),
      ...props,
    },
    children
  );
}
