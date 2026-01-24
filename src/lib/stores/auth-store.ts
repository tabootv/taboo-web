import { authClient } from '@/api/client/auth.client';
import { isAuthenticated, removeToken } from '@/api/client/base-client';
import type { FirebaseLoginData, LoginCredentials, RegisterData, User } from '@/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  isSubscribed: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  _hasHydrated: boolean;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  firebaseLogin: (data: FirebaseLoginData) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  setSubscribed: (subscribed: boolean) => void;
  clearError: () => void;
  checkAuth: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isSubscribed: false,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authClient.login(credentials);
          const isSubscribed = response.subscribed ?? false;
          set({
            user: response.user,
            isSubscribed,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authClient.register(data);
          const isSubscribed = response.subscribed ?? false;
          set({
            user: response.user,
            isSubscribed,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Registration failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      firebaseLogin: async (data: FirebaseLoginData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authClient.firebaseLogin(data);
          const isSubscribed = response.subscribed ?? false;
          set({
            user: response.user,
            isSubscribed,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Social login failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authClient.logout();
        } catch {
        } finally {
          removeToken();
          set({ user: null, isSubscribed: false, isAuthenticated: false, isLoading: false });
        }
      },

      fetchUser: async () => {
        if (!isAuthenticated()) {
          set({ user: null, isSubscribed: false, isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await authClient.me();
          const isSubscribed = response.subscribed ?? response.user?.subscribed ?? false;
          set({
            user: response.user,
            isSubscribed,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          removeToken();
          set({ user: null, isSubscribed: false, isAuthenticated: false, isLoading: false });
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      setSubscribed: (subscribed: boolean) => {
        set({ isSubscribed: subscribed });
      },

      clearError: () => set({ error: null }),

      checkAuth: () => {
        const authenticated = isAuthenticated();
        if (!authenticated) {
          set({ user: null, isSubscribed: false, isAuthenticated: false });
        } else if (!get().user) {
          get().fetchUser();
        }
      },
    }),
    {
      name: 'tabootv-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isSubscribed: state.isSubscribed,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
