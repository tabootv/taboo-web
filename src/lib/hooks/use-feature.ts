'use client';

import { FEATURES, type FeatureName } from '@/shared/lib/config/feature-flags';

/**
 * useFeature Hook
 *
 * Checks if a feature is enabled in Client Components.
 *
 * @param featureName - The name of the feature to check
 * @returns boolean - true if enabled, false otherwise
 *
 * @example
 * function VideoCard() {
 *   const bookmarksEnabled = useFeature('BOOKMARK_SYSTEM');
 *
 *   return (
 *     <div>
 *       {bookmarksEnabled && <SaveButton />}
 *     </div>
 *   );
 * }
 */
export function useFeature(featureName: FeatureName): boolean {
  return FEATURES[featureName].enabled;
}

/**
 * useFeatureConfig Hook
 *
 * Returns the full feature configuration object.
 * Useful when you need access to description, impacts, or reason.
 *
 * @param featureName - The name of the feature
 * @returns FeatureConfig object
 *
 * @example
 * const bookmarkConfig = useFeatureConfig('BOOKMARK_SYSTEM');
 * console.log(bookmarkConfig.reason); // "Backend not ready..."
 */
export function useFeatureConfig(featureName: FeatureName) {
  return FEATURES[featureName];
}
