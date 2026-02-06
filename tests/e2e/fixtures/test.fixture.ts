/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, Page } from '@playwright/test';
import { mockPrepareUpload, mockVideoUpdate, mockCreateSchedule } from '../helpers/mock-api.helper';
import { mockTusUpload } from '../helpers/tus-mock.helper';
import { setupMockAuth } from '../helpers/auth.helper';

/**
 * Global Mock Mode Toggle
 *
 * Reads PLAYWRIGHT_MOCK_MODE from environment:
 * - 'true' or not set (default): Mocks enabled (safe)
 * - 'false': Mocks disabled (real API calls)
 */
export const isMockMode = process.env.PLAYWRIGHT_MOCK_MODE !== 'false';

/**
 * Custom Test Fixture with Auto-Mocking and Authentication
 *
 * Provides page fixtures with automatic authentication setup:
 * - `page`: Standard Playwright page with auth mocks applied
 * - `autoMockedPage`: Page with mocks auto-applied based on PLAYWRIGHT_MOCK_MODE
 *
 * Usage:
 * ```typescript
 * import { test, expect } from '../../fixtures/test.fixture';
 *
 * // Option 1: Use autoMockedPage for automatic mocking
 * test('my test', async ({ autoMockedPage: page }) => {
 *   // Mocks are already applied if PLAYWRIGHT_MOCK_MODE=true
 * });
 *
 * // Option 2: Use standard page for manual control
 * test('my test', async ({ page }) => {
 *   // Auth is set up, set up your own API mocks or use real APIs
 * });
 * ```
 */
export const test = base.extend<{ autoMockedPage: Page }>({
  /**
   * Override default page fixture to include auth setup when in mock mode
   *
   * When PLAYWRIGHT_MOCK_MODE=true:
   *   - Sets auth cookie (tabootv_token)
   *   - Seeds auth store in localStorage
   *   - Mocks /me endpoint
   *
   * When PLAYWRIGHT_MOCK_MODE=false:
   *   - No mocking, relies on actual login flow
   */
  page: async ({ page }, use) => {
    if (isMockMode) {
      // Set up mock authentication for all tests
      await setupMockAuth(page);

      if (process.env.DEBUG) {
        console.log('[Test Fixture] Mock auth setup applied');
      }
    }

    await use(page);
  },

  /**
   * Auto-mocked page fixture
   * Applies all upload-related mocks when PLAYWRIGHT_MOCK_MODE=true
   */
  autoMockedPage: async ({ page }, use) => {
    // Auth is already set up via the page fixture above
    if (isMockMode) {
      // Apply all API mocks
      await mockPrepareUpload(page);
      await mockVideoUpdate(page);
      await mockCreateSchedule(page);

      // Apply TUS upload mock
      await mockTusUpload(page);

      if (process.env.DEBUG) {
        console.log('[Test Fixture] Mock mode ENABLED - All API mocks applied');
      }
    } else if (process.env.DEBUG) {
      console.log('[Test Fixture] Mock mode DISABLED - Using real APIs');
    }

    await use(page);
  },
});

// Re-export expect from Playwright
export { expect } from '@playwright/test';
