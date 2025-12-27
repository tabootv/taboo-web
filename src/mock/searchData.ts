// Mock data for search functionality - structured to swap with DB later

export interface SearchTitle {
  type: 'title';
  id: string;
  uuid: string;
  title: string;
  thumb: string;
  thumbWebp?: string;
  creatorName: string;
  creatorId: string;
  year: number;
  description: string;
  duration?: number;
  views?: number;
  contentType: 'video' | 'short' | 'series';
}

export interface SearchCreator {
  type: 'creator';
  id: string;
  uuid: string;
  name: string;
  avatar: string;
  subscriberCount: number;
  videoCount: number;
  verified?: boolean;
}

export interface SearchTag {
  type: 'tag';
  id: string;
  name: string;
  count: number;
}

export type SearchItem = SearchTitle | SearchCreator | SearchTag;

export interface SearchRail {
  label: string;
  type: 'titles' | 'creators' | 'tags';
  items: SearchItem[];
}

export interface TopResult {
  type: 'title' | 'creator';
  id: string;
  uuid?: string | undefined;
  title: string;
  thumb: string;
  thumbLarge?: string | undefined;
  creatorName?: string | undefined;
  year?: number | undefined;
  description: string;
  duration?: number | undefined;
  contentType?: 'video' | 'short' | 'series' | undefined;
}

export interface SearchResponse {
  query: string;
  top: TopResult | null;
  rails: SearchRail[];
  pagination: {
    page: number;
    nextPage: number | null;
    hasMore: boolean;
    total: number;
  };
}

export interface SuggestResponse {
  query: string;
  suggestions: SearchItem[];
  recentSearches?: string[];
}

export interface TrendingResponse {
  trending: SearchItem[];
  popular: string[];
}

// Mock titles database
export const mockTitles: SearchTitle[] = [
  {
    type: 'title',
    id: '1',
    uuid: 'video-1',
    title: 'Rio After Dark',
    thumb: 'https://picsum.photos/seed/rio1/320/180',
    thumbWebp: 'https://picsum.photos/seed/rio1/320/180.webp',
    creatorName: 'Arab Studios',
    creatorId: 'creator-1',
    year: 2024,
    description: 'Experience the vibrant nightlife of Rio de Janeiro in this stunning documentary series.',
    duration: 3600,
    views: 125000,
    contentType: 'series',
  },
  {
    type: 'title',
    id: '2',
    uuid: 'video-2',
    title: 'The Art of Seduction',
    thumb: 'https://picsum.photos/seed/art1/320/180',
    creatorName: 'Passion Films',
    creatorId: 'creator-2',
    year: 2024,
    description: 'A deep dive into the psychology of attraction and connection.',
    duration: 5400,
    views: 89000,
    contentType: 'video',
  },
  {
    type: 'title',
    id: '3',
    uuid: 'video-3',
    title: 'Midnight in Paris',
    thumb: 'https://picsum.photos/seed/paris1/320/180',
    creatorName: 'European Cinema',
    creatorId: 'creator-3',
    year: 2023,
    description: 'Romance unfolds under the twinkling lights of the City of Love.',
    duration: 7200,
    views: 234000,
    contentType: 'video',
  },
  {
    type: 'title',
    id: '4',
    uuid: 'video-4',
    title: 'Tokyo Nights',
    thumb: 'https://picsum.photos/seed/tokyo1/320/180',
    creatorName: 'Asian Dreams',
    creatorId: 'creator-4',
    year: 2024,
    description: 'Explore the electric nightlife scene of Tokyo\'s most exclusive districts.',
    duration: 4500,
    views: 167000,
    contentType: 'series',
  },
  {
    type: 'title',
    id: '5',
    uuid: 'video-5',
    title: 'Summer Heat',
    thumb: 'https://picsum.photos/seed/summer1/320/180',
    creatorName: 'Beach Productions',
    creatorId: 'creator-5',
    year: 2024,
    description: 'Sun, sand, and sizzling summer adventures.',
    duration: 2700,
    views: 98000,
    contentType: 'video',
  },
  {
    type: 'title',
    id: '6',
    uuid: 'short-1',
    title: 'Quick Tease',
    thumb: 'https://picsum.photos/seed/quick1/180/320',
    creatorName: 'Shorts Studio',
    creatorId: 'creator-6',
    year: 2024,
    description: 'A tantalizing quick clip.',
    duration: 60,
    views: 450000,
    contentType: 'short',
  },
  {
    type: 'title',
    id: '7',
    uuid: 'video-7',
    title: 'Rioja Wine Country',
    thumb: 'https://picsum.photos/seed/rioja1/320/180',
    creatorName: 'Travel Desires',
    creatorId: 'creator-7',
    year: 2023,
    description: 'A sensual journey through Spain\'s famous wine region.',
    duration: 3200,
    views: 76000,
    contentType: 'video',
  },
  {
    type: 'title',
    id: '8',
    uuid: 'video-8',
    title: 'Behind Closed Doors',
    thumb: 'https://picsum.photos/seed/doors1/320/180',
    creatorName: 'Mystery Films',
    creatorId: 'creator-8',
    year: 2024,
    description: 'What happens when the lights go down...',
    duration: 6000,
    views: 312000,
    contentType: 'series',
  },
];

