import { Page, BrowserContext } from '@playwright/test';
import { setupStudioContentMocks } from './mock-api.helper';

/**
 * Auth Helper for E2E Tests
 *
 * Provides utilities for mocking authentication in tests.
 * Sets up cookies, localStorage, and API mocks needed for authenticated flows.
 */

const TOKEN_KEY = 'tabootv_token';
const AUTH_STORE_KEY = 'tabootv-auth';

/**
 * Default mock user for testing
 */
export const MOCK_CREATOR_USER = {
  id: 999,
  email: 'test-creator@example.com',
  username: 'testcreator',
  display_name: 'Test Creator',
  is_creator: true,
  channel: {
    id: 100,
    name: 'Test Channel',
    slug: 'test-channel',
  },
};

/**
 * Default mock token for testing
 */
export const MOCK_TOKEN = 'test-auth-token-playwright-e2e';

/**
 * Set up mock authentication for a page
 *
 * This sets the auth cookie and seeds the auth store in localStorage.
 * Should be called before navigating to protected routes.
 */
export async function setupMockAuth(
  page: Page,
  options: {
    user?: typeof MOCK_CREATOR_USER;
    token?: string;
  } = {}
): Promise<void> {
  const { user = MOCK_CREATOR_USER, token = MOCK_TOKEN } = options;

  // Set auth cookie at context level (applies to all requests immediately)
  // Use domain and path explicitly for reliable cookie access
  await page.context().addCookies([
    {
      name: TOKEN_KEY,
      value: token,
      domain: 'localhost',
      path: '/',
      secure: false,
      sameSite: 'Lax',
    },
  ]);

  // Mock the /me endpoint for client-side auth calls
  // This pattern matches both local (/api/me) and external (https://app.taboo.tv/api/me) URLs
  // Use a single comprehensive pattern to avoid route priority issues
  await page.route(/\/api\/me(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user }),
    });
  });

  // Also mock direct /me endpoint (without /api prefix) for any edge cases
  await page.route(/\/me(\?.*)?$/, async (route) => {
    const url = route.request().url();
    // Only intercept if it's truly the /me endpoint (not /something/me)
    if (/\/me(\?.*)?$/.exec(url)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user }),
      });
    } else {
      await route.continue();
    }
  });

  // Seed the auth store in localStorage via addInitScript
  // This runs EVERY time the page loads/navigates (before any JS executes)
  //
  // Force the auth state on every run to prevent pollution from previous failed tests
  // Include ALL necessary state to prevent race conditions with Zustand hydration
  await page.addInitScript(
    ([authKey, userData, subscribed]) => {
      const authState = {
        state: {
          user: userData,
          isSubscribed: subscribed,
          isProfileComplete: true,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
          error: null,
          _hasHydrated: true,
        },
        version: 0,
      };
      localStorage.setItem(authKey, JSON.stringify(authState));
    },
    [AUTH_STORE_KEY, user, false] as const
  );

  // Mock studio content APIs to prevent 401 errors that trigger redirects
  await setupStudioContentMocks(page);
}

/**
 * Seed the auth store in localStorage
 *
 * This should be called after the page has loaded to set up the client-side auth state.
 */
export async function seedAuthStore(
  page: Page,
  options: {
    user?: typeof MOCK_CREATOR_USER;
    isSubscribed?: boolean;
  } = {}
): Promise<void> {
  const { user = MOCK_CREATOR_USER, isSubscribed = false } = options;

  await page.evaluate(
    ([key, userData, subscribed]) => {
      const authState = {
        state: {
          user: userData,
          isSubscribed: subscribed,
          isProfileComplete: true,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
          error: null,
          _hasHydrated: true,
        },
        version: 0,
      };
      localStorage.setItem(key, JSON.stringify(authState));
    },
    [AUTH_STORE_KEY, user, isSubscribed] as const
  );
}

/**
 * Clear all authentication state
 */
export async function clearAuth(page: Page): Promise<void> {
  // Clear cookie
  await page.context().clearCookies();

  // Clear localStorage auth state
  await page.evaluate((key) => {
    localStorage.removeItem(key);
  }, AUTH_STORE_KEY);
}

/**
 * Setup full authentication mocking for a context
 *
 * This sets up auth at the context level for all pages.
 */
export async function setupContextAuth(context: BrowserContext): Promise<void> {
  await context.addCookies([
    {
      name: TOKEN_KEY,
      value: MOCK_TOKEN,
      domain: 'localhost',
      path: '/',
      secure: false,
      sameSite: 'Lax',
    },
  ]);
}
