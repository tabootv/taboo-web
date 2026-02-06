import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { UploadModalPage } from './upload-modal.page';

/**
 * Studio Content Page Object
 *
 * Represents the /studio/content page where creators
 * manage their videos and can initiate uploads.
 */
export class StudioContentPage extends BasePage {
  readonly uploadButton: Locator;
  readonly contentTable: Locator;
  readonly tabVideos: Locator;
  readonly tabShorts: Locator;
  readonly searchInput: Locator;
  readonly uploadModal: UploadModalPage;

  constructor(page: Page) {
    super(page);
    this.uploadButton = page.locator('button:has-text("Upload")');
    this.contentTable = page.locator('table, [role="table"], [data-testid="content-table"]');
    this.tabVideos = page.locator('button:has-text("Videos"), [role="tab"]:has-text("Videos")');
    this.tabShorts = page.locator('button:has-text("Shorts"), [role="tab"]:has-text("Shorts")');
    this.searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
    this.uploadModal = new UploadModalPage(page);
  }

  async navigate(): Promise<void> {
    await this.goto('/studio/content');
    await this.waitForHydration();
  }

  async navigateWithUploadId(uploadId: string): Promise<void> {
    await this.goto(`/studio/content?uploadId=${uploadId}`);
    await this.waitForHydration();
  }

  async openUploadModal(): Promise<UploadModalPage> {
    await this.uploadButton.click();
    await this.uploadModal.waitForOpen();
    return this.uploadModal;
  }

  async switchToTab(tab: 'videos' | 'shorts'): Promise<void> {
    const tabMap = {
      videos: this.tabVideos,
      shorts: this.tabShorts,
    };
    await tabMap[tab].click();
    await this.waitForLoadingComplete();
  }

  async searchContent(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.waitForLoadingComplete();
  }

  async getContentRowByTitle(title: string): Promise<Locator> {
    return this.contentTable.locator('tr, [role="row"]', { hasText: title });
  }

  async getContentCount(): Promise<number> {
    const rows = this.contentTable.locator('tbody tr, [role="row"]:not([role="columnheader"])');
    return await rows.count();
  }

  async waitForContentToAppear(title: string): Promise<void> {
    await expect(this.contentTable.locator(`text=${title}`)).toBeVisible({ timeout: 30_000 });
  }
}
