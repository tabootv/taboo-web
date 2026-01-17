'use client';

import { publicClient } from '@/api/client/public.client';
import { useCreators, useFeaturedVideos } from '@/api/queries/home.queries';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCompactNumber } from '@/lib/utils';
import { calculateSimilarity, detectCountry } from '@/lib/utils/search-utils';
import type { Creator, Video } from '@/types';
import { Film, Search } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

interface SmartSearchDropdownProps {
  className?: string;
}

// Loading skeleton for video results
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

// Loading skeleton for creator results
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

// Get initials from name for avatar fallback
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Video result item
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

// Creator result item with avatar fallback
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

type MapVideo = {
  id?: string | number | undefined;
  uuid?: string | undefined;
  country?: string | undefined;
  country_name?: string | undefined;
  channel?: { id: number } | undefined;
  creator?: { channel?: { id: number } | undefined } | undefined;
} & Partial<Video>;

export function SmartSearchDropdown({ className }: SmartSearchDropdownProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [countryCreators, setCountryCreators] = useState<Creator[]>([]);
  const [isLoadingCountryData, setIsLoadingCountryData] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const mapVideosCacheRef = useRef<MapVideo[]>([]);

  const { data: allVideos = [], isLoading: videosLoading } = useFeaturedVideos();
  const { data: allCreators = [], isLoading: creatorsLoading } = useCreators();

  const isDataLoading = videosLoading || creatorsLoading;

  const normalizedQuery = query.toLowerCase().trim();

  const filteredVideos = useMemo(() => {
    if (!normalizedQuery) return [];
    return allVideos
      .filter((v) => {
        const isShort = v.short || v.is_short || v.type === 'short';
        if (isShort) return false;
        return v.title.toLowerCase().includes(normalizedQuery);
      })
      .slice(0, 3);
  }, [allVideos, normalizedQuery]);

  const allCreatorsRef = useRef(allCreators);
  allCreatorsRef.current = allCreators;

  useEffect(() => {
    const country = detectCountry(normalizedQuery);

    if (!country) {
      setDetectedCountry(null);
      setCountryCreators([]);
      return;
    }

    setDetectedCountry(country);
    setIsLoadingCountryData(true);

    const fetchCreators = async () => {
      try {
        let videos = mapVideosCacheRef.current;

        if (videos.length === 0) {
          const allMapVideos = await publicClient.getMapVideos();
          videos = (allMapVideos as unknown as MapVideo[]).map((v) => ({
            ...v,
            country: (v as Record<string, unknown>).country as string | undefined,
            country_name: (v as Record<string, unknown>).country_name as string | undefined,
            channel: v.channel ?? (v as Video).channel,
          }));
          mapVideosCacheRef.current = videos;
        }

        const normalizedCountryName = country.toLowerCase();
        const matchingVideos = videos.filter((v) => {
          const videoCountry = ((v.country || v.country_name || '') as string).toLowerCase();
          return (
            videoCountry === normalizedCountryName ||
            videoCountry.includes(normalizedCountryName) ||
            normalizedCountryName.includes(videoCountry)
          );
        });

        const creatorIds = new Set<number>();
        matchingVideos.forEach((v) => {
          const channelId = v.channel?.id || (v as Video).channel?.id;
          if (channelId) {
            creatorIds.add(channelId);
          }
        });

        const matchedCreators = allCreatorsRef.current.filter((c) => creatorIds.has(c.id));
        setCountryCreators(matchedCreators);
      } catch (error) {
        console.error('Failed to fetch creators by country:', error);
        setCountryCreators([]);
      } finally {
        setIsLoadingCountryData(false);
      }
    };

    fetchCreators();
  }, [normalizedQuery]);

  const filteredCreators = useMemo(() => {
    if (!normalizedQuery) return [];

    const exactMatches: Array<{ creator: Creator; score: number }> = [];
    const fuzzyMatches: Array<{ creator: Creator; score: number }> = [];

    allCreators.forEach((creator) => {
      const similarity = calculateSimilarity(normalizedQuery, creator.name);

      if (creator.name.toLowerCase().includes(normalizedQuery)) {
        exactMatches.push({ creator, score: similarity });
      } else if (similarity >= 70) {
        fuzzyMatches.push({ creator, score: similarity });
      }
    });

    exactMatches.sort((a, b) => b.score - a.score);
    fuzzyMatches.sort((a, b) => b.score - a.score);

    const combined = [...exactMatches, ...fuzzyMatches].slice(0, 2).map((item) => item.creator);

    return combined;
  }, [allCreators, normalizedQuery]);

  const hasResults =
    filteredVideos.length > 0 || filteredCreators.length > 0 || countryCreators.length > 0;
  const totalItems = filteredVideos.length + filteredCreators.length + countryCreators.length;

  // Show dropdown when typing and query is not empty
  const shouldShowDropdown = isOpen && normalizedQuery.length > 0;

  // Close dropdown and reset state
  const closeDropdown = () => {
    setIsOpen(false);
    setQuery('');
  };

  // Handle click outside to close
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

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [normalizedQuery]);

  // Handle form submit - navigate to search page
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/searches?q=${encodeURIComponent(query.trim())}`);
      closeDropdown();
    }
  };

  // Handle keyboard navigation
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
            if (creatorIndex < filteredCreators.length) {
              const creator = filteredCreators[creatorIndex];
              if (creator) {
                router.push(`/creators/creator-profile/${creator.id}`);
                closeDropdown();
              }
            } else {
              const countryCreatorIndex = creatorIndex - filteredCreators.length;
              const creator = countryCreators[countryCreatorIndex];
              if (creator) {
                router.push(`/creators/creator-profile/${creator.id}`);
                closeDropdown();
              }
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
            {/* Loading state */}
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

            {/* Results */}
            {!isDataLoading && hasResults && (
              <div className="p-2">
                {/* Videos section */}
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
                  </>
                )}

                {/* Divider */}
                {filteredVideos.length > 0 &&
                  (filteredCreators.length > 0 || countryCreators.length > 0) && (
                    <div className="my-2 border-t border-white/5" />
                  )}

                {/* Creators section */}
                {filteredCreators.length > 0 && (
                  <>
                    <div className="px-3 py-1.5">
                      <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Creators
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
                          router.push(`/creators/creator-profile/${creator.id}`);
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

                {/* Divider between name matches and country matches */}
                {filteredCreators.length > 0 && countryCreators.length > 0 && (
                  <div className="my-2 border-t border-white/5" />
                )}

                {/* Country-based creators section */}
                {isLoadingCountryData && (
                  <>
                    <div className="px-3 py-1.5">
                      <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                        {detectedCountry ? `Creators in ${detectedCountry}` : 'Creators'}
                      </span>
                    </div>
                    <CreatorSkeleton />
                    <CreatorSkeleton />
                  </>
                )}

                {!isLoadingCountryData && countryCreators.length > 0 && (
                  <>
                    <div className="px-3 py-1.5">
                      <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Creators in {detectedCountry}
                      </span>
                    </div>
                    {countryCreators.map((creator, index) => (
                      <div
                        key={creator.id}
                        role="button"
                        tabIndex={0}
                        className="block cursor-pointer"
                        onPointerDown={(e) => e.preventDefault()}
                        onClick={() => {
                          router.push(`/creators/creator-profile/${creator.id}`);
                          closeDropdown();
                        }}
                      >
                        <CreatorResultItem
                          creator={creator}
                          isSelected={
                            selectedIndex ===
                            filteredVideos.length + filteredCreators.length + index
                          }
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Empty state */}
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
