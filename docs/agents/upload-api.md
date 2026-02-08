# Upload API Reference

> **When to use:** Implementing video/short uploads, working with Bunny.net TUS protocol, handling thumbnails.

---

## Overview

TabooTV uses **Bunny.net Stream** for video uploads via the TUS (Tus Resumable Upload) protocol. This enables reliable, resumable uploads directly to Bunny CDN.

---

## Upload Flow

```
1. [Optional] Upload thumbnail to S3
2. Prepare upload (get TUS credentials)
3. Upload video via TUS
4. [Optional] Set custom thumbnail
```

---

## API Endpoints

### 1. Upload Thumbnail (Optional)

**Endpoint:** `POST /api/videos/upload-thumbnail`

Uploads a thumbnail image to S3 for later use with Bunny.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `thumbnail` | file | Yes | Image file, max 2MB |
| `slug` | string | No | Optional slug for filename |

**Response:**
```json
{
  "data": {
    "path": "bunny-thumbnails/my-video-thumbnail-{uuid}.webp",
    "url": "https://object.us-east-1.rumble.cloud/...",
    "filename": "my-video-thumbnail-{uuid}.webp",
    "disk": "s3_uploads"
  },
  "message": "Thumbnail uploaded successfully"
}
```

---

### 2. Prepare Bunny Upload

**Endpoint:** `POST /api/videos/prepare-bunny-upload`

Prepares the video record and returns TUS upload credentials.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | **Yes** | Video title (max 255) |
| `description` | string | No | Video description |
| `duration` | integer | No | Duration in seconds |
| `short` | boolean | No | `true` for shorts (9:16), `false` for videos (16:9) |
| `location` | string | No | Location name (max 255) |
| `country_id` | integer | No | Country ID from countries table |
| `latitude` | numeric | No | Location latitude |
| `longitude` | numeric | No | Location longitude |
| `is_adult_content` | boolean | No | Sensitive content flag (default: false) |
| `tags` | array | No | Array of tag IDs |
| `thumbnail_path` | string | No | S3 path from thumbnail upload |
| `publish_mode` | string | No | `none` (draft), `auto`, or `scheduled` |
| `scheduled_at` | datetime | No | Required if `publish_mode=scheduled` |

**Response:**
```json
{
  "data": {
    "video_id": 123,
    "video_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "bunny_video_id": "abc123def456",
    "upload_config": {
      "endpoint": "https://video.bunnycdn.com/tusupload",
      "headers": {
        "AuthorizationSignature": "signature_value",
        "AuthorizationExpire": 3600,
        "LibraryId": "12345",
        "VideoId": "abc123def456"
      }
    }
  },
  "message": "Upload prepared successfully"
}
```

---

### 3. TUS Upload (Client-Side)

Use `tus-js-client` to upload directly to Bunny.net:

```typescript
import * as tus from 'tus-js-client';

const upload = new tus.Upload(videoFile, {
  endpoint: uploadConfig.endpoint,
  retryDelays: [0, 3000, 5000, 10000, 20000],
  headers: {
    'AuthorizationSignature': uploadConfig.headers.AuthorizationSignature,
    'AuthorizationExpire': String(uploadConfig.headers.AuthorizationExpire),
    'LibraryId': uploadConfig.headers.LibraryId,
    'VideoId': uploadConfig.headers.VideoId,
    'filetype': videoFile.type,
  },
  metadata: {
    filename: videoFile.name,
    filetype: videoFile.type,
  },
  onProgress: (bytesUploaded, bytesTotal) => {
    const percentage = (bytesUploaded / bytesTotal) * 100;
    setProgress(percentage);
  },
  onSuccess: () => {
    // Upload complete, redirect to studio
  },
  onError: (error) => {
    console.error('Upload failed:', error);
  },
});

// Check for previous uploads to resume
upload.findPreviousUploads().then((previousUploads) => {
  if (previousUploads.length) {
    upload.resumeFromPreviousUpload(previousUploads[0]);
  }
  upload.start();
});
```

---

### 4. Set Bunny Thumbnail (Optional)

**Endpoint:** `POST /api/videos/set-bunny-thumbnail`

Sets a custom thumbnail on a Bunny video after upload.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `video_uuid` | string | **Yes** | UUID from prepare step |
| `thumbnail_url` | URL | **Yes** | Public URL of thumbnail |
| `s3_path` | string | No | S3 path for CloudFront URLs |

