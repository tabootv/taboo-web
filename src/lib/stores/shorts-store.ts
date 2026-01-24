/**
 * Shorts UI Store
 *
 * Minimal Zustand store for UI-only state that needs to persist across shorts.
 * Video data and like state are managed by React Query for proper cache management.
 *
 * State managed here:
 * - Audio preferences (muted, volume) - persists user preference
 * - Comment panel visibility - UI state
 * - Comment list for current video - UI state (loaded from API)
 */

import { create } from 'zustand';
import type { Comment } from '@/types';

interface ShortsUIState {
  // Audio state
  isMuted: boolean;
  volume: number;

  // Comment panel state
  showComments: boolean;
  commentList: Comment[];

  // Actions
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  toggleComments: () => void;
  setShowComments: (show: boolean) => void;
  setCommentList: (comments: Comment[]) => void;
  appendComment: (comment: Comment) => void;
}

export const useShortsStore = create<ShortsUIState>((set) => ({
  // Audio state - start unmuted, autoplay handles temporary muting
  isMuted: false,
  volume: 1,

  // Comment panel - closed by default
  showComments: false,
  commentList: [],

  // Audio actions
  toggleMute: () => {
    set((state) => ({ isMuted: !state.isMuted }));
  },

  setVolume: (volume: number) => {
    set({ volume, isMuted: volume === 0 });
  },

  // Comment actions
  toggleComments: () => {
    set((state) => ({ showComments: !state.showComments }));
  },

  setShowComments: (show: boolean) => {
    set({ showComments: show });
  },

  setCommentList: (comments: Comment[]) => {
    set({ commentList: comments });
  },

  appendComment: (comment: Comment) => {
    set((state) => ({ commentList: [comment, ...state.commentList] }));
  },
}));
