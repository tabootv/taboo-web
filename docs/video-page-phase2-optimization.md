# Video Page Phase 2 Optimization

Phase 1 converted the video page from 100% client-side to server component architecture. This Phase 2 targets **Shaka Player startup speed**, **correct tag-based related videos**, and remaining performance gaps.

## Changes

### 1. Native `<video>` Fast Path for MP4-Only Videos

**Files:** `use-shaka-player.ts`

Most older videos only have MP4 URLs (no HLS manifest). Previously, all videos went through Shaka Player's heavy init sequence (dynamic import, polyfill, create Player, attach, configure, load). For MP4s, this added ~500ms of unnecessary overhead.

Now, the hook detects whether the source is an HLS/DASH manifest (`.m3u8`, `.mpd`, or contains `manifest`). If not, it sets `video.src` directly and skips the Shaka import entirely. The existing player UI (controls, fullscreen, PiP) still works since it's driven by native `<video>` events.

**Impact:** -500ms+ for MP4-only videos.

### 2. Fast-Start ABR Configuration

**Files:** `player-constants.ts`, `use-shaka-player.ts`

Initial Shaka buffer config was conservative: `bufferingGoal: 15` (buffer 15s before playback), `rebufferingGoal: 3`. This delayed first frame significantly.

New approach uses aggressive `FAST_START` values initially (`bufferingGoal: 2`, `rebufferingGoal: 0.5`), then expands to steady-state values after the first `canplay` event via `{ once: true }` listener.

**Impact:** -1-3s to first frame for HLS videos.

### 3. Lazy Preview Player Initialization

**Files:** `use-shaka-player.ts`, `shaka-player/index.tsx`

The preview player (seek-scrub thumbnails) previously initialized immediately alongside the main player — a second Shaka instance, second manifest fetch, second buffer allocation — all before the user touched the seek bar.

Now converted to an `ensurePreviewPlayer()` callback triggered on first seek bar hover (`onMouseMove` on the progress bar). Uses a ref guard to ensure single initialization.

**Impact:** -50-200ms initial load, eliminates second manifest fetch.

### 4. Tag-Based Related Videos

**Files:** `page.tsx`, `related-videos-sidebar.tsx`, `video.client.ts`, `video.queries.ts`, `query-keys.ts`

The sidebar previously used the generic `/public/videos/related` endpoint which returned unrelated content. Now:

- **Server-side:** `page.tsx` extracts tag IDs from the video and fetches tag-filtered videos via `videoClient.list({ tag_ids })` with `serverToken` support.
- **Client-side:** New `useVideosByTags()` hook with `initialData` from server for instant render + background revalidation.
- **Sidebar refactor:** Extracted `TagChips`, `RelatedVideoCard`, and helper functions (`getFilteredVideos`, `getVisibleTags`, `extractTagIds`) to keep cognitive complexity low.
- Added `usePrefetchVideo()` on hover for instant navigation to related videos.
- Added `sizes="168px"` to thumbnail images to prevent oversized image downloads.

**Impact:** Correct content, hover prefetch (-300-800ms navigation), -50-200KB bandwidth from sized images.

### 5. RSC Serialization Slimming

**File:** `page.tsx`

Full `playData.video` objects were serialized across the RSC boundary to every client component. Now:

- Comments section receives a lean object with only `uuid`, `id`, `comments_count`, `comments`, and `channel.user_id`.
- Sidebar videos have `description`, `comments`, and `captions` stripped before serialization.

**Impact:** -20-40% HTML payload size.

### 6. Dynamic CDN Preconnect

**File:** `page.tsx`

Layout previously preconnected to `video.bunnycdn.com` (upload domain), not the actual video CDN. Now extracts the origin from the video source URL and renders `<link rel="preconnect" href={cdnOrigin} />`.

**Impact:** -100-200ms DNS/TLS for video segments.

### 7. `serverExternalPackages` Configuration

**File:** `next.config.ts`

Added `shaka-player` to the top-level `serverExternalPackages` array. This prevents Next.js from attempting to bundle the client-only Shaka Player library during server-side compilation.

**Impact:** Faster builds, no accidental server-side import issues.

## Performance Summary

| Optimization | Estimated Impact |
|-------------|-----------------|
| MP4 native fast path | -500ms+ for MP4-only videos |
| Fast-start ABR | -1-3s to first frame (HLS) |
| Lazy preview player | -50-200ms initial load |
| Tag-based related + prefetch | -300-800ms navigation |
| RSC payload slimming | -20-40% HTML payload |
| Dynamic CDN preconnect | -100-200ms DNS/TLS |
| serverExternalPackages | Faster builds |

## Verification Checklist

1. `npm run build` — no build errors
2. `npx tsc --noEmit` — TypeScript passes
3. `npm run lint` — 0 errors
4. MP4-only video plays without Shaka chunk loading
5. HLS video plays with fast start (~2s initial buffer)
6. Related videos sidebar shows tag-matched content
7. Tag chip filtering works
8. Hover prefetch fires (check Network tab)
9. Seek bar preview thumbnails work (lazy init on hover)
10. `<link rel="preconnect">` shows actual CDN domain in HTML source
