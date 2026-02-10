import type { Creator, Video } from '@/types';

export type TabType = 'home' | 'videos' | 'shorts' | 'series' | 'posts' | 'education' | 'search';

export interface TabConfig {
  key: TabType;
  label: string;
  count?: number;
}

export interface CreatorHeaderProps {
  creator: Creator;
  featuredVideoThumbnail?: string | undefined;
  stats: Array<{
    key: string;
    label: string;
    value: number;
    icon: React.ReactNode;
  }>;
  socialLinks: Array<{
    key: string;
    url: string;
    icon: React.ReactNode;
    label: string;
  }>;
}

export interface CreatorTabsProps {
  handler: string;
  tabs: TabConfig[];
}

export interface CreatorFeaturedVideoProps {
  video: Video;
}

export interface CreatorVideoGridProps {
  videos: Video[];
  variant?: 'grid' | 'rail';
  showAll?: boolean;
}

export interface CreatorShortsGridProps {
  shorts: Video[];
  variant?: 'grid' | 'rail';
  showAll?: boolean;
}
