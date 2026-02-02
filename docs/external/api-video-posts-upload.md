# Video & Posts Upload API Documentation

This document covers all video (long & shorts) and posts upload functionality, including API endpoints, parameters, frontend integration, and file processing flows.

---

## Table of Contents

1. [Video Upload](#1-video-upload)
   - [Bunny.net Video Upload Flow (Primary)](#11-bunnynet-video-upload-flow-primary-method)
   - [Chunked Upload Flow (Legacy)](#12-chunked-upload-flow-legacyalternative)
   - [Shorts vs Long Videos](#13-shorts-vs-long-videos)
2. [Posts Upload](#2-posts-upload)
   - [Post Creation](#21-post-creation)
   - [Post Comments](#22-post-comments)
3. [Frontend Integration](#3-frontend-integration)
   - [Video Upload Components](#31-video-upload-components)
   - [Post Upload Components](#32-post-upload-components)
4. [File Processing Pipeline](#4-file-processing-pipeline)
   - [Video Processing](#41-video-processing)
   - [Image Processing](#42-image-processing)
5. [Error Handling](#5-error-handling)
6. [Security Considerations](#6-security-considerations)

---

## 1. Video Upload

TabooTV supports two video upload methods:
1. **Bunny.net Stream** (Primary) - Modern TUS-based upload to Bunny CDN
2. **Chunked Upload** (Legacy) - Server-side chunk processing for fallback

### 1.1 Bunny.net Video Upload Flow (Primary Method)

This is the recommended upload method using Bunny.net's TUS protocol for reliable, resumable uploads.

#### Step 1: Upload Thumbnail to S3 (Optional)

**Endpoint:** `POST /api/videos/upload-thumbnail`
**Also available at:** `POST /videos/upload-thumbnail` (web)

**Authentication:** Required (`auth:sanctum` or `auth`)
**Middleware:** `EnsureSubscriptionMiddleware`

**Action Class:** `App\Actions\Video\UploadThumbnailToS3`

##### Request Parameters

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| `thumbnail` | file | Yes | `image\|max:2048` | Image file, max 2MB |
| `slug` | string | No | `string\|max:255` | Optional slug for filename generation |

##### Response

```json
{
  "data": {
    "path": "bunny-thumbnails/my-video-thumbnail-550e8400-e29b-41d4-a716-446655440000.webp",
    "url": "https://object.us-east-1.rumble.cloud/{zoneId}:{bucket}/bunny-thumbnails/...",
    "filename": "my-video-thumbnail-550e8400-e29b-41d4-a716-446655440000.webp",
    "disk": "s3_uploads"
  },
  "message": "Thumbnail uploaded successfully"
}
```

##### Processing Flow
1. Save original to temp directory: `storage/app/temp/bunny-thumbnails/`
2. Detect image type via `getimagesize()`
3. Convert to WebP format (quality: 90) using GD library
4. Generate filename: `{slug}-thumbnail-{uuid}.webp`
5. Upload to S3 (`s3_uploads` disk) at path `bunny-thumbnails/{filename}`
6. Generate public URL for Bunny to fetch
7. Clean up local temp files
8. Return both S3 path (for CloudFront) and Rumble URL (for Bunny)

**Supported Image Types:** JPEG, PNG, GIF, WebP

---

#### Step 2: Prepare Bunny Upload

**Endpoint:** `POST /api/videos/prepare-bunny-upload`
**Also available at:** `POST /videos/prepare-bunny-upload` (web)

**Authentication:** Required
**Middleware:** `EnsureSubscriptionMiddleware`, `EnsureProfileCompleteMiddleware`, `ActiveMiddleware`

**Action Class:** `App\Actions\Video\PrepareVideoBunnyUpload`

##### Request Parameters

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| `title` | string | **Yes** | `required\|string\|max:255` | Video title |
| `description` | string | No | `nullable\|string` | Video description |
| `duration` | integer | No | `nullable\|integer\|min:0` | Duration in seconds |
| `short` | boolean | No | `nullable\|boolean` | `true` for shorts (9:16), `false` for long videos (16:9) |
| `location` | string | No | `nullable\|string\|max:255` | Location name |
| `country_id` | integer | No | `nullable\|exists:countries,id` | Country ID from countries table |
| `latitude` | numeric | No | `nullable\|numeric` | Location latitude |
| `longitude` | numeric | No | `nullable\|numeric` | Location longitude |
| `is_adult_content` | boolean | No | `nullable\|boolean` | Sensitive content flag (defaults to false) |
| `tags` | array | No | `nullable\|array` | Array of tag IDs |
| `tags.*` | integer | No | `exists:tags,id` | Each tag must exist |
| `series_id` | integer | No | `nullable\|exists:series,id` | Associated series ID |
| `thumbnail_path` | string | No | `nullable\|string` | S3 path from Step 1 |
| `publish_mode` | string | No | `nullable\|in:none,auto,scheduled` | Publishing mode |
| `scheduled_at` | datetime | No | `nullable\|date\|after:now` | Required if `publish_mode=scheduled` |

##### Publish Modes
- **`none`**: Save as draft, publish later manually
- **`auto`**: Publish automatically when video processing completes
- **`scheduled`**: Publish at specified `scheduled_at` timestamp

> **Note:** For shorts (`short=true`), publish mode is ignored and defaults to `none`.

##### Response

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

##### Processing Flow
1. Get/create Bunny collection for the creator's channel
2. Create video in Bunny.net with title and thumbnail time (5000ms)
3. If `thumbnail_path` provided, set custom thumbnail via `BunnyStreamService::setThumbnailFromUrl()`
4. Create local database record with:
   - All metadata fields
   - `processing=true`, `progress=0`, `bunny_status=0` (Queued)
5. Sync tags relationship
6. Create publish schedule (if not a short and `publish_mode != 'none'`)
7. Generate TUS upload credentials (1-hour expiry)
8. Return upload configuration

---

#### Step 3: Upload Video via TUS

Use the TUS credentials from Step 2 to upload the video directly to Bunny.net.

**Client Library:** [tus-js-client](https://github.com/tus/tus-js-client)

```javascript
import * as tus from 'tus-js-client';

const upload = new tus.Upload(videoFile, {
    endpoint: upload_config.endpoint,
    retryDelays: [0, 3000, 5000, 10000, 20000],
    headers: {
        'AuthorizationSignature': upload_config.headers.AuthorizationSignature,
        'AuthorizationExpire': upload_config.headers.AuthorizationExpire,
        'LibraryId': upload_config.headers.LibraryId,
        'VideoId': upload_config.headers.VideoId,
        'filetype': videoFile.type,
    },
    metadata: {
        filename: videoFile.name,
        filetype: videoFile.type,
    },
    onError: (error) => {
        console.error('Upload failed:', error);
    },
    onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = (bytesUploaded / bytesTotal) * 100;
        console.log(`Progress: ${percentage.toFixed(2)}%`);
    },
    onSuccess: () => {
        console.log('Upload completed');
    },
});

// Resume from previous upload if available
upload.findPreviousUploads().then((previousUploads) => {
    if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
    }
    upload.start();
});
```

---

#### Step 4: Set Bunny Thumbnail (Optional, Post-Upload)

**Endpoint:** `POST /api/videos/set-bunny-thumbnail`
**Also available at:** `POST /videos/set-bunny-thumbnail` (web)

**Authentication:** Required
**Middleware:** `EnsureSubscriptionMiddleware`

**Action Class:** `App\Actions\Video\SetBunnyThumbnail`

##### Request Parameters

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| `video_uuid` | string | **Yes** | `required\|string` | UUID from Step 2 |
| `thumbnail_url` | URL | **Yes** | `required\|url` | Public URL of thumbnail (Rumble URL) |
| `s3_path` | string | No | `nullable\|string` | S3 path for CloudFront signed URLs |

##### Response

```json
{
  "data": {},
  "message": "Thumbnail set successfully"
}
```

##### Processing Flow
1. Verify URL is accessible (HEAD request, 10s timeout)
2. Check Content-Type starts with `image/`
3. Find video by UUID (bypasses global scopes)
4. Validate video is a Bunny video (`is_bunny_video=true`)
5. Call `BunnyStreamService::setThumbnailFromUrl()`
6. Save `s3_path` or `thumbnail_url` to database

##### Error Cases
- Video not found: 404
- Not a Bunny video: 500
- Thumbnail URL not accessible: 500
- Content-Type not an image: 500
- Bunny API failure: 500

---

### 1.2 Chunked Upload Flow (Legacy/Alternative)

The chunked upload system is used for direct server uploads. Files are split into 7MB chunks, uploaded in parallel, then merged server-side.

#### Step 1: Initialize Upload

**Endpoint:** `POST /temp_media/get-uuid`

**Controller:** `TempMediaController@getUuid`

**Authentication:** Required
**Middleware:** `EnsureSubscriptionMiddleware`

##### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `total_chunks` | integer | Yes | Total number of chunks to upload |
| `file_extension` | string | Yes | File extension (mp4, mov, etc.) |

##### Response

```json
{
  "data": {
    "media_uuid": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

#### Step 2: Upload Chunks

**Endpoint:** `POST /temp_media/upload`

**Controller:** `TempMediaController@upload`

##### Request Parameters (multipart/form-data)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `media_uuid` | string | Yes | UUID from Step 1 |
| `index` | integer | Yes | Chunk index (0-based) |
| `offset` | integer | Yes | Byte offset in file |
| `chunk` | file | Yes | Chunk data |

##### Response (During Upload)

```json
{
  "data": {
    "media_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "chucking_completed": false,
    "merging_started": false,
    "merge_status": null,
    "total_uploaded_chunks": 5,
    "chunk_count": 10,
    "progress": 50.0
  }
}
```

##### Response (All Chunks Uploaded)

```json
{
  "data": {
    "media_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "chucking_completed": true,
    "merging_started": true,
    "merge_status": "processing",
    "total_uploaded_chunks": 10,
    "chunk_count": 10,
    "progress": 100.0
  }
}
```

When all chunks are uploaded, `MergeVideoChunksJob` is dispatched to merge them.

---

#### Step 3: Check Merge Status

**Endpoint:** `GET /temp_media/{uuid}/status`

**Controller:** `TempMediaController@status`

##### Response

```json
{
  "data": {
    "media_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "merge_status": "completed",
    "merge_error": null,
    "is_completed": true,
    "is_failed": false,
    "is_processing": false
  }
}
```

**Merge Status Values:**
- `pending` - Not yet started
- `processing` - Merge in progress
- `completed` - Merge successful
- `failed` - Merge failed (check `merge_error`)

---

#### Step 4: Store Video

**Endpoint:** `POST /contents/videos/store`

**Controller:** `UploadContentController@store`

**Authentication:** Required
**Middleware:** Full middleware stack

##### Request Parameters

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| `video` | string | **Yes** | `required\|string\|exists:temp_media,uuid` | TempMedia UUID |
| `title` | string | **Yes** | `required` | Video title |
| `description` | string | **Yes** | `required` | Video description |
| `short` | boolean | **Yes** | `required\|bool` | Short video flag |
| `tags` | array | **Yes** | `required\|array\|min:2` | Minimum 2 tag IDs |
| `tags.*` | integer | - | `exists:tags,id` | Each tag must exist |
| `country` | string/int | **Yes** | `required` | Country ID or ISO code |
| `thumbnail` | file | No | `nullable\|mimetypes:image/*` | Thumbnail image |
| `location` | string | No | `nullable\|string\|max:255` | Location name |
| `duration` | integer | No | `nullable\|integer` | Auto-calculated if missing |
| `latitude` | numeric | No | `nullable\|numeric` | Location latitude |
| `longitude` | numeric | No | `nullable\|numeric` | Location longitude |
| `is_adult_content` | boolean | No | `nullable\|boolean` | Defaults to false |

##### Processing Flow
1. Authorization check: User must have a channel
2. Validate country (by ID or ISO code)
3. Get video file path from TempMedia
4. Calculate duration via ffprobe if not provided
5. Create Video record with `processing=true`
6. Sync tags
7. Store thumbnail if provided
8. Dispatch `ProcessVideoMediaJob`

##### Response

Inertia redirect to video show page with success message.

---

#### Step 5: Cancel Upload (Optional)

**Endpoint:** `DELETE /temp_media/{tempMedia:uuid}`

**Controller:** `TempMediaController@destroy`

Deletes TempMedia and all associated chunks.

---

### 1.3 Shorts vs Long Videos

| Aspect | Long Videos | Shorts |
|--------|-------------|--------|
| Aspect Ratio | 16:9 (horizontal) | 9:16 (vertical) |
| Min Resolution | 1280x720 | N/A |
| Recommended | 1920x1080 | 1080x1920 |
| `short` Parameter | `false` | `true` |
| Publish Scheduling | Supported | Not supported (always draft) |
| Listing Route | `/contents/videos` | `/contents/shorts` |
| Create Route | `/contents/videos/create` | `/contents/shorts/create` |

**Dimension Validation (Client-side):**
- Videos with unsupported codecs (HEVC/H.265) bypass validation
- Tolerance for aspect ratio: ±0.05

---

## 2. Posts Upload

### 2.1 Post Creation

**Endpoint:** `POST /api/posts/` or `POST /posts`

**Action Class:** `App\Actions\Community\PostStore`

**Authentication:** Required
**Middleware:** `EnsureSubscriptionMiddleware`

#### Request Parameters

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| `caption` | string | **Yes** | `required\|string` | Post text content |
| `post_image` | file[] | No | `nullable` (array), `image` (each) | Multiple images allowed |
| `post_audio` | file[] | No | `mimetypes:audio/mp4,audio/x-m4a,audio/aac\|max:10240` | Audio files, max 10MB each |
| `location` | string | No | `nullable\|string\|max:255` | Location name |
| `latitude` | numeric | No | `nullable\|numeric\|between:-90,90` | Latitude |
| `longitude` | numeric | No | `nullable\|numeric\|between:-180,180` | Longitude |

#### Authorization Check

User must have a channel (creator status). Returns 400 error if not.

#### Media Handling

**Images (`post_image`):**
- Converted to WebP format (quality: 90)
- Stored in S3 via Spatie Media Library
- Collection: `post-image` on `s3_uploads` disk

**Audio (`post_audio`):**
- Stored directly without conversion
- Supported formats: `audio/mp4`, `audio/x-m4a`, `audio/aac`
- Max size: 10MB per file
- Collection: `post-audio` on `s3_uploads` disk

#### Response

```json
{
  "status": true,
  "data": {
    "post": {
      "id": 123,
      "user_id": 456,
      "caption": "Post content here",
      "created_at": "2 hours ago",
      "location": "New York, NY",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "likes_count": 0,
      "dislikes_count": 0,
      "comments_count": 0,
      "has_liked": false,
      "recent_like": null,
      "has_disliked": false,
      "comments": [],
      "user": {
        "id": 456,
        "display_name": "Creator Name"
      },
      "post_image": ["https://cloudfront-signed-url..."],
      "post_audio": false
    }
  },
  "message": "Post created successfully"
}
```

#### Background Jobs

1. **Firebase Topic Notification** (2-minute delay):
   - Topic: `all_users`
   - Title: "New Community Updates"
   - Body: "{creator_name} has posted to their community feed."

2. **Database Notifications** (`NewPostUploadedJob`, 2-minute delay):
   - Sends to all users in chunks
   - Persists notification in database

---

### 2.2 Post Comments

#### Add Comment

**Endpoint:** `POST /api/post-comments/posts/{post}`

**Action Class:** `App\Actions\Community\StorePostComment`

##### Request Parameters

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| `content` | string | **Yes** | `required\|string\|max:1500\|min:1` | Comment text |
| `parent_id` | integer | No | `nullable` | Parent comment ID (for replies) |

##### Response

```json
{
  "status": true,
  "data": {
    "postComment": {
      "id": 789,
      "uuid": "comment-uuid",
      "replies": [],
      "user": {
        "id": 456,
        "display_name": "User Name"
      },
      "parent_id": null,
      "user_id": 456,
      "post_id": 123,
      "content": "Great post!",
      "replies_count": 0,
      "likes_count": 0,
      "dislikes_count": 0,
      "is_creator": false,
      "has_liked": false,
      "has_disliked": false,
      "created_at": "Just now"
    }
  },
  "message": "added comment on post successfully"
}
```

##### Notifications

When replying to a comment (`parent_id` provided), sends `PostCommentReplyNotification` to the parent comment author.

---

#### List Comments

**Endpoint:** `GET /api/post-comments/posts/{post}`

**Action Class:** `App\Actions\Community\PostCommentList`

##### Response

Returns cursor-paginated comments (10,000 per page) with nested replies.

```json
{
  "status": true,
  "data": {
    "postComment": [
      {
        "id": 789,
        "uuid": "comment-uuid",
        "replies": [...],
        "user": {...},
        "parent_id": null,
        "content": "Comment text",
        "replies_count": 5,
        "likes_count": 10,
        "dislikes_count": 0,
        "is_creator": true,
        "has_liked": false,
        "has_disliked": false,
        "created_at": "1 hour ago"
      }
    ]
  },
  "message": "Comments retrieved"
}
```

---

## 3. Frontend Integration

### 3.1 Video Upload Components

#### Main Upload Page

**File:** `resources/js/Pages/content/create.vue`

**Props:**
- `countries: Array` - Available countries for selection
- `tags: Array` - Available tags for selection
- `short: Boolean` - Whether creating a short video

**Key Features:**
- Uses `tus-js-client` for TUS uploads to Bunny.net
- Thumbnail cropping via `vue-cropperjs` (16:9 for videos, 9:16 for shorts)
- Google Maps integration for location selection
- Client-side video dimension validation
- Resumable uploads with progress tracking
- Fun loading messages during upload

**Upload Flow:**
1. User selects video file
2. Client validates dimensions (16:9 or 9:16)
3. User fills metadata form
4. On submit:
   - Upload thumbnail to S3 (if provided)
   - Call `prepare-bunny-upload` endpoint
   - Use TUS to upload video to Bunny.net
   - Redirect to videos list on success

---

#### Chunked File Input (Legacy)

**File:** `resources/js/Components/Inputs/ChunkableFileInput.vue`

**Emits:**
- `clear` - Video cleared
- `uploaded` - Upload complete (with UUID)
- `startUploading` - Upload started
- `fileSelected` - File selected (for validation)
- `inputReset` - Input reset
- `durationCalculated` - Video duration extracted
- `progress` - Upload progress percentage
- `mergeStatus` - Merge status updates

**Configuration:**
- Chunk size: 7MB
- Parallel uploads: 5 concurrent chunks
- Retry logic: 3 attempts with exponential backoff (2s, 4s, 6s)
- Timeout per chunk: 2 minutes

**Status Values:**
- `idle` - Initial state
- `pending` - Uploading chunks
- `merging` - Server merging chunks
- `completed` - Upload successful
- `invalid` - Invalid video dimensions
- `merge_failed` - Server merge failed
- `upload_failed` - Chunk upload failed

---

### 3.2 Post Upload Components

#### Community Post Creation

**File:** `resources/js/Pages/Community/Partials/CreatePost.vue`

**Props:**
- `posts: Array` - Existing posts array (for prepending new post)

**Features:**
- Text area for caption
- Single image upload with preview
- Accepts: `.jpg`, `.jpeg`, `.png`, `.gif`
- Success toast notification
- Prepends new post to feed immediately

**Form Data:**
```javascript
const formData = new FormData();
formData.append("caption", postText.value);
if (postImage.value) {
    formData.append("post_image", postImage.value);
}
```

---

## 4. File Processing Pipeline

### 4.1 Video Processing

#### Bunny.net Flow

Videos uploaded to Bunny.net are processed automatically by Bunny's encoding pipeline:

1. **Upload Complete** - Video received by Bunny
2. **Bunny Status 0** - Queued for processing
3. **Bunny Status 1** - Processing started
4. **Bunny Status 2** - Encoding in progress
5. **Bunny Status 3** - Processing complete

The database stores:
- `bunny_video_id` - Bunny's video identifier
- `bunny_library_id` - Bunny library ID
- `bunny_status` - Current processing status
- `is_bunny_video` - Flag indicating Bunny video

---

#### Legacy Flow (Chunked Upload)

**Job:** `MergeVideoChunksJob`
- Merges uploaded chunks into single file
- Updates `merge_status` in TempMedia

**Job:** `ProcessVideoMediaJob`
- Processes thumbnail
- Sets up media library
- Prepares for streaming

**Job:** `ConvertVideoResolution`
- Converts to multiple resolutions: 480p, 720p, 1080p, 1440p
- Uses external service (`VIDEO_CONVERTER_API_URL`)

---

### 4.2 Image Processing

**Thumbnail Processing:**
- Converted to WebP format
- Quality: 90%
- Sizes: `card`, `featured`
- Storage: S3 with CloudFront delivery

**Post Image Processing:**
- Converted to WebP format
- Quality: 90%
- Uses PHP's `imagewebp()` function
- Original filename preserved

---

## 5. Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (e.g., not a creator) |
| 404 | Resource not found |
| 422 | Validation error |
| 500 | Server error |

### Error Response Format

```json
{
  "message": "Error description",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

### Common Errors

**Video Upload:**
- "Invalid video dimensions" - Wrong aspect ratio
- "Video not found" - UUID doesn't exist
- "Not a Bunny video" - Trying to set thumbnail on non-Bunny video
- "Thumbnail URL not accessible" - Cannot fetch thumbnail from URL

**Post Upload:**
- "You are not creator" - User doesn't have a channel
- "Post cannot be empty" - Missing caption

---

## 6. Security Considerations

### Authentication

All upload endpoints require authentication via:
- `auth:sanctum` (API routes)
- `auth` session (Web routes)

### Authorization

- **Videos:** User must have a channel and active subscription
- **Posts:** User must be a creator (have a channel)
- **Middleware Stack:** `EnsureSubscriptionMiddleware`, `EnsureProfileCompleteMiddleware`, `ActiveMiddleware`

### File Validation

**Videos:**
- Client-side dimension validation
- Server-side codec detection via ffprobe
- File type checking

**Images:**
- Max size: 2MB (thumbnails)
- Type validation via `getimagesize()`
- Converted to WebP (removes potential malicious content)

**Audio:**
- Max size: 10MB
- Allowed MIME types: `audio/mp4`, `audio/x-m4a`, `audio/aac`

### Signed URLs

All media is served via CloudFront signed URLs with expiration:
- Thumbnails: 1 hour for Bunny fetch
- Media playback: 1 day expiry

---

## Quick Reference

### Video Upload Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/videos/upload-thumbnail` | POST | Upload thumbnail to S3 |
| `/api/videos/prepare-bunny-upload` | POST | Prepare video and get TUS credentials |
| `/api/videos/set-bunny-thumbnail` | POST | Set thumbnail on Bunny video |
| `/temp_media/get-uuid` | POST | Initialize chunked upload |
| `/temp_media/upload` | POST | Upload chunk |
| `/temp_media/{uuid}/status` | GET | Check merge status |
| `/temp_media/{uuid}` | DELETE | Cancel upload |
| `/contents/videos/store` | POST | Finalize video from temp media |

### Post Upload Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/posts/` | POST | Create post with media |
| `/api/post-comments/posts/{post}` | POST | Add comment to post |
| `/api/post-comments/posts/{post}` | GET | List post comments |

---

## Related Documentation

- [Routes and API](./04-routes-and-api.md)
- [Media and Video Processing](./07-media-and-video-processing.md)
- [Frontend Architecture](./08-frontend-architecture.md)
- [Security Audit Report](./10-SECURITY-AUDIT-REPORT.md)
