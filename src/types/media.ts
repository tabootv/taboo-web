/**
 * Media Types
 * Generic media and tag types used across content
 */

export interface Media {
  id: number;
  uuid?: string;
  collection_name?: string;
  name?: string;
  file_name?: string;
  mime_type?: string;
  size?: number;
  original_url?: string;
  preview_url?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  should_show?: boolean;
}
