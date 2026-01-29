# State Management with Zustand

> **When to use:** Managing client-side UI state, preferences, auth status. Using Zustand stores.

---

## Quick Reference

```tsx
// Import a store
import { useAuthStore } from '@/shared/stores/auth-store';
import { useSidebarStore } from '@/shared/stores/sidebar-store';

// Use in component
const { user, isAuthenticated, logout } = useAuthStore();
const { isOpen, toggle } = useSidebarStore();
```

---

## Store Locations

All stores are in `src/shared/stores/`:

| Store | Purpose |
|-------|---------|
| `auth-store.ts` | User auth state, login/logout |
| `shorts-store.ts` | Shorts feed state (current video index, etc.) |
| `sidebar-store.ts` | Sidebar open/closed state |

---

## Creating a Zustand Store

### Pattern

```tsx
// src/shared/stores/my-store.ts
import { create } from 'zustand';

export const useMyStore = create((set) => ({
  // State
  count: 0,
  isOpen: false,
  
  // Actions
  increment: () => set((state) => ({ count: state.count + 1 })),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  
  // Complex actions
  reset: () => set({ count: 0, isOpen: false }),
}));
```

### In Component

```tsx
'use client';

import { useMyStore } from '@/shared/stores/my-store';

export function MyComponent() {
  const { count, isOpen, increment, toggle } = useMyStore();
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={toggle}>Toggle: {isOpen ? 'Open' : 'Closed'}</button>
    </div>
  );
}
```

---

## Persist Store to LocalStorage

```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePreferencesStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      language: 'en',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'taboo-preferences', // Key in localStorage
    }
  )
);
```

---

## Auth Store Example

```tsx
// src/shared/stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
}

export const useAuthStore = create(
  persist(
    (set) => ({
      // State
      user: null as User | null,
      token: null as string | null,
      
      // Computed
      isAuthenticated: false,
      
      // Actions
      setUser: (user: User | null, token: string | null) =>
        set({ 
          user, 
          token, 
          isAuthenticated: !!user 
        }),
      
      logout: () =>
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        }),
    }),
    {
      name: 'auth-store',
    }
  )
);
```

---

## Combining TanStack Query + Zustand

### Fetch once, store in Zustand

```tsx
'use client';

import { useEffect } from 'react';
import { useUser } from '@/api/queries/auth.queries';
import { useAuthStore } from '@/shared/stores/auth-store';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: user } = useUser();
  const setUser = useAuthStore((state) => state.setUser);
  
  useEffect(() => {
    if (user) {
      setUser(user, user.token);
    }
  }, [user, setUser]);
  
  return <>{children}</>;
}
```

### Access from Zustand

```tsx
const { user } = useAuthStore();
```

---

## Best Practices

✅ **DO:**
- Use Zustand for UI state (modals, sidebar, etc.)
- Use TanStack Query for server state (data)
- Persist stores that need to survive page reloads
- Keep stores simple and focused
- Use descriptive action names

❌ **DON'T:**
- Use Zustand for server data (use TanStack Query)
- Create too many stores (combine related state)
- Mutate state directly (use set())
- Store sensitive data in localStorage (tokens should be secure)

---

## Shorts Feed Example

```tsx
// src/shared/stores/shorts-store.ts
export const useShortsStore = create((set) => ({
  currentIndex: 0,
  videos: [] as Video[],
  
  setVideos: (videos: Video[]) => set({ videos }),
  
  next: () => set((state) => ({
    currentIndex: Math.min(state.currentIndex + 1, state.videos.length - 1),
  })),
  
  prev: () => set((state) => ({
    currentIndex: Math.max(state.currentIndex - 1, 0),
  })),
  
  goTo: (index: number) => set({ currentIndex: index }),
}));
```

### In Shorts Feed Component

```tsx
'use client';

import { useShortsStore } from '@/shared/stores/shorts-store';

export function ShortsPlayer({ videos }: { videos: Video[] }) {
  const { currentIndex, next, prev, setVideos } = useShortsStore();
  
  useEffect(() => {
    setVideos(videos);
  }, [videos, setVideos]);
  
  const current = videos[currentIndex];
  
  return (
    <div>
      <Video key={current.id} src={current.url} />
      <button onClick={prev}>← Previous</button>
      <button onClick={next}>Next →</button>
    </div>
  );
}
```

---

## Reference

- **All stores:** `src/shared/stores/`
- **Zustand docs:** https://zustand-demo.vercel.app/
- **Best practices:** Use for UI state, auth state, user preferences
