import { Page, Route } from '@playwright/test';

/**
 * TUS Mock Helper
 *
 * Utilities for mocking TUS (resumable upload) protocol endpoints.
 * Simulates the TUS server behavior for testing upload flows.
 */

/**
 * TUS mock configuration options
 */
export interface TusMockOptions {
  /** Simulated failure rate (0-1) */
  failureRate?: number;
  /** Fail after this many bytes uploaded */
  failAfterBytes?: number;
  /** Simulated latency in ms */
  latencyMs?: number;
  /** Maximum upload size in bytes */
  maxUploadSize?: number;
}

/**
 * TUS upload state tracker
 */
interface TusUploadState {
  offset: number;
  length: number;
}

/**
 * TUS Mock Server
 *
 * Simulates a TUS server for testing upload flows.
 */
export class TusMockServer {
  private page: Page;
  private uploads: Map<string, TusUploadState> = new Map();
  private options: TusMockOptions;

  constructor(page: Page, options: TusMockOptions = {}) {
    this.page = page;
    this.options = {
      failureRate: 0,
      latencyMs: 0,
      ...options,
    };
  }

  /**
   * Setup TUS mock routes
   */
  async setup(): Promise<void> {
    const { failureRate = 0, failAfterBytes, latencyMs = 0 } = this.options;

    await this.page.route('**/tusupload/**', async (route: Route) => {
      // Simulate latency
      if (latencyMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, latencyMs));
      }

      const method = route.request().method();
      const url = route.request().url();
      const uploadId = this.extractUploadId(url);

      // Random failure simulation
      if (Math.random() < failureRate) {
        return route.fulfill({
          status: 500,
          body: 'Simulated TUS failure',
        });
      }

      switch (method) {
        case 'OPTIONS':
          return this.handleOptions(route);
        case 'POST':
          return this.handlePost(route, uploadId);
        case 'PATCH':
          return this.handlePatch(route, uploadId, failAfterBytes);
        case 'HEAD':
          return this.handleHead(route, uploadId);
        case 'DELETE':
          return this.handleDelete(route, uploadId);
        default:
          return route.continue();
      }
    });
  }

  private extractUploadId(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1] || 'default';
  }

  private async handleOptions(route: Route): Promise<void> {
    await route.fulfill({
      status: 204,
      headers: {
        'Tus-Resumable': '1.0.0',
        'Tus-Version': '1.0.0',
        'Tus-Extension': 'creation,creation-with-upload,termination',
        'Tus-Max-Size': String(this.options.maxUploadSize || 20 * 1024 * 1024 * 1024),
      },
    });
  }

  private async handlePost(route: Route, uploadId: string): Promise<void> {
    const headers = route.request().headers();
    const length = parseInt(headers['upload-length'] || '0', 10);

    this.uploads.set(uploadId, { offset: 0, length });

    await route.fulfill({
      status: 201,
      headers: {
        Location: `${route.request().url()}/${uploadId}`,
        'Tus-Resumable': '1.0.0',
      },
    });
  }

  private async handlePatch(
    route: Route,
    uploadId: string,
    failAfterBytes?: number
  ): Promise<void> {
    const currentUpload = this.uploads.get(uploadId);

    if (!currentUpload) {
      return route.fulfill({
        status: 404,
        body: 'Upload not found',
      });
    }

    const chunkSize = parseInt(route.request().headers()['content-length'] || '0', 10);
    currentUpload.offset += chunkSize;

    // Fail after certain bytes
    if (failAfterBytes && currentUpload.offset >= failAfterBytes) {
      return route.fulfill({
        status: 500,
        body: 'Upload limit reached (simulated)',
      });
    }

    await route.fulfill({
      status: 204,
      headers: {
        'Upload-Offset': String(currentUpload.offset),
        'Tus-Resumable': '1.0.0',
      },
    });
  }

  private async handleHead(route: Route, uploadId: string): Promise<void> {
    const currentUpload = this.uploads.get(uploadId);

    if (!currentUpload) {
      return route.fulfill({
        status: 404,
        body: 'Upload not found',
      });
    }

    await route.fulfill({
      status: 200,
      headers: {
        'Upload-Offset': String(currentUpload.offset),
        'Upload-Length': String(currentUpload.length),
        'Tus-Resumable': '1.0.0',
      },
    });
  }

  private async handleDelete(route: Route, uploadId: string): Promise<void> {
    this.uploads.delete(uploadId);
    await route.fulfill({
      status: 204,
    });
  }

  /**
   * Get the current progress of an upload
   */
  getUploadProgress(uploadId: string): number {
    const upload = this.uploads.get(uploadId);
    if (!upload || upload.length === 0) return 0;
    return (upload.offset / upload.length) * 100;
  }

  /**
   * Reset all tracked uploads
   */
  reset(): void {
    this.uploads.clear();
  }
}

/**
 * Quick setup for basic TUS mocking
 */
export async function mockTusUpload(
  page: Page,
  options: TusMockOptions = {}
): Promise<TusMockServer> {
  const server = new TusMockServer(page, options);
  await server.setup();
  return server;
}

/**
 * Mock TUS to always fail (for error handling tests)
 */
export async function mockTusFailure(
  page: Page,
  statusCode: number = 500,
  errorMessage: string = 'Upload failed'
): Promise<void> {
  await page.route('**/tusupload/**', async (route: Route) => {
    const method = route.request().method();

    if (method === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: {
          'Tus-Resumable': '1.0.0',
          'Tus-Version': '1.0.0',
        },
      });
    } else {
      await route.fulfill({
        status: statusCode,
        body: errorMessage,
      });
    }
  });
}

/**
 * Mock TUS to simulate slow upload (for timeout tests)
 */
export async function mockTusSlow(page: Page, delayMs: number = 5000): Promise<void> {
  await page.route('**/tusupload/**', async (route: Route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await route.continue();
  });
}

/**
 * Capture TUS request headers for validation
 */
export async function captureTusHeaders(
  page: Page
): Promise<{ getHeaders: () => Record<string, string>[] }> {
  const capturedHeaders: Record<string, string>[] = [];

  await page.route('**/tusupload/**', async (route: Route) => {
    capturedHeaders.push(route.request().headers());
    await route.continue();
  });

  return {
    getHeaders: () => capturedHeaders,
  };
}
