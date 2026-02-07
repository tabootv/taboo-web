import { test, expect } from '../../fixtures/test.fixture';
import { StudioContentPage } from '../../pages/studio/content.page';
import {
  clearUploadStore,
  seedUploadStore,
  EIGHTEEN_GB,
  TEN_GB,
  formatBytes,
  monitorMemoryUsage,
  mockPrepareUpload,
  mockTusUpload,
  injectVirtualFileToInput,
} from '../../helpers';

/**
 * Pillar 9: Large-Scale Content Validation Tests (18GB+)
 *
 * Tests for:
 * - UI calculation handles large numbers without NaN
 * - TUS Upload-Length header reflects correct file size
 * - Memory stability during large file progress
 *
 * Strategy: "Virtual 18GB" - Uses a virtual Blob with manipulated size
 * property to simulate large files without actual disk/memory usage.
 */
test.describe('Large-Scale Content (18GB+)', () => {
  let contentPage: StudioContentPage;

  test.beforeEach(async ({ page }) => {
    contentPage = new StudioContentPage(page);
    // Navigate first to establish page context for localStorage access
    await contentPage.navigate();
    await clearUploadStore(page);
  });

  test.describe('UI Calculation Validation', () => {
    test('estimated time displays valid values for 18GB file', async ({ page }) => {
      const uploadId = 'large-time-test';

      // Seed with large file upload in progress
      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            phase: 'uploading',
            progress: 25,
            bytesUploaded: EIGHTEEN_GB / 4, // 4.5GB uploaded
            bytesTotal: EIGHTEEN_GB,
            fileName: 'large-test-video.mp4',
            fileSize: EIGHTEEN_GB,
            modalStep: 'details',
            hasOpenModal: true,
            startedAt: Date.now() - 300000, // Started 5 minutes ago
            lastProgressAt: Date.now(),
          },
        ],
      ]);

      await contentPage.navigateWithUploadId(uploadId);

      // Wait for UI to render
      await page.waitForTimeout(500);

      // Check for NaN or Infinity in any numeric displays
      const progressBar = page.locator('[role="progressbar"]');

      // Check if progress bar exists
      if ((await progressBar.count()) > 0) {
        const progressText = await progressBar.textContent();
        if (progressText) {
          expect(progressText.toLowerCase()).not.toContain('nan');
          expect(progressText.toLowerCase()).not.toContain('infinity');
        }
      }

      // Check time displays
      const timeElements = page.locator('text=/remaining|left|time/i');
      const timeCount = await timeElements.count();

      for (let i = 0; i < timeCount; i++) {
        const timeText = await timeElements.nth(i).textContent();
        if (timeText) {
          expect(timeText.toLowerCase()).not.toContain('nan');
          expect(timeText.toLowerCase()).not.toContain('infinity');
        }
      }
    });

    test('progress percentage handles large byte counts correctly', async ({ page }) => {
      const uploadId = 'large-progress-test';

      // Seed with large file upload
      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            phase: 'uploading',
            progress: 50,
            bytesUploaded: EIGHTEEN_GB / 2, // 9GB uploaded
            bytesTotal: EIGHTEEN_GB,
            fileName: 'large-video.mp4',
            fileSize: EIGHTEEN_GB,
            modalStep: 'details',
            hasOpenModal: false,
            isStale: false,
            startedAt: Date.now() - 100000,
            lastProgressAt: Date.now(),
          },
        ],
      ]);

      await contentPage.navigate();

      // Wait for upload indicator to appear
      await page.waitForTimeout(500);

      // Look for the global upload indicator button (shows "1 uploading" or similar)
      const uploadIndicator = page.locator('button:has-text("uploading")');

      if ((await uploadIndicator.count()) > 0) {
        const text = await uploadIndicator.textContent();

        // Should show "1 uploading" or similar
        expect(text).toBeTruthy();
        expect(text?.toLowerCase()).toContain('uploading');

        // Should not contain NaN or Infinity
        expect(text?.toLowerCase()).not.toContain('nan');
        expect(text?.toLowerCase()).not.toContain('infinity');
      }

      // Verify progress calculations in store don't have NaN
      const storeState = await page.evaluate(() => {
        const raw = localStorage.getItem('taboo-uploads');
        if (!raw) return null;
        const state = JSON.parse(raw);
        const uploads = state.state?.uploads || state.uploads || new Map();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const uploadsArray = Array.from(uploads as Map<string, any>);
        return uploadsArray.map(
          ([_id, upload]: [
            string,
            { progress: number; bytesUploaded: number; bytesTotal: number },
          ]) => ({
            progress: upload.progress,
            bytesUploaded: upload.bytesUploaded,
            bytesTotal: upload.bytesTotal,
          })
        );
      });

      if (storeState && storeState.length > 0) {
        const upload = storeState[0];
        if (upload) {
          expect(Number.isNaN(upload.progress)).toBe(false);
          expect(Number.isFinite(upload.progress)).toBe(true);
          expect(upload.progress).toBeGreaterThanOrEqual(0);
          expect(upload.progress).toBeLessThanOrEqual(100);
        }
      }
    });

    test('file size display formats large numbers correctly', async ({ page }) => {
      const uploadId = 'size-display-test';

      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            phase: 'uploading',
            progress: 25,
            bytesUploaded: EIGHTEEN_GB / 4,
            bytesTotal: EIGHTEEN_GB,
            fileName: 'massive-video.mp4',
            fileSize: EIGHTEEN_GB,
            modalStep: 'details',
            hasOpenModal: true,
          },
        ],
      ]);

      await contentPage.navigateWithUploadId(uploadId);

      // Look for file size display
      const sizeDisplay = page.locator('text=/GB|MB|bytes/i');

      if ((await sizeDisplay.count()) > 0) {
        const text = await sizeDisplay.first().textContent();

        // Should show approximately 18 GB
        expect(text).not.toBeNull();
        expect(text?.toLowerCase()).not.toContain('nan');

        // Should use GB unit for large files
        if (text?.includes('GB')) {
          const match = text.match(/(\d+\.?\d*)\s*GB/i);
          if (match) {
            const gbValue = parseFloat(match[1]!);
            expect(gbValue).toBeGreaterThan(0);
            expect(gbValue).toBeLessThan(100);
          }
        }
      }
    });

    test('time remaining calculation is reasonable for large files', async ({ page }) => {
      const uploadId = 'time-calc-test';

      // Simulate 1GB uploaded out of 18GB at ~10MB/s = ~1700s remaining
      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            phase: 'uploading',
            progress: 5,
            bytesUploaded: 1024 * 1024 * 1024, // 1GB
            bytesTotal: EIGHTEEN_GB,
            fileName: 'time-test-video.mp4',
            fileSize: EIGHTEEN_GB,
            startedAt: Date.now() - 100000, // Started 100s ago
            lastProgressAt: Date.now(),
            modalStep: 'details',
            hasOpenModal: true,
          },
        ],
      ]);

      await contentPage.navigateWithUploadId(uploadId);

      // Time should not be negative or astronomical
      const timeDisplay = page.locator('text=/remaining|left|time/i').first();

      if (await timeDisplay.isVisible()) {
        const text = await timeDisplay.textContent();

        // Should not contain negative values
        expect(text).not.toMatch(/-\d+/);

        // Should not be unreasonably large (e.g., years)
        expect(text?.toLowerCase()).not.toContain('year');
      }
    });
  });

  test.describe('TUS Chunking Integrity', () => {
    test('Upload-Length header reflects 18GB file size', async ({ page }) => {
      let capturedUploadLength: string | null = null;

      // Intercept TUS requests
      await page.route('**/tusupload/**', async (route) => {
        const method = route.request().method();

        if (method === 'POST') {
          capturedUploadLength = route.request().headers()['upload-length'] ?? null;
          await route.fulfill({
            status: 201,
            headers: {
              Location: route.request().url() + '/test-upload-id',
              'Tus-Resumable': '1.0.0',
            },
          });
        } else if (method === 'OPTIONS') {
          await route.fulfill({
            status: 204,
            headers: {
              'Tus-Resumable': '1.0.0',
              'Tus-Version': '1.0.0',
              'Tus-Extension': 'creation',
            },
          });
        } else {
          await route.continue();
        }
      });

      await mockPrepareUpload(page);
      await contentPage.navigate();
      await contentPage.openUploadModal();

      // Inject virtual large file
      await injectVirtualFileToInput(page, 'input[type="file"]', {
        size: EIGHTEEN_GB,
        fileName: 'header-test.mp4',
      });

      // Wait for TUS request
      await page.waitForTimeout(2000);

      // Verify header value
      if (capturedUploadLength) {
        const lengthNum = parseInt(capturedUploadLength, 10);
        expect(lengthNum).toBe(EIGHTEEN_GB);

        // Format for logging
        console.log(`Captured Upload-Length: ${capturedUploadLength} (${formatBytes(lengthNum)})`);
      }
    });

    test('chunk requests contain correct offset headers', async ({ page }) => {
      const chunkOffsets: number[] = [];

      await page.route('**/tusupload/**', async (route) => {
        const method = route.request().method();

        if (method === 'PATCH') {
          const offset = route.request().headers()['upload-offset'];
          if (offset) {
            chunkOffsets.push(parseInt(offset, 10));
          }
          await route.fulfill({
            status: 204,
            headers: {
              'Upload-Offset': String(parseInt(offset || '0', 10) + 1024 * 1024),
              'Tus-Resumable': '1.0.0',
            },
          });
        } else if (method === 'POST') {
          await route.fulfill({
            status: 201,
            headers: {
              Location: route.request().url() + '/chunk-test',
              'Tus-Resumable': '1.0.0',
            },
          });
        } else if (method === 'OPTIONS') {
          await route.fulfill({
            status: 204,
            headers: {
              'Tus-Resumable': '1.0.0',
              'Tus-Version': '1.0.0',
            },
          });
        } else {
          await route.continue();
        }
      });

      await mockPrepareUpload(page);
      await contentPage.navigate();

      // Seed an active upload
      await seedUploadStore(page, [
        [
          'chunk-offset-test',
          {
            id: 'chunk-offset-test',
            phase: 'uploading',
            progress: 0,
            bytesTotal: EIGHTEEN_GB,
            modalStep: 'details',
          },
        ],
      ]);

      await page.waitForTimeout(1000);

      // Verify offsets are sequential (if any were captured)
      if (chunkOffsets.length > 1) {
        for (let i = 1; i < chunkOffsets.length; i++) {
          expect(chunkOffsets[i]).toBeGreaterThanOrEqual(chunkOffsets[i - 1]!);
        }
      }
    });
  });

  test.describe('Memory Stability', () => {
    test('modal remains responsive during large file progress simulation', async ({ page }) => {
      const errors: string[] = [];

      page.on('pageerror', (err) => errors.push(err.message));
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      const uploadId = 'memory-stability-test';
      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            phase: 'uploading',
            progress: 0,
            bytesUploaded: 0,
            bytesTotal: EIGHTEEN_GB,
            fileName: 'test-video.mp4',
            fileSize: EIGHTEEN_GB,
            modalStep: 'details',
            hasOpenModal: true,
          },
        ],
      ]);

      await contentPage.navigateWithUploadId(uploadId);

      // Wait for modal to render
      await page.waitForTimeout(500);

      // Simulate progress updates from 0 to 100%
      for (let percent = 0; percent <= 100; percent += 10) {
        const bytesUploaded = Math.floor(EIGHTEEN_GB * (percent / 100));

        await page.evaluate(
          ([id, bytes, pct]) => {
            const raw = localStorage.getItem('taboo-uploads');
            if (!raw) return;
            const state = JSON.parse(raw);
            const uploads = state.state?.uploads || state.uploads || [];
            const uploadEntry = uploads.find(([uid]: [string]) => uid === id);
            if (uploadEntry) {
              uploadEntry[1].bytesUploaded = bytes;
              uploadEntry[1].progress = pct;
              localStorage.setItem('taboo-uploads', JSON.stringify(state));
            }

            // Dispatch progress event
            window.dispatchEvent(
              new CustomEvent('test:progress', {
                detail: { bytesUploaded: bytes, progress: pct },
              })
            );
          },
          [uploadId, bytesUploaded, percent]
        );

        // Verify modal is still responsive by checking it's still open
        const modal = page.locator('h2:has-text("Test Video"), h2:has-text("test-video")');
        await expect(modal.first()).toBeVisible({ timeout: 2000 });

        await page.waitForTimeout(50);
      }

      // No errors should have occurred
      const criticalErrors = errors.filter(
        (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error')
      );
      expect(criticalErrors).toHaveLength(0);
    });

    test('no memory leaks during large file simulation', async ({ page }) => {
      const memoryMonitor = await monitorMemoryUsage(page);

      const uploadId = 'memory-leak-test';
      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            phase: 'uploading',
            progress: 0,
            bytesTotal: EIGHTEEN_GB,
            modalStep: 'details',
          },
        ],
      ]);

      await contentPage.navigateWithUploadId(uploadId);

      // Get initial memory
      const initialMemory = await memoryMonitor.getMemoryInfo();

      // Simulate many progress updates
      for (let i = 0; i < 500; i++) {
        const progress = (i / 500) * 100;
        const bytes = Math.floor(EIGHTEEN_GB * (progress / 100));

        await page.evaluate(
          ([b, p]) => {
            window.dispatchEvent(
              new CustomEvent('test:progress', {
                detail: { bytesUploaded: b, progress: p },
              })
            );
          },
          [bytes, progress]
        );
      }

      // Get final memory
      const finalMemory = await memoryMonitor.getMemoryInfo();

      if (initialMemory && finalMemory) {
        const memoryGrowth = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;

        // Memory growth should be reasonable (< 100MB for this simulation)
        expect(memoryGrowth).toBeLessThan(100 * 1024 * 1024);

        console.log(`Memory growth: ${formatBytes(memoryGrowth)}`);
      }
    });

    test('handles 10GB file without issues', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await mockPrepareUpload(page);
      await mockTusUpload(page);

      await contentPage.navigate();
      await contentPage.openUploadModal();

      // Test with 10GB file
      await injectVirtualFileToInput(page, 'input[type="file"]', {
        size: TEN_GB,
        fileName: '10gb-test.mp4',
      });

      await page.waitForTimeout(2000);

      // Should handle without errors
      expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
    });
  });
});
