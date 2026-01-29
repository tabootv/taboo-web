---
name: testing
description: "Vitest unit testing, component testing, mocking strategies, test fixtures, coverage targets"
allowed-tools: Read, Write, Edit, Bash
version: 1.0
priority: HIGH
---

# Testing Patterns – TabooTV Quality Assurance

> **CORE GOAL:** Write fast, maintainable tests that catch bugs and prevent regressions.

---

## When to Use This Skill

**Trigger Keywords:**
- "Write tests for X"
- "This component needs tests"
- "Mock API calls"
- "Test error handling"
- "Increase test coverage"
- "Create test fixtures"
- "Test performance"

---

## Test Structure

```
src/
├── features/video/
│   ├── components/video-card.tsx
│   ├── components/video-card.test.tsx      ← Co-located
│   ├── hooks/useVideoPlayer.ts
│   ├── hooks/useVideoPlayer.test.ts        ← Co-located
│   └── __tests__/
│       ├── fixtures/
│       │   ├── videos.fixture.ts           ← Test data
│       │   └── player.fixture.ts
│       └── mocks/
│           ├── video.mock.ts               ← Mocked APIs
│           └── player.mock.ts
└── testing/                                ← Shared test utilities
    ├── setup.ts
    ├── mocks/
    │   ├── handlers.ts                     ← MSW handlers
    │   └── server.ts                       ← MSW server
    ├── fixtures/
    │   └── common.fixture.ts               ← Shared test data
    └── utils.ts                            ← Test helpers
```

---

## Unit Test Pattern

```typescript
// src/features/video/hooks/useVideoPlayer.test.ts
import { renderHook, act } from '@testing-library/react';
import { useVideoPlayer } from './useVideoPlayer';

describe('useVideoPlayer', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useVideoPlayer('video-1'));

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentTime).toBe(0);
  });

  it('plays video when play is called', () => {
    const { result } = renderHook(() => useVideoPlayer('video-1'));

    act(() => {
      result.current.play();
    });

    expect(result.current.isPlaying).toBe(true);
  });

  it('seeks to specified time', () => {
    const { result } = renderHook(() => useVideoPlayer('video-1'));

    act(() => {
      result.current.seek(30);
    });

    expect(result.current.currentTime).toBe(30);
  });
});
```

---

## Component Test Pattern

```typescript
// src/features/video/components/video-card.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VideoCard } from './video-card';
import { createVideoFixture } from '../__tests__/fixtures/videos.fixture';

describe('VideoCard', () => {
  it('renders video title and duration', () => {
    const video = createVideoFixture();
    
    render(<VideoCard video={video} />);

    expect(screen.getByText(video.title)).toBeInTheDocument();
    expect(screen.getByText(`${video.duration}m`)).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const video = createVideoFixture();
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<VideoCard video={video} onClick={onClick} />);

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('shows loading state when isLoading is true', () => {
    const video = createVideoFixture();

    render(<VideoCard video={video} isLoading />);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

---

## Test Fixtures (Mock Data)

```typescript
// src/features/video/__tests__/fixtures/videos.fixture.ts
import type { Video } from '@/api/types/video.types';

export const createVideoFixture = (overrides?: Partial<Video>): Video => ({
  id: 'video-1',
  title: 'Test Video',
  description: 'A test video',
  duration: 120,
  playlistUrl: 'https://example.com/playlist.m3u8',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  createdAt: '2026-01-27T00:00:00Z',
  updatedAt: '2026-01-27T00:00:00Z',
  views: 1000,
  isLiked: false,
  likeCount: 50,
  ...overrides,
});

export const createVideoListFixture = (count: number = 5): Video[] =>
  Array.from({ length: count }, (_, i) =>
    createVideoFixture({ id: `video-${i + 1}` })
  );

// Usage in tests:
const video = createVideoFixture({ title: 'Custom Title' });
const videos = createVideoListFixture(10);
```

---

## Mocking API Calls (MSW)

```typescript
// src/testing/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const handlers = [
  http.get(`${baseURL}/videos/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: 'Test Video',
      duration: 120,
    });
  }),

  http.get(`${baseURL}/videos`, () => {
    return HttpResponse.json({
      data: [
        { id: '1', title: 'Video 1' },
        { id: '2', title: 'Video 2' },
      ],
      pagination: { page: 1, limit: 20, total: 2, pages: 1 },
    });
  }),

  http.post(`${baseURL}/videos/:id/like`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      likeCount: 51,
    });
  }),
];

// src/testing/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// src/testing/setup.ts (Vitest config)
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## Testing Mutations

```typescript
// src/api/mutations/video.mutations.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMutation } from '@tanstack/react-query';
import { useToggleLike } from './video.mutations';
import { server } from '@/testing/mocks/server';
import { http, HttpResponse } from 'msw';

describe('useToggleLike', () => {
  it('toggles like status optimistically', async () => {
    const { result } = renderHook(() => useToggleLike());

    act(() => {
      result.current.mutate('video-1');
    });

    // Check optimistic update
    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('rolls back on error', async () => {
    // Override handler to return error
    server.use(
      http.post('*/videos/:id/like', () => {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      })
    );

    const { result } = renderHook(() => useToggleLike());

    act(() => {
      result.current.mutate('video-999');
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
```

---

## Testing Async Operations

```typescript
// Avoid
function test() {
  const { result } = renderHook(() => useVideo('1'));
  expect(result.current.data).toBe(video); // ❌ Fails (async not finished)
}

// Correct
async function test() {
  const { result } = renderHook(() => useVideo('1'));
  
  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });

  expect(result.current.data?.title).toBe('Test Video');
}
```

---

## Test Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/testing/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/__tests__/**',
        'src/testing/**',
      ],
      lines: 70,      // 70% coverage target
      branches: 60,   // 60% coverage target
      statements: 70,
      functions: 70,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

## Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- src/features/video/components/video-card.test.tsx

# Watch mode
npm run test -- --watch

# Generate coverage report
npm run test -- --coverage

# UI mode (interactive dashboard)
npm run test:ui
```

---

## Coverage Targets

| Category | Target |
|----------|--------|
| **Lines** | 70% |
| **Branches** | 60% |
| **Functions** | 70% |
| **Statements** | 70% |

Start with these targets, increase over time. Focus on:
1. Critical business logic
2. Error cases
3. Edge cases
4. User interactions

Don't test:
- Library code
- Auto-generated code
- UI framework internals

---

## When Complete: Self-Check

- [ ] Tests cover happy path + error cases
- [ ] Async operations use `waitFor`
- [ ] API calls are mocked
- [ ] Fixtures are used for test data
- [ ] No hardcoded test data
- [ ] Test names describe what is tested
- [ ] Coverage targets are met
- [ ] Tests run: `npm run test`

---

## Related Skills

- **api-integration** — API mocking patterns
- **clean-code** — Writing maintainable tests
- **refactoring-patterns** — Testable code structure
