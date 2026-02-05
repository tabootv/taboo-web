# Studio Videos API

> **Documentation file:** `documentation/api-studio-videos.md`
>
> **Related files:**
> - `routes/api.php` (Studio routes section)
> - `app/Actions/Studio/StudioVideoList.php`
> - `app/Actions/Studio/UpdateStudioVideo.php`
> - `app/Actions/Studio/ToggleVideoHidden.php`
> - `app/Actions/Studio/DeleteStudioVideo.php`
> - `app/Actions/Studio/CreateVideoPublishSchedule.php`
> - `app/Actions/Studio/UpdateVideoPublishSchedule.php`
> - `app/Actions/Studio/DeleteVideoPublishSchedule.php`

## Overview

The Studio Videos API allows creators to manage their own videos. All endpoints require authentication and verify that the authenticated user owns the video being accessed.

**Base URL:** `/api/studio/videos`

**Authentication:** Required (Sanctum token)

**Authorization:** User must be the video owner (`video.user_id === auth.user.id`)

---

## Endpoints

### 1. List Videos

**GET** `/api/studio/videos`

Lists all videos belonging to the authenticated creator, including unpublished and hidden videos.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `per_page` | integer | 20 | Items per page (max: 100) |
| `sort_by` | string | - | Sort order: `latest`, `oldest` |
| `ids` | string/array | - | Filter by video IDs (CSV or array) |
| `countries` | string/array | - | Filter by country names |
| `countries_ids` | string/array | - | Filter by country IDs |
| `series_ids` | string/array | - | Filter by series IDs |
| `types` | string | `videos,series` | Content types: `videos`, `series`, `courses`, `shorts` |

#### Response

```json
{
  "success": true,
  "data": {
    "videos": [
      {
        "id": 123,
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Video Title",
        "description": "Video description",
        "short": false,
        "duration": 3600,
        "location": "New York, USA",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "country": "United States",
        "country_id": 1,
        "series_id": null,
        "series_title": null,
        "series_type": null,
        "display_order": 0,
        "featured": false,
        "banner": false,
        "hidden": false,
        "is_adult_content": false,
        "tags": ["tag1", "tag2"],
        "published_at": "2024-01-15T10:30:00+00:00",
        "published": true,
        "created_at": "2024-01-10T08:00:00+00:00",
        "updated_at": "2024-01-15T10:30:00+00:00",
        "processing": false,
        "is_bunny_video": true,
        "bunny_video_id": "abc123",
        "bunny_status": 4,
        "bunny_encode_progress": 100,
        "bunny_available_resolutions": "360,480,720,1080",
        "thumbnail": "https://signed-url-to-thumbnail.jpg",
        "publish_schedule": null
      }
    ],
    "pagination": {
      "total": 50,
      "per_page": 20,
      "current_page": 1,
      "last_page": 3,
      "from": 1,
      "to": 20
    }
  }
}
```

---

### 2. Update Video

**PATCH** `/api/studio/videos/{videoUuid}`

Updates video metadata and/or thumbnail.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `videoUuid` | string (UUID) | The video's UUID |

#### Request Body (multipart/form-data or JSON)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | No | Video title (max: 255) |
| `description` | string | No | Video description |
| `location` | string | No | Location text (max: 255) |
| `latitude` | decimal | No | Latitude (-90 to 90) |
| `longitude` | decimal | No | Longitude (-180 to 180) |
| `country_id` | integer | No | Country ID (must exist) |
| `series_id` | integer | No | Series ID (must exist) |
| `is_adult_content` | boolean | No | Mark as adult content |
| `featured` | boolean | No | Mark as featured |
| `hidden` | boolean | No | Hide from public listings |
| `published_at` | datetime | No | Publication date (ISO 8601) |
| `tags` | array | No | Array of tag slugs |
| `thumbnail` | file | No | Thumbnail image (max: 10MB) |

#### Response

```json
{
  "success": true,
  "data": {
    "video": {
      "id": 123,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Updated Title",
      "description": "Updated description",
      "short": false,
      "duration": 3600,
      "location": "Los Angeles, USA",
      "latitude": 34.0522,
      "longitude": -118.2437,
      "country": "United States",
      "country_id": 1,
      "series_id": null,
      "series_title": null,
      "featured": true,
      "banner": false,
      "hidden": false,
      "is_adult_content": false,
      "tags": ["updated-tag"],
      "published_at": "2024-01-15T10:30:00+00:00",
      "published": true,
      "created_at": "2024-01-10T08:00:00+00:00",
      "updated_at": "2024-01-20T14:00:00+00:00",
      "is_bunny_video": true,
      "thumbnail_url": "bunny-thumbnails/video-thumbnail-uuid.webp"
    }
  },
  "message": "Video updated successfully."
}
```

#### Thumbnail Upload Process

When a thumbnail file is provided:
1. Image is converted to WebP format
2. Uploaded to S3 (`bunny-thumbnails/` directory)
3. If Bunny video, thumbnail is set via Bunny API
4. Path is saved to `thumbnail_url` column

