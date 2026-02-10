# Claude Memory

## Project Rules

- **Use `npm`** — Never use `pnpm` or `yarn`. All commands should use `npm` (e.g. `npm run dev`, `npm run build`, `npm install`).

## Next.js 16 Conventions

- **`proxy.ts` replaces `middleware.ts`** — In Next.js 16 (2026), the middleware file was renamed to `proxy.ts`. Always use `proxy.ts` at the project root (or `src/`), never `middleware.ts`.
  - Export a named `proxy` function or a default export
  - Uses `NextRequest` / `NextResponse` (same API as old middleware)
  - Use `config.matcher` to filter routes
  - Ref: https://nextjs.org/docs/app/getting-started/proxy
