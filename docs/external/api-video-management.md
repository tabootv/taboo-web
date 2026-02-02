# Video Management System Documentation

This document explains the complete video management system including upload, listing, editing, deletion, and Bunny.net processing status.

## Table of Contents

1. [Overview](#overview)
2. [Video Upload Flow](#video-upload-flow)
3. [Video Listing Endpoints](#video-listing-endpoints)
4. [Video Editing](#video-editing)
5. [Video Deletion](#video-deletion)
6. [Bunny Processing Status](#bunny-processing-status)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [Frontend Components](#frontend-components)

---

## Overview

TabooTV uses **Bunny.net** as the primary video CDN and processing service. When a creator uploads a video, it is:

1. Created as a **draft** (unpublished)
2. Uploaded directly to Bunny.net via TUS protocol
3. Processed and encoded into multiple resolutions
4. Available for manual publishing once processing completes

**Key Files:**
| Purpose | File Path |
|---------|-----------|
| Upload Action | `app/Actions/Video/PrepareVideoBunnyUpload.php` |
| Controller (CRUD) | `app/Http/Controllers/UploadContentController.php` |
| Video Model | `app/Models/Video.php` |
| Bunny Service | `app/Services/BunnyStreamService.php` |
| Bunny Webhook | `app/Actions/Bunny/HandleBunnyWebhook.php` |
| Video Resource | `app/Http/Resources/VideoResource.php` |

---

## Video Upload Flow

### Step 1: Upload Thumbnail (Optional)

```
POST /api/videos/upload-thumbnail
```

**Request:**
```
Content-Type: multipart/form-data
- thumbnail: file (image/jpeg, image/png, image/gif, image/webp)
```

**Response:**
```json
{
  "success": true,
  "s3_path": "bunny-thumbnails/video-title-thumbnail-uuid.webp",
  "thumbnail_url": "https://rumble.tabootv.com/bunny-thumbnails/video-title-thumbnail-uuid.webp"
}
```

**What happens:**
1. Image is saved to temp directory
2. Converted to WebP format (quality: 90)
3. Uploaded to S3 (`s3_uploads` disk)
4. Returns both S3 path (for CloudFront) and Rumble URL (for Bunny to fetch)

---

### Step 2: Prepare Bunny Upload

```
POST /api/videos/prepare-bunny-upload
```

**Request:**
```json
{
  "title": "My Video Title",
  "description": "Video description",
  "duration": 300,
  "country_id": 1,
  "tags": [1, 2, 3],
  "thumbnail_path": "bunny-thumbnails/video-title-thumbnail-uuid.webp",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "is_adult_content": false,
  "short": false,
  "publish_mode": "none",
  "scheduled_at": null
}
```

**Response:**
```json
{
  "success": true,
  "video_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "upload_config": {
    "upload_url": "https://video.bunnycdn.com/tusupload",
    "signature": "abc123...",
    "expiry": 1704067200,
    "library_id": "12345",
    "video_id": "bunny-guid-here"
  }
}
```

**What happens:**
1. Creates/gets Bunny collection for creator's channel
2. Creates video object in Bunny.net
3. Sets custom thumbnail if provided
4. **Creates draft Video record in database** with:
   - `published_at = null` (draft)
   - `processing = true`
   - `bunny_status = 0` (Queued)
   - `is_bunny_video = true`
5. Generates TUS upload credentials (1-hour expiry)

---

### Step 3: Upload Video via TUS

The frontend uses `tus-js-client` to upload directly to Bunny.net:

```javascript
const upload = new tus.Upload(file, {
  endpoint: uploadConfig.upload_url,
  headers: {
    'AuthorizationSignature': uploadConfig.signature,
    'AuthorizationExpire': uploadConfig.expiry,
    'VideoId': uploadConfig.video_id,
    'LibraryId': uploadConfig.library_id
  },
  chunkSize: 5 * 1024 * 1024, // 5MB chunks
  onProgress: (bytesUploaded, bytesTotal) => {
    // Update progress UI
  },
  onSuccess: () => {
    // Upload complete, Bunny will start processing
  }
});
upload.start();
```

---

### Step 4: Set Thumbnail (Optional, Post-Upload)

```
POST /api/videos/set-bunny-thumbnail
```

**Request:**
```json
{
  "video_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "thumbnail_url": "https://rumble.tabootv.com/bunny-thumbnails/video-title-thumbnail-uuid.webp"
}
```

---

### Step 5: Bunny Processing (Automatic)

Bunny.net processes the video automatically. Your server receives webhook callbacks at:

```
POST /webhook/bunny/stream
```

The webhook updates the video status as processing progresses (see [Bunny Processing Status](#bunny-processing-status)).

---

### Step 6: Video Appears in /contents/videos

Once the video is created (Step 2), it immediately appears in the creator's video list at `/contents/videos` as a **draft** with **processing** status.

---

## Video Listing Endpoints

### Creator's Own Videos (Web)

```
GET /contents/videos
```

**Controller:** `UploadContentController@videos()`

**What it shows:**
- All videos owned by the authenticated user
- Includes drafts, processing, and published videos
- Only long-form videos (`short = false`)
- Ordered by newest first
- Paginated (50 per page)

**Response:** Inertia page with `VideoResource` collection

**Key Query:**
```php
Video::where('user_id', auth()->id())
    ->where('short', false)
    ->withoutGlobalScope('allowed')  // Shows unpublished videos
    ->with('publishSchedule')
    ->orderByDesc('id')
    ->paginate(50);
```

---

### Creator's Shorts (Web)

```
GET /contents/shorts
```

Same as above but with `short = true`.

---

### Public Video List (API)

```
GET /api/videos/list
```

**Action:** `VideoList`

**Query Parameters:**
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 8)
- `search` - Search by title or country
- `sort` - newest, trending, old, featured
- `category_ids` - Filter by category IDs
- `country_id` - Filter by country
- `channel_id` - Filter by channel
- `tag_ids` - Filter by tags

**Returns:** Only **published** videos with global scope applied.

---

## Video Editing

### Edit Page

```
GET /contents/videos/{video}/edit
```

**Controller:** `UploadContentController@videoEdit()`

Loads the edit form with current video data.

---

### Update Video

```
PUT /contents/video/{video}/edit
```

**Controller:** `UploadContentController@update()`

**Request:**
```
Content-Type: multipart/form-data

Required:
- title: string
- description: string
- country: integer (country_id)
- published: boolean

Optional:
- thumbnail: file (image)
- video: string (TempMedia UUID for video replacement)
- duration: integer
- latitude: numeric
- longitude: numeric
- tags: array of tag IDs
- is_adult_content: boolean
- publish_mode: "none" | "auto" | "scheduled"
- scheduled_at: datetime (required if publish_mode=scheduled)
```

**What happens:**

1. **Authorization check:** Verifies video belongs to authenticated user
2. **Validation:** Validates all input fields
3. **Published status:**
   - If `published=true` and video wasn't published: Sets `published_at = now()`
   - If `published=true` and video was published: Keeps original timestamp
   - If `published=false`: Sets `published_at = null`
4. **Video replacement (optional):**
   - If new video UUID provided, retrieves from TempMedia
   - Calculates duration via ffprobe
   - Sets `processing = true`
5. **Updates video record** with new data
6. **Syncs tags** relationship
7. **Handles publish schedule:**
   - `none`: Deletes existing schedule
   - `auto`: Creates auto-publish schedule
   - `scheduled`: Creates schedule with `scheduled_at` date
8. **Dispatches ProcessVideoMediaJob** if media changed
9. **Redirects** to video show page with success message

---

## Video Deletion

### Delete Video

```
DELETE /contents/video/{video}/delete
```

**Controller:** `UploadContentController@destroy()`

**What happens:**

1. Finds video without global scopes (allows deleting drafts)
2. Verifies `user_id` matches authenticated user
3. If not owned: Returns error "You are not the owner of this video"
4. Calls `$video->delete()` (soft delete if trait present, or hard delete)
5. Returns to previous page

**Frontend Flow:**
```javascript
// In content/Index.vue
1. User clicks delete icon on video card
2. Modal shows "Delete Video?" confirmation
3. User clicks "Delete"
4. Sends DELETE request to route("contents.video.delete", video.id)
5. On success: Modal closes, page refreshes
```

---

## Bunny Processing Status

### Status Values

| Status | Code | Description | Video Playable? |
|--------|------|-------------|-----------------|
| Queued | 0 | Video queued for processing | No |
| Processing | 1 | Analyzing video format | No |
| Encoding | 2 | Encoding in progress | No |
| **Finished** | **3** | **All resolutions complete** | **Yes** |
| **Resolution Finished** | **4** | **At least one resolution done** | **Yes (partial)** |
| Failed | 5 | Processing failed | No |
| PresignedUploadStarted | 6 | TUS upload started | No |
| PresignedUploadFinished | 7 | TUS upload completed | No |
| PresignedUploadFailed | 8 | TUS upload failed | No |
| CaptionsGenerated | 9 | AI captions generated | Yes |
| TitleOrDescriptionGenerated | 10 | AI metadata generated | Yes |

---

### Processing vs Done Status

#### **Processing Status (0-2)**

When `bunny_status` is 0, 1, or 2:
- Video is being processed by Bunny
- `processing = true` in database
- Video shows "Processing" badge in UI
- Video **cannot** be played yet
- Progress is tracked via `bunny_encode_progress` (0-100%)

#### **Done Status (3 or 4)**

**Status 4 - Resolution Finished:**
- At least one resolution is complete
- Video **can start playing** (adaptive quality)
- `isReadyForPlayback() = true`
- Other resolutions may still be encoding

**Status 3 - Finished:**
- **All** resolutions are complete
- `bunny_encode_progress = 100`
- `processing = false`
- Full quality selection available
- S3 backup job dispatched (if enabled)

---

### Database Fields for Status

```php
// Video Model fields
bunny_status              // Integer 0-10 (see table above)
bunny_encode_progress     // Integer 0-100 (encoding percentage)
bunny_available_resolutions // String "360p,720p,1080p" (comma-separated)
bunny_duration            // Integer (duration in seconds)
bunny_width, bunny_height // Integers (video dimensions)
bunny_storage_size        // Integer (bytes)
bunny_hls_url             // String (HLS playlist URL)
bunny_encoding_completed_at // Timestamp
processing                // Boolean (true while processing)
progress                  // Float 0-1 (legacy, used for UI)
```

---

### Webhook Flow

```
Upload completes
       ↓
Bunny webhook: status=0 (Queued)
       ↓
Bunny webhook: status=1 (Processing)
       ↓
Bunny webhook: status=2 (Encoding)
       ↓
Bunny webhook: status=4 (Resolution Finished)
- Video is now playable!
- Updates available_resolutions
- Updates encode_progress
       ↓
Bunny webhook: status=3 (Finished)
- All resolutions done
- Sets processing=false
- Sets bunny_encode_progress=100
- Fetches HLS URL, duration, dimensions
- Dispatches S3 backup job
       ↓
Video ready for publishing
```

---

### Model Helper Methods

```php
// Check if video uses Bunny
$video->isBunnyVideo();  // true if is_bunny_video && bunny_video_id

// Check if still processing
$video->isProcessing();  // true if bunny_status < 3 OR processing flag

// Get encoding progress
$video->getProgress();   // Returns 0-100

// Get available resolutions
$video->getAvailableResolutions();  // ["360p", "720p", "1080p"]

// Check if playable
$video->isReadyForPlayback();  // true if bunny_status >= 4
```

---

## API Endpoints Reference

### Upload Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/videos/upload-thumbnail` | Upload thumbnail to S3 |
| POST | `/api/videos/prepare-bunny-upload` | Create draft video, get TUS credentials |
| POST | `/api/videos/set-bunny-thumbnail` | Set custom thumbnail on Bunny video |

### Management Endpoints (Web)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contents/videos` | List creator's long videos |
| GET | `/contents/videos/create` | Video create form |
| POST | `/contents/videos/store` | Create video (legacy flow) |
| GET | `/contents/videos/{video}/show` | View video details |
| GET | `/contents/videos/{video}/edit` | Video edit form |
| PUT | `/contents/video/{video}/edit` | Update video |
| DELETE | `/contents/video/{video}/delete` | Delete video |

### Shorts Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contents/shorts` | List creator's shorts |
| GET | `/contents/shorts/create` | Short create form |
| GET | `/contents/shorts/{video}/edit` | Short edit form |

### Public API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/videos/list` | Public video listing with filters |
| GET | `/api/videos/{video:uuid}` | Get single video details |
| GET | `/api/videos/{video}/play` | Get video for playback |

### Webhook

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhook/bunny/stream` | Bunny processing webhooks |

---

## Frontend Components

### Video Listing Page

**File:** `resources/js/Pages/content/Index.vue`

**Features:**
- Grid display (4 columns)
- Processing overlay with progress percentage
- Status badges:
  - **Published** - Green
  - **Scheduled** - Blue (with date)
  - **Pending** - Gray (draft)
- Action buttons: View, Edit, Delete
- Auto-refresh every 10 seconds while videos are processing
- Delete confirmation modal

---

### Video Create/Edit Form

**Files:**
- `resources/js/Pages/content/create.vue`
- `resources/js/Pages/content/edit.vue`

**Form Fields:**
- Title (required)
- Description (required)
- Location with map picker
- Country selector (required)
- Tags multi-select
- Thumbnail upload
- Video upload (ChunkableFileInput)
- Adult content checkbox
- Publication settings:
  - Published toggle
  - Publish mode: None / Auto / Scheduled
  - Scheduled date/time picker

---

### Chunked File Upload

**File:** `resources/js/Components/Inputs/ChunkableFileInput.vue`

Handles large video file uploads with:
- 7MB chunk size
- 5 parallel uploads
- Progress tracking
- Resume capability
- Drag-and-drop support

---

## Publish Modes

| Mode | Behavior |
|------|----------|
| `none` | Save as draft, publish manually later |
| `auto` | Publish automatically when processing completes |
| `scheduled` | Publish at specified `scheduled_at` timestamp |

**Note:** Shorts do not support publish scheduling - they are always created as drafts.

---

## Video Lifecycle Summary

```
1. DRAFT CREATED
   - User calls prepare-bunny-upload
   - Video record created with published_at=null
   - Appears in /contents/videos immediately

2. UPLOADING
   - TUS upload in progress
   - bunny_status = 6,7

3. PROCESSING
   - bunny_status = 0,1,2
   - processing = true
   - Shows "Processing" badge with progress %

4. PLAYABLE (Partial)
   - bunny_status = 4
   - At least one resolution ready
   - Can preview video

5. READY
   - bunny_status = 3
   - All resolutions encoded
   - processing = false
   - S3 backup in progress

6. PUBLISHED
   - User sets published=true
   - published_at = timestamp
   - Appears in public feeds

7. DELETED
   - User deletes video
   - Removed from database
   - (Bunny video may remain until cleanup)
```
