/**
 * Profile Completion Utilities
 *
 * Derives profile completion status from field presence since the backend
 * does not reliably set profile_completed via the update-profile API.
 */

import type { User } from '@/types/user';

/**
 * Check if a user's profile is complete based on required fields.
 * Required: display_name, first_name, last_name, gender, country_id, handler
 */
export function isProfileComplete(user: User | null): boolean {
  if (!user) return false;
  return !!(
    user.display_name &&
    user.first_name &&
    user.last_name &&
    user.gender &&
    user.country_id &&
    user.handler
  );
}

export type OnboardingStep = 'complete_profile' | 'subscribe' | 'ready';

/**
 * Determine the current onboarding step for a user.
 */
export function getOnboardingStep(user: User | null, isSubscribed: boolean): OnboardingStep {
  if (!isProfileComplete(user)) return 'complete_profile';
  if (!isSubscribed) return 'subscribe';
  return 'ready';
}

/**
 * Get the redirect path for the user's current onboarding step.
 * Returns null if user is ready (no redirect needed).
 */
export function getOnboardingRedirectPath(user: User | null, isSubscribed: boolean): string | null {
  const step = getOnboardingStep(user, isSubscribed);
  switch (step) {
    case 'complete_profile':
      return '/profile/complete';
    case 'subscribe':
      return '/choose-plan';
    case 'ready':
      return null;
  }
}
