'use client';

import { ReactNode } from 'react';

export type GridVariant = 'media' | 'creator' | 'series' | 'shorts' | 'posts';

export interface ContentGridProps {
  /** Grid variant for different content types */
  variant?: GridVariant;
  /** Custom column configuration */
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /** Gap size */
  gap?: 'sm' | 'md' | 'lg';
  /** Children to render in grid */
  children: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Unified content grid component for consistent layouts across the app.
 *
 * @example
 * // Default media grid (videos)
 * <ContentGrid variant="media">
 *   {videos.map(video => <MediaCard key={video.id} {...video} />)}
 * </ContentGrid>
 *
 * @example
 * // Series grid
 * <ContentGrid variant="series">
 *   {series.map(s => <MediaCard key={s.id} type="series" {...s} />)}
 * </ContentGrid>
 *
 * @example
 * // Custom columns
 * <ContentGrid columns={{ default: 1, sm: 2, lg: 4 }}>
 *   {items.map(item => <Card key={item.id} />)}
 * </ContentGrid>
 */
export function ContentGrid({
  variant = 'media',
  columns,
  gap = 'md',
  children,
  className = '',
}: ContentGridProps) {
  // Default column configurations for each variant
  const variantColumns: Record<GridVariant, Record<string, number>> = {
    media: { default: 1, sm: 2, md: 3, lg: 4, xl: 5 },
    creator: { default: 1, sm: 2, md: 3, lg: 4, xl: 4 },
    series: { default: 1, sm: 2, lg: 3, xl: 4 },
    shorts: { default: 2, sm: 3, md: 4, lg: 5, xl: 6 },
    posts: { default: 1, md: 1, lg: 1 },
  };

  // Gap sizes
  const gapSizes = {
    sm: 'gap-3',
    md: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8',
  };

  // Get column config
  const cols = columns || variantColumns[variant];

  // Generate responsive grid classes
  const getGridClasses = () => {
    const classes: string[] = ['grid'];

    // Default columns
    if (cols.default) {
      classes.push(`grid-cols-${cols.default}`);
    }

    // Responsive columns
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);

    return classes.join(' ');
  };

  return (
    <div className={`${getGridClasses()} ${gapSizes[gap]} ${className}`}>
      {children}
    </div>
  );
}

export default ContentGrid;
