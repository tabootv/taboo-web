import { create } from 'zustand';

interface ComposeDraft {
  caption: string;
  images: File[];
  audioFiles: File[];
  location: string;
  latitude: number | undefined;
  longitude: number | undefined;
}

interface ComposeState {
  isPublishing: boolean;
  draft: ComposeDraft;
  lastCreatedPostId: number | null;

  setCaption: (caption: string) => void;
  addImages: (files: File[]) => void;
  removeImage: (index: number) => void;
  addAudioFiles: (files: File[]) => void;
  removeAudioFile: (index: number) => void;
  setLocation: (location: string, latitude?: number, longitude?: number) => void;
  setPublishing: (isPublishing: boolean) => void;
  setLastCreatedPostId: (id: number | null) => void;
  resetDraft: () => void;
}

const initialDraft: ComposeDraft = {
  caption: '',
  images: [],
  audioFiles: [],
  location: '',
  latitude: undefined,
  longitude: undefined,
};

export const useComposeStore = create<ComposeState>((set) => ({
  isPublishing: false,
  draft: { ...initialDraft },
  lastCreatedPostId: null,

  setCaption: (caption) => set((s) => ({ draft: { ...s.draft, caption } })),
  addImages: (files) =>
    set((s) => ({ draft: { ...s.draft, images: [...s.draft.images, ...files] } })),
  removeImage: (index) =>
    set((s) => ({ draft: { ...s.draft, images: s.draft.images.filter((_, i) => i !== index) } })),
  addAudioFiles: (files) =>
    set((s) => ({ draft: { ...s.draft, audioFiles: [...s.draft.audioFiles, ...files] } })),
  removeAudioFile: (index) =>
    set((s) => ({
      draft: { ...s.draft, audioFiles: s.draft.audioFiles.filter((_, i) => i !== index) },
    })),
  setLocation: (location, latitude, longitude) =>
    set((s) => ({ draft: { ...s.draft, location, latitude, longitude } })),
  setPublishing: (isPublishing) => set({ isPublishing }),
  setLastCreatedPostId: (id) => set({ lastCreatedPostId: id }),
  resetDraft: () => set({ draft: { ...initialDraft }, isPublishing: false }),
}));
