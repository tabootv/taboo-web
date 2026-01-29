# Testing Guide

> **When to use:** Writing unit tests, component tests, mocking data. Using Vitest.

---

## Quick Start

```bash
npm run test                    # Run all tests
npm run test -- path/to/file   # Run specific test
npm run test -- --watch        # Watch mode
```

---

## Test Structure

### Location
Tests live alongside code:
```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   └── button.test.tsx    ← Test here
│   └── layout/
│       ├── navbar.tsx
│       └── navbar.test.tsx
└── api/
    ├── queries/
    │   ├── video.queries.ts
    │   └── video.queries.test.ts
    └── mutations/
```

---

## Unit Test Pattern

```tsx
// src/utils/formatting.test.ts
import { describe, it, expect } from 'vitest';
import { formatDuration, formatViews } from '@/shared/utils/formatting';

describe('formatDuration', () => {
  it('formats seconds to MM:SS', () => {
    expect(formatDuration(125)).toBe('2:05');
  });
  
  it('formats to HH:MM:SS for long videos', () => {
    expect(formatDuration(3661)).toBe('1:01:01');
  });
});

describe('formatViews', () => {
  it('formats view count with K/M suffix', () => {
    expect(formatViews(1500)).toBe('1.5K');
    expect(formatViews(1500000)).toBe('1.5M');
  });
});
```

---

## Component Test Pattern

### Simple Component Test

```tsx
// src/components/ui/button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick handler', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    
    fireEvent.click(screen.getByText('Click'));
    expect(onClick).toHaveBeenCalled();
  });
  
  it('respects disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Component with Hooks

```tsx
// src/components/video-player.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VideoPlayer } from './video-player';

// Wrap with QueryClientProvider for TanStack Query hooks
function renderWithQuery(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
}

describe('VideoPlayer', () => {
  it('renders video element', () => {
    renderWithQuery(<VideoPlayer videoId="123" />);
    expect(screen.getByRole('video')).toBeInTheDocument();
  });
  
  it('fetches video data on mount', async () => {
    renderWithQuery(<VideoPlayer videoId="123" />);
    
    await waitFor(() => {
      expect(screen.getByText(/loading/i)).not.toBeInTheDocument();
    });
  });
});
```

---

## Mocking Patterns

### Mock TanStack Query

```tsx
// src/api/queries/video.queries.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as queries from './video.queries';

// Mock the API client
vi.mock('@/api/client/video.client', () => ({
  videoClient: {
    getVideo: vi.fn(() => Promise.resolve({
      id: '123',
      title: 'Test Video',
      duration: 300,
    })),
  },
}));

describe('useVideo', () => {
  it('fetches and returns video data', async () => {
    const { result } = renderHook(() => queries.useVideo('123'));
    
    // Wait for loading to finish
    await waitFor(() => !result.current.isLoading);
    
    expect(result.current.data).toEqual({
      id: '123',
      title: 'Test Video',
      duration: 300,
    });
  });
});
```

### Mock Zustand Store

```tsx
// src/stores/auth-store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth-store';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });
  
  it('initializes with no user', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
  
  it('sets user and marks authenticated', () => {
    const user = { id: '1', email: 'test@example.com' };
    useAuthStore.getState().setUser(user, 'token');
    
    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
  });
});
```

---

## Server Action Testing

```tsx
// src/app/(auth)/sign-in/_actions.test.ts
import { describe, it, expect, vi } from 'vitest';
import { loginAction } from './_actions';

vi.mock('@/api/client/auth.client', () => ({
  authClient: {
    login: vi.fn(() => Promise.resolve({ token: 'test-token' })),
  },
}));

describe('loginAction', () => {
  it('returns token on successful login', async () => {
    const result = await loginAction({
      email: 'test@example.com',
      password: 'password',
    });
    
    expect(result).toHaveProperty('token', 'test-token');
  });
  
  it('throws on invalid credentials', async () => {
    vi.mocked(authClient.login).mockRejectedValueOnce(
      new Error('Invalid credentials')
    );
    
    await expect(
      loginAction({ email: 'test@example.com', password: 'wrong' })
    ).rejects.toThrow('Invalid credentials');
  });
});
```

---

## Common Assertions

```tsx
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(screen.getByText('Hello')).toBeInTheDocument();
expect(screen.queryByText('Gone')).not.toBeInTheDocument();
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
expect(result).toEqual({ id: 1, name: 'Test' });
```

---

## Test Utilities

```tsx
import {
  render,           // Render component
  screen,           // Query rendered elements
  fireEvent,        // Simulate user interactions
  waitFor,          // Wait for async updates
  renderHook,       // Test hooks
} from '@testing-library/react';

import { vi, describe, it, expect } from 'vitest';
```

---

## Best Practices

✅ **DO:**
- Test behavior, not implementation details
- Use semantic queries (`screen.getByRole`, `screen.getByText`)
- Mock external dependencies
- Test error states
- Use `waitFor` for async operations
- Reset state between tests

❌ **DON'T:**
- Test implementation details (internal variables)
- Use `innerHTML` or DOM navigation
- Forget to mock API calls
- Ignore error cases
- Test third-party libraries

---

## Vitest Config

Located in `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

## Reference

- **Testing Library docs:** https://testing-library.com/
- **Vitest docs:** https://vitest.dev/
- **TanStack Query testing:** https://tanstack.com/query/latest/docs/react/testing
