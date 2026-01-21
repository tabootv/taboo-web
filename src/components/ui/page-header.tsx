'use client';

import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

export interface PageHeaderProps {
  /** Main title of the page */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Back navigation link */
  backHref?: string;
  /** Custom back button click handler */
  onBack?: () => void;
  /** Optional icon to display before title */
  icon?: ReactNode;
  /** Filter/action slot to render after title */
  actions?: ReactNode;
  /** Additional className for customization */
  className?: string;
  classNameActions?: string;
  variant?: 'default' | 'large' | 'hero';
}

/**
 * Unified page header component for consistent page titles across the app.
 *
 * @example
 * // Basic usage
 * <PageHeader title="Videos" subtitle="Browse all videos" />
 *
 * @example
 * // With back button
 * <PageHeader
 *   title="Upload Video"
 *   subtitle="Share your content"
 *   backHref="/studio"
 * />
 *
 * @example
 * // With filters
 * <PageHeader title="Series" actions={<FilterChips filters={filters} />} />
 */
export function PageHeader({
  title,
  subtitle,
  backHref,
  onBack,
  icon,
  actions,
  className = '',
  classNameActions = '',
  variant = 'default',
}: PageHeaderProps) {
  const titleClasses = {
    default: 'title-page',
    large: 'title-hero',
    hero: 'title-hero gradient-text',
  };

  const BackButton = () => {
    if (!backHref && !onBack) return null;

    const buttonClasses =
      'p-2 rounded-xl hover:bg-white/10 transition-colors flex-shrink-0';

    if (onBack) {
      return (
        <button onClick={onBack} className={buttonClasses}>
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>
      );
    }

    return (
      <Link href={backHref!} className={buttonClasses}>
        <ArrowLeft className="w-5 h-5 text-text-secondary" />
      </Link>
    );
  };

  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-start gap-4">
        <BackButton />

        {icon && (
          <div className="p-3 rounded-xl bg-white/5 shrink-0">{icon}</div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className={titleClasses[variant]}>{title}</h1>
              {subtitle && <p className="body-base mt-1">{subtitle}</p>}
            </div>

            {actions && (
              <div className={cn('shrink-0', classNameActions)}>{actions}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageHeader;
