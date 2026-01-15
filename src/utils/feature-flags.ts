import { FEATURES, type FeatureName } from '@/shared/lib/config/feature-flags';

/**
 * isFeatureEnabled
 *
 * Check if a feature is enabled in Server Components or API routes.
 * Use this instead of useFeature() in server-side code.
 *
 * @param featureName - The name of the feature to check
 * @returns boolean - true if enabled, false otherwise
 *
 * @example
 * // In Server Component
 * export default async function ProfilePage() {
 *   const bookmarksEnabled = isFeatureEnabled('BOOKMARK_SYSTEM');
 *
 *   return (
 *     <div>
 *       {bookmarksEnabled && <SavedTab />}
 *     </div>
 *   );
 * }
 *
 * @example
 * // In API route
 * export async function POST(request: Request) {
 *   if (!isFeatureEnabled('BOOKMARK_SYSTEM')) {
 *     return new Response('Feature disabled', { status: 403 });
 *   }
 *   // ... handle bookmark
 * }
 */
export function isFeatureEnabled(featureName: FeatureName): boolean {
  return FEATURES[featureName].enabled;
}

/**
 * getFeatureConfig
 *
 * Get the full feature configuration in server-side code.
 */
export function getFeatureConfig(featureName: FeatureName) {
  return FEATURES[featureName];
}

/**
 * getAllFeatures
 *
 * Get all feature flags and their status.
 * Useful for debugging or admin dashboards.
 */
export function getAllFeatures() {
  return Object.entries(FEATURES).map(([key, config]) => ({
    key,
    ...config,
  }));
}
