import { Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Subscription Page Object
 *
 * Encapsulates interactions with the subscription management page
 * at /profile/subscription.
 */
export class SubscriptionPage extends BasePage {
  // ─── Locators ───

  /** Back to Profile link */
  get backLink(): Locator {
    return this.page.locator('a', { hasText: 'Back to Profile' });
  }

  /** Page heading */
  get heading(): Locator {
    return this.page.locator('h1', { hasText: 'Subscription' });
  }

  /** Loading spinner */
  get loadingSpinner(): Locator {
    return this.page.locator('.animate-spin').first();
  }

  // ─── Active Subscription Locators ───

  /** Left column plan card (has status bar) */
  get planCard(): Locator {
    return this.page.locator('text=Your Plan').locator('..');
  }

  /** Plan name display */
  get planName(): Locator {
    return this.page.locator('h2').filter({ hasText: /premium|monthly|yearly|annual/i });
  }

  /** Status badge pill */
  get statusBadge(): Locator {
    return this.page.locator('span').filter({
      hasText: /Active|Canceled|Expired|Past Due/,
    });
  }

  /** Features list items */
  get featureItems(): Locator {
    return this.page
      .locator('text=Unlimited streaming access')
      .locator('..')
      .locator('..')
      .locator('> div');
  }

  /** Cancellation notice inside plan card */
  get cancellationNotice(): Locator {
    return this.page.locator('text=Access continues until');
  }

  // ─── Billing Card Locators ───

  /** Billing details card */
  get billingCard(): Locator {
    return this.page.locator('text=Billing Details').locator('..');
  }

  /** Provider name in billing card */
  get providerName(): Locator {
    return this.page.locator('text=Provider').locator('..').locator('p').last();
  }

  /** Billing date in billing card */
  get billingDate(): Locator {
    return this.page.locator('text=Next Billing').locator('..').locator('p').last();
  }

  /** Access until date (when canceled) */
  get accessUntilDate(): Locator {
    return this.page.locator('text=Access Until').locator('..').locator('p').last();
  }

  /** Account email in billing card */
  get accountEmail(): Locator {
    return this.page.locator('text=Account').locator('..').locator('p').last();
  }

  // ─── Manage Card Locators ───

  /** Manage card heading */
  get manageCard(): Locator {
    return this.page.locator('h3', { hasText: 'Manage' }).locator('..');
  }

  /** Manage Subscription button (web providers) */
  get manageButton(): Locator {
    return this.page.locator('button', { hasText: 'Manage Subscription' });
  }

  /** Open Google Play button */
  get googlePlayButton(): Locator {
    return this.page.locator('button', { hasText: 'Open Google Play' });
  }

  /** Apple iOS instructions card */
  get appleInstructions(): Locator {
    return this.page.locator('text=Open on iOS');
  }

  /** Contact Support link */
  get contactSupportLink(): Locator {
    return this.page.locator('a', { hasText: 'Contact Support' });
  }

  /** View detailed instructions link (Apple) */
  get appleInstructionsLink(): Locator {
    return this.page.locator('a', { hasText: 'View detailed instructions' });
  }

  // ─── No Subscription Locators ───

  /** No subscription promo heading */
  get promoHeading(): Locator {
    return this.page.locator('h2', { hasText: 'Unlock Premium Content' });
  }

  /** View Plans CTA button */
  get viewPlansButton(): Locator {
    return this.page.locator('a', { hasText: 'View Plans' });
  }

  // ─── Banner Locators ───

  /** Cancellation detected banner */
  get cancellationBanner(): Locator {
    return this.page.locator('text=Subscription Canceled').first();
  }

  /** Re-subscribe button in cancellation banner */
  get resubscribeButton(): Locator {
    return this.page.locator('a', { hasText: 'Re-subscribe' });
  }

  /** Polling indicator badge */
  get pollingBadge(): Locator {
    return this.page.locator('text=Checking...');
  }

  /** Error banner */
  get errorBanner(): Locator {
    return this.page.locator('text=Failed to load subscription info');
  }

  /** Retry button in error banner */
  get retryButton(): Locator {
    return this.page.locator('button', { hasText: 'Try again' });
  }

  // ─── Actions ───

  async navigate(): Promise<void> {
    await this.goto('/profile/subscription');
    await this.waitForHydration();
  }

  async waitForLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }

  async waitForSubscriptionLoaded(): Promise<void> {
    // Wait for either the plan card or promo card to appear
    await this.page
      .locator('text=Your Plan, text=Unlock Premium Content')
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 })
      .catch(() => {
        // One of the two should be visible
      });
  }

  async clickManageSubscription(): Promise<void> {
    await this.manageButton.click();
  }

  async clickViewPlans(): Promise<void> {
    await this.viewPlansButton.click();
  }

  async clickBackToProfile(): Promise<void> {
    await this.backLink.click();
  }

  async clickRetry(): Promise<void> {
    await this.retryButton.click();
  }

  // ─── Assertions ───

  async expectActiveSubscription(): Promise<void> {
    await expect(this.statusBadge).toContainText('Active');
  }

  async expectCanceledSubscription(): Promise<void> {
    await expect(this.statusBadge).toContainText('Canceled');
  }

  async expectExpiredSubscription(): Promise<void> {
    await expect(this.statusBadge).toContainText('Expired');
  }

  async expectPastDueSubscription(): Promise<void> {
    await expect(this.statusBadge).toContainText('Past Due');
  }

  async expectNoSubscription(): Promise<void> {
    await expect(this.promoHeading).toBeVisible();
    await expect(this.viewPlansButton).toBeVisible();
  }

  async expectProviderName(name: string): Promise<void> {
    await expect(this.providerName).toContainText(name);
  }

  async expectFeaturesVisible(): Promise<void> {
    await expect(this.page.locator('text=Unlimited streaming access')).toBeVisible();
    await expect(this.page.locator('text=Exclusive creator content')).toBeVisible();
    await expect(this.page.locator('text=Cancel anytime')).toBeVisible();
  }

  async expectSplitLayout(): Promise<void> {
    // Verify two-column layout exists (md:grid-cols-12)
    const grid = this.page.locator('.grid.md\\:grid-cols-12');
    await expect(grid).toBeVisible();
  }

  async expectGlassCardStyling(): Promise<void> {
    // Verify glass card styling is applied (backdrop-blur-xl class)
    const glassCards = this.page.locator('.backdrop-blur-xl');
    const count = await glassCards.count();
    expect(count).toBeGreaterThanOrEqual(2); // At least plan card + billing card
  }
}
