/**
 * Videos Page Types
 * Type definitions for video filtering and sorting
 */

export type SortOption = 'newest' | 'oldest' | 'longest' | 'shortest';

export interface VideoFilters {
  sort: SortOption;
  creator: string;
  tag: string;
}
