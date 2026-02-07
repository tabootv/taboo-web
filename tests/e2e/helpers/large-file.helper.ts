import { Page } from '@playwright/test';

/**
 * Large File Helper
 *
 * Utilities for testing large file uploads (18GB+) using virtual file simulation.
 * This creates a "virtual" file with manipulated size property to test UI behavior
 * without actually transferring large amounts of data.
 */

/**
 * 18GB in bytes (18 * 1024 * 1024 * 1024)
 */
export const EIGHTEEN_GB = 19_327_352_832;

/**
 * 10GB in bytes for medium file tests
 */
export const TEN_GB = 10_737_418_240;

/**
 * 5GB in bytes for smaller large file tests
 */
export const FIVE_GB = 5_368_709_120;

/**
 * Create a virtual large file in the browser context
 *
 * This creates a minimal Blob with an overridden size property
 * to simulate large file uploads without actual disk/memory usage.
 */
export async function createVirtualLargeFile(
  page: Page,
  options: {
    size?: number;
    fileName?: string;
    mimeType?: string;
  } = {}
): Promise<void> {
  const { size = EIGHTEEN_GB, fileName = 'large-test-video.mp4', mimeType = 'video/mp4' } = options;

  await page.evaluate(
    ([fileSize, name, type]) => {
      // Create minimal blob with overridden size property
      const blob = new Blob([new ArrayBuffer(0)], { type });

      // Override size property to report large file size
      Object.defineProperty(blob, 'size', {
        value: fileSize,
        writable: false,
        configurable: false,
      });

      // Create a File-like object
      const virtualFile = new File([blob], name, { type });
      Object.defineProperty(virtualFile, 'size', {
        value: fileSize,
        writable: false,
        configurable: false,
      });

      // Store for test access
      (window as unknown as { __VIRTUAL_LARGE_FILE__: File }).__VIRTUAL_LARGE_FILE__ = virtualFile;
    },
    [size, fileName, mimeType] as const
  );
}

/**
 * Get the virtual large file from the browser context
 */
export async function getVirtualLargeFile(page: Page): Promise<File | null> {
  return await page.evaluate(() => {
    return (window as unknown as { __VIRTUAL_LARGE_FILE__?: File }).__VIRTUAL_LARGE_FILE__ || null;
  });
}

/**
 * Inject a virtual large file into a file input element
 *
 * This creates a DataTransfer object with the virtual file
 * and triggers the change event on the file input.
 */
export async function injectVirtualFileToInput(
  page: Page,
  selector: string,
  options: {
    size?: number;
    fileName?: string;
    mimeType?: string;
  } = {}
): Promise<void> {
  const { size = EIGHTEEN_GB, fileName = 'large-test-video.mp4', mimeType = 'video/mp4' } = options;

  await page.evaluate(
    ([sel, fileSize, name, type]) => {
      const input = document.querySelector(sel) as HTMLInputElement;
      if (!input) {
        throw new Error(`File input not found: ${sel}`);
      }

      // Create DataTransfer to set files
      const dt = new DataTransfer();

      // Create a minimal file with overridden size
      const minimalBlob = new Blob([new ArrayBuffer(1)], { type });
      const virtualFile = new File([minimalBlob], name, { type });

      // Override the size property
      Object.defineProperty(virtualFile, 'size', {
        value: fileSize,
        writable: false,
        configurable: false,
      });

      dt.items.add(virtualFile);
      input.files = dt.files;

      // Dispatch change event
      input.dispatchEvent(new Event('change', { bubbles: true }));
    },
    [selector, size, fileName, mimeType] as const
  );
}

/**
 * Simulate progress updates for large file uploads
 *
 * This dispatches custom events that the upload component can listen to
 * for simulating progress updates during tests.
 */
