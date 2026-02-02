'use client';

import { cn } from '@/shared/utils/formatting';

export type ContentType = 'videos' | 'shorts' | 'posts';

interface ContentTabsProps {
  activeTab: ContentType;
  onTabChange: (tab: ContentType) => void;
  videosCount: number | undefined;
  shortsCount: number | undefined;
  postsCount?: number | undefined;
}

export function ContentTabs({
  activeTab,
  onTabChange,
  videosCount,
  shortsCount,
  postsCount,
}: ContentTabsProps) {
  const tabs: { id: ContentType; label: string; count: number | undefined }[] = [
    { id: 'videos', label: 'Videos', count: videosCount },
    { id: 'shorts', label: 'Shorts', count: shortsCount },
    { id: 'posts', label: 'Posts', count: postsCount },
  ];

  return (
    <div className="flex gap-1 border-b border-white/10">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'px-4 py-3 text-sm font-medium transition-colors relative',
            activeTab === tab.id
              ? 'text-text-primary'
              : 'text-text-tertiary hover:text-text-secondary'
          )}
        >
          <span className="flex items-center gap-2">
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  activeTab === tab.id
                    ? 'bg-red-primary/20 text-red-primary'
                    : 'bg-white/10 text-text-tertiary'
                )}
              >
                {tab.count}
              </span>
            )}
          </span>
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-primary" />
          )}
        </button>
      ))}
    </div>
  );
}
