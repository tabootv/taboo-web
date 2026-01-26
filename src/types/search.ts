/**
 * Search Types
 * Search results and UI types
 */

import type { Video } from './video';
import type { Series } from './series';
import type { Post } from './post';
import type { Creator } from './channel';

export interface SearchResults {
  videos: Video[];
  shorts: Video[];
  series: Series[];
  posts: Post[];
  creators: Creator[];
}

export interface SearchResponse {
  message: string;
  results: SearchResults;
}

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
  handler?: string;
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
  uuid?: string;
  title: string;
  thumb: string;
  thumbLarge?: string;
  creatorName?: string;
  year?: number;
  description: string;
  duration?: number;
  contentType?: 'video' | 'short' | 'series';
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
