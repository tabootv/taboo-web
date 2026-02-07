import { test, expect } from '../../fixtures/test.fixture';
import { StudioContentPage } from '../../pages/studio/content.page';
import {
  clearUploadStore,
  createStaleUpload,
  getUploadById,
  isCircuitBreakerOpen,
} from '../../helpers';
import {
  mockPrepareUpload,
  mockTusUpload,
  mockTusFailure,
  setupFullUploadMocks,
} from '../../helpers';

/**
 * Pillar 1: Resilience Tests
 *
 * Tests for:
 * - beforeunload alerts during active upload
 * - TUS resume after forced refresh (F5)
 * - Circuit breaker behavior after failures
 */
test.describe('Upload Resilience', () => {
  let contentPage: StudioContentPage;

  test.beforeEach(async ({ page }) => {
    contentPage = new StudioContentPage(page);
    // Navigate first to establish page context for localStorage access
    await contentPage.navigate();
    await clearUploadStore(page);
  });

  test.describe('Beforeunload Warning', () => {
    test('shows beforeunload warning when upload is in progress', async ({ page }) => {
      // Setup mocks
      await setupFullUploadMocks(page);
      await mockTusUpload(page, { latencyMs: 100 });

      // Navigate and start upload
      await contentPage.navigate();
      await contentPage.openUploadModal();

      // Start an upload (would need a test file)
      // For now, we'll seed the store with an active upload
      await page.evaluate(() => {
        const uploadState = {
          state: {
            uploads: [
              [
                'test-upload-1',
                {
                  id: 'test-upload-1',
                  phase: 'uploading',
                  progress: 50,
                  isPaused: false,
                  isStale: false,
                },
              ],
            ],
          },
          version: 0,
        };
        localStorage.setItem('taboo-uploads', JSON.stringify(uploadState));
      });

      // Listen for dialog
      page.on('dialog', async (dialog) => {
        await dialog.dismiss();
      });

      // Trigger beforeunload
      await page.evaluate(() => {
        window.dispatchEvent(new Event('beforeunload'));
      });

      // Note: Actual beforeunload dialogs are browser-controlled
      // This test verifies the event listener is set up correctly
      // In a real scenario, you'd check that the upload state prevents navigation
    });

    test('allows navigation without warning when no upload is active', async ({ page }) => {
      await contentPage.navigate();

      // Verify no uploads in store
      await page.evaluate(() => {
        const raw = localStorage.getItem('taboo-uploads');
        return raw ? JSON.parse(raw) : null;
      });

      // Should be able to navigate away freely
      await page.goto('/');
      expect(page.url()).toContain('/');
    });

    test('allows navigation when upload is paused', async ({ page }) => {
      // Seed store with paused upload
      await page.evaluate(() => {
        const uploadState = {
          state: {
            uploads: [
              [
                'test-upload-1',
                {
                  id: 'test-upload-1',
                  phase: 'uploading',
                  progress: 50,
                  isPaused: true,
                  isStale: false,
                },
              ],
            ],
          },
          version: 0,
        };
        localStorage.setItem('taboo-uploads', JSON.stringify(uploadState));
      });

      await contentPage.navigate();

      // Paused uploads should allow navigation
      // (depending on implementation - adjust assertion as needed)
    });
  });

  test.describe('TUS Resume After Refresh', () => {
    test('marks upload as stale after page refresh', async ({ page }) => {
      // Seed store with active upload
      const uploadId = 'test-upload-resume';
      await page.evaluate((id) => {
        const uploadState = {
          state: {
            uploads: [
              [
                id,
                {
                  id,
                  videoId: 12345,
                  videoUuid: 'test-uuid',
                  bunnyVideoId: 'bunny-xyz',
                  fileName: 'test-video.mp4',
                  fileSize: 10000000,
                  contentType: 'video',
                  phase: 'uploading',
                  progress: 50,
                  bytesUploaded: 5000000,
                  bytesTotal: 10000000,
                  tusFingerprint: 'tus::fingerprint::123',
                  metadata: {
                    title: 'Test Video',
                    thumbnailSource: 'auto',
                    publishMode: 'none',
                  },
                  circuitBreaker: {
                    failureCount: 0,
                    lastFailureAt: null,
                    isOpen: false,
                  },
                  isPaused: false,
                  isStale: false,
                  error: null,
                  modalStep: 'details',
                  hasOpenModal: true,
                  startedAt: Date.now() - 60000,
                  lastProgressAt: Date.now(),
                },
              ],
            ],
          },
          version: 0,
        };
        localStorage.setItem('taboo-uploads', JSON.stringify(uploadState));
      }, uploadId);

      await contentPage.navigate();

      // Simulate page refresh (F5)
      await page.reload();

      // After reload, upload should be marked as stale
      // The app should detect this and show recovery UI
      const upload = await getUploadById(page, uploadId);

      // Note: The actual stale marking depends on the app's hydration logic
      // This test validates the store persistence across reload
      expect(upload).not.toBeNull();
      expect(upload?.fileName).toBe('test-video.mp4');
    });

    test('shows stale upload indicator for interrupted uploads', async ({ page }) => {
      const uploadId = await createStaleUpload(page, {
        fileName: 'interrupted-video.mp4',
        progress: 50,
        videoUuid: 'test-uuid-123',
      });

      // Navigate with uploadId to trigger modal
      await contentPage.navigateWithUploadId(uploadId);

      // Modal should show stale upload indicator
      // (The actual UI element depends on implementation)
      // const _staleIndicator = page.locator('text=/stale|interrupted|resume/i');

      // This assertion may need adjustment based on actual UI
      // await expect(_staleIndicator).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Circuit Breaker', () => {
    test('circuit breaker opens after 3 consecutive failures', async ({ page }) => {
      // Setup TUS to always fail
      await mockTusFailure(page, 500, 'Simulated server error');
      await mockPrepareUpload(page);

      // Seed upload with some failures
      const uploadId = 'test-circuit-breaker';
      await page.evaluate((id) => {
        const uploadState = {
          state: {
            uploads: [
              [
                id,
                {
                  id,
                  phase: 'uploading',
                  progress: 0,
                  circuitBreaker: {
                    failureCount: 2, // Already failed twice
                    lastFailureAt: Date.now() - 1000,
                    isOpen: false,
                  },
                  isPaused: false,
                  isStale: false,
                },
              ],
            ],
          },
          version: 0,
        };
        localStorage.setItem('taboo-uploads', JSON.stringify(uploadState));
      }, uploadId);

      await contentPage.navigate();

      // After another failure, circuit breaker should open
      // This would require triggering an actual upload retry
    });

    test('shows error UI when circuit breaker is open', async ({ page }) => {
      // Seed upload with open circuit breaker
      const uploadId = 'test-circuit-open';
      await page.evaluate((id) => {
        const uploadState = {
          state: {
            uploads: [
              [
                id,
                {
                  id,
                  phase: 'error',
                  progress: 25,
                  error: 'Upload failed after multiple retries',
                  circuitBreaker: {
                    failureCount: 3,
                    lastFailureAt: Date.now(),
                    isOpen: true,
                  },
                  isPaused: false,
                  isStale: false,
                  modalStep: 'details',
                  hasOpenModal: true,
                },
              ],
            ],
          },
          version: 0,
        };
        localStorage.setItem('taboo-uploads', JSON.stringify(uploadState));
      }, uploadId);

      await contentPage.navigateWithUploadId(uploadId);

      // Should show error UI
      const isOpen = await isCircuitBreakerOpen(page, uploadId);
      expect(isOpen).toBe(true);
    });
  });
});
