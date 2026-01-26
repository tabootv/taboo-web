# TabooTV Web

Premium video streaming platform frontend built with Next.js 16, React 19, and Tailwind CSS 4.

## Features

- **Video Streaming** - HLS/MP4 playback with Shaka Player, quality selection, playback speed control
- **Shorts Feed** - TikTok-style vertical video feed with swipe navigation
- **Series & Courses** - Netflix-style episode layouts with auto-play
- **Creator Studio** - Content management dashboard for creators
- **Community** - Social feed with posts, comments, likes

## Tech Stack

- **Next.js 16** - App Router with Server/Client Components
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **Shaka Player** - HLS video playback

## Getting Started

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Commands

```bash
npm run dev          # Development server (port 3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint (--max-warnings=0)
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier formatting
npm run type-check   # TypeScript check
npm run test         # Unit tests (Vitest)
```

## Documentation

| Document | Purpose |
|----------|---------|
| [AGENTS.md](./AGENTS.md) | AI assistant context (Claude Code, Cursor, Copilot) |
| [docs/PROJECT_CONTEXT.md](./docs/PROJECT_CONTEXT.md) | Comprehensive project documentation |
| [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) | Design tokens, typography, components |

## Project Structure

```
src/
├── app/              # Next.js App Router (routes + colocated components)
│   └── [route]/
│       ├── _components/  # Route-specific components
│       └── _actions.ts   # Route-specific server actions
├── api/              # TanStack Query API layer
├── components/       # Shared React components
│   ├── ui/           # Design system components
│   └── layout/       # Navbar, Footer, Sidebar
├── features/         # Feature modules (video, shorts, series)
├── shared/           # Utilities, stores, lib
└── types/            # TypeScript interfaces
```

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://app.taboo.tv/api  # Backend API URL
# Firebase config for OAuth
# Laravel Reverb config for WebSockets
```

## License

Proprietary - All rights reserved.