export async function simulateLargeFileProgress(
  page: Page,
  options: {
    totalSize?: number;
    progressPercent: number;
  }
): Promise<void> {
  const { totalSize = EIGHTEEN_GB, progressPercent } = options;
  const bytesUploaded = Math.floor(totalSize * (progressPercent / 100));

  await page.evaluate(
    ([bytes, percent, total]) => {
      window.dispatchEvent(
        new CustomEvent('test:upload-progress', {
          detail: {
            bytesUploaded: bytes,
            bytesTotal: total,
            percent,
          },
        })
      );
    },
    [bytesUploaded, progressPercent, totalSize] as const
  );
}

/**
 * Validate that a number display doesn't show NaN or Infinity
 */
export async function validateNumericDisplay(
  page: Page,
  selector: string
): Promise<{ isValid: boolean; value: string | null }> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) {
      return { isValid: false, value: null };
    }

    const text = element.textContent || '';
    const hasNaN = text.toLowerCase().includes('nan');
    const hasInfinity = text.toLowerCase().includes('infinity');
    const hasNegative = text.includes('-') && !text.includes('remaining');

    return {
      isValid: !hasNaN && !hasInfinity && !hasNegative,
      value: text,
    };
  }, selector);
}

/**
 * Format bytes to human-readable string (for test assertions)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Calculate expected upload time based on simulated speed
 */
export function calculateExpectedTime(bytes: number, speedMbps: number = 100): number {
  const speedBps = (speedMbps * 1024 * 1024) / 8; // Convert Mbps to Bytes per second
  return Math.ceil(bytes / speedBps);
}

/**
 * Mock the TUS endpoint to capture Upload-Length header for large files
 */
export async function captureUploadLengthHeader(
  page: Page
): Promise<{ getUploadLength: () => string | null }> {
  let capturedLength: string | null = null;

  await page.route('**/tusupload/**', async (route) => {
    const method = route.request().method();

    if (method === 'POST') {
      capturedLength = route.request().headers()['upload-length'] || null;
    }

    // Continue with the request
    await route.continue();
  });

  return {
    getUploadLength: () => capturedLength,
  };
}

/**
 * Monitor memory usage during upload simulation
 */
export async function monitorMemoryUsage(page: Page): Promise<{
  getMemoryInfo: () => Promise<{ usedJSHeapSize: number; totalJSHeapSize: number } | null>;
}> {
  return {
    getMemoryInfo: async () => {
      return await page.evaluate(() => {
        const memory = (
          performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }
        ).memory;
        if (memory) {
          return {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
          };
        }
        return null;
      });
    },
  };
}

/**
 * Mock video metadata loading to bypass aspect ratio detection
 *
 * This intercepts the video element's metadata loading to prevent
 * errors when using virtual files that have no actual video data.
 */
export async function mockVideoMetadata(
  page: Page,
  options: {
    width?: number;
    height?: number;
    duration?: number;
  } = {}
): Promise<void> {
  const { width = 1920, height = 1080, duration = 60 } = options;

  await page.addInitScript(
    ({ w, h, d }) => {
      // Override createElement to intercept video element creation
      const originalCreateElement = document.createElement.bind(document);
      document.createElement = function (tagName: string, options?: ElementCreationOptions) {
        const element = originalCreateElement(tagName, options);

        if (tagName.toLowerCase() === 'video') {
          // Mock video properties
          Object.defineProperties(element, {
            videoWidth: { value: w, writable: false, configurable: true },
            videoHeight: { value: h, writable: false, configurable: true },
            duration: { value: d, writable: false, configurable: true },
          });

          // Trigger loadedmetadata event when src is set
          const srcDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');

          Object.defineProperty(element, 'src', {
            set: function (value: string) {
              if (srcDescriptor && srcDescriptor.set) {
                srcDescriptor.set.call(this, value);
              }
              // Trigger metadata loaded event after a short delay
              setTimeout(() => {
                if (this.onloadedmetadata) {
                  this.onloadedmetadata(new Event('loadedmetadata'));
                }
                this.dispatchEvent(new Event('loadedmetadata'));
              }, 10);
            },
            get: function () {
              return srcDescriptor && srcDescriptor.get ? srcDescriptor.get.call(this) : '';
            },
          });
        }

        return element;
      };
    },
    { w: width, h: height, d: duration }
  );
}
