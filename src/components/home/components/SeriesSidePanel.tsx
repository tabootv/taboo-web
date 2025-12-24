/**
 * Series side panel component showing selected series details
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, Plus, Check, ChevronRight, Clock, Film } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCompactNumber } from '@/lib/utils';
import { useSavedVideosStore, type SavedVideo } from '@/lib/stores/saved-videos-store';
import type { Series } from '@/types';

interface SeriesSidePanelProps {
  series: Series | null;
}

export function SeriesSidePanel({ series }: SeriesSidePanelProps) {
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

