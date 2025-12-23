import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface SavedVideo {
  id: number;
  title: string;
  thumbnail: string | null;
  channelName: string | null;
  savedAt: number;
}

interface SavedVideosState {
  videos: SavedVideo[];

  // Actions
  saveVideo: (video: SavedVideo) => void;
  removeVideo: (videoId: number) => void;
  isSaved: (videoId: number) => boolean;
  toggleSave: (video: SavedVideo) => boolean; // Returns new saved state
  clearAll: () => void;
}

export const useSavedVideosStore = create<SavedVideosState>()(
  persist(
    (set, get) => ({
      videos: [],

      saveVideo: (video: SavedVideo) => {
        const { videos } = get();
        if (!videos.some((v) => v.id === video.id)) {
          set({ videos: [video, ...videos] });
        }
      },

      removeVideo: (videoId: number) => {
        set({ videos: get().videos.filter((v) => v.id !== videoId) });
      },

      isSaved: (videoId: number) => {
        return get().videos.some((v) => v.id === videoId);
      },

      toggleSave: (video: SavedVideo) => {
        const { videos, isSaved, saveVideo, removeVideo } = get();
        if (isSaved(video.id)) {
          removeVideo(video.id);
          return false;
        } else {
          saveVideo(video);
          return true;
        }
      },

      clearAll: () => {
        set({ videos: [] });
      },
    }),
    {
      name: 'tabootv-saved-videos',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
