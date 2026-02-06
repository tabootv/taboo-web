import { Page, Route } from '@playwright/test';

/**
 * Mock API Helper
 *
 * Utilities for mocking API responses using Playwright's page.route()
 * for testing upload flows without hitting the real backend.
 */

/**
 * Mock prepare-bunny-upload response
 */
export interface MockPrepareUploadResponse {
  video_id: number;
  video_uuid: string;
  bunny_video_id: string;
  upload_config: {
    endpoint: string;
    headers: {
      AuthorizationSignature: string;
      AuthorizationExpire: number;
      LibraryId: string;
      VideoId: string;
    };
  };
}

/**
 * Default mock responses
 */
export const DEFAULT_PREPARE_UPLOAD_RESPONSE: MockPrepareUploadResponse = {
  video_id: 12345,
  video_uuid: 'test-uuid-abc-123',
  bunny_video_id: 'bunny-vid-xyz',
  upload_config: {
    endpoint: 'https://video.bunnycdn.com/tusupload',
    headers: {
      AuthorizationSignature: 'mock-auth-signature-123',
      AuthorizationExpire: Date.now() + 3600000,
      LibraryId: '123456',
      VideoId: 'bunny-vid-xyz',
    },
  },
};

/**
 * Mock the prepare-bunny-upload endpoint
 */
export async function mockPrepareUpload(
  page: Page,
  response: Partial<MockPrepareUploadResponse> = {}
): Promise<void> {
  const fullResponse = { ...DEFAULT_PREPARE_UPLOAD_RESPONSE, ...response };

  await page.route('**/videos/prepare-bunny-upload', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Video prepared successfully',
        ...fullResponse,
      }),
    });
  });
}

/**
 * Mock the video update (PATCH) endpoint
 */
export async function mockVideoUpdate(
  page: Page,
  options: {
    validator?: (body: unknown) => void;
    response?: Record<string, unknown>;
  } = {}
): Promise<void> {
  await page.route('**/studio/videos/*', async (route: Route) => {
    if (route.request().method() === 'PATCH') {
      const body = route.request().postDataJSON();

      // Call validator if provided
      if (options.validator) {
        options.validator(body);
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          options.response || {
            success: true,
            video: {
              id: 12345,
              uuid: 'test-uuid-abc-123',
              title: body?.title || 'Test Video',
            },
          }
        ),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Mock the schedule creation endpoint
 */
export async function mockCreateSchedule(
  page: Page,
  response?: Record<string, unknown>
): Promise<void> {
  await page.route('**/studio/videos/*/schedule', async (route: Route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON();

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          response || {
            success: true,
            data: {
              schedule: {
                id: 1,
                video_id: 12345,
                publish_mode: body?.publish_mode || 'auto',
                scheduled_at: body?.scheduled_at || null,
                notify: body?.notify ?? false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            },
            message: 'Schedule created',
          }
        ),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Mock a 500 server error for any endpoint
 */
export async function mock500Error(page: Page, endpoint: string): Promise<void> {
  await page.route(`**/${endpoint}`, (route: Route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Internal Server Error',
        errors: { server: ['Something went wrong'] },
      }),
    })
  );
}

/**
 * Mock a 404 not found error (for stale upload session)
 */
export async function mock404Error(page: Page, endpoint: string): Promise<void> {
  await page.route(`**/${endpoint}`, (route: Route) =>
    route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Resource not found',
        errors: { resource: ['The requested resource does not exist'] },
      }),
    })
  );
}

/**
 * Mock a network timeout
 */
export async function mockTimeout(page: Page, endpoint: string, delayMs = 30000): Promise<void> {
  await page.route(`**/${endpoint}`, async (route: Route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await route.abort('timedout');
  });
}

/**
 * Mock intermittent failures (for retry testing)
 */
export async function mockIntermittentFailure(
  page: Page,
  endpoint: string,
  failCount = 2
): Promise<{ getAttempts: () => number }> {
  let attempts = 0;

  await page.route(`**/${endpoint}`, async (route: Route) => {
    attempts++;
    if (attempts <= failCount) {
      await route.fulfill({
        status: 500,
        body: `Simulated failure ${attempts}/${failCount}`,
      });
    } else {
      await route.continue();
    }
  });

  return {
    getAttempts: () => attempts,
  };
}

/**
 * Capture request payloads for validation
 */
export async function captureRequests(
  page: Page,
  endpoint: string,
  method: string = 'PATCH'
): Promise<{ getPayloads: () => unknown[] }> {
  const payloads: unknown[] = [];

  await page.route(`**/${endpoint}`, async (route: Route) => {
    if (route.request().method() === method) {
      payloads.push(route.request().postDataJSON());
    }
    await route.continue();
  });

  return {
    getPayloads: () => payloads,
  };
}

/**
 * Mock studio videos list endpoint
 * Matches /api/studio/videos for API calls
 */
export async function mockStudioVideos(page: Page): Promise<void> {
  await page.route('**/api/studio/videos*', async (route: Route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          videos: [],
          pagination: {
            current_page: 1,
            last_page: 1,
            total: 0,
            per_page: 20,
          },
        }),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Mock studio shorts list endpoint
 * Matches both /api/studio/shorts and /api/v2/shorts for API calls
 */
export async function mockStudioShorts(page: Page): Promise<void> {
  // Mock legacy endpoint
  await page.route('**/api/studio/shorts*', async (route: Route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          videos: [],
          pagination: {
            current_page: 1,
            last_page: 1,
            total: 0,
            per_page: 20,
          },
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock v2 endpoint (current)
  await page.route('**/api/v2/shorts*', async (route: Route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          pagination: {
            current_page: 1,
            last_page: 1,
            total: 0,
            per_page: 20,
          },
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock home short-videos endpoint
  await page.route('**/api/v2/home/short-videos*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [],
      }),
    });
  });
}

/**
 * Mock studio posts list endpoint
 * Matches both /api/studio/posts and /api/creators/creator-posts for API calls
 */
export async function mockStudioPosts(page: Page): Promise<void> {
  // Mock legacy endpoint
  await page.route('**/api/studio/posts*', async (route: Route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          posts: [],
          pagination: {
            current_page: 1,
            last_page: 1,
            total: 0,
            per_page: 20,
          },
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock creator-posts endpoint (current) - use regex to match path with ID
  await page.route(/\/api\/creators\/creator-posts/, async (route: Route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          posts: [],
          pagination: {
            current_page: 1,
            last_page: 1,
            total: 0,
            per_page: 20,
          },
        }),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Setup all mock endpoints for a complete upload flow
 */
export async function setupFullUploadMocks(page: Page): Promise<void> {
  await mockPrepareUpload(page);
  await mockVideoUpdate(page);
  await mockCreateSchedule(page);
}

/**
 * Setup all mock endpoints for studio content page
 */
export async function setupStudioContentMocks(page: Page): Promise<void> {
  await mockStudioVideos(page);
  await mockStudioShorts(page);
  await mockStudioPosts(page);
}
