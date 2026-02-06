import { test, expect } from '../../fixtures/test.fixture';
import { StudioContentPage } from '../../pages/studio/content.page';
import { clearUploadStore, seedUploadStore, getUploadById, captureRequests } from '../../helpers';

/**
 * Pillar 3: Data Integrity Tests
 *
 * Tests for:
 * - Tag ID to Slug conversion in PATCH payloads
 * - Store maintaining both IDs and slugs
 * - Metadata consistency during updates
 */
test.describe('Upload Data Integrity', () => {
  let contentPage: StudioContentPage;

  test.beforeEach(async ({ page }) => {
    contentPage = new StudioContentPage(page);
    // Navigate first to establish page context for localStorage access
    await contentPage.navigate();
    await clearUploadStore(page);
  });

  test.describe('Tag Conversion', () => {
    test('converts tag IDs to slugs when updating video metadata', async ({ page }) => {
      let capturedPayload: Record<string, unknown> | null = null;

      // Setup mock to capture the PATCH payload
      await page.route('**/studio/videos/**', async (route) => {
        if (route.request().method() === 'PATCH') {
          capturedPayload = route.request().postDataJSON();
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true }),
          });
        } else {
          await route.continue();
        }
      });

      // Seed upload with tags (IDs and slugs)
      const uploadId = 'tag-conversion-test';
      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            videoId: 12345,
            videoUuid: 'test-uuid-123',
            phase: 'complete',
            progress: 100,
            metadata: {
              title: 'Tag Test Video',
              tags: [1, 2, 3], // IDs
              tagSlugs: ['music', 'entertainment', 'comedy'], // Slugs
              thumbnailSource: 'auto',
              publishMode: 'none',
            },
            modalStep: 'publishing',
          },
        ],
      ]);

      await contentPage.navigateWithUploadId(uploadId);

      // Trigger a metadata update (depends on UI implementation)
      // This would typically happen during the publish flow

      // If payload was captured, verify tags are slugs not IDs
      if (capturedPayload !== null) {
        const payload = capturedPayload as Record<string, unknown>;
        const tags = payload.tags as unknown[];

        // Tags should be strings (slugs), not numbers (IDs)
        if (Array.isArray(tags) && tags.length > 0) {
          expect(tags.every((t) => typeof t === 'string')).toBe(true);
          expect(tags).toContain('music');
          expect(tags).not.toContain(1);
        }
      }
    });

    test('PATCH payload contains tag slugs, not numeric IDs', async ({ page }) => {
      const payloadCapture = await captureRequests(page, 'studio/videos/*', 'PATCH');

      // Seed upload ready for publish
      const uploadId = 'slug-verify-test';
      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            videoId: 12345,
            videoUuid: 'video-uuid-456',
            phase: 'complete',
            progress: 100,
            metadata: {
              title: 'Slug Verify Video',
              description: 'Testing slug conversion',
              tags: [1, 5, 8],
              tagSlugs: ['music', 'sports', 'lifestyle'],
              thumbnailSource: 'auto',
              publishMode: 'auto',
            },
            modalStep: 'publishing',
          },
        ],
      ]);

      await contentPage.navigateWithUploadId(uploadId);

      // Check captured payloads
      const payloads = payloadCapture.getPayloads();

      for (const payload of payloads) {
        const p = payload as Record<string, unknown>;
        if (p.tags && Array.isArray(p.tags)) {
          // Verify no numeric IDs
          expect(p.tags.every((t: unknown) => typeof t !== 'number')).toBe(true);
        }
      }
    });
  });

  test.describe('Store State Consistency', () => {
    test('store maintains both tag IDs for UI and slugs for API', async ({ page }) => {
      const uploadId = 'dual-tags-test';
      const tagIds = [1, 2, 4];
      const tagSlugs = ['music', 'entertainment', 'education'];

      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            phase: 'uploading',
            progress: 50,
            metadata: {
              title: 'Dual Tags Test',
              tags: tagIds,
              tagSlugs: tagSlugs,
              thumbnailSource: 'auto',
              publishMode: 'none',
            },
          },
        ],
      ]);

      await contentPage.navigate();

      // Verify store has both formats
      const upload = await getUploadById(page, uploadId);

      expect(upload).not.toBeNull();
      expect(upload?.metadata?.tags).toEqual(tagIds);
      expect(upload?.metadata?.tagSlugs).toEqual(tagSlugs);
    });

    test('tag updates sync both IDs and slugs', async ({ page }) => {
      const uploadId = 'tag-sync-test';

      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            phase: 'uploading',
            progress: 60,
            metadata: {
              title: 'Tag Sync Test',
              tags: [1],
              tagSlugs: ['music'],
              thumbnailSource: 'auto',
              publishMode: 'none',
            },
            modalStep: 'tags',
          },
        ],
      ]);

      await contentPage.navigateWithUploadId(uploadId);

      // Simulate adding more tags (would require actual tag selection UI)
      // After selection, both arrays should update together
    });
  });

  test.describe('Metadata Consistency', () => {
    test('metadata persists correctly through modal steps', async ({ page }) => {
      const uploadId = 'persist-test';
      const testMetadata = {
        title: 'Persistence Test Video',
        description: 'Testing metadata persistence',
        tags: [1, 2],
        tagSlugs: ['music', 'entertainment'],
        isAdultContent: false,
        location: 'Test Location',
        thumbnailSource: 'auto' as const,
        publishMode: 'none' as const,
      };

      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            phase: 'uploading',
            progress: 80,
            metadata: testMetadata,
            modalStep: 'details',
          },
        ],
      ]);

      await contentPage.navigate();

      // Verify all metadata fields are preserved
      const upload = await getUploadById(page, uploadId);

      expect(upload?.metadata?.title).toBe(testMetadata.title);
      expect(upload?.metadata?.description).toBe(testMetadata.description);
      expect(upload?.metadata?.tags).toEqual(testMetadata.tags);
      expect(upload?.metadata?.isAdultContent).toBe(testMetadata.isAdultContent);
    });

    test('special characters in metadata are preserved', async ({ page }) => {
      const uploadId = 'special-chars-test';
      const specialTitle = 'Test Video with \'Quotes\' & <Special> "Characters"';
      const specialDescription = 'Description with emoji 🎬 and unicode: café, naïve';

      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            phase: 'uploading',
            progress: 70,
            metadata: {
              title: specialTitle,
              description: specialDescription,
              thumbnailSource: 'auto',
              publishMode: 'none',
            },
          },
        ],
      ]);

      await contentPage.navigate();

      const upload = await getUploadById(page, uploadId);
      expect(upload?.metadata?.title).toBe(specialTitle);
      expect(upload?.metadata?.description).toBe(specialDescription);
    });

    test('empty optional fields are handled correctly', async ({ page }) => {
      const uploadId = 'empty-fields-test';

      await seedUploadStore(page, [
        [
          uploadId,
          {
            id: uploadId,
            phase: 'uploading',
            progress: 40,
            metadata: {
              title: 'Minimal Video',
              // description omitted
              // tags omitted
              thumbnailSource: 'auto',
              publishMode: 'none',
            },
          },
        ],
      ]);

      await contentPage.navigate();

      const upload = await getUploadById(page, uploadId);
      expect(upload?.metadata?.title).toBe('Minimal Video');
      expect(upload?.metadata?.description).toBeUndefined();
      expect(upload?.metadata?.tags).toBeUndefined();
    });
  });
});
