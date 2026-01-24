/**
 * Moderation Types
 * Reporting and blocking functionality
 */

export interface ReportData {
  type: 'video' | 'post' | 'comment' | 'user';
  id: number | string;
  reason: string;
  description?: string;
}

export interface BlockData {
  type: 'video' | 'post' | 'user';
  id: number | string;
}
