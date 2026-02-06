import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object with common methods for all pages
 *
 * All page objects should extend this class to inherit
 * common navigation, wait, and interaction patterns.
 */
export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Navigation
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  // Wait for Next.js hydration to complete
  async waitForHydration(): Promise<void> {
    await this.page.waitForFunction(() => {
      return document.readyState === 'complete';
    });
    // Small buffer for React hydration
    await this.page.waitForTimeout(100);
  }

  // Toast notifications (Sonner)
  async waitForToast(text: string | RegExp): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]', {
      hasText: text,
    });
    await expect(toast).toBeVisible({ timeout: 10_000 });
  }

  async dismissToast(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  // Modal helpers
  async waitForModal(selector?: string): Promise<Locator> {
    const modalSelector = selector || '[role="dialog"]';
    const modal = this.page.locator(modalSelector);
    await expect(modal).toBeVisible();
    return modal;
  }

  async closeModal(): Promise<void> {
    await this.page.keyboard.press('Escape');
    // Wait for modal to close
    await this.page.waitForTimeout(300);
  }

  // Loading states
  async waitForLoadingComplete(): Promise<void> {
    // Wait for any loading spinners to disappear
    const loadingIndicators = this.page.locator(
      '[data-loading="true"], [aria-busy="true"], .animate-spin'
    );
    await loadingIndicators
      .first()
      .waitFor({
        state: 'hidden',
        timeout: 30_000,
      })
      .catch(() => {
        // No loading indicator found, continue
      });
  }

  // LocalStorage helpers
  async getLocalStorageItem(key: string): Promise<string | null> {
    return await this.page.evaluate((k) => localStorage.getItem(k), key);
  }

  async setLocalStorageItem(key: string, value: string): Promise<void> {
    await this.page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, value]);
  }

  async clearLocalStorage(): Promise<void> {
    await this.page.evaluate(() => localStorage.clear());
  }

  // Console error monitoring
  async collectConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    this.page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    return errors;
  }
}
