'use client';

import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useHiddenComponentByPage } from '@/hooks';
import { useDebounce } from '@/hooks/use-debounce';
import { useMixedSearch } from '@/hooks/useMixedSearch';
import { cn, formatCompactNumber, getCreatorRoute } from '@/shared/utils/formatting';
import { detectCountry } from '@/shared/utils/search-utils';
import type { Creator, Video } from '@/types';
import { Film, Search } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

interface SmartSearchDropdownProps {
  className?: string;
}

function VideoSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <Skeleton className="w-16 h-10 rounded-md shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function CreatorSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function VideoResultItem({ video, isSelected }: { video: Video; isSelected: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
        isSelected ? 'bg-white/10' : 'hover:bg-white/5'
      )}
    >
      <div className="relative w-16 h-10 rounded-md overflow-hidden bg-surface shrink-0">
        {video.thumbnail_webp || video.thumbnail ? (
          <Image
            src={video.thumbnail_webp || video.thumbnail || ''}
            alt={video.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-4 h-4 text-text-secondary" />
          </div>
        )}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm text-text-primary truncate">{video.title}</p>
        <p className="text-xs text-text-secondary truncate">{video.channel?.name}</p>
      </div>
    </div>
  );
}

function CreatorResultItem({
  creator,
  isSelected,
  subtitle,
}: {
  creator: Creator;
  isSelected: boolean;
  subtitle?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
        isSelected ? 'bg-white/10' : 'hover:bg-white/5'
      )}
    >
      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-red-primary/20 shrink-0">
        {creator.dp ? (
          <Image src={creator.dp} alt={creator.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm font-medium text-red-primary">
            {getInitials(creator.name)}
          </div>
        )}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm text-text-primary truncate">{creator.name}</p>
        <p className="text-xs text-text-secondary">
          {subtitle ||
            (creator.subscribers_count
              ? `${formatCompactNumber(creator.subscribers_count)} subscribers`
              : 'Content Creator')}
        </p>
      </div>
    </div>
  );
}


export function SmartSearchDropdown({ className }: SmartSearchDropdownProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const normalizedQuery = query.toLowerCase().trim();
  const debouncedQuery = useDebounce(normalizedQuery, 300);

  const {
    filteredVideos: allFilteredVideos,
    filteredCreators,
    isLoading: isDataLoading,
    isLoadingCountryData,
    countryHeader,
    hasResults,
  } = useMixedSearch(query);

  const filteredVideos = useMemo(() => {
    return allFilteredVideos.slice(0, 6);
  }, [allFilteredVideos]);
  const totalItems = filteredVideos.length + filteredCreators.length;

  const shouldShowDropdown = isOpen && normalizedQuery.length > 0;

  const closeDropdown = () => {
    setIsOpen(false);
    setQuery('');
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [normalizedQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/searches?q=${encodeURIComponent(query.trim())}`);
      closeDropdown();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!shouldShowDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (hasResults) {
          setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (hasResults) {
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && hasResults) {
          if (selectedIndex < filteredVideos.length) {
            const video = filteredVideos[selectedIndex];
            if (video) {
              router.push(`/videos/${video.id}`);
              closeDropdown();
            }
          } else {
            const creatorIndex = selectedIndex - filteredVideos.length;
            const creator = filteredCreators[creatorIndex];
            if (creator) {
              router.push(getCreatorRoute(creator.handler));
              closeDropdown();
            }
          }
        } else if (query.trim()) {
          router.push(`/searches?q=${encodeURIComponent(query.trim())}`);
          closeDropdown();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const isToHidden = useHiddenComponentByPage(['/searches']);
  if (isToHidden) return null;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Popover open={shouldShowDropdown} modal={false}>
        <PopoverAnchor asChild>
          <form onSubmit={handleSubmit}>
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-text-secondary pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value.trim()) {
                    setIsOpen(true);
                  }
                }}
                onFocus={() => {
                  if (query.trim()) {
                    setIsOpen(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-red-primary transition-colors"
              />
            </div>
          </form>
        </PopoverAnchor>

        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-0 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl"
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-[400px] overflow-y-auto">
            {isDataLoading && (
              <div className="p-2">
                <div className="px-3 py-1.5">
                  <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Videos
                  </span>
                </div>
                <VideoSkeleton />
                <VideoSkeleton />
                <VideoSkeleton />
                <div className="my-2 border-t border-white/5" />
                <div className="px-3 py-1.5">
                  <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Creators
                  </span>
                </div>
                <CreatorSkeleton />
                <CreatorSkeleton />
              </div>
            )}

            {!isDataLoading && hasResults && (
              <div className="p-2">
                {filteredVideos.length > 0 && (
                  <>
                    <div className="px-3 py-1.5">
                      <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Videos
                      </span>
                    </div>
                    {filteredVideos.map((video, index) => (
                      <div
                        key={video.id || video.uuid}
                        role="button"
                        tabIndex={0}
                        className="block cursor-pointer"
                        onPointerDown={(e) => e.preventDefault()}
                        onClick={() => {
                          router.push(`/videos/${video.id}`);
                          closeDropdown();
                        }}
                      >
                        <VideoResultItem video={video} isSelected={selectedIndex === index} />
                      </div>
                    ))}
                    {filteredVideos.length > 0 && (
                      <div
                        role="button"
                        tabIndex={0}
                        className="px-3 py-2 cursor-pointer hover:bg-white/5 transition-colors rounded-lg text-text-secondary hover:text-primary"
                        onPointerDown={(e) => e.preventDefault()}
                        onClick={() => {
                          router.push(`/searches?q=${encodeURIComponent(query.trim())}`);
                          closeDropdown();
                        }}
                      >
                        <span className="text-sm">
                          See all videos →
                        </span>
                      </div>
                    )}
                  </>
                )}

                {filteredVideos.length > 0 && filteredCreators.length > 0 && (
                  <div className="my-2 border-t border-white/5" />
                )}

                {isLoadingCountryData && detectCountry(debouncedQuery) && (
                  <>
                    <div className="px-3 py-1.5">
                      <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                        {`Creators in ${detectCountry(debouncedQuery) || ''}`}
                      </span>
                    </div>
                    <CreatorSkeleton />
                    <CreatorSkeleton />
                  </>
                )}

                {!isLoadingCountryData && filteredCreators.length > 0 && (
                  <>
                    <div className="px-3 py-1.5">
                      <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                        {countryHeader}
                      </span>
                    </div>
                    {filteredCreators.map((creator, index) => (
                      <div
                        key={creator.id}
                        role="button"
                        tabIndex={0}
                        className="block cursor-pointer"
                        onPointerDown={(e) => e.preventDefault()}
                        onClick={() => {
                          router.push(getCreatorRoute(creator.handler));
                          closeDropdown();
                        }}
                      >
                        <CreatorResultItem
                          creator={creator}
                          isSelected={selectedIndex === filteredVideos.length + index}
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {!isDataLoading && !hasResults && normalizedQuery && (
              <div className="p-6 text-center">
                <Search className="w-8 h-8 mx-auto text-text-secondary opacity-50 mb-2" />
                <p className="text-sm text-text-secondary">
                  No results found for &quot;{query}&quot;
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
