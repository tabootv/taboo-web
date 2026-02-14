# Claude Memory

## Project Rules

- **Use `npm`** — Never use `pnpm` or `yarn`. All commands should use `npm` (e.g. `npm run dev`, `npm run build`, `npm install`).

## Next.js 16 Conventions

- **`proxy.ts` replaces `middleware.ts`** — In Next.js 16 (2026), the middleware file was renamed to `proxy.ts`. Always use `proxy.ts` at the project root (or `src/`), never `middleware.ts`.
  - Export a named `proxy` function or a default export
  - Uses `NextRequest` / `NextResponse` (same API as old middleware)
  - Use `config.matcher` to filter routes
  - Ref: https://nextjs.org/docs/app/getting-started/proxy

## Styling

- **Tailwind CSS v4** — This project uses Tailwind CSS v4 for all styling. Key differences from v3:
  - No `tailwind.config.js` — configuration is done via CSS using `@theme` in the main CSS file
  - Use `@import "tailwindcss"` instead of the old `@tailwind` directives
  - Theme values are defined as CSS custom properties under `@theme` (e.g. `--color-primary: ...`)
  - Arbitrary values and variants work the same as v3
  - Ref: https://tailwindcss.com/docs

## Auto-Apply Skills

When handling any code-related prompt (writing, reviewing, refactoring, debugging, or modifying code), always apply these skills:

1. **`/vercel-react-best-practices`** — Ensure React/Next.js performance patterns
2. **`/web-performance-optimization`** — Optimize Core Web Vitals, bundle size, and navigation speed
3. **`/sonar-scan`** — Run code quality analysis after writing code

Apply them in this order: best practices first (guides implementation), then performance optimization (validates perf), then sonar scan (quality gate at the end).
