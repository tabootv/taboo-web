api-public-map-videos.md 2026-01-16

# API: Public Map Videos

## Endpoint

```
  GET /api/public/map-videos

## Description

```

Returns a paginated list of public (published) videos with support for multiple filters, smart search, and

optional authentication data.


This endpoint is optimized for use in maps and listings, returning only essential data for each video.

## Authentication


**Optional** . The endpoint works for both authenticated and unauthenticated users.


**Without authentication** : Returns all public videos

**With authentication** :

Automatically filters content blocked by the user

Can include user-specific data (progress, watchlist, likes) if `auth=true`

## Query Parameters


Pagination


**Parameter** **Type** **Default** **Description**


`per_page` integer `20` Number of videos per page


Basic Filters


**Parameter** **Type** **Format** **Description**


`ids` string/array CSV or array Specific video IDs


`creators` string/array CSV or array Channel/creator IDs


`handler` string  - Channel handler (e.g., `@username` )


`countries` string/array CSV or array Country names


`countries_ids` string/array CSV or array Country IDs


`series_ids` string/array CSV or array Series IDs


**Hybrid format** : All array parameters support both CSV and array format:


1 / 8


api-public-map-videos.md 2026-01-16

```
  ?ids=1,2,3      # CSV
  ?ids[]=1&ids[]=2   # Array

```

Type Filter


**Parameter** **Type** **Default** **Values** **Description**


`types` string/array `videos,series` `videos`, `series`, `courses`, `shorts` Content types


**Definitions:**


`videos`    - Standalone videos (not part of series, not short)

`series`    - Videos belonging to a series (type='series')

`courses`    - Videos belonging to a course (type='course')

`shorts`    - Short videos (short=true)


Sorting


**Parameter** **Type** **Default** **Values** **Description**


`sort_by` string `created_at asc` `latest`, `oldest` Sort by date


**Note** : When `search` is used without `sort_by`, the default sorting is by **relevance** .


Smart Search


**Parameter** **Type** **Minimum** **Description**


`search` string 3 characters Search across multiple fields


**Searched fields:**


1. Video title

2. Video description

3. Channel/creator name

4. Country name

5. Tags (name and slug)


**Features:**


**Accent-insensitive** : "educacao" finds "educação"

**Case-insensitive** : "BRAZIL" finds "brazil"

**Relevance ordering** (when no `sort_by` ):

Score 1: Match in title

Score 2: Match in channel

Score 3: Match in description

Score 4: Match in country

Score 5: Match in tags

Score 6: Others


2 / 8


api-public-map-videos.md 2026-01-16


User Data


**Parameter** **Type** **Default** **Description**


`auth` boolean `false` Include user-specific data


When `auth=true` and user is authenticated, each video includes:


`user_progress`    - Watch progress

`in_watchlist`    - Whether it's in the watchlist

`is_liked`    - Whether the user liked it

`is_disliked`    - Whether the user disliked it


Compact Mode


**Parameter** **Type** **Default** **Description**


`compact` boolean `false` Return only `channel_id` instead of full channel object

## Request Examples


Basic

```
  GET /api/public/map-videos

```

With pagination

```
  GET /api/public/map-videos?per_page=50

```

Filter by types

```
  GET /api/public/map-videos?types=videos,shorts

```

Filter by country

```
  GET /api/public/map-videos?countries=Brazil,Argentina
  GET /api/public/map-videos?countries_ids=1,2,3

```

Filter by creator


3 / 8


api-public-map-videos.md 2026-01-16

```
  GET /api/public/map-videos?creators=1,5,10
  GET /api/public/map-videos?handler=@johndoe

```

Smart search

```
  GET /api/public/map-videos?search=education
  GET /api/public/map-videos?search=brazil&types=videos

```

With user data (requires authentication)

```
  GET /api/public/map-videos?auth=true
  GET /api/public/map-videos?search=travel&auth=true

```

Search with date sorting (ignores relevance)

```
  GET /api/public/map-videos?search=brazil&sort_by=latest

## Response

```

Basic Structure

```
  {
  "success": true,
  "data": {
  "videos": [...],
  "pagination": {
  "total": 150,
  "per_page": 20,
  "current_page": 1,
  "last_page": 8,
  "from": 1,
  "to": 20
  }
  }
  }

```

Video Structure

```
  {
  "id": 123,

```

4 / 8


api-public-map-videos.md 2026-01-16

