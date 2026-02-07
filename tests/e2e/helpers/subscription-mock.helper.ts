import { Page, Route } from '@playwright/test';

/**
 * Subscription Mock Helper
 *
 * Utilities for mocking subscription-related API responses
 * for testing the subscription management page.
 */

// ─── Mock Response Types ───

export interface MockSubscriptionResponse {
  provider: string | null;
  status: string | null;
  start_at: string | null;
  end_at: string | null;
  manage_url: string | null;
}

export interface MockSubscriptionStatusResponse {
  is_subscribed: boolean;
}

// ─── Shared Date Constants ───

const JAN_2026 = '2026-01-01T00:00:00.000Z';
const FEB_2026 = '2026-02-01T00:00:00.000Z';
const MAR_2026 = '2026-03-01T00:00:00.000Z';
const WHOP_MANAGE_URL = 'https://whop.com/manage/test-subscription';

// ─── Default Responses ───

export const MOCK_SUBSCRIPTION_ACTIVE: MockSubscriptionResponse = {
  provider: 'whop',
  status: 'active',
  start_at: JAN_2026,
  end_at: FEB_2026,
  manage_url: WHOP_MANAGE_URL,
};

export const MOCK_SUBSCRIPTION_CANCELED: MockSubscriptionResponse = {
  provider: 'whop',
  status: 'canceled',
  start_at: JAN_2026,
  end_at: MAR_2026,
  manage_url: WHOP_MANAGE_URL,
};

export const MOCK_SUBSCRIPTION_EXPIRED: MockSubscriptionResponse = {
  provider: 'whop',
  status: 'expired',
  start_at: '2025-01-01T00:00:00.000Z',
  end_at: '2025-12-31T00:00:00.000Z',
  manage_url: null,
};

export const MOCK_SUBSCRIPTION_PAST_DUE: MockSubscriptionResponse = {
  provider: 'stripe',
  status: 'past_due',
  start_at: JAN_2026,
  end_at: FEB_2026,
  manage_url: 'https://billing.stripe.com/test',
};

export const MOCK_SUBSCRIPTION_APPLE: MockSubscriptionResponse = {
  provider: 'apple',
  status: 'active',
  start_at: JAN_2026,
  end_at: FEB_2026,
  manage_url: null,
};

export const MOCK_SUBSCRIPTION_GOOGLE: MockSubscriptionResponse = {
  provider: 'google',
  status: 'active',
  start_at: JAN_2026,
  end_at: FEB_2026,
  manage_url: null,
};

export const MOCK_NO_MANAGE_URL: MockSubscriptionResponse = {
  provider: 'copecart',
  status: 'active',
  start_at: JAN_2026,
  end_at: FEB_2026,
  manage_url: null,
};

// ─── Mock Setup Functions ───

/**
 * Mock the subscription endpoint to return given subscription data.
 * Mocks both GET /api/subscription and GET /api/subscription/status.
 */
export async function mockSubscription(
  page: Page,
  subscription: MockSubscriptionResponse | null,
  options: { isSubscribed?: boolean } = {}
): Promise<void> {
  const isSubscribed =
    options.isSubscribed ??
    (subscription?.status === 'active' || subscription?.status === 'canceled');

  // Mock GET /api/subscription
  await page.route(/\/api\/subscription(?!\/)/, async (route: Route) => {
    if (route.request().method() === 'GET') {
      if (subscription) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(subscription),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({}),
        });
      }
    } else {
      await route.continue();
    }
  });

  // Mock GET /api/subscription/status
  await page.route('**/api/subscription/status*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ is_subscribed: isSubscribed }),
    });
  });
}

/**
 * Mock subscription status endpoint to return a dynamic sequence of responses.
 * Useful for testing post-cancellation polling where status changes over time.
 */
export async function mockSubscriptionStatusSequence(
  page: Page,
  responses: MockSubscriptionStatusResponse[]
): Promise<{ getCallCount: () => number }> {
  let callCount = 0;

  await page.route('**/api/subscription/status*', async (route: Route) => {
    const idx = Math.min(callCount, responses.length - 1);
    callCount++;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responses[idx]),
    });
  });

  return { getCallCount: () => callCount };
}

/**
 * Mock subscription endpoint to return a server error
 */
export async function mockSubscriptionError(page: Page, statusCode = 500): Promise<void> {
  await page.route(/\/api\/subscription/, async (route: Route) => {
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Failed to fetch subscription',
        errors: { subscription: ['Server error'] },
      }),
    });
  });
}

/**
 * Seed the auth store with subscription state via addInitScript.
 * Must be called BEFORE page navigation.
 */
export async function seedSubscriptionState(
  page: Page,
  options: {
    isSubscribed?: boolean;
    user?: Record<string, unknown>;
  } = {}
): Promise<void> {
  const { isSubscribed = true, user } = options;

  const defaultUser = {
    id: 999,
    email: 'test-creator@example.com',
    username: 'testcreator',
    display_name: 'Test Creator',
    first_name: 'Test',
    last_name: 'Creator',
    gender: 'male',
    country_id: 1,
    handler: 'testcreator',
    is_creator: true,
    channel: { id: 100, name: 'Test Channel', slug: 'test-channel' },
  };

  await page.addInitScript(
    ([authKey, userData, subscribed]) => {
      const authState = {
        state: {
          user: userData,
          isSubscribed: subscribed,
          isAuthenticated: true,
          isProfileComplete: true,
          isLoading: false,
          isInitialized: true,
          error: null,
          _hasHydrated: true,
        },
        version: 0,
      };
      localStorage.setItem(authKey, JSON.stringify(authState));
    },
    ['tabootv-auth', user ?? defaultUser, isSubscribed] as const
  );
}
