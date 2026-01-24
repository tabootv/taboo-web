/**
 * Series & Course Types
 * Series, courses, and related content types
 */

import type { Channel } from './channel';
import type { Tag } from './media';
import type { Video } from './video';

export interface SeriesCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Series {
  id: number;
  uuid: string;
  type: string;
  module_type: 'series' | 'course';
  title: string;
  description?: string;
  duration?: number;
  banner?: boolean;
  is_free?: boolean;
  is_adult_content?: boolean;
  user_has_access?: boolean;
  purchase_link?: string | null;
  published_at: string;
  humans_publish_at?: string;
  latest?: boolean;
  videos_count: number;
  thumbnail?: string;
  card_thumbnail?: string;
  trailer_thumbnail?: string;
  course_thumbnail?: string;
  desktop_banner?: string;
  mobile_banner?: string;
  trailer_url?: string;
  trailer?: string;
  channel: Channel;
  user_id: number;
  videos?: Video[];
  categories?: SeriesCategory[];
  tags?: Tag[];
}

export interface Course extends Series {
  module_type: 'course';
  price_tier?: string;
  is_enrolled?: boolean;
}

export interface SeriesResponse {
  message: string;
  series: Series[];
}

export interface SeriesDetailResponse {
  message: string;
  series: Series;
}
