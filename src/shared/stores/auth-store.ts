import { authClient, AuthenticatedMeResponse } from '@/api/client/auth.client';
import { AnalyticsEvent } from '@/shared/lib/analytics/events';
import { isProfileComplete } from '@/shared/lib/auth/profile-completion';
import type { FirebaseLoginData, LoginCredentials, RegisterData, User } from '@/types';
import posthog from 'posthog-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  isSubscribed: boolean;
  isProfileComplete: boolean;
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
      isProfileComplete: false,
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
          const subscribed = response.subscribed ?? false;
          set({
            user: response.user,
            isSubscribed: subscribed,
            isProfileComplete: isProfileComplete(response.user),
            isAuthenticated: true,
            isInitialized: true,
            isLoading: false,
          });
          posthog.identify(response.user.email, {
            name:
              (response.user.display_name ??
                [response.user.first_name, response.user.last_name].filter(Boolean).join(' ')) ||
              response.user.email,
            subscribed,
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
          const subscribed = response.subscribed ?? false;
          set({
            user: response.user,
            isSubscribed: subscribed,
            isProfileComplete: isProfileComplete(response.user),
            isAuthenticated: true,
            isInitialized: true,
            isLoading: false,
          });
          posthog.identify(response.user.email, {
            name:
              (response.user.display_name ??
                [response.user.first_name, response.user.last_name].filter(Boolean).join(' ')) ||
              response.user.email,
            subscribed,
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
          const subscribed = response.subscribed ?? false;
          set({
            user: response.user,
            isSubscribed: subscribed,
            isProfileComplete: isProfileComplete(response.user),
            isAuthenticated: true,
            isInitialized: true,
            isLoading: false,
          });
          posthog.identify(response.user.email, {
            name:
              (response.user.display_name ??
                [response.user.first_name, response.user.last_name].filter(Boolean).join(' ')) ||
              response.user.email,
            subscribed,
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
          posthog.capture(AnalyticsEvent.AUTH_LOGOUT_COMPLETED);
          posthog.reset();
          set({
            user: null,
            isSubscribed: false,
            isProfileComplete: false,
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
            const subscribed = response.subscribed ?? (response.user as User)?.subscribed ?? false;
            const user = response.user as User;
            set({
              user,
              isSubscribed: subscribed,
              isProfileComplete: isProfileComplete(user),
              isAuthenticated: true,
              isLoading: false,
            });
            posthog.identify(user.email, {
              name:
                (user.display_name ??
                  [user.first_name, user.last_name].filter(Boolean).join(' ')) ||
                user.email,
              subscribed,
            });
          } else {
            set({
              user: null,
              isSubscribed: false,
              isProfileComplete: false,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch {
          // Not authenticated or error - clear state
          set({
            user: null,
            isSubscribed: false,
            isProfileComplete: false,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          set({
            user: updatedUser,
            isProfileComplete: isProfileComplete(updatedUser),
          });
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
            set({
              user: null,
              isSubscribed: false,
              isProfileComplete: false,
              isAuthenticated: false,
            });
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
        isProfileComplete: state.isProfileComplete,
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
      }),
      onRehydrateStorage: () => {
        console.log('[auth-store] onRehydrateStorage outer called');
        return (state) => {
          console.log('[auth-store] onRehydrateStorage inner called, state:', !!state);
          if (!state) return;
          console.log('[auth-store] setting _hasHydrated = true, user:', !!state.user);
          state.setHasHydrated(true);
          if (state.user) {
            // Set optimistically so AccessGate renders immediately
            useAuthStore.setState({ isInitialized: true, isAuthenticated: true });
            setTimeout(() => state.checkAuth(), 0); // background verify
          } else {
            useAuthStore.setState({ isInitialized: true, isAuthenticated: false });
          }
        };
      },
    }
  )
);

// Safety net: ensure _hasHydrated is set even if onRehydrateStorage doesn't fire
if (typeof window !== 'undefined') {
  useAuthStore.persist.onFinishHydration(() => {
    console.log('[auth-store] onFinishHydration called');
    const state = useAuthStore.getState();
    if (!state._hasHydrated) {
      console.warn('[auth-store] _hasHydrated was still false after hydration, forcing it');
      useAuthStore.setState({ _hasHydrated: true });
    }
  });
}
