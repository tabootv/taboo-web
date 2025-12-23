'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarStore {
  isExpanded: boolean;
  isMobileOpen: boolean;
  setExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;
  setMobileOpen: (open: boolean) => void;
  toggleMobileOpen: () => void;
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isExpanded: true,
      isMobileOpen: false,
      setExpanded: (expanded) => set({ isExpanded: expanded }),
      toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
      setMobileOpen: (open) => set({ isMobileOpen: open }),
      toggleMobileOpen: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
    }),
    {
      name: 'tabootv-sidebar',
      partialize: (state) => ({ isExpanded: state.isExpanded }),
    }
  )
);
