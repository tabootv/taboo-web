/**
 * Banner Types
 * Homepage banners and promotional content
 */

import type { Channel } from './channel';

export interface Banner {
  id: number;
  uuid: string;
  type: 'series' | 'video';
  module_type?: string;
  title: string;
  description?: string;
  banner: boolean;
  user_id: number;
  series_id?: number;
  is_adult_content?: boolean;
  published_at?: string;
  channel: Channel;
  trailer_thumbnail?: string;
  desktop_banner?: string;
  mobile_banner?: string;
  trailer_url?: string;
  thumbnail?: string;
}

export interface BannersResponse {
  message: string;
  banners: Banner[];
}
