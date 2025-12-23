# TabooTV Creator Profile - Landing Page Integration

This folder contains all the code needed to integrate creator profiles into your Framer landing page.

## API Base URL

```
Production: https://app.taboo.tv/api
Beta: https://beta.taboo.tv/api
```

## Files Included

1. **types.ts** - TypeScript interfaces for all API responses
2. **api.ts** - API functions to fetch creator data
3. **CreatorProfile.tsx** - React component example (adapt for Framer)
4. **styles.css** - CSS styles for the creator profile

## API Endpoints

### Get Creator by ID
```
GET /creators/{id}
```

Response:
```json
{
  "creator": {
    "id": 1,
    "uuid": "abc-123",
    "name": "Arab",
    "description": "Creator bio here",
    "dp": "https://...",
    "banner": "https://...",
    "videos_count": 50,
    "shorts_count": 100,
    "series_count": 5,
    "posts_count": 20,
    "followers_count": 1000
  }
}
```

### Get Creator Videos
```
GET /creators/creator-videos/{id}?sort_by=newest
```

### Get Creator Shorts
```
GET /creators/creator-shorts/{id}?sort_by=newest
```

### Get Creator Series
```
GET /creators/creator-series/{id}?sort_by=newest
```

### Get Creator Posts
```
GET /creators/creator-posts/{id}?sort_by=newest
```

### Get Creator Courses
```
GET /creators/creator-course/{id}?sort_by=newest
```

## Framer Integration

For Framer, you can use the fetch API directly:

```javascript
// In Framer code component
const API_URL = "https://app.taboo.tv/api";

async function getCreator(id) {
  const response = await fetch(`${API_URL}/creators/${id}`);
  const data = await response.json();
  return data.creator || data.data || data;
}

async function getCreatorVideos(id) {
  const response = await fetch(`${API_URL}/creators/creator-videos/${id}`);
  const data = await response.json();
  return data.videos || data;
}
```

## Future: Username-based URLs

Once the Laravel backend adds username support:
```
GET /creators/by-username/{username}
```

This will enable URLs like:
- `taboo.tv/arab` (landing page)
- `app.taboo.tv/@arab` (full profile)
