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
