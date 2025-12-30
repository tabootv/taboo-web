import { create } from 'zustand';
import type { Video, Comment } from '@/types';
import { shorts } from '@/lib/api';

interface ShortsState {
  videos: Video[];
  currentIndex: number;
  nextPageUrl: string | null;
  isLastPage: boolean;
  isMuted: boolean;
  volume: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasFetched: boolean;
  error: string | null;

  // Comment state
  showComments: boolean;
  commentList: Comment[];
  hasLiked: boolean;

  // Actions
  fetchVideos: (initialUuid?: string) => Promise<void>;
  loadMore: () => Promise<void>;
  setCurrentIndex: (index: number) => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  prependVideo: (video: Video) => void;
  appendVideos: (videos: Video[]) => void;
  reset: () => void;

  // Comment actions
  toggleComments: () => void;
  updateCommentList: (comments: Comment[]) => void;
  appendComment: (comment: Comment) => void;
  setHasLiked: (liked: boolean) => void;
  updateVideoLike: (uuid: string, isLiked: boolean) => void;
}

export const useShortsStore = create<ShortsState>((set, get) => ({
  videos: [],
  currentIndex: 0,
  nextPageUrl: null,
  isLastPage: false,
  isMuted: false, // Start unmuted - autoplay handles temporary muting
  volume: 1,
  isLoading: false,
  isLoadingMore: false,
  hasFetched: false,
  error: null,

  // Comment state
  showComments: false,
  commentList: [],
  hasLiked: false,

  fetchVideos: async (initialUuid?: string) => {
    const { isLoading, hasFetched, videos } = get();

    // Prevent duplicate fetches
    if (isLoading) return;

    // If we already have videos and no initialUuid, don't refetch
    if (hasFetched && videos.length > 0 && !initialUuid) return;

    set({ isLoading: true, error: null });
    try {
      // If we have an initial UUID, fetch that specific short first
      if (initialUuid) {
        const shortData = await shorts.getV2(initialUuid);
        const response = await shorts.listV2({ per_page: 10 });

        // Filter out the initial video from the list and prepend it
        const filteredVideos = (response.data || []).filter(
          (v: Video) => v.uuid !== initialUuid
        );

        // Safely access comments - they may not be embedded in the response
        const videoComments = shortData?.comments ?? [];

        set({
          videos: shortData ? [shortData, ...filteredVideos] : filteredVideos,
          nextPageUrl: response.next_page_url,
          isLastPage: !response.next_page_url,
          isLoading: false,
          hasFetched: true,
          currentIndex: 0,
          commentList: Array.isArray(videoComments) ? videoComments : [],
          hasLiked: shortData?.has_liked ?? false,
        });
      } else {
        const response = await shorts.listV2({ per_page: 10 });
        const fetchedVideos = response.data || [];
        const firstVideo = fetchedVideos[0];

        // Safely access comments - they may not be embedded in the response
        const videoComments = firstVideo?.comments ?? [];

        set({
          videos: fetchedVideos,
          nextPageUrl: response.next_page_url,
          isLastPage: !response.next_page_url,
          isLoading: false,
          hasFetched: true,
          currentIndex: 0,
          commentList: Array.isArray(videoComments) ? videoComments : [],
          hasLiked: firstVideo?.has_liked ?? false,
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch shorts';
      set({ error: message, isLoading: false, hasFetched: true });
    }
  },

  loadMore: async () => {
    const { nextPageUrl, isLastPage, isLoading, isLoadingMore } = get();
    if (isLastPage || isLoading || isLoadingMore || !nextPageUrl) return;

    set({ isLoadingMore: true });
    try {
      // Extract page number from URL
      const url = new URL(nextPageUrl);
      const page = url.searchParams.get('page') || '2';

      const response = await shorts.listV2({
        page: parseInt(page),
        per_page: 10,
      });

      set((state) => ({
        videos: [...state.videos, ...(response.data || [])],
        nextPageUrl: response.next_page_url,
        isLastPage: !response.next_page_url,
        isLoadingMore: false,
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load more shorts';
      set({ error: message, isLoadingMore: false });
    }
  },

  setCurrentIndex: (index: number) => {
    const { videos, loadMore, currentIndex, isLoadingMore } = get();

    // Prevent unnecessary updates
    if (index === currentIndex) return;

    const video = videos[index];
    if (!video) return;

    // Safely access comments - they may not be embedded in the response
    const videoComments = video?.comments ?? [];

    set({
      currentIndex: index,
      commentList: Array.isArray(videoComments) ? videoComments : [],
      hasLiked: video?.has_liked ?? false,
      showComments: false, // Close comments when switching videos
    });

    // Preload more videos when near the end (3 videos away like Vue)
    if (index >= videos.length - 3 && !isLoadingMore) {
      loadMore();
    }
  },

  toggleMute: () => {
    set((state) => ({ isMuted: !state.isMuted }));
  },

  setVolume: (volume: number) => {
    set({ volume, isMuted: volume === 0 });
  },

  prependVideo: (video: Video) => {
    set((state) => ({
      videos: [video, ...state.videos],
    }));
  },

  appendVideos: (videos: Video[]) => {
    set((state) => ({
      videos: [...state.videos, ...videos],
    }));
  },

  reset: () => {
    set({
      videos: [],
      currentIndex: 0,
      nextPageUrl: null,
      isLastPage: false,
      isLoading: false,
      isLoadingMore: false,
      hasFetched: false,
      error: null,
      showComments: false,
      commentList: [],
      hasLiked: false,
    });
  },

  // Comment actions
  toggleComments: () => {
    set((state) => ({ showComments: !state.showComments }));
  },

  updateCommentList: (comments: Comment[]) => {
    set({ commentList: comments });
  },

  appendComment: (comment: Comment) => {
    set((state) => {
      if (comment.parent_id) {
        // Find parent and add reply
        const updatedComments = state.commentList.map((c) => {
          if (c.id === comment.parent_id) {
            return {
              ...c,
              replies: [...(c.replies || []), comment],
            };
          }
          return c;
        });
        return { commentList: updatedComments };
      } else {
        // Add to beginning
        return { commentList: [comment, ...state.commentList] };
      }
    });
  },

  setHasLiked: (liked: boolean) => {
    set({ hasLiked: liked });
  },

  updateVideoLike: (uuid: string, isLiked: boolean) => {
    set((state) => ({
      videos: state.videos.map((video) =>
        video.uuid === uuid
          ? {
              ...video,
              has_liked: isLiked,
              is_liked: isLiked,
              likes_count: (video.likes_count || 0) + (isLiked ? 1 : -1),
            }
          : video
      ),
      hasLiked: isLiked,
    }));
  },
}));
