export type VideoStatusFilter = 'all' | 'processing' | 'published' | 'draft' | 'scheduled';
export type VideoSortOption = 'newest' | 'oldest';

export interface ContentFilters {
  status: VideoStatusFilter;
  sortBy: VideoSortOption;
}

export const STATUS_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'processing', label: 'Processing' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Drafts' },
  { id: 'scheduled', label: 'Scheduled' },
] as const;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
] as const;
