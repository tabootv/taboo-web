import { FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Global Setup for Playwright E2E Tests
 *
 * This runs once before all tests to:
 * 1. Create auth directory for storing authenticated state
 * 2. Optionally authenticate a test user and save state
 *
 * Note: For full authentication, uncomment the auth section and
 * set TEST_CREATOR_EMAIL and TEST_CREATOR_PASSWORD in .env.test
 */
async function globalSetup(_config: FullConfig) {
  // Create auth directory if it doesn't exist
  const authDir = path.join(__dirname, '../.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Create empty auth state file if it doesn't exist
  const authFile = path.join(authDir, 'user.json');
  if (!fs.existsSync(authFile)) {
    // Create minimal storage state
    const emptyState = {
      cookies: [],
      origins: [],
    };
    fs.writeFileSync(authFile, JSON.stringify(emptyState, null, 2));
  }

  // Optional: Authenticate test user
  // Uncomment this section when ready to test authenticated flows
  /*
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const email = process.env.TEST_CREATOR_EMAIL;
  const password = process.env.TEST_CREATOR_PASSWORD;

  if (email && password && baseURL) {
    await page.goto(`${baseURL}/sign-in`);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for authentication to complete
    await page.waitForURL(url =>
      url.pathname !== '/sign-in',
      { timeout: 30_000 }
    );

    // Save authentication state
    await context.storageState({ path: authFile });
  }

  await browser.close();
  */

  console.log('Global setup complete');
}

export default globalSetup;
