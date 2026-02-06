import { authClient, AuthenticatedMeResponse } from '@/api/client/auth.client';
import type { FirebaseLoginData, LoginCredentials, RegisterData, User } from '@/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  isSubscribed: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  error: string | null;
  _hasHydrated: boolean;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  firebaseLogin: (data: FirebaseLoginData) => Promise<{ requires_username?: boolean }>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  setSubscribed: (subscribed: boolean) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  setHasHydrated: (state: boolean) => void;
}

let pendingAuthCheck: Promise<void> | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isSubscribed: false,
      isLoading: false,
      isAuthenticated: false,
      isInitialized: false,
      error: null,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          // Client-side: /api/login proxy sets HttpOnly cookie
          const response = await authClient.login(credentials);
          const isSubscribed = response.subscribed ?? false;
          set({
            user: response.user,
            isSubscribed,
            isAuthenticated: true,
            isInitialized: true,
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
          // Client-side: /api/register proxy sets HttpOnly cookie
          const response = await authClient.register(data);
          const isSubscribed = response.subscribed ?? false;
          set({
            user: response.user,
            isSubscribed,
            isAuthenticated: true,
            isInitialized: true,
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
          // Client-side: /api/auth/firebase-login proxy sets HttpOnly cookie
          const response = await authClient.firebaseLogin(data);
          const isSubscribed = response.subscribed ?? false;
          set({
            user: response.user,
            isSubscribed,
            isAuthenticated: true,
            isInitialized: true,
            isLoading: false,
          });
          return response.requires_username !== undefined
            ? { requires_username: response.requires_username }
            : {};
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Social login failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          // Client-side: /api/logout proxy clears HttpOnly cookie
          await authClient.logout();
        } catch {
          // Ignore logout errors - clear local state anyway
        } finally {
          set({
            user: null,
            isSubscribed: false,
            isAuthenticated: false,
            isInitialized: false,
            isLoading: false,
          });
          window.location.href = '/sign-in';
        }
      },

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const response: AuthenticatedMeResponse = await authClient.me();
          if (response.authenticated && response.user) {
            const isSubscribed =
              response.subscribed ?? (response.user as User)?.subscribed ?? false;
            set({
              user: response.user as User,
              isSubscribed,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({ user: null, isSubscribed: false, isAuthenticated: false, isLoading: false });
          }
        } catch {
          // Not authenticated or error - clear state
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

      checkAuth: async () => {
        if (pendingAuthCheck) return pendingAuthCheck;
        pendingAuthCheck = (async () => {
          try {
            await get().fetchUser();
          } catch {
            set({ user: null, isSubscribed: false, isAuthenticated: false });
          } finally {
            set({ isInitialized: true });
            pendingAuthCheck = null;
          }
        })();
        return pendingAuthCheck;
      },
    }),
    {
      name: 'tabootv-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isSubscribed: state.isSubscribed,
        // Don't persist isAuthenticated - derive from server on hydration
        // Persist _hasHydrated to allow E2E tests to pre-set hydration state
        _hasHydrated: state._hasHydrated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (state?.user) {
          setTimeout(() => state.checkAuth(), 0);
        } else {
          // No persisted user — no need to verify, mark as initialized
          useAuthStore.setState({ isInitialized: true });
        }
      },
    }
  )
);
