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
    description: 'Allows users to save/bookmark videos to their watchlist',
    impacts: [
      'Save button in VideoCardEnhanced',
      'Save button in ShortPlayer',
      'Profile "Saved" tab',
      'Watchlist page',
      'POST /api/watchlist/{video:uuid}/toggle API calls',
      'GET /api/watchlist API calls',
    ],
    reason: '',
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
  STUDIO_ANALYTICS: {
    enabled: process.env.NEXT_PUBLIC_FEATURE_STUDIO_ANALYTICS === 'true',
    name: 'Studio Analytics',
    description: 'Analytics page in Creator Studio',
    impacts: ['Studio sidebar Analytics link', '/studio/analytics page'],
    reason: 'Page hidden during development',
  },
  STUDIO_EARNINGS: {
    enabled: process.env.NEXT_PUBLIC_FEATURE_STUDIO_EARNINGS === 'true',
    name: 'Studio Earnings',
    description: 'Earnings page in Creator Studio',
    impacts: ['Studio sidebar Earnings link', '/studio/earnings page'],
    reason: 'Page hidden during development',
  },
  STUDIO_PAYOUTS: {
    enabled: process.env.NEXT_PUBLIC_FEATURE_STUDIO_PAYOUTS === 'true',
    name: 'Studio Payouts',
    description: 'Payouts page in Creator Studio',
    impacts: ['Studio sidebar Payouts link', '/studio/payouts page'],
    reason: 'Page hidden during development',
  },
  STUDIO_SETTINGS: {
    enabled: process.env.NEXT_PUBLIC_FEATURE_STUDIO_SETTINGS === 'true',
    name: 'Studio Settings',
    description: 'Settings page in Creator Studio',
    impacts: ['Studio sidebar Settings link', '/studio/settings page'],
    reason: 'Page hidden during development',
  },
  STUDIO_CODES: {
    enabled: process.env.NEXT_PUBLIC_FEATURE_STUDIO_CODES === 'true',
    name: 'Studio Codes',
    description: 'Redeem codes management page in Creator Studio',
    impacts: ['Studio sidebar Codes link', '/studio/codes page'],
    reason: 'Page hidden during development',
  },
  INVITE_SYSTEM: {
    enabled: process.env.NEXT_PUBLIC_FEATURE_INVITE_SYSTEM === 'true',
    name: 'Invite System',
    description: 'Allows paid subscribers to generate and share invite codes',
    impacts: [
      'Account sidebar "Invite a Friend" tab',
      '/account/invite page',
      'GET /redeem-codes/my-invite API calls',
      'POST /redeem-codes/create-invite API calls',
    ],
    reason: '',
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