---

## Publish Modes

| Mode | Behavior |
|------|----------|
| `none` | Save as draft, publish later manually |
| `auto` | Publish automatically when processing completes |
| `scheduled` | Publish at specified `scheduled_at` timestamp |

> **Note:** For shorts (`short=true`), publish mode is ignored and defaults to `none`.

---

## Video vs Shorts

| Aspect | Videos | Shorts |
|--------|--------|--------|
| Aspect Ratio | 16:9 (horizontal) | 9:16 (vertical) |
| Max File Size | 2GB | 500MB |
| Description Limit | 5000 chars | 500 chars |
| Tags Required | Minimum 2 | Optional |
| Publish Scheduling | Supported | Not supported |

---

## Error Handling

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (e.g., not a creator) |
| 404 | Resource not found |
| 422 | Validation error |
| 500 | Server error |

Common errors:
- "Invalid video dimensions" - Wrong aspect ratio
- "Video not found" - UUID doesn't exist
- "Not a Bunny video" - Trying to set thumbnail on non-Bunny video
- "Thumbnail URL not accessible" - Cannot fetch thumbnail from URL

---

## Related Files

- `src/app/studio/upload/_hooks/use-upload-progress.ts` - TUS progress hook
- `src/app/studio/upload/_actions.ts` - Server actions
- `src/api/client/studio.client.ts` - API client methods

---

## Studio Video Management API

The Studio API provides unified endpoints for managing videos using **UUID identifiers** (not numeric IDs).

**Authentication:** Required (Sanctum token)

**Authorization:** All endpoints verify `video.user_id === auth.user.id` before any action.

**Global scope bypass:** All Studio endpoints use `Video::withoutGlobalScope('allowed')` to access unpublished (`published_at IS NULL`) and hidden (`hidden = true`) videos.

### List Videos

**Endpoint:** `GET /api/studio/videos`

Lists all videos belonging to the authenticated creator, including unpublished and hidden.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `per_page` | integer | 20 | Items per page (max: 100) |
| `sort_by` | string | `latest` | Sort order: `latest`, `oldest` |
| `ids` | string/array | - | Filter by video IDs (CSV) |
| `countries` | string/array | - | Filter by country names |
| `countries_ids` | string/array | - | Filter by country IDs |
| `series_ids` | string/array | - | Filter by series IDs |
| `types` | string | `videos,series` | Content types: `videos`, `series`, `courses`, `shorts` |

---

### Update Video (Unified Endpoint)

**Endpoint:** `PATCH /api/studio/videos/{videoUuid}`

Updates video metadata and/or publication status in a **single request**.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | No | Video title (max 255) |
| `description` | string | No | Video description |
| `tags` | string[] | No | Array of **tag slugs** (not IDs) |
| `country_id` | number | No | Country ID |
| `series_id` | number | No | Series ID (must exist) |
| `location` | string | No | Location text |
| `latitude` | number | No | Latitude (-90 to 90) |
| `longitude` | number | No | Longitude (-180 to 180) |
| `is_adult_content` | boolean | No | Adult content flag |
| `featured` | boolean | No | Featured flag |
| `hidden` | boolean | No | Hidden from public listings |
| `published_at` | datetime | No | Publication date (ISO 8601) |
| `thumbnail` | file | No | Thumbnail image (max 10MB, converted to WebP) |

**Note:** Uses `videoUuid` (string), not numeric `videoId`. Tags accept **slugs** (not IDs).

**Response:**
```json
{
  "success": true,
  "data": {
    "video": {
      "id": 123,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Updated Title",
      ...
    }
  },
  "message": "Video updated successfully."
}
```

---

### Toggle Hidden Status

**Endpoint:** `PATCH /api/studio/videos/{videoUuid}/toggle-hidden`

Toggles video visibility in public listings. Hidden videos remain accessible in Studio but are excluded from public endpoints (`GET /api/videos`, `GET /api/featured-videos`, etc.) via the `allowed` global scope.

**Response:**
```json
{
  "success": true,
  "data": {
    "hidden": true,
    "message": "Video hidden successfully."
  }
}
```

---

### Publish Schedule

Manage when unpublished videos go live.

