# MP4 Quality Corruption — Backend Report

**Date:** 2026-02-15
**From:** Frontend Team
**To:** Backend / Encoding Team
**Priority:** High

---

## Summary

Some MP4 video files have **truncated lower-quality encodes** (1080p, 720p, 480p) while the highest quality (1440p) is unaffected. This causes seeking failures in the browser because the browser's MP4 parser hits a corrupted chunk offset table (`stco` atom), resulting in broken playback when users try to scrub through the video.

The frontend has implemented a **workaround** that detects this corruption and disables seeking for affected videos. However, the **root fix must happen on the backend** by re-encoding the corrupted quality variants.

---

## Technical Details

### What's happening

The MP4 container format uses a `stco` (Sample Table Chunk Offset) atom to index byte positions of video chunks within the file. The `stco` atom uses **32-bit unsigned integers**, which means it can only address up to **4 GB** (2^32 bytes = 4,294,967,296 bytes).

When a video file exceeds 4 GB, the `stco` atom overflows. The correct fix during encoding is to use `co64` (64-bit chunk offsets) instead. Some of our lower-quality encodes appear to have been generated with a `stco` atom despite exceeding or approaching the 4 GB boundary, resulting in a truncated duration reported by the browser.

### Observed behavior

For a video with an API-reported duration of **5940 seconds (1h39min)**:

| Quality | Reported duration | Status |
|---------|-------------------|--------|
| 1440p   | 5940s (correct)   | OK |
| 1080p   | ~948s (truncated) | Corrupted |
| 720p    | ~948s (truncated) | Corrupted |
| 480p    | ~948s (truncated) | Corrupted |

The lower qualities report approximately **16% of the actual duration**, indicating the `stco` overflow happened at the same byte boundary across all lower encodes.

### How to detect affected files

A corrupted file can be identified by comparing the metadata duration to the expected duration:

```bash
# Check MP4 duration using ffprobe
ffprobe -v quiet -show_entries format=duration -of csv=p=0 video_file.mp4

# Check if stco or co64 is used
ffprobe -v quiet -show_entries stream=codec_type -of json video_file.mp4
mp4dump video_file.mp4 | grep -E "stco|co64"
```

If a file uses `stco` and the file size is > 3.5 GB, it is likely affected.

### Detection threshold

We use a **90% threshold**: if a quality variant's duration is less than 90% of the API-reported duration (from the `videos` table), it is flagged as corrupted.

---

## Frontend Workaround (current state)

Since the backend fix will take time, the frontend now handles this gracefully:

1. **Proactive detection at page load**: When a video page mounts, the frontend creates a hidden `<video>` element, loads only the metadata (a few KB) of the first lower-quality URL, and compares its duration against the API-provided `videoDuration` field.

2. **If corruption is detected**: Seeking is disabled immediately — the progress bar is grayed out, keyboard shortcuts (arrow keys), double-tap seeking, and scrubbing are all blocked. The user can still play the full video from the start using the highest quality (1440p).

3. **Cascade fallback (runtime)**: If proactive detection misses it (e.g., no `videoDuration` from API), runtime detection catches seek failures when they happen and tries progressively lower qualities. If all qualities fail, seeking is disabled.

4. **Navigation between videos**: All state resets when the user navigates to a different video, so unaffected videos work normally.

### Limitation

Users **cannot seek** in corrupted videos. They can only watch from the beginning. This is a significant UX degradation that the backend fix would resolve.

---

## Requested Backend Actions

### 1. Identify affected videos (high priority)

Run a scan across all encoded MP4 files to find those with `stco` atoms and file sizes > 3.5 GB. Cross-reference with the expected duration from the database.

```sql
-- Example query to find candidates
-- (adjust based on your actual schema)
SELECT v.id, v.title, v.duration,
       v.url_1440, v.url_1080, v.url_720, v.url_480
FROM videos v
WHERE v.duration > 3600  -- videos longer than 1 hour are most likely affected
  AND v.url_1080 IS NOT NULL;
```

### 2. Re-encode corrupted quality variants

Re-encode the affected lower-quality files ensuring the encoder uses `co64` (64-bit chunk offsets). With FFmpeg, this is typically automatic for files > 4 GB, but can be forced:

```bash
# FFmpeg uses co64 automatically for large files, but ensure:
ffmpeg -i input.mp4 -movflags +faststart -c copy output.mp4

# Or explicitly with mp4box:
mp4box -add input.mp4 -new output.mp4
```

The key is ensuring the muxer detects the file will exceed 4 GB and switches to `co64`.

### 3. Ensure the `videoDuration` field is populated in the API

The frontend's proactive detection relies on the `videoDuration` prop, which comes from the API. Make sure:

- The `duration` field in the videos table/API response is accurate and always populated
- Duration is measured from the **source file** (or the highest quality encode), not from a potentially corrupted lower quality

### 4. Prevent future occurrences

Update the encoding pipeline to:
- Always use `co64` for output files (or let FFmpeg auto-detect)
- Add a post-encode validation step that compares each quality variant's duration against the source
- Flag any variant where `abs(variant_duration - source_duration) / source_duration > 0.1`

---

## API Field Dependency

The frontend uses the following field from the video API response for proactive detection:

| Field | Type | Description |
|-------|------|-------------|
| `duration` | `number` (seconds) | Total video duration from the source/highest quality encode |

If this field is `null`, `0`, or missing, the proactive detection is skipped and the frontend falls back to runtime detection only (worse UX — user has to attempt a seek before corruption is caught).

---

## Questions for Backend Team

1. **How many videos are affected?** Can you run the scan described above and share results?
2. **Encoding pipeline**: Which encoder/muxer is used? Is there a configuration flag we can flip for `co64`?
3. **Re-encode timeline**: Can affected files be re-encoded in batch? What's the estimated timeline?
4. **HLS availability**: For long-form content (> 1 hour), would it be feasible to prioritize HLS delivery? HLS uses segmented transport and is immune to this issue entirely.

---

## References

- [MP4 `stco` vs `co64` specification](https://developer.apple.com/documentation/quicktime-file-format/chunk_offset_atom)
- [FFmpeg large file handling](https://trac.ffmpeg.org/wiki/Encode/H.264)
- Frontend implementation: `src/features/video/components/video-player.tsx`
