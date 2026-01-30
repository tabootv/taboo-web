'use client';

import { cn } from '@/shared/utils/formatting';

interface StepCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Consistent card wrapper for wizard steps
 * Provides unified styling for all step content
 */
export function StepCard({ title, description, children, className }: StepCardProps) {
  return (
    <div className={cn('bg-surface border border-border rounded-xl p-6', className)}>
      <div className="mb-6">
        <h2 className="text-lg font-medium text-text-primary">{title}</h2>
        {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
      </div>
      {children}
    </div>
  );
}
