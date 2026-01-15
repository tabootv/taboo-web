import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, LoginCredentials, RegisterData, FirebaseLoginData } from '@/types';
import { authClient, removeToken, isAuthenticated } from '@/api/client';

interface AuthState {
  user: User | null;
  isSubscribed: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  _hasHydrated: boolean;

  // Actions
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
          // subscribed is at root level in login response
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
          // subscribed is at root level in register response
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
          // subscribed is at root level in firebase login response
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
          // Continue logout even if API call fails
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
          // subscribed may be at root or inside user
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