**Create:** `POST /api/studio/videos/{videoUuid}/schedule`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `publish_mode` | string | Yes | `auto` or `scheduled` |
| `scheduled_at` | datetime | If `scheduled` | Must be in the future (ISO 8601) |
| `notify` | boolean | No | Notify users after publishing (default: true) |

Returns 409 if a schedule already exists for this video.

**Update:** `PATCH /api/studio/videos/{videoUuid}/schedule`

Same fields as create, all optional. Switching to `auto` mode clears `scheduled_at`.

**Delete:** `DELETE /api/studio/videos/{videoUuid}/schedule`

| Mode | Description |
|------|-------------|
| `auto` | Published automatically when processing completes |
| `scheduled` | Published at `scheduled_at` datetime |

---

### Delete Video

**Endpoint:** `DELETE /api/studio/videos/{videoUuid}`

Permanently deletes video and associated resources (Bunny.net video, media library, DB record).

**Response:**
```json
{
  "success": true,
  "data": [],
  "message": "Video deleted successfully."
}
```

---

### Error Responses

| Code | Description |
|------|-------------|
| 403 | User does not own the video |
| 404 | Video UUID not found |
| 409 | Schedule already exists (create only) |
| 422 | Validation error |

---

## Bunny Processing Status

Videos uploaded to Bunny.net are processed automatically. The backend tracks status via webhooks.

### Status Codes

| Status | Code | Description | Playable? |
|--------|------|-------------|-----------|
| Queued | 0 | Waiting for processing | No |
| Processing | 1 | Analyzing video | No |
| Encoding | 2 | Encoding in progress | No |
| **Finished** | **3** | All resolutions complete | **Yes** |
| **Resolution Finished** | **4** | At least one resolution ready | **Yes** |
| Failed | 5 | Processing failed | No |
| PresignedUploadStarted | 6 | TUS upload started | No |
| PresignedUploadFinished | 7 | TUS upload completed | No |
| PresignedUploadFailed | 8 | TUS upload failed | No |
| CaptionsGenerated | 9 | AI captions generated | Yes |

### Video Lifecycle

```
DRAFT → UPLOADING → PROCESSING → PLAYABLE (4) → READY (3) → PUBLISHED
```

- **Status 4 (Resolution Finished):** At least one resolution complete, video can start playing
- **Status 3 (Finished):** All resolutions encoded, S3 backup dispatched

### Database Fields

```typescript
interface VideoProcessingFields {
  bunny_status: number;              // 0-10 status code
  bunny_encode_progress: number;     // 0-100 percentage
  bunny_available_resolutions: string; // "360p,720p,1080p"
  bunny_hls_url: string;             // HLS playlist URL
  processing: boolean;               // true while processing
}
```

---

## Posts Upload

### Create Post

**Endpoint:** `POST /api/posts/`

Creates a community post with optional media.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `caption` | string | **Yes** | Post text content |
| `post_image` | file[] | No | Multiple images allowed |
| `post_audio` | file[] | No | Audio files (max 10MB, m4a/aac) |
| `location` | string | No | Location name |
| `latitude` | numeric | No | Location latitude |
| `longitude` | numeric | No | Location longitude |

**Authorization:** User must have a channel (creator status).

**Media Handling:**
- **Images:** Converted to WebP (quality: 90), stored in S3
- **Audio:** Stored directly, formats: `audio/mp4`, `audio/x-m4a`, `audio/aac`

**Response:**
```json
{
  "status": true,
  "data": {
    "post": {
      "id": 123,
      "caption": "Post content",
      "likes_count": 0,
      "comments_count": 0,
      "post_image": ["https://cloudfront-signed-url..."],
      "post_audio": false
    }
  },
  "message": "Post created successfully"
}
```

---

## Chunked Upload (Legacy)

The legacy chunked upload system is available as fallback. Files are split into 7MB chunks.

### Flow

1. **Initialize:** `POST /temp_media/get-uuid` → Returns `media_uuid`
2. **Upload Chunks:** `POST /temp_media/upload` with `media_uuid`, `index`, `chunk`
3. **Check Status:** `GET /temp_media/{uuid}/status` → `merge_status`: pending|processing|completed|failed
4. **Store Video:** `POST /contents/videos/store` with `video: media_uuid`
5. **Cancel:** `DELETE /temp_media/{uuid}` (optional)

### Chunk Configuration
- Chunk size: 7MB
- Parallel uploads: 5 concurrent
- Retry: 3 attempts with exponential backoff
