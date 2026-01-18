/**
 * Feature Flag Configuration
 *
 * Each feature has:
 * - enabled: Boolean flag (reads from environment variables)
 * - name: Human-readable name
 * - description: What the feature does
 * - impacts: Where in the UI this feature affects
 * - reason: Why it's disabled (if applicable)
 */

export const FEATURES = {
  BOOKMARK_SYSTEM: {
    enabled: process.env.NEXT_PUBLIC_FEATURE_BOOKMARK_SYSTEM === 'true',
    name: 'Bookmark System',
    description: 'Allows users to save/bookmark videos to their profile',
    impacts: [
      'Save button in VideoCardEnhanced',
      'Save button in ShortPlayer',
      'Profile "Saved" tab',
      'POST /videos/{id}/toggle-bookmark API calls',
    ],
    reason: 'Backend not ready - bookmark persistence under development',
  },
  WATCH_HISTORY: {
    enabled: process.env.NEXT_PUBLIC_FEATURE_WATCH_HISTORY === 'true',
    name: 'Watch History',
    description: 'Allows users to view their video watch history',
    impacts: [
      'Profile page History tab',
      'History navigation item in sidebar',
      'GET /profile/watch-history API endpoint',
      'useHistoryVideos() query hook',
    ],
    reason: 'Backend not ready - history tracking under development',
  },
} as const;

export type FeatureName = keyof typeof FEATURES;
export type FeatureConfig = (typeof FEATURES)[FeatureName];

/**
 * isFeatureEnabled
 *
 * Check if a feature is enabled in Server Components or API routes.
 * Use this instead of useFeature() in server-side code.
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
