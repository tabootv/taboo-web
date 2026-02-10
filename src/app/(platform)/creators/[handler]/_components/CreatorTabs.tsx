'use client';

import { useSearchExpansion } from '@/components/search/hooks/use-search-expansion';
import { cn } from '@/shared/utils/formatting';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSelectedLayoutSegment } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CreatorTabsProps, TabType } from './types';

const TAB_ROUTES: Record<TabType, string> = {
  home: '',
  videos: 'videos',
  shorts: 'shorts',
  series: 'series',
  posts: 'posts',
  education: 'education',
  search: 'search',
};

function getActiveTab(segment: string | null): TabType {
  if (!segment) return 'home';
  const entry = Object.entries(TAB_ROUTES).find(([, route]) => route === segment);
  return (entry?.[0] as TabType) || 'home';
}

export function CreatorTabs({ handler, tabs }: CreatorTabsProps) {
  const segment = useSelectedLayoutSegment();
  const activeTab = getActiveTab(segment);
  const router = useRouter();

  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const { isExpanded, expand, collapse, inputRef } = useSearchExpansion();

  const handleCollapse = useCallback(() => {
    collapse();
    setQuery('');
  }, [collapse]);

  // Click outside to collapse
  useEffect(() => {
    if (!isExpanded) return;

    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleCollapse();
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isExpanded, handleCollapse]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      handleCollapse();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = query.trim();
      if (trimmed) {
        router.push(`/creators/${handler}/search?q=${encodeURIComponent(trimmed)}`);
      } else {
        router.push(`/creators/${handler}/search`);
      }
    }
  }

  // Auto-collapse search when navigating away from search tab
  useEffect(() => {
    if (activeTab !== 'search') {
      handleCollapse();
    }
  }, [activeTab, handleCollapse]);

  const isSearchActive = isExpanded || activeTab === 'search';

  return (
    <section className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-t border-white/6 border-b border-white/6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex justify-center gap-4 sm:gap-6 overflow-x-auto">
        {tabs.map((tab) => {
          const route = TAB_ROUTES[tab.key];
          const href = route ? `/creators/${handler}/${route}` : `/creators/${handler}`;
          return (
            <Link
              key={tab.key}
              href={href}
              className={cn(
                'bg-transparent border-none shrink-0',
                'text-sm sm:text-base font-semibold',
                'px-2 py-2',
                'border-b-2 border-transparent',
                'transition-all duration-200',
                'hover:text-white/80',
                activeTab === tab.key ? 'text-white border-b-2 border-[#AB0113]' : 'text-white/50',
                isExpanded && 'hidden sm:block'
              )}
            >
              <span className={cn(isExpanded && 'hidden sm:inline')}>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={cn('ml-1.5 text-xs text-white/40', isExpanded && 'hidden sm:inline')}
                >
                  ({tab.count})
                </span>
              )}
            </Link>
          );
        })}

        {/* Inline expandable search */}
        <div ref={containerRef} className="flex items-center shrink-0">
          <div
            className={cn(
              'flex items-center overflow-hidden transition-all duration-300',
              isExpanded ? 'w-48 sm:w-64 opacity-100' : 'w-0 opacity-0'
            )}
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              className="w-full bg-white/10 text-white text-sm placeholder:text-white/40 px-2 py-2 rounded-l-full border border-white/20 focus:outline-none focus:border-[#AB0113]"
            />
          </div>
          <button
            onClick={isExpanded ? handleCollapse : expand}
            className={cn(
              'flex items-center justify-center shrink-0',
              'px-2 py-2',
              'border-b-2 border-transparent',
              'transition-all duration-200',
              'hover:text-white/80',
              isSearchActive ? 'text-white border-b-2 border-[#AB0113]' : 'text-white/50'
            )}
            aria-label={isExpanded ? 'Close search' : 'Search creator content'}
          >
            {isExpanded ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </section>
  );
}
