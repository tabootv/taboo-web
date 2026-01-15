'use client';

import { type ReactNode } from 'react';
import { useFeature } from '@/lib/hooks/use-feature';
import { type FeatureName } from '@/shared/lib/config/feature-flags';

export interface FeatureProps {
  /**
   * The name of the feature flag to check
   */
  name: FeatureName;

  /**
   * Content to render if feature is enabled
   */
  children: ReactNode;

  /**
   * Optional fallback content if feature is disabled
   * @default null (renders nothing)
   */
  fallback?: ReactNode;

  /**
   * Invert the logic (render when disabled instead of enabled)
   * @default false
   */
  invert?: boolean;
}

/**
 * Feature Wrapper Component
 *
 * Conditionally renders children based on feature flag state.
 *
 * @example
 * // Render save button only if bookmarks are enabled
 * <Feature name="BOOKMARK_SYSTEM">
 *   <SaveButton />
 * </Feature>
 *
 * @example
 * // Show fallback UI when disabled
 * <Feature name="BOOKMARK_SYSTEM" fallback={<ComingSoonBadge />}>
 *   <SaveButton />
 * </Feature>
 *
 * @example
 * // Invert logic (show when disabled)
 * <Feature name="BOOKMARK_SYSTEM" invert>
 *   <div>Bookmarks are currently unavailable</div>
 * </Feature>
 */
export function Feature({ name, children, fallback = null, invert = false }: FeatureProps) {
  const isEnabled = useFeature(name);
  const shouldRender = invert ? !isEnabled : isEnabled;

  if (!shouldRender) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
