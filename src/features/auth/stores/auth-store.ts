import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { isAuthenticated } from '@/api/client/base-client';

/**
 * Auth store for client-side UI state only.
 * Server state should be managed via TanStack Query.
 */
interface AuthUIState {
  isAuthenticated: boolean;
  checkAuth: () => void;
}

export const useAuthUIStore = create<AuthUIState>()(
  persist(
    (set) => ({
      isAuthenticated: false,

      checkAuth: () => {
        const authenticated = isAuthenticated();
        set({ isAuthenticated: authenticated });
      },
    }),
    {
      name: 'tabootv-auth-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

