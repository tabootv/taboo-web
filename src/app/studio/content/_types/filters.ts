export type VideoStatusFilter = 'all' | 'processing' | 'published' | 'private' | 'unlisted';
export type VideoSortOption = 'newest' | 'oldest';

export interface ContentFilters {
  status: VideoStatusFilter;
  sortBy: VideoSortOption;
}

export const STATUS_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'processing', label: 'Processing' },
  { id: 'published', label: 'Published' },
  { id: 'private', label: 'Private' },
  { id: 'unlisted', label: 'Unlisted' },
] as const;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
] as const;