// Mock creators database
export const mockCreators: SearchCreator[] = [
  {
    type: 'creator',
    id: 'creator-1',
    uuid: 'creator-1',
    name: 'Arab Studios',
    avatar: 'https://picsum.photos/seed/arab1/100/100',
    subscriberCount: 1250000,
    videoCount: 45,
    verified: true,
  },
  {
    type: 'creator',
    id: 'creator-2',
    uuid: 'creator-2',
    name: 'Passion Films',
    avatar: 'https://picsum.photos/seed/passion1/100/100',
    subscriberCount: 890000,
    videoCount: 32,
    verified: true,
  },
  {
    type: 'creator',
    id: 'creator-3',
    uuid: 'creator-3',
    name: 'European Cinema',
    avatar: 'https://picsum.photos/seed/euro1/100/100',
    subscriberCount: 2100000,
    videoCount: 78,
    verified: true,
  },
  {
    type: 'creator',
    id: 'creator-4',
    uuid: 'creator-4',
    name: 'Asian Dreams',
    avatar: 'https://picsum.photos/seed/asian1/100/100',
    subscriberCount: 560000,
    videoCount: 23,
    verified: false,
  },
  {
    type: 'creator',
    id: 'creator-5',
    uuid: 'creator-5',
    name: 'Beach Productions',
    avatar: 'https://picsum.photos/seed/beach1/100/100',
    subscriberCount: 340000,
    videoCount: 18,
    verified: false,
  },
  {
    type: 'creator',
    id: 'creator-rio',
    uuid: 'creator-rio',
    name: 'Rio Productions',
    avatar: 'https://picsum.photos/seed/rioprod/100/100',
    subscriberCount: 780000,
    videoCount: 56,
    verified: true,
  },
];

// Mock tags database
export const mockTags: SearchTag[] = [
  { type: 'tag', id: 'tag-1', name: 'romance', count: 234 },
  { type: 'tag', id: 'tag-2', name: 'rio', count: 45 },
  { type: 'tag', id: 'tag-3', name: 'nightlife', count: 89 },
  { type: 'tag', id: 'tag-4', name: 'documentary', count: 156 },
  { type: 'tag', id: 'tag-5', name: 'paris', count: 67 },
  { type: 'tag', id: 'tag-6', name: 'tokyo', count: 98 },
  { type: 'tag', id: 'tag-7', name: 'summer', count: 123 },
  { type: 'tag', id: 'tag-8', name: 'series', count: 445 },
];

// Trending searches
export const mockTrending: string[] = [
  'Rio After Dark',
  'Summer Heat',
  'Tokyo Nights',
  'romance',
  'behind the scenes',
  'new releases',
  'trending now',
  'exclusive',
];

// Search function helpers
export function searchTitles(query: string): SearchTitle[] {
  const q = query.toLowerCase();
  return mockTitles.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.creatorName.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
  );
}

export function searchCreators(query: string): SearchCreator[] {
  const q = query.toLowerCase();
  return mockCreators.filter((c) => c.name.toLowerCase().includes(q));
}

export function searchTags(query: string): SearchTag[] {
  const q = query.toLowerCase();
  return mockTags.filter((t) => t.name.toLowerCase().includes(q));
}

export function getTopResult(query: string): TopResult | null {
  const titles = searchTitles(query);
  const creators = searchCreators(query);

  // Prioritize exact title matches, then creator matches
  const exactTitle = titles.find((t) => t.title.toLowerCase() === query.toLowerCase());
  if (exactTitle) {
    return {
      type: 'title',
      id: exactTitle.id,
      uuid: exactTitle.uuid,
      title: exactTitle.title,
      thumb: exactTitle.thumb,
      thumbLarge: exactTitle.thumb.replace('320/180', '1280/720'),
      creatorName: exactTitle.creatorName,
      year: exactTitle.year,
      description: exactTitle.description,
      duration: exactTitle.duration,
      contentType: exactTitle.contentType,
    };
  }

  // Return highest viewed title match
  if (titles.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const top = titles.sort((a, b) => (b.views || 0) - (a.views || 0))[0]!;
    return {
      type: 'title',
      id: top.id,
      uuid: top.uuid,
      title: top.title,
      thumb: top.thumb,
      thumbLarge: top.thumb.replace('320/180', '1280/720'),
      creatorName: top.creatorName,
      year: top.year,
      description: top.description,
      duration: top.duration,
      contentType: top.contentType,
    };
  }

  // Return creator match
  if (creators.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const top = creators.sort((a, b) => b.subscriberCount - a.subscriberCount)[0]!;
    return {
      type: 'creator',
      id: top.id,
      uuid: top.uuid,
      title: top.name,
      thumb: top.avatar,
      description: `${top.videoCount} videos`,
    };
  }

  return null;
}
