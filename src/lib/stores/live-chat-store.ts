import { create } from 'zustand';
import type { ChatMessage } from '@/types';
import { liveChat } from '@/lib/api';

interface LiveChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  platformUsersCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  toggle: () => void;
  open: () => void;
  close: () => void;
  fetchMessages: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  appendMessage: (message: ChatMessage) => void;
  fetchUsersCount: () => Promise<void>;
}

export const useLiveChatStore = create<LiveChatState>((set, get) => ({
  isOpen: false,
  messages: [],
  platformUsersCount: 0,
  isLoading: false,
  error: null,

  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  fetchMessages: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await liveChat.getMessages();
      set({ messages: response.data, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch messages';
      set({ error: message, isLoading: false });
    }
  },

  sendMessage: async (content: string) => {
    try {
      const message = await liveChat.sendMessage(content);
      // Append the new message optimistically (or it may come via WebSocket)
      get().appendMessage(message);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      set({ error: message });
      throw error;
    }
  },

  appendMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  fetchUsersCount: async () => {
    try {
      const { count } = await liveChat.getPlatformUsersCount();
      set({ platformUsersCount: count });
    } catch {
      // Silent fail for user count
    }
  },
}));
