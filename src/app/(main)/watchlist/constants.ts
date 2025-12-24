import type { WatchlistItemType } from '@/lib/stores/watchlist-store';

export const filterCategories: Array<{ id: WatchlistItemType | 'all'; name: string }> = [
  { id: 'all', name: 'All' },
  { id: 'video', name: 'Videos' },
  { id: 'series', name: 'Series' },
  { id: 'course', name: 'Courses' },
];

