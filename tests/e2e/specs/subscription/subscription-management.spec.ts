import { expect } from '@playwright/test';
import { test } from '../../fixtures/test.fixture';
import { SubscriptionPage } from '../../pages/profile/subscription.page';
import {
  mockSubscription,
  mockSubscriptionError,
  mockSubscriptionStatusSequence,
  seedSubscriptionState,
  MOCK_SUBSCRIPTION_ACTIVE,
  MOCK_SUBSCRIPTION_CANCELED,
  MOCK_SUBSCRIPTION_EXPIRED,
  MOCK_SUBSCRIPTION_PAST_DUE,
  MOCK_SUBSCRIPTION_APPLE,
  MOCK_SUBSCRIPTION_GOOGLE,
  MOCK_NO_MANAGE_URL,
} from '../../helpers/subscription-mock.helper';

/**
 * Subscription Management Page Tests
 *
 * Tests the redesigned split-layout subscription management page
 * at /profile/subscription.
 *
 * Covers:
 * - Layout & design (glass cards, split layout, status bars)
 * - Active subscription states (active, canceled, expired, past_due)
 * - Provider-specific manage sections (Whop, Apple, Google, no manage URL)
 * - No subscription promo state
 * - Cancellation detection & banner
 * - Error handling & retry
 * - Navigation (back to profile, view plans)
 */

