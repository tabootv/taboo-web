/**
 * Playlist Types
 * User playlists and video collections
 */

import type { Video } from './video';

export interface Playlist {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  user_id: number;
  videos_count: number;
  thumbnail?: string;
  videos?: Video[];
  created_at: string;
  updated_at: string;
}

export interface PlaylistsResponse {
  message: string;
  playlists: Playlist[];
}
