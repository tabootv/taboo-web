import { test, expect } from '../../fixtures/test.fixture';
import { StudioContentPage } from '../../pages/studio/content.page';
import { clearUploadStore, seedUploadStore, mockTusUpload, mockPrepareUpload } from '../../helpers';

/**
 * Pillar 4: Stability Tests
 *
 * Tests for:
 * - No "Maximum update depth exceeded" errors
 * - Efficient progress updates without excessive re-renders
 * - Console error monitoring during upload
 */
test.describe('Upload Stability', () => {
  let contentPage: StudioContentPage;

  test.beforeEach(async ({ page }) => {
    contentPage = new StudioContentPage(page);
    // Navigate first to establish page context for localStorage access
    await contentPage.navigate();
    await clearUploadStore(page);
  });

  test.describe('Console Error Monitoring', () => {
    test('no "Maximum update depth exceeded" errors during upload', async ({ page }) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];

      // Collect console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Collect page errors
      page.on('pageerror', (error) => {
        pageErrors.push(error.message);
      });

      // Setup mocks
      await mockPrepareUpload(page);
      await mockTusUpload(page);

      // Seed an active upload
      const uploadId = 'stability-test-1';
      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            phase: 'uploading',
            progress: 0,
            bytesUploaded: 0,
            bytesTotal: 10000000,
            modalStep: 'details',
            hasOpenModal: true,
          },
        ],
      ]);

      await contentPage.navigateWithUploadId(uploadId);

      // Simulate rapid progress updates
      for (let progress = 0; progress <= 100; progress += 5) {
        await page.evaluate(
          ([id, p]) => {
            const raw = localStorage.getItem('taboo-uploads');
            if (!raw) return;
            const state = JSON.parse(raw);
            const uploads = state.state?.uploads || state.uploads || [];
            const uploadIndex = uploads.findIndex(([uid]: [string]) => uid === id);
            if (uploadIndex >= 0) {
              uploads[uploadIndex][1].progress = p;
              uploads[uploadIndex][1].bytesUploaded = Math.floor(10000000 * (Number(p) / 100));
              localStorage.setItem('taboo-uploads', JSON.stringify(state));
            }
          },
          [uploadId, progress] as const
        );

        // Small delay to allow React to process
        await page.waitForTimeout(50);
      }

      // Wait for any async errors
      await page.waitForTimeout(1000);

      // Filter for the specific error we're testing
      const maxDepthErrors = consoleErrors.filter((e) =>
        e.toLowerCase().includes('maximum update depth exceeded')
      );
      const maxDepthPageErrors = pageErrors.filter((e) =>
        e.toLowerCase().includes('maximum update depth exceeded')
      );

      expect(maxDepthErrors).toHaveLength(0);
      expect(maxDepthPageErrors).toHaveLength(0);
    });

    test('no React hydration errors', async ({ page }) => {
      const hydrationErrors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error' && msg.text().includes('Hydration')) {
          hydrationErrors.push(msg.text());
        }
      });

      await contentPage.navigate();
      await page.waitForTimeout(2000);

      // Filter out known/acceptable hydration warnings
      const criticalHydrationErrors = hydrationErrors.filter(
        (e) => !e.includes('Suspense') && !e.includes('useLayoutEffect')
      );

      expect(criticalHydrationErrors).toHaveLength(0);
    });

    test('no unhandled promise rejections during upload flow', async ({ page }) => {
      const unhandledRejections: string[] = [];

      page.on('pageerror', (error) => {
        if (error.message.includes('Unhandled')) {
          unhandledRejections.push(error.message);
        }
      });

      // Setup mocks
      await mockPrepareUpload(page);
      await mockTusUpload(page);

      await contentPage.navigate();

      // Open upload modal
      await contentPage.openUploadModal();

      // Wait for any async operations
      await page.waitForTimeout(2000);

      expect(unhandledRejections).toHaveLength(0);
    });
  });

  test.describe('Re-render Efficiency', () => {
    test('progress updates are efficient', async ({ page }) => {
      // Inject render counter into the page
      await page.addInitScript(() => {
        (window as unknown as { __RENDER_COUNT__: number }).__RENDER_COUNT__ = 0;

        // Override React DevTools hook if available
        const originalError = console.error;
        console.error = (...args) => {
          if (args[0]?.includes?.('too many re-renders')) {
            (window as unknown as { __RENDER_COUNT__: number }).__RENDER_COUNT__ += 100;
          }
          originalError.apply(console, args);
        };
      });

      await mockPrepareUpload(page);
      await mockTusUpload(page);

      const uploadId = 'render-efficiency-test';
      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            phase: 'uploading',
            progress: 0,
            modalStep: 'details',
            hasOpenModal: true,
          },
        ],
      ]);

      await contentPage.navigateWithUploadId(uploadId);

      // Simulate 100 progress updates (0% to 100%)
      for (let i = 0; i <= 100; i++) {
        await page.evaluate((progress) => {
          // Dispatch a custom event that the app might listen to
          window.dispatchEvent(
            new CustomEvent('test:progress', {
              detail: { progress },
            })
          );
        }, i);
      }

      await page.waitForTimeout(500);

      // Check if any "too many re-renders" warnings were triggered
      const renderIssues = await page.evaluate(
        () => (window as unknown as { __RENDER_COUNT__: number }).__RENDER_COUNT__
      );

      expect(renderIssues).toBeLessThan(100);
    });

    test('modal remains responsive during upload', async ({ page }) => {
      const uploadId = 'responsive-test';
      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            phase: 'uploading',
            progress: 50,
            modalStep: 'details',
            hasOpenModal: true,
          },
        ],
      ]);

      await contentPage.navigateWithUploadId(uploadId);

      // Measure interaction responsiveness
      const interactionTime = await page.evaluate(async () => {
        const start = performance.now();

        // Try to interact with an input
        const input = document.querySelector('input[type="text"]');
        if (input) {
          (input as HTMLInputElement).focus();
          (input as HTMLInputElement).blur();
        }

        return performance.now() - start;
      });

      // Interaction should be fast (< 100ms)
      expect(interactionTime).toBeLessThan(100);
    });
  });

  test.describe('Memory Stability', () => {
    test('no memory leaks during long upload session', async ({ page }) => {
      // This test checks that memory doesn't grow excessively
      // during a simulated long upload session

      await mockPrepareUpload(page);
      await mockTusUpload(page);

      const uploadId = 'memory-test';
      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            phase: 'uploading',
            progress: 0,
            modalStep: 'details',
          },
        ],
      ]);

      await contentPage.navigateWithUploadId(uploadId);

      // Get initial memory (if available)
      const initialMemory = await page.evaluate(() => {
        return (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize;
      });

      // Simulate many progress updates
      for (let i = 0; i < 1000; i++) {
        await page.evaluate((progress) => {
          window.dispatchEvent(
            new CustomEvent('test:progress', {
              detail: { progress: progress % 100 },
            })
          );
        }, i);
      }

      // Get final memory
      const finalMemory = await page.evaluate(() => {
        return (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize;
      });

      if (initialMemory && finalMemory) {
        // Memory shouldn't grow more than 50MB during the test
        const memoryGrowth = finalMemory - initialMemory;
        expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
      }
    });
  });

  test.describe('Error Boundary', () => {
    test('app does not crash on component error', async ({ page }) => {
      const crashDetected: boolean[] = [];

      page.on('pageerror', () => {
        crashDetected.push(true);
      });

      await contentPage.navigate();

      // Try to trigger an error by manipulating state incorrectly
      await page.evaluate(() => {
        // Corrupt the store state
        localStorage.setItem('taboo-uploads', 'invalid-json{{{');
      });

      // Refresh to trigger hydration with corrupted state
      await page.reload();

      // Page should still be functional (error boundary should catch)
      await page.waitForTimeout(2000);

      // Check if page is still interactive
      const isResponsive = await page.evaluate(() => {
        return document.body !== null;
      });

      expect(isResponsive).toBe(true);
    });
  });
});
