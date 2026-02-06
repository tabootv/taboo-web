import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.test for test environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

/**
 * Playwright E2E Test Configuration for TabooTV Upload Flow
 *
 * Run tests:
 * - `npm run test:e2e` - Run all tests
 * - `npm run test:e2e:upload` - Run upload tests only
 * - `npm run test:e2e:ui` - Interactive UI mode
 * - `npm run test:e2e:headed` - Run with visible browser
 *
 * Mock Mode:
 * - PLAYWRIGHT_MOCK_MODE=true (default) - Uses mocked APIs
 * - PLAYWRIGHT_MOCK_MODE=false - Uses real APIs (integration)
 */

const isCI = !!process.env.CI;
const isMockMode = process.env.PLAYWRIGHT_MOCK_MODE !== 'false';

// Log mock mode status
console.log(`[Playwright] Mock Mode: ${isMockMode ? 'ENABLED' : 'DISABLED'}`);

export default defineConfig({
  testDir: './tests/e2e/specs',
  timeout: 60_000,
  globalTimeout: 15 * 60 * 1000, // 15 minutes

  expect: {
    timeout: 10_000,
  },

  // Upload tests should run sequentially to avoid state conflicts
  fullyParallel: false,

  // Fail the build on CI if test.only is left in source
  forbidOnly: isCI,

  // Retry failed tests
  retries: isCI ? 2 : 0,

  // Single worker for upload tests (state isolation)
  workers: 1,

  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ...(isCI ? [['github' as const]] : []),
  ],

  // Shared settings for all projects
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  // Global setup and teardown
  globalSetup: './tests/e2e/global/setup.ts',
  globalTeardown: './tests/e2e/global/teardown.ts',

  // Project configurations
  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /global\/.*\.setup\.ts/,
    },

    // Desktop Chrome (primary)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-web-security'], // Allow CORS for mock mode
        },
      },
      dependencies: ['setup'],
    },

    // Desktop Firefox (optional)
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },

    // Desktop Safari (optional)
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
  ],

  // Web server configuration - auto-start Next.js dev server
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 120_000, // 2 minutes for Next.js to start
    stdout: 'pipe',
    stderr: 'pipe',
    // Pass test environment variables to Next.js
    env: {
      PLAYWRIGHT_MOCK_MODE: isMockMode ? 'true' : 'false',
    },
  },

  // Output folder for test artifacts
  outputDir: './tests/e2e/test-results',
});