test.describe('Subscription Management Page', () => {
  // ──────────────────────────────────────────────────
  // Layout & Design
  // ──────────────────────────────────────────────────

  test.describe('Layout & Design', () => {
    test('should display split-layout with glass cards for active subscription', async ({
      page,
    }) => {
      await seedSubscriptionState(page, { isSubscribed: true });
      await mockSubscription(page, MOCK_SUBSCRIPTION_ACTIVE, { isSubscribed: true });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      // Header
      await expect(subscriptionPage.heading).toBeVisible();
      await expect(subscriptionPage.heading).toHaveCSS('font-size', /30px|2rem|1\.875rem/);

      // Split layout
      await subscriptionPage.expectSplitLayout();

      // Glass card styling
      await subscriptionPage.expectGlassCardStyling();

      // Back link
      await expect(subscriptionPage.backLink).toBeVisible();
    });

    test('should display features list in left column', async ({ page }) => {
      await seedSubscriptionState(page, { isSubscribed: true });
      await mockSubscription(page, MOCK_SUBSCRIPTION_ACTIVE, { isSubscribed: true });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      await subscriptionPage.expectFeaturesVisible();
      await expect(page.locator('text=HD & 4K quality')).toBeVisible();
      await expect(page.locator('text=Watch on any device')).toBeVisible();
      await expect(page.locator('text=Early access to new releases')).toBeVisible();
    });

    test('should display billing details in right column', async ({ page }) => {
      await seedSubscriptionState(page, { isSubscribed: true });
      await mockSubscription(page, MOCK_SUBSCRIPTION_ACTIVE, { isSubscribed: true });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      await expect(subscriptionPage.billingCard).toBeVisible();
      await subscriptionPage.expectProviderName('Whop');
      await expect(subscriptionPage.accountEmail).toContainText('test-creator@example.com');
    });

    test('should show loading state with branded spinner', async ({ page }) => {
      await seedSubscriptionState(page, { isSubscribed: true });

      // Delay the subscription response to see loading state
      await page.route(/\/api\/subscription/, async (route) => {
        await new Promise((r) => setTimeout(r, 3000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_SUBSCRIPTION_ACTIVE),
        });
      });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.goto('/profile/subscription');

      // Loading spinner should be visible
      await expect(subscriptionPage.loadingSpinner).toBeVisible();
      await expect(page.locator('text=Loading subscription details...')).toBeVisible();
    });
  });

  // ──────────────────────────────────────────────────
  // Status Variations
  // ──────────────────────────────────────────────────

  test.describe('Subscription Status Variations', () => {
    test('should display active status with green bar and badge', async ({ page }) => {
      await seedSubscriptionState(page, { isSubscribed: true });
      await mockSubscription(page, MOCK_SUBSCRIPTION_ACTIVE, { isSubscribed: true });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      await subscriptionPage.expectActiveSubscription();

      // Green status bar should be visible
      const statusBar = page.locator('.bg-green-500.h-1');
      await expect(statusBar).toBeVisible();

      // Billing date label should say "Next Billing"
      await expect(page.locator('text=Next Billing')).toBeVisible();
    });

    test('should display canceled status with yellow bar and notice', async ({ page }) => {
      await seedSubscriptionState(page, { isSubscribed: true });
      await mockSubscription(page, MOCK_SUBSCRIPTION_CANCELED, { isSubscribed: true });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      await subscriptionPage.expectCanceledSubscription();

      // Yellow status bar
      const statusBar = page.locator('.bg-yellow-500.h-1');
      await expect(statusBar).toBeVisible();

      // Cancellation notice
      await expect(subscriptionPage.cancellationNotice).toBeVisible();
      await expect(subscriptionPage.cancellationNotice).toContainText('March 1, 2026');

      // Billing label should say "Access Until"
      await expect(page.locator('text=Access Until')).toBeVisible();
    });

    test('should display expired status with red bar', async ({ page }) => {
      await seedSubscriptionState(page, { isSubscribed: false });
      await mockSubscription(page, MOCK_SUBSCRIPTION_EXPIRED, { isSubscribed: false });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      // Expired subscription with isSubscribed=false shows the no-subscription view
      await subscriptionPage.expectNoSubscription();
    });

    test('should display past_due status with orange bar', async ({ page }) => {
      await seedSubscriptionState(page, { isSubscribed: true });
      await mockSubscription(page, MOCK_SUBSCRIPTION_PAST_DUE, { isSubscribed: true });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      await subscriptionPage.expectPastDueSubscription();

      // Orange status bar
      const statusBar = page.locator('.bg-orange-500.h-1');
      await expect(statusBar).toBeVisible();

      // Should show Stripe as provider
      await subscriptionPage.expectProviderName('Stripe');
    });
  });

  // ──────────────────────────────────────────────────
  // Provider-Specific Manage Sections
  // ──────────────────────────────────────────────────

  test.describe('Provider-Specific Manage Sections', () => {
    test('should show manage button for Whop (web provider)', async ({ page }) => {
      await seedSubscriptionState(page, { isSubscribed: true });
      await mockSubscription(page, MOCK_SUBSCRIPTION_ACTIVE, { isSubscribed: true });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      await expect(subscriptionPage.manageButton).toBeVisible();
      await expect(subscriptionPage.manageButton).toContainText('Manage Subscription');

      // btn-premium class should be applied
      await expect(subscriptionPage.manageButton).toHaveClass(/btn-premium/);
    });

    test('should show Apple iOS instructions for Apple provider', async ({ page }) => {
      await seedSubscriptionState(page, { isSubscribed: true });
      await mockSubscription(page, MOCK_SUBSCRIPTION_APPLE, { isSubscribed: true });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      await expect(subscriptionPage.appleInstructions).toBeVisible();
      await expect(page.locator('text=Settings')).toBeVisible();
      await expect(page.locator('text=Apple ID')).toBeVisible();
      await expect(subscriptionPage.appleInstructionsLink).toBeVisible();

      // Manage button should NOT be visible
      await expect(subscriptionPage.manageButton).not.toBeVisible();

      // Provider name
      await subscriptionPage.expectProviderName('Apple App Store');
    });

    test('should show Google Play button for Google provider', async ({ page }) => {
      await seedSubscriptionState(page, { isSubscribed: true });
      await mockSubscription(page, MOCK_SUBSCRIPTION_GOOGLE, { isSubscribed: true });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      await expect(subscriptionPage.googlePlayButton).toBeVisible();
      await expect(subscriptionPage.googlePlayButton).toContainText('Open Google Play');

      // Manage button should NOT be visible
      await expect(subscriptionPage.manageButton).not.toBeVisible();

      // Provider name
      await subscriptionPage.expectProviderName('Google Play');
    });

    test('should show contact support for web provider without manage URL', async ({ page }) => {
      await seedSubscriptionState(page, { isSubscribed: true });
      await mockSubscription(page, MOCK_NO_MANAGE_URL, { isSubscribed: true });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      await expect(subscriptionPage.contactSupportLink).toBeVisible();
      await expect(subscriptionPage.contactSupportLink).toHaveAttribute(
        'href',
        'mailto:support@taboo.tv'
      );

      // Manage button should NOT be visible
      await expect(subscriptionPage.manageButton).not.toBeVisible();

      // Provider name
      await subscriptionPage.expectProviderName('CopeCart');
    });
  });

  // ──────────────────────────────────────────────────
  // No Subscription State
  // ──────────────────────────────────────────────────

  test.describe('No Subscription State', () => {
    test('should display promo card with Crown icon and CTA', async ({ page }) => {
      await seedSubscriptionState(page, { isSubscribed: false });
      await mockSubscription(page, null, { isSubscribed: false });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      await subscriptionPage.expectNoSubscription();
      await expect(subscriptionPage.promoHeading).toContainText('Unlock Premium Content');
      await expect(
        page.locator('text=Get unlimited access to exclusive creator content')
      ).toBeVisible();
    });

    test('should link to /choose-plan from View Plans CTA', async ({ page }) => {
      await seedSubscriptionState(page, { isSubscribed: false });
      await mockSubscription(page, null, { isSubscribed: false });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      await expect(subscriptionPage.viewPlansButton).toHaveAttribute('href', '/choose-plan');
    });

    test('should have fadeInScale animation on promo card', async ({ page }) => {
      await seedSubscriptionState(page, { isSubscribed: false });
      await mockSubscription(page, null, { isSubscribed: false });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      // Check the promo card container has the animation class
      const promoCard = page.locator(
        '.animate-\\[fadeInScale_0\\.4s_cubic-bezier\\(0\\.4\\,0\\,0\\.2\\,1\\)\\]'
      );
      await expect(promoCard).toBeVisible();
    });
  });

  // ──────────────────────────────────────────────────
  // Cancellation Detection & Banner
  // ──────────────────────────────────────────────────

  test.describe('Cancellation Detection', () => {
    test('should show cancellation banner when cancellation is detected after polling', async ({
      page,
    }) => {
      await seedSubscriptionState(page, { isSubscribed: true });
      await mockSubscription(page, MOCK_SUBSCRIPTION_ACTIVE, { isSubscribed: true });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      // Now simulate the polling response sequence: first subscribed, then not
      await mockSubscriptionStatusSequence(page, [
        { is_subscribed: false }, // First poll after returning from manage portal
      ]);

      // Simulate returning from manage portal by triggering the manage button
      // We intercept window.open to avoid actual navigation
      await page.evaluate(() => {
        window.open = () => null;
      });
      await subscriptionPage.clickManageSubscription();

      // Simulate visibility change (returning to tab)
      await page.evaluate(() => {
        document.dispatchEvent(new Event('visibilitychange'));
        Object.defineProperty(document, 'visibilityState', {
          value: 'visible',
          writable: true,
        });
        document.dispatchEvent(new Event('visibilitychange'));
      });

      // Wait for the polling to detect cancellation
      await expect(subscriptionPage.cancellationBanner).toBeVisible({ timeout: 15_000 });
      await expect(subscriptionPage.resubscribeButton).toBeVisible();
      await expect(subscriptionPage.resubscribeButton).toHaveAttribute('href', '/choose-plan');
    });
  });

  // ──────────────────────────────────────────────────
  // Error Handling
  // ──────────────────────────────────────────────────

  test.describe('Error Handling', () => {
    test('should display error banner when subscription fetch fails', async ({ page }) => {
      await seedSubscriptionState(page, { isSubscribed: true });
      await mockSubscriptionError(page, 500);

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      await expect(subscriptionPage.errorBanner).toBeVisible();
      await expect(subscriptionPage.retryButton).toBeVisible();
    });

    test('should retry loading when retry button is clicked', async ({ page }) => {
      let callCount = 0;
      await seedSubscriptionState(page, { isSubscribed: true });

      await page.route(/\/api\/subscription/, async (route) => {
        callCount++;
        if (callCount <= 1) {
          // First call fails
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Server error' }),
          });
        } else {
          // Subsequent calls succeed
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_SUBSCRIPTION_ACTIVE),
          });
        }
      });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      // Error should appear
      await expect(subscriptionPage.retryButton).toBeVisible();

      // Click retry
      await subscriptionPage.clickRetry();

      // Should now show subscription
      await subscriptionPage.expectActiveSubscription();
    });
  });

  // ──────────────────────────────────────────────────
  // Navigation
  // ──────────────────────────────────────────────────

  test.describe('Navigation', () => {
    test('should navigate back to profile when clicking back link', async ({ page }) => {
      await seedSubscriptionState(page, { isSubscribed: true });
      await mockSubscription(page, MOCK_SUBSCRIPTION_ACTIVE, { isSubscribed: true });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      await expect(subscriptionPage.backLink).toHaveAttribute('href', '/profile');
    });

    test('should open manage portal in new tab for Whop', async ({ page }) => {
      await seedSubscriptionState(page, { isSubscribed: true });
      await mockSubscription(page, MOCK_SUBSCRIPTION_ACTIVE, { isSubscribed: true });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      // Intercept window.open to verify it's called with the manage URL
      const windowOpenPromise = page.evaluate(() => {
        return new Promise<string>((resolve) => {
          window.open = (url) => {
            resolve(url as string);
            return null;
          };
        });
      });

      await subscriptionPage.clickManageSubscription();

      const openedUrl = await windowOpenPromise;
      expect(openedUrl).toBe('https://whop.com/manage/test-subscription');
    });

    test('should open Google Play subscriptions in new tab', async ({ page }) => {
      await seedSubscriptionState(page, { isSubscribed: true });
      await mockSubscription(page, MOCK_SUBSCRIPTION_GOOGLE, { isSubscribed: true });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      const windowOpenPromise = page.evaluate(() => {
        return new Promise<string>((resolve) => {
          window.open = (url) => {
            resolve(url as string);
            return null;
          };
        });
      });

      await subscriptionPage.googlePlayButton.click();

      const openedUrl = await windowOpenPromise;
      expect(openedUrl).toBe('https://play.google.com/store/account/subscriptions');
    });
  });

  // ──────────────────────────────────────────────────
  // Responsive Layout
  // ──────────────────────────────────────────────────

  test.describe('Responsive Layout', () => {
    test('should stack columns vertically on mobile viewport', async ({ page }) => {
      await seedSubscriptionState(page, { isSubscribed: true });
      await mockSubscription(page, MOCK_SUBSCRIPTION_ACTIVE, { isSubscribed: true });

      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      // On mobile, the grid should be single column (grid-cols-1)
      const leftColumn = page.locator('.md\\:col-span-7');
      const rightColumn = page.locator('.md\\:col-span-5');

      await expect(leftColumn).toBeVisible();
      await expect(rightColumn).toBeVisible();

      // Verify both columns are full width on mobile
      const leftBox = await leftColumn.boundingBox();
      const rightBox = await rightColumn.boundingBox();

      if (leftBox && rightBox) {
        // On mobile, right column should be BELOW left column (higher y)
        expect(rightBox.y).toBeGreaterThan(leftBox.y);
      }
    });

    test('should show side-by-side columns on desktop viewport', async ({ page }) => {
      await seedSubscriptionState(page, { isSubscribed: true });
      await mockSubscription(page, MOCK_SUBSCRIPTION_ACTIVE, { isSubscribed: true });

      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 800 });

      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();
      await subscriptionPage.waitForLoaded();

      const leftColumn = page.locator('.md\\:col-span-7');
      const rightColumn = page.locator('.md\\:col-span-5');

      const leftBox = await leftColumn.boundingBox();
      const rightBox = await rightColumn.boundingBox();

      if (leftBox && rightBox) {
        // On desktop, columns should be side by side (similar y, different x)
        expect(Math.abs(leftBox.y - rightBox.y)).toBeLessThan(10);
        expect(rightBox.x).toBeGreaterThan(leftBox.x);
      }
    });
  });
});