```
  "uuid": "abc-123-def",
  "title": "Video Title",
  "description": "Full video description...",
  "created_at": "2024-01-15T10:30:00.000000Z",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "location": "São Paulo, Brazil",
  "country": "Brazil",
  "thumbnail": "https://cdn.example.com/thumbnails/video-123.jpg",
  "tags": ["travel", "adventure", "brazil"],
  "series_id": null,
  "short": false,
  "channel": {
  "id": 45,
  "name": "Travel Channel",
  "handler": "@travelchannel",
  "user_id": 12,
  "dp": "https://cdn.example.com/dp/channel-45.jpg",
  "x": "https://x.com/travelchannel",
  "tiktok": null,
  "instagram": "@travelchannel",
  "facebook": null,
  "youtube": "https://youtube.com/@travelchannel"
  }
  }

```

With `compact=true`

```
  {
  "id": 123,
  "uuid": "abc-123-def",
  "title": "Video Title",
  "channel_id": 45
   // ... other fields, without channel object
  }

```

With `auth=true` (authenticated user)

```
  {
  "id": 123,
   // ... basic fields ...
  "user_progress": {
  "position": 125.5,
  "duration": 600.0,
  "completed": false,
  "first_watched_at": "2024-01-10T08:00:00.000000Z",
  "first_completed_at": null
  },
  "in_watchlist": true,

```

5 / 8


api-public-map-videos.md 2026-01-16

```
  "is_liked": true,
  "is_disliked": false
  }

```

**Note** : If the user has never watched the video, `user_progress` will be `null` .


With `search` (match_details)

```
  {
  "id": 123,
  "title": "Video about financial education",
   // ... other fields ...
  "match_details": [
  {
  "field": "title",
  "matched_text": "Video about financial education"
  },
  {
  "field": "tag",
  "matched_text": "education"
  }
  ]
  }

```

**Possible fields in** **`match_details`** **:**


**Field** **Description**


`title` Match found in title


`description` Match found in description (with truncated context)


`channel` Match found in channel name


`country` Match found in country name


`tag` Match found in a tag

## Special Behaviors


Content Blocking


When the user is authenticated, the endpoint **automatically** filters:


Videos blocked by the user

Videos from blocked series

Videos from blocked users/creators


**Note** : This filter is applied regardless of the `auth` parameter.


6 / 8


api-public-map-videos.md 2026-01-16


Accent-Insensitive Search


The search uses PostgreSQL's `unaccent` extension to remove accents during comparison:


**Search** **Finds**


`video` `vídeo`, `VIDEO`, `Vídeo`


`educacao` `educação`, `Educação`

```
 sao paulo São Paulo

```

`cafe` `café`, `Café`


Relevance Ordering


When `search` is used without `sort_by`, results are ordered by relevance:


**Score** **Field** **Priority**


1 Title Highest


2 Channel Name


3 Description


4 Country


5 Tags


6 Others Lowest


To sort by date instead of relevance:

```
  GET /api/public/map-videos?search=brazil&sort_by=latest

## Response Codes

```

**Code** **Description**


`200` Success


`401` Unauthenticated (only if endpoint requires auth)


`422` Invalid parameters


`500` Internal server error

## Performance


Implemented Optimizations


7 / 8


api-public-map-videos.md 2026-01-16


1. **Eager Loading** : Channel, country, tags, and media are loaded in batch

2. **User data pre-fetch** : Progress, watchlist, and likes are fetched in a single query

3. **Field selection** : Only necessary fields are selected from relationships


Considerations


Searches with `search` on very large datasets (>100k videos) may be slower

The `compact=true` parameter reduces response size and improves performance

More specific filters (IDs, handler) are faster than broad filters


Recommended Indexes (for future)


If search becomes slow, consider creating functional indexes:

```
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
  CREATE INDEX idx_videos_title_unaccent ON videos USING gin(unaccent(title)
  gin_trgm_ops);
  CREATE INDEX idx_videos_description_unaccent ON videos USING
  gin(unaccent(description) gin_trgm_ops);
  CREATE INDEX idx_channels_name_unaccent ON channels USING gin(unaccent(name)
  gin_trgm_ops);
  CREATE INDEX idx_tags_name_unaccent ON tags USING gin(unaccent(name)
  gin_trgm_ops);

## Changelog

```

**Date** **Version** **Changes**


2026-01-16 1.0 Initial version with smart search

## Related Files


**Action** : `app/Actions/Public/PublicMapVideoList.php`

**Route** : `routes/api.php`

**Migration** : `database/migrations/2026_01_16_000000_enable_unaccent_extension.php`


8 / 8