---

### 3. Toggle Hidden Status

**PATCH** `/api/studio/videos/{videoUuid}/toggle-hidden`

Toggles the hidden status of a video. Hidden videos are not shown in public listings but remain accessible in the Studio.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `videoUuid` | string (UUID) | The video's UUID |

#### Response

```json
{
  "success": true,
  "data": {
    "hidden": true,
    "message": "Video hidden successfully."
  }
}
```

Or when unhiding:

```json
{
  "success": true,
  "data": {
    "hidden": false,
    "message": "Video is now visible."
  }
}
```

---

### 4. Delete Video

**DELETE** `/api/studio/videos/{videoUuid}`

Permanently deletes a video and all associated resources.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `videoUuid` | string (UUID) | The video's UUID |

#### Deletion Process

1. If Bunny video: Deletes from Bunny.net via API
2. Clears Spatie Media Library collections (thumbnail, video)
3. Deletes database record

> **Note:** Deletion from Bunny may fail silently (logged as error). Local deletion proceeds regardless.

#### Response

```json
{
  "success": true,
  "data": [],
  "message": "Video deleted successfully."
}
```

---

### 5. Create Publish Schedule

**POST** `/api/studio/videos/{videoUuid}/schedule`

Creates a publish schedule for a video that doesn't have one yet.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `videoUuid` | string (UUID) | The video's UUID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `publish_mode` | string | Yes | `auto` or `scheduled` |
| `scheduled_at` | datetime | Conditional | Required if `publish_mode=scheduled`. Must be in the future (ISO 8601) |
| `notify` | boolean | No | Whether to notify users after publishing (default: true) |

#### Response

```json
{
  "success": true,
  "data": {
    "schedule": {
      "id": 1,
      "video_id": 123,
      "publish_mode": "scheduled",
      "scheduled_at": "2024-02-15T10:00:00+00:00",
      "notify": true,
      "created_at": "2024-02-01T08:00:00+00:00",
      "updated_at": "2024-02-01T08:00:00+00:00"
    }
  },
  "message": "Publish schedule created successfully."
}
```

#### Error: Schedule Already Exists (409)

```json
{
  "success": false,
  "message": "A publish schedule already exists for this video.",
  "data": []
}
```

---

### 6. Update Publish Schedule

**PATCH** `/api/studio/videos/{videoUuid}/schedule`

Updates an existing publish schedule for a video.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `videoUuid` | string (UUID) | The video's UUID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `publish_mode` | string | No | `auto` or `scheduled` |
| `scheduled_at` | datetime | No | Must be in the future (ISO 8601). Cleared automatically when switching to `auto` mode |
| `notify` | boolean | No | Whether to notify users after publishing |

#### Response

```json
{
  "success": true,
  "data": {
    "schedule": {
      "id": 1,
      "video_id": 123,
      "publish_mode": "auto",
      "scheduled_at": null,
      "notify": true,
      "created_at": "2024-02-01T08:00:00+00:00",
      "updated_at": "2024-02-05T12:00:00+00:00"
    }
  },
  "message": "Publish schedule updated successfully."
}
```

---

### 7. Delete Publish Schedule

**DELETE** `/api/studio/videos/{videoUuid}/schedule`

Deletes an existing publish schedule for a video.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `videoUuid` | string (UUID) | The video's UUID |

#### Response

```json
{
  "success": true,
  "data": [],
  "message": "Publish schedule deleted successfully."
}
```

---

## Publish Schedule Modes

| Mode | Value | Description |
|------|-------|-------------|
| Auto Publish | `auto` | Video is published automatically when processing completes |
| Scheduled | `scheduled` | Video is published at the specified `scheduled_at` datetime |

> **Note:** The admin project is responsible for checking schedules and publishing videos. This API only manages the schedule records.

---

## Error Responses

### 403 Forbidden

Returned when the authenticated user does not own the video.

```json
{
  "success": false,
  "message": "You are not authorized to modify this video.",
  "data": []
}
```

### 404 Not Found

Returned when the video UUID does not exist.

```json
{
  "success": false,
  "message": "Video not found.",
  "data": []
}
```

---

## Implementation Notes

### Global Scope Bypass

All Studio endpoints use `Video::withoutGlobalScope('allowed')` to:
- Access unpublished videos (`published_at IS NULL`)
- Access hidden videos (`hidden = true`)

### Ownership Verification

Every endpoint verifies ownership before performing any action:

```php
if ($video->user_id !== $user->id) {
    return $this->sendError('You are not authorized...', [], 403);
}
```

### Related Public Endpoints

Hidden videos are automatically excluded from these public endpoints via the `allowed` global scope:
- `GET /api/videos`
- `GET /api/map-videos`
- `GET /api/featured-videos`
- `GET /api/recommended-videos`
- `GET /api/short-videos`
- `GET /api/creator-videos/{channel}`
