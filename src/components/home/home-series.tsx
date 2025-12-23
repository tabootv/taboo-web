'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, Plus, Check, ChevronRight, ChevronUp, ChevronDown, Clock, Film } from 'lucide-react';
import { home } from '@/lib/api';
import type { Series } from '@/types';
import { useSavedVideosStore, type SavedVideo } from '@/lib/stores/saved-videos-store';
import { cn, formatCompactNumber } from '@/lib/utils';

interface HomeSeriesSectionProps {
  initialSeries?: Series[];
}

export function HomeSeriesSection({ initialSeries }: HomeSeriesSectionProps) {
  const hasInitialData = initialSeries && initialSeries.length > 0;
  const [series, setSeries] = useState<Series[]>(initialSeries || []);
  const [isLoading, setIsLoading] = useState(!hasInitialData);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (initialSeries && initialSeries.length > 0) return;

    async function fetchSeries() {
      try {
        const data = await home.getSeries();
        setSeries(data || []);
      } catch (error) {
        console.error('Error fetching series:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSeries();
  }, [initialSeries]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(series.length - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [series.length]);

  const selectedSeries = series[selectedIndex] || null;

  if (isLoading) {
    return <TopSeriesSkeleton />;
  }

  if (series.length === 0) return null;

  return (
    <section className="mt-8 md:mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-white">Top Series</h2>
        <Link
          href="/series"
          className="group flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-4 lg:gap-6 items-start lg:items-stretch">
        <VerticalSeriesList series={series} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
        <SeriesSidePanel series={selectedSeries} />
      </div>
    </section>
  );
}

// ============================================
// Vertical Series List Component
// ============================================

interface VerticalSeriesListProps {
  series: Series[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

function VerticalSeriesList({ series, selectedIndex, onSelect }: VerticalSeriesListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const selectedItem = list.children[selectedIndex] as HTMLElement;
    if (!selectedItem) return;

    const listRect = list.getBoundingClientRect();
    const itemRect = selectedItem.getBoundingClientRect();
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

    if (isDesktop) {
      const fullyVisible = itemRect.top >= listRect.top && itemRect.bottom <= listRect.bottom;
      if (!fullyVisible) {
        const targetTop = selectedItem.offsetTop - list.clientHeight / 2 + selectedItem.clientHeight / 2;
        list.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' });
      }
    } else {
      const fullyVisible = itemRect.left >= listRect.left && itemRect.right <= listRect.right;
      if (!fullyVisible) {
        const targetLeft =
          selectedItem.offsetLeft - list.clientWidth / 2 + selectedItem.clientWidth / 2;
        list.scrollTo({ left: Math.max(targetLeft, 0), behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const handleItemClick = useCallback(
    (index: number, item: Series) => {
      if (window.innerWidth < 1024) {
        router.push(`/series/${item.uuid || item.id}`);
      } else {
        onSelect(index);
      }
    },
    [onSelect, router]
  );

  return (
    <div className="lg:w-[320px] xl:w-[340px] flex-shrink-0 relative lg:h-full">
      <div className="hidden lg:flex items-center justify-between text-xs text-white/40 mb-2 px-1">
        <span>{series.length} series</span>
        <div className="flex items-center gap-1">
          <ChevronUp className="w-3 h-3" />
          <ChevronDown className="w-3 h-3" />
          <span>to navigate</span>
        </div>
      </div>

      <div
        ref={listRef}
        className="flex lg:flex-col gap-3 lg:gap-1.5 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:h-full lg:max-h-full pb-2 lg:pb-0 lg:pr-3 scroll-smooth series-list-scroll"
      >
        {series.map((item, index) => (
          <SeriesListItem
            key={item.uuid || item.id}
            item={item}
            index={index}
            isSelected={index === selectedIndex}
            onClick={() => handleItemClick(index, item)}
          />
        ))}
      </div>

      <div className="lg:hidden flex justify-center mt-3">
        <div className="flex gap-1">
          {series.slice(0, Math.min(series.length, 8)).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-colors',
                i === selectedIndex ? 'bg-white' : 'bg-white/20'
              )}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .series-list-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
        .series-list-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .series-list-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .series-list-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .series-list-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        @media (max-width: 1023px) {
          .series-list-scroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .series-list-scroll::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================
// Series List Item Component
// ============================================

interface SeriesListItemProps {
  item: Series;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

function SeriesListItem({ item, index, isSelected, onClick }: SeriesListItemProps) {
  const thumbnail = item.card_thumbnail || item.thumbnail || item.trailer_thumbnail;
  const isNew = item.latest;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex-shrink-0 w-[140px] lg:w-full flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 p-1.5 lg:p-2 rounded-lg transition-all duration-200 text-left border border-transparent',
        isSelected ? 'bg-white/10 border-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.25)]' : 'bg-transparent hover:bg-white/5'
      )}
    >
      <div className="relative w-full lg:w-20 aspect-video lg:aspect-[16/10] rounded-md overflow-hidden flex-shrink-0">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={item.title}
            fill
            sizes="(max-width: 1024px) 140px, 80px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-hover flex items-center justify-center">
            <Film className="w-5 h-5 text-white/30" />
          </div>
        )}

        <div className="lg:hidden absolute top-1 left-1 w-4 h-4 bg-black/70 rounded flex items-center justify-center">
          <span className="text-[9px] font-bold text-white">{index + 1}</span>
        </div>

        {isNew && (
          <div className="absolute top-1 right-1 px-1 py-0.5 bg-red-primary text-white text-[7px] font-bold rounded">
            NEW
          </div>
        )}

        {isSelected && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-3 h-3 text-black fill-black ml-0.5" />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="hidden lg:flex items-center gap-1.5 mb-0.5">
          <span
            className={cn(
              'text-sm font-bold transition-colors',
              isSelected ? 'text-white' : 'text-white/30'
            )}
          >
            #{index + 1}
          </span>
        </div>

        <h3
          className={cn(
            'font-medium text-xs lg:text-sm line-clamp-2 lg:line-clamp-1 transition-colors',
            isSelected ? 'text-white' : 'text-white/70 group-hover:text-white'
          )}
        >
          {item.title}
        </h3>

        <div className="flex flex-wrap items-center gap-2 mt-1">
          <p className="text-[10px] lg:text-xs text-white/60">{item.videos_count || 0} episodes</p>
          {item.channel?.name && (
            <span className="text-[10px] lg:text-xs text-white/40 truncate">
              {item.channel.name}
            </span>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-2 mt-2">
          <Link
            href={`/series/${item.uuid || item.id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-[11px] font-medium transition-colors"
          >
            View series
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <ChevronRight
        className={cn(
          'hidden lg:block w-4 h-4 flex-shrink-0 transition-all',
          isSelected
            ? 'text-white opacity-100 translate-x-0'
            : 'text-white/20 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
        )}
      />
    </button>
  );
}

// ============================================
// Series Side Panel Component
// ============================================

interface SeriesSidePanelProps {
  series: Series | null;
}

function SeriesSidePanel({ series }: SeriesSidePanelProps) {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [saved, setSaved] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isSaved, toggleSave } = useSavedVideosStore();
  const router = useRouter();
  const seriesHref = series ? `/series/${series.uuid || series.id}` : '#';

  useEffect(() => {
    if (series?.id) {
      setSaved(isSaved(series.id));
    }
  }, [series?.id, isSaved]);

  useEffect(() => {
    setIsVideoReady(false);
    setIsVideoPlaying(false);

    if (series?.trailer_url && videoRef.current) {
      videoRef.current.load();
      const playTimer = setTimeout(() => {
        videoRef.current?.play().then(() => {
          setIsVideoPlaying(true);
        }).catch(() => {});
      }, 300);

      return () => clearTimeout(playTimer);
    }
  }, [series?.uuid, series?.trailer_url]);

  const handleSave = useCallback(() => {
    if (!series?.id) return;
    const savedVideo: SavedVideo = {
      id: series.id,
      title: series.title,
      thumbnail: series.thumbnail || null,
      channelName: series.channel?.name || null,
      savedAt: Date.now(),
    };
    const newState = toggleSave(savedVideo);
    setSaved(newState);
  }, [series, toggleSave]);

  const handlePlay = useCallback(() => {
    if (seriesHref !== '#') {
      router.push(seriesHref);
    }
  }, [router, seriesHref]);

  if (!series) {
    return (
      <div className="hidden lg:flex flex-1 min-h-[520px] bg-surface/30 rounded-xl items-center justify-center">
        <p className="text-white/40">Select a series to view details</p>
      </div>
    );
  }

  const thumbnail = series.card_thumbnail || series.thumbnail || series.trailer_thumbnail;
  const description = series.description || series.title;

  return (
    <div className="hidden lg:block flex-1 min-w-0 h-full">
      <div className="bg-surface/40 rounded-xl overflow-hidden border border-white/5 h-full flex flex-col">
        <div className="relative aspect-video">
          {thumbnail && (
            <Image
              src={thumbnail}
              alt={series.title}
              fill
              className={cn(
                'object-cover transition-opacity duration-500',
                isVideoPlaying && isVideoReady ? 'opacity-0' : 'opacity-100'
              )}
              priority
            />
          )}

          {series.trailer_url && (
            <video
              ref={videoRef}
              className={cn(
                'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
                isVideoPlaying && isVideoReady ? 'opacity-100' : 'opacity-0'
              )}
              muted
              loop
              playsInline
              preload="auto"
              onCanPlayThrough={() => setIsVideoReady(true)}
            >
              <source src={series.trailer_url} type="video/mp4" />
            </video>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <button
              onClick={handlePlay}
              className="w-14 h-14 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all hover:scale-110"
            >
              <Play className="w-6 h-6 text-black fill-black ml-0.5" />
            </button>
          </div>

          <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg flex items-center gap-2">
            <Film className="w-4 h-4 text-white/70" />
            <span className="text-sm font-medium text-white">
              {series.videos_count || 0} Episodes
            </span>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2">
            {series.title}
          </h3>

          <div className="flex flex-wrap items-center gap-2 text-sm text-white/60 mb-4">
            {series.latest && (
              <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-medium rounded">
                NEW
              </span>
            )}
            <span className="px-2 py-0.5 bg-white/10 text-white/70 text-xs font-medium rounded">
              HD
            </span>
            {series.videos_count > 0 && (
              <span className="flex items-center gap-1 text-white/50">
                <Clock className="w-3.5 h-3.5" />
                {series.videos_count} episodes
              </span>
            )}
          </div>

          {series.channel && (
            <Link
              href={`/creators/creator-profile/${series.channel.uuid || series.channel.id}`}
              className="inline-flex items-center gap-3 mb-4 group"
            >
              {series.channel.dp ? (
                <div className="relative w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/10 group-hover:ring-white/30 transition-all">
                  <Image
                    src={series.channel.dp}
                    alt={series.channel.name || 'Creator'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {series.channel.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-white/90 group-hover:text-white transition-colors">
                  {series.channel.name}
                </p>
                {series.channel.subscribers_count !== undefined && (
                  <p className="text-xs text-white/40">
                    {formatCompactNumber(series.channel.subscribers_count)} subscribers
                  </p>
                )}
              </div>
            </Link>
          )}

          {description && (
            <p className="text-sm text-white/60 leading-relaxed line-clamp-3 mb-5">
              {description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-auto">
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-white/90 text-black font-medium rounded-lg transition-colors"
            >
              <Play className="w-4 h-4 fill-black" />
              Watch Now
            </button>

            <button
              onClick={handleSave}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors',
                saved
                  ? 'bg-white/15 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white'
              )}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Save
                </>
              )}
            </button>

            <Link
              href={seriesHref}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white/80 hover:text-white font-medium rounded-lg transition-colors ml-auto"
            >
              View Series
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Skeleton Loading State
// ============================================

function TopSeriesSkeleton() {
  return (
    <section className="mt-10 md:mt-12">
      <div className="flex items-center justify-between mb-5">
        <div className="h-7 w-32 bg-surface rounded animate-pulse" />
        <div className="h-5 w-20 bg-surface rounded animate-pulse" />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div className="lg:w-[320px] xl:w-[340px] flex-shrink-0">
          <div className="flex lg:flex-col gap-3 lg:gap-1.5 overflow-hidden">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[140px] lg:w-full flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 p-1.5 lg:p-2 rounded-lg"
              >
                <div className="w-full lg:w-20 aspect-video lg:aspect-[16/10] rounded-md bg-surface animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-3/4 bg-surface rounded animate-pulse" />
                  <div className="h-2.5 w-1/2 bg-surface rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:block flex-1 min-h-[520px] bg-surface/30 rounded-2xl animate-pulse" />
      </div>
    </section>
  );
}
