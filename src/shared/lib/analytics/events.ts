/**
 * Typed constants for all PostHog custom event names.
 *
 * Usage:
 *   import posthog from 'posthog-js';
 *   import { AnalyticsEvent } from '@/shared/lib/analytics/events';
 *   posthog.capture(AnalyticsEvent.AUTH_LOGIN_COMPLETED, { method: 'email' });
 */
export const AnalyticsEvent = {
  // ── P0: Auth & Onboarding ──
  AUTH_LOGIN_COMPLETED: 'auth_login_completed',
  AUTH_REGISTER_COMPLETED: 'auth_register_completed',
  ONBOARDING_PROFILE_STEP_COMPLETED: 'onboarding_profile_step_completed',
  ONBOARDING_PROFILE_COMPLETED: 'onboarding_profile_completed',

  // ── P0: Subscription Funnel ──
  SUBSCRIPTION_PLAN_VIEWED: 'subscription_plan_viewed',
  SUBSCRIPTION_PLAN_SELECTED: 'subscription_plan_selected',
  SUBSCRIPTION_CHECKOUT_STARTED: 'subscription_checkout_started',
  SUBSCRIPTION_PAYMENT_COMPLETED: 'subscription_payment_completed',
  SUBSCRIPTION_REDEEM_CODE_SUBMITTED: 'subscription_redeem_code_submitted',
  SUBSCRIPTION_REDEEM_CODE_APPLIED: 'subscription_redeem_code_applied',

  // ── P0: Content Consumption ──
  VIDEO_PLAYED: 'video_played',
  VIDEO_PAUSED: 'video_paused',
  SHORT_VIEWED: 'short_viewed',
  SHORT_LIKED: 'short_liked',

  // ── P0: Engagement ──
  VIDEO_LIKED: 'video_liked',
  WATCHLIST_ITEM_ADDED: 'watchlist_item_added',
  COMMENT_CREATED: 'comment_created',
  CREATOR_FOLLOWED: 'creator_followed',

  // ── P0: Search ──
  SEARCH_PERFORMED: 'search_performed',

  // ── P0: Payment-First Onboarding ──
  AUTH_LEAD_CAPTURED: 'auth_lead_captured',
  AUTH_POST_CHECKOUT_ACCOUNT_CREATED: 'auth_post_checkout_account_created',
  SUBSCRIPTION_GUEST_CHECKOUT_STARTED: 'subscription_guest_checkout_started', // docs: "embedded checkout"

  // ── P1: Auth ──
  AUTH_LOGIN_FAILED: 'auth_login_failed',
  AUTH_REGISTER_FAILED: 'auth_register_failed',
  AUTH_LOGOUT_COMPLETED: 'auth_logout_completed',
  AUTH_PASSWORD_RESET_REQUESTED: 'auth_password_reset_requested',
  AUTH_PASSWORD_RESET_COMPLETED: 'auth_password_reset_completed',

  // ── P1: Video Player ──
  VIDEO_SEEKED: 'video_seeked',
  VIDEO_COMPLETED: 'video_completed',
  VIDEO_QUALITY_CHANGED: 'video_quality_changed',

  // ── P1: Series ──
  SERIES_EPISODE_STARTED: 'series_episode_started',
  SERIES_EPISODE_COMPLETED: 'series_episode_completed',

  // ── P1: Engagement ──
  VIDEO_SAVED: 'video_saved',
  COMMENT_REPLY_CREATED: 'comment_reply_created',
  SHORT_SHARED: 'short_shared',
  SEARCH_RESULT_CLICKED: 'search_result_clicked',
  SUBSCRIPTION_MANAGE_CLICKED: 'subscription_manage_clicked',

  // ── P1: Creator Studio ──
  STUDIO_CONTENT_PUBLISHED: 'studio_content_published',

  // ── P2: Toggle / Undo Events ──
  VIDEO_LIKE_REMOVED: 'video_like_removed',
  SHORT_LIKE_REMOVED: 'short_like_removed',
  WATCHLIST_ITEM_REMOVED: 'watchlist_item_removed',
  VIDEO_UNSAVED: 'video_unsaved',
  COMMENT_DELETED: 'comment_deleted',
  CREATOR_UNFOLLOWED: 'creator_unfollowed',

  // ── P2: Player Controls ──
  VIDEO_FULLSCREEN_TOGGLED: 'video_fullscreen_toggled',
  VIDEO_AUTOPLAY_TOGGLED: 'video_autoplay_toggled',
  VIDEO_SPEED_CHANGED: 'video_speed_changed',

  // ── P2: Series ──
  SERIES_UP_NEXT_TRIGGERED: 'series_up_next_triggered',
  SERIES_UP_NEXT_CANCELLED: 'series_up_next_cancelled',

  // ── P2: Studio ──
  STUDIO_UPLOAD_STARTED: 'studio_upload_started',
  STUDIO_CONTENT_DELETED: 'studio_content_deleted',
  STUDIO_VISIBILITY_CHANGED: 'studio_visibility_changed',

  // ── P2: Community & Profile ──
  POST_CREATED: 'post_created',
  NOTIFICATION_CLICKED: 'notification_clicked',
  PROFILE_UPDATED: 'profile_updated',
  PASSWORD_CHANGED: 'password_changed',

  // ── Web Vitals (Performance Monitoring) ──
  WEB_VITALS_LCP: 'web_vitals_lcp',
  WEB_VITALS_CLS: 'web_vitals_cls',
  WEB_VITALS_INP: 'web_vitals_inp',
  WEB_VITALS_FCP: 'web_vitals_fcp',
  WEB_VITALS_TTFB: 'web_vitals_ttfb',
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];
