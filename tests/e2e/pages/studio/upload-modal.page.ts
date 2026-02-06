import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import path from 'path';

/**
 * Upload steps in the modal flow
 */
export type UploadStep =
  | 'details'
  | 'location'
  | 'tags'
  | 'content-rating'
  | 'thumbnail'
  | 'publishing';

/**
 * Upload Modal Page Object
 *
 * Represents the upload modal component with all its steps
 * and interactions for uploading videos.
 */
export class UploadModalPage extends BasePage {
  // Modal container
  readonly modal: Locator;

  // File selection
  readonly fileInput: Locator;
  readonly dropZone: Locator;

  // Form fields
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;

  // Progress indicators
  readonly progressBar: Locator;
  readonly progressText: Locator;
  readonly estimatedTime: Locator;

  // Navigation buttons
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly publishButton: Locator;
  readonly closeButton: Locator;

  // Step indicator
  readonly stepIndicator: Locator;

  // Pause/Resume controls
  readonly pauseButton: Locator;
  readonly resumeButton: Locator;

  constructor(page: Page) {
    super(page);
    // Modal is identified by the heading "Upload video" or "Edit video"
    this.modal = page
      .locator('h2:has-text("Upload video"), h2:has-text("Edit video")')
      .locator('xpath=ancestor::div[contains(@class, "fixed")]')
      .first();
    this.fileInput = page.locator('input[type="file"][accept*="video"]');
    this.dropZone = page.locator('[data-testid="drop-zone"], text=Drag and drop').locator('..');
    this.titleInput = page.locator('input[name="title"], input[placeholder*="title" i]');
    this.descriptionInput = page.locator(
      'textarea[name="description"], textarea[placeholder*="description" i]'
    );
    this.progressBar = page.locator('[role="progressbar"]');
    this.progressText = page.locator('[data-testid="progress-text"], text=/\\d+%/');
    this.estimatedTime = page.locator('[data-testid="estimated-time"], text=/remaining/i');
    this.nextButton = page.locator('button:has-text("Next")');
    this.backButton = page.locator('button:has-text("Back")');
    this.publishButton = page.locator('button:has-text("Publish"), button:has-text("Save")');
    this.closeButton = page
      .locator('h2:has-text("Upload video"), h2:has-text("Edit video")')
      .locator('..')
      .locator('button')
      .first();
    this.stepIndicator = page.locator('[data-testid="step-indicator"], nav[aria-label*="step" i]');
    this.pauseButton = page.locator('button:has-text("Pause"), button[aria-label*="pause" i]');
    this.resumeButton = page.locator('button:has-text("Resume"), button[aria-label*="resume" i]');
  }

  async isOpen(): Promise<boolean> {
    return await this.modal.isVisible();
  }

  async waitForOpen(): Promise<void> {
    await expect(this.modal).toBeVisible({ timeout: 10_000 });
  }

  // File selection methods
  async selectFile(filePath: string): Promise<void> {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(__dirname, '../../fixtures', filePath);
    await this.fileInput.setInputFiles(absolutePath);
  }

  async selectFileFromFixtures(fileName: string): Promise<void> {
    const filePath = path.join(__dirname, '../../fixtures/videos', fileName);
    await this.fileInput.setInputFiles(filePath);
  }

  // Form interactions
  async fillTitle(title: string): Promise<void> {
    await this.titleInput.clear();
    await this.titleInput.fill(title);
  }

  async fillDescription(description: string): Promise<void> {
    await this.descriptionInput.clear();
    await this.descriptionInput.fill(description);
  }

  // Progress tracking
  async waitForUploadStart(): Promise<void> {
    await expect(this.progressBar).toBeVisible({ timeout: 15_000 });
  }

  async waitForUploadProgress(minPercent: number): Promise<void> {
    await this.page.waitForFunction(
      (min) => {
        const progressEl = document.querySelector('[role="progressbar"]');
        if (!progressEl) return false;
        const value = parseInt(progressEl.getAttribute('aria-valuenow') || '0', 10);
        return value >= min;
      },
      minPercent,
      { timeout: 60_000 }
    );
  }

  async waitForUploadComplete(): Promise<void> {
    // Wait for processing phase or complete
    await expect(this.page.locator('text=/Processing|complete|100%/i')).toBeVisible({
      timeout: 120_000,
    });
  }

  async getUploadProgress(): Promise<number> {
    const value = await this.progressBar.getAttribute('aria-valuenow');
    return parseInt(value || '0', 10);
  }

  async getEstimatedTimeText(): Promise<string | null> {
    if (await this.estimatedTime.isVisible()) {
      return await this.estimatedTime.textContent();
    }
    return null;
  }

  // Step navigation
  async goToNextStep(): Promise<void> {
    await this.nextButton.click();
    await this.page.waitForTimeout(300); // Animation
  }

  async goToPreviousStep(): Promise<void> {
    await this.backButton.click();
    await this.page.waitForTimeout(300); // Animation
  }

  // Tags step
  async selectTag(tagName: string): Promise<void> {
    await this.page.locator(`button:has-text("${tagName}")`).click();
  }

  async selectTags(tagNames: string[]): Promise<void> {
    for (const tag of tagNames) {
      await this.selectTag(tag);
    }
  }

  // Content rating step
  async setAdultContent(isAdult: boolean): Promise<void> {
    const toggle = this.page.locator('[role="switch"]');
    const currentState = await toggle.getAttribute('aria-checked');
    if ((currentState === 'true') !== isAdult) {
      await toggle.click();
    }
  }

  // Publishing step
  async selectPublishMode(mode: 'draft' | 'now' | 'scheduled'): Promise<void> {
    const modeMap = {
      draft: /draft/i,
      now: /now|publish/i,
      scheduled: /schedule/i,
    };
    await this.page.locator(`button, label`).filter({ hasText: modeMap[mode] }).click();
  }

  // Pause/Resume
  async pauseUpload(): Promise<void> {
    await this.pauseButton.click();
  }

  async resumeUpload(): Promise<void> {
    await this.resumeButton.click();
  }

  // Actions
  async publish(): Promise<void> {
    await expect(this.publishButton).toBeEnabled({ timeout: 5_000 });
    await this.publishButton.click();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    // Handle confirmation dialog if present
    const confirmButton = this.page.locator('button:has-text("Yes"), button:has-text("Close")');
    if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmButton.click();
    }
  }

  // Full upload flow helper
  async completeBasicUploadFlow(options: {
    filePath: string;
    title: string;
    description?: string;
  }): Promise<void> {
    // Select file
    await this.selectFile(options.filePath);
    await this.waitForUploadStart();

    // Fill details
    await this.fillTitle(options.title);
    if (options.description) {
      await this.fillDescription(options.description);
    }
  }
}
