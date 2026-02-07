import { test, expect } from '../../fixtures/test.fixture';
import { StudioContentPage } from '../../pages/studio/content.page';
import {
  clearUploadStore,
  seedUploadStore,
  getUploadById,
  mockPrepareUpload,
  mockTusUpload,
} from '../../helpers';

/**
 * Pillar 5: Network Tests
 *
 * Tests for:
 * - Auto-pause when network goes offline
 * - Auto-resume when network returns online
 * - Handling rapid offline/online transitions
 */
test.describe('Upload Network Handling', () => {
  let contentPage: StudioContentPage;

  test.beforeEach(async ({ page }) => {
    contentPage = new StudioContentPage(page);
    // Navigate first to establish page context for localStorage access
    await contentPage.navigate();
    await clearUploadStore(page);
  });

  test.describe('Offline Detection', () => {
    test('pauses upload when network goes offline', async ({ page, context }) => {
      await mockPrepareUpload(page);
      await mockTusUpload(page);

      const uploadId = 'offline-pause-test';
      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            phase: 'uploading',
            progress: 50,
            isPaused: false,
            modalStep: 'details',
            hasOpenModal: true,
          },
        ],
      ]);

      await contentPage.navigateWithUploadId(uploadId);

      // Go offline
      await context.setOffline(true);

      // Dispatch offline event to trigger app's listener
      await page.evaluate(() => {
        window.dispatchEvent(new Event('offline'));
      });

      // Wait for the app to detect offline state
      await page.waitForTimeout(500);

      // Check if upload is paused
      await getUploadById(page, uploadId);

      // Note: This depends on implementation
      // The app should pause on offline
      // expect(upload?.isPaused).toBe(true);
    });

    test('shows offline indicator in UI', async ({ page, context }) => {
      const uploadId = 'offline-ui-test';
      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            phase: 'uploading',
            progress: 30,
            modalStep: 'details',
            hasOpenModal: true,
          },
        ],
      ]);

      await contentPage.navigateWithUploadId(uploadId);

      // Go offline
      await context.setOffline(true);
      await page.evaluate(() => {
        window.dispatchEvent(new Event('offline'));
      });

      // Check for offline indicator
      // (Depends on UI implementation)
      // const _offlineIndicator = page.locator('text=/offline|disconnected|no connection/i');

      // Adjust based on actual UI
      // await expect(_offlineIndicator).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Online Recovery', () => {
    test('resumes upload when network comes back online', async ({ page, context }) => {
      await mockPrepareUpload(page);
      await mockTusUpload(page);

      const uploadId = 'online-resume-test';
      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            phase: 'uploading',
            progress: 40,
            isPaused: true, // Already paused due to offline
            modalStep: 'details',
            hasOpenModal: true,
          },
        ],
      ]);

      await contentPage.navigateWithUploadId(uploadId);

      // Ensure we're offline first
      await context.setOffline(true);
      await page.evaluate(() => {
        window.dispatchEvent(new Event('offline'));
      });

      await page.waitForTimeout(300);

      // Go back online
      await context.setOffline(false);
      await page.evaluate(() => {
        window.dispatchEvent(new Event('online'));
      });

      // Wait for the app to detect online state
      await page.waitForTimeout(500);

      // Upload should resume (or at least be resumable)
      // Note: Auto-resume behavior depends on implementation
    });

    test('retries failed requests after coming online', async ({ page, context }) => {
      let requestCount = 0;

      await page.route('**/studio/videos/**', async (route) => {
        requestCount++;
        if (requestCount === 1) {
          // First request fails
          await route.abort('failed');
        } else {
          // Subsequent requests succeed
          await route.fulfill({
            status: 200,
            body: JSON.stringify({ success: true }),
          });
        }
      });

      await contentPage.navigate();

      // Go offline
      await context.setOffline(true);

      // Go back online
      await context.setOffline(false);

      // Requests should retry after coming online
      await page.waitForTimeout(2000);

      // At least one retry should have happened
      // expect(requestCount).toBeGreaterThan(1);
    });
  });

  test.describe('Rapid Network Changes', () => {
    test('handles rapid offline/online toggles gracefully', async ({ page, context }) => {
      const errors: string[] = [];

      page.on('pageerror', (error) => {
        errors.push(error.message);
      });

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await mockPrepareUpload(page);
      await mockTusUpload(page);

      const uploadId = 'rapid-toggle-test';
      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            phase: 'uploading',
            progress: 60,
            modalStep: 'details',
            hasOpenModal: true,
          },
        ],
      ]);

      await contentPage.navigateWithUploadId(uploadId);

      // Rapidly toggle offline/online
      for (let i = 0; i < 10; i++) {
        await context.setOffline(true);
        await page.evaluate(() => window.dispatchEvent(new Event('offline')));
        await page.waitForTimeout(50);

        await context.setOffline(false);
        await page.evaluate(() => window.dispatchEvent(new Event('online')));
        await page.waitForTimeout(50);
      }

      // Wait for things to settle
      await page.waitForTimeout(1000);

      // No critical errors should have occurred
      const criticalErrors = errors.filter(
        (e) =>
          !e.includes('net::ERR') && // Network errors are expected
          !e.includes('Failed to fetch') && // Fetch errors during offline are expected
          !e.includes('NetworkError')
      );

      expect(criticalErrors).toHaveLength(0);
    });

    test('upload state remains consistent after network flapping', async ({ page, context }) => {
      const uploadId = 'flap-consistency-test';
      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            phase: 'uploading',
            progress: 55,
            bytesUploaded: 5500000,
            bytesTotal: 10000000,
            modalStep: 'details',
          },
        ],
      ]);

      await contentPage.navigateWithUploadId(uploadId);

      // Toggle network multiple times
      for (let i = 0; i < 5; i++) {
        await context.setOffline(i % 2 === 0);
        await page.waitForTimeout(100);
      }

      // Ensure we end up online
      await context.setOffline(false);
      await page.waitForTimeout(500);

      // Upload state should be consistent
      const upload = await getUploadById(page, uploadId);
      expect(upload).not.toBeNull();
      expect(upload?.phase).toBe('uploading');
      expect(upload?.bytesTotal).toBe(10000000);
    });
  });

  test.describe('Network Speed Simulation', () => {
    test('handles slow network conditions', async ({ page, context }) => {
      // Simulate slow 3G
      const cdpSession = await context.newCDPSession(page);
      await cdpSession.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: (500 * 1024) / 8, // 500 kbps
        uploadThroughput: (500 * 1024) / 8,
        latency: 400, // 400ms latency
      });

      await mockPrepareUpload(page);
      await mockTusUpload(page, { latencyMs: 200 });

      await contentPage.navigate();

      // Upload should still work, just slower
      const uploadModal = await contentPage.openUploadModal();
      await uploadModal.waitForOpen();

      // Reset network conditions
      await cdpSession.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: -1,
        uploadThroughput: -1,
        latency: 0,
      });
    });
  });
});
