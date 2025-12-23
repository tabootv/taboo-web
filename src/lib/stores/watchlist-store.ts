import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type WatchlistItemType = 'video' | 'series' | 'course';

export interface WatchlistItem {
  id: number;
  uuid?: string;
  type: WatchlistItemType;
  title: string;
  thumbnail: string | null;
  channel?: {
    id: number;
    name: string;
    dp?: string | null;
  };
  duration?: string;
  progress?: number; // 0-100 percentage
  videosCount?: number; // For series/courses
  addedAt: number;
}

interface WatchlistState {
  items: WatchlistItem[];

  // Actions
  addItem: (item: WatchlistItem) => void;
  removeItem: (itemId: number, type: WatchlistItemType) => void;
  isInWatchlist: (itemId: number, type: WatchlistItemType) => boolean;
  toggleWatchlist: (item: WatchlistItem) => boolean; // Returns new state (true = added, false = removed)
  updateProgress: (itemId: number, type: WatchlistItemType, progress: number) => void;
  getItemsByType: (type: WatchlistItemType | 'all') => WatchlistItem[];
  clearAll: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item: WatchlistItem) => {
        const { items } = get();
        // Check if item already exists (by id and type)
        if (!items.some((i) => i.id === item.id && i.type === item.type)) {
          set({ items: [{ ...item, addedAt: Date.now() }, ...items] });
        }
      },

      removeItem: (itemId: number, type: WatchlistItemType) => {
        set({
          items: get().items.filter((i) => !(i.id === itemId && i.type === type)),
        });
      },

      isInWatchlist: (itemId: number, type: WatchlistItemType) => {
        return get().items.some((i) => i.id === itemId && i.type === type);
      },

      toggleWatchlist: (item: WatchlistItem) => {
        const { isInWatchlist, addItem, removeItem } = get();
        if (isInWatchlist(item.id, item.type)) {
          removeItem(item.id, item.type);
          return false;
        } else {
          addItem(item);
          return true;
        }
      },

      updateProgress: (itemId: number, type: WatchlistItemType, progress: number) => {
        set({
          items: get().items.map((i) =>
            i.id === itemId && i.type === type ? { ...i, progress } : i
          ),
        });
      },

      getItemsByType: (type: WatchlistItemType | 'all') => {
        const { items } = get();
        if (type === 'all') return items;
        return items.filter((i) => i.type === type);
      },

      clearAll: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'tabootv-watchlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Helper function to format the "added at" time
export function formatAddedAt(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / 604800000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;

  // Format as date for older items
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
