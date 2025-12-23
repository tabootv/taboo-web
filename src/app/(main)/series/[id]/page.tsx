'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Clock, CheckCircle, ChevronDown, Info } from 'lucide-react';
import { series as seriesApi } from '@/lib/api';
import type { Series, Video, Channel } from '@/types';
import { VideoPlayer } from '@/components/video/video-player';
import { cn, formatDuration } from '@/lib/utils';

export default function SeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.id as string;
  const [seriesData, setSeriesData] = useState<Series | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchSeries() {
      try {
        setIsLoading(true);
        const series = await seriesApi.getSeriesDetail(seriesId);
        setSeriesData(series);
        const videosList = series?.videos || [];
        setVideos(videosList);
      } catch (error) {
        console.error('Failed to fetch series:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (seriesId) {
      fetchSeries();
    }
  }, [seriesId]);

  const handleTrailerEnded = () => {
    setShowTrailer(false);
    if (videos.length > 0) {
      router.push(`/series/${seriesId}/play/${videos[0].uuid}`);
    }
  };

  const handlePlaySeries = () => {
    if (videos.length > 0) {
      router.push(`/series/${seriesId}/play/${videos[0].uuid}`);
    }
  };

  const handleWatchTrailer = () => {
    setShowTrailer(true);
    heroRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Calculate total duration
  const totalDuration = videos.reduce((acc, v) => acc + (v.duration || 0), 0);

  if (isLoading) {
    return <SeriesPageSkeleton />;
  }

  if (!seriesData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Series not found</h1>
          <Link href="/series" className="text-red-primary hover:underline">
            Back to series
          </Link>
        </div>
      </div>
    );
  }

  const heroImage = seriesData.trailer_thumbnail || seriesData.thumbnail || seriesData.card_thumbnail;
  const isCourse = seriesData.module_type === 'course';

  return (
    <div className="min-h-screen bg-background">
      {/* Netflix-style Hero Section */}
      <div ref={heroRef} className="relative">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 h-[80vh] min-h-[550px]">
          {heroImage && (
            <Image
              src={heroImage}
              alt={seriesData.title}
              fill
              className="object-cover"
              priority
            />
          )}
          {/* Multi-layer gradient overlay for cinematic effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 pt-16 pb-8 min-h-[80vh] flex flex-col justify-end">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
            {/* Trailer Player (shows when clicked) */}
            {showTrailer && seriesData.trailer_url && (
              <div className="mb-8 max-w-4xl animate-fade-in">
                <VideoPlayer
                  thumbnail={heroImage}
                  url_1080={seriesData.trailer_url}
                  autoplay={true}
                  onEnded={handleTrailerEnded}
                />
              </div>
            )}

            {/* Series Info */}
            {!showTrailer && (
              <div className="max-w-2xl space-y-5 animate-fade-in">
                {/* Series Badge */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-primary text-white text-sm font-bold rounded tracking-wide">
                    <Play className="w-3.5 h-3.5 fill-white" />
                    {isCourse ? 'COURSE' : 'SERIES'}
                  </span>
                  {seriesData.categories?.map((cat) => (
                    <span
                      key={cat.id}
                      className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white/90 text-sm rounded border border-white/10"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                  {seriesData.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/70 text-sm">
                  <span className="text-green-400 font-semibold px-2 py-0.5 bg-green-400/10 rounded">New</span>
                  <span>{seriesData.humans_publish_at}</span>
                  <span className="flex items-center gap-1.5">
                    <Play className="w-4 h-4" />
                    {videos.length} {videos.length === 1 ? 'Episode' : 'Episodes'}
                  </span>
                  {totalDuration > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {formatDuration(totalDuration)} total
                    </span>
                  )}
                </div>

                {/* Description */}
                {seriesData.description && (
                  <div className="relative">
                    <p
                      className={cn(
                        'text-base sm:text-lg text-white/80 leading-relaxed transition-all duration-300',
                        !isDescriptionExpanded && 'line-clamp-3'
                      )}
                    >
                      {seriesData.description}
                    </p>
                    {seriesData.description.length > 150 && (
                      <button
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="mt-2 text-white/60 hover:text-white text-sm flex items-center gap-1 transition-colors"
                      >
                        {isDescriptionExpanded ? 'Show less' : 'Show more'}
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 transition-transform duration-200',
                            isDescriptionExpanded && 'rotate-180'
                          )}
                        />
                      </button>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                  <button
                    onClick={handlePlaySeries}
                    disabled={videos.length === 0}
                    className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white hover:bg-white/90 text-black font-semibold rounded-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Play className="w-5 sm:w-6 h-5 sm:h-6 fill-black" />
                    <span>Play</span>
                  </button>
                  {seriesData.trailer_url && !showTrailer && (
                    <button
                      onClick={handleWatchTrailer}
                      className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-md backdrop-blur-sm transition-all border border-white/10"
                    >
                      <Info className="w-5 h-5" />
                      <span>Trailer</span>
                    </button>
                  )}
                </div>

                {/* Creator Info */}
                <Link
                  href={`/creators/creator-profile/${seriesData.channel?.id}`}
                  className="inline-flex items-center gap-3 pt-2 group"
                >
                  <div className="relative">
                    {seriesData.channel?.dp ? (
                      <Image
                        src={seriesData.channel.dp}
                        alt={seriesData.channel.name || 'Creator'}
                        width={44}
                        height={44}
                        className="rounded-full object-cover ring-2 ring-white/20 group-hover:ring-red-primary/50 transition-all"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center ring-2 ring-white/20">
                        <span className="text-base font-bold text-white">
                          {(seriesData.channel?.name || 'C').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <VerifiedBadge size={16} />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-medium group-hover:text-red-primary transition-colors">
                      {seriesData.channel?.name}
                    </p>
                    <p className="text-white/50 text-xs">Creator</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <div className="relative z-20 pt-8 pb-16">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              {isCourse ? 'Course Episodes' : 'Episodes'}
            </h2>
            <span className="text-white/50 text-sm">
              {videos.length} {videos.length === 1 ? 'episode' : 'episodes'}
            </span>
          </div>

          {/* Episode Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video, index) => (
              <EpisodeCard
                key={video.uuid}
                video={video}
                episodeNumber={index + 1}
                seriesId={seriesId}
                channel={seriesData.channel}
                isCourse={isCourse}
              />
            ))}
          </div>

          {videos.length === 0 && (
            <div className="text-center py-16 bg-surface/30 rounded-2xl border border-white/5">
              <Play className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 text-lg">No episodes available yet</p>
              <p className="text-white/40 text-sm mt-2">Check back soon for new content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Episode Card Component
function EpisodeCard({
  video,
  episodeNumber,
  seriesId,
  channel,
  isCourse,
}: {
  video: Video;
  episodeNumber: number;
  seriesId: string;
  channel?: Channel;
  isCourse: boolean;
}) {
  const href = isCourse
    ? `/courses/${seriesId}/play/${video.uuid}`
    : `/series/${seriesId}/play/${video.uuid}`;

  return (
    <Link href={href} className="group block">
      <div className="relative bg-surface/40 rounded-xl overflow-hidden transition-all duration-300 hover:bg-surface/70 hover:ring-1 hover:ring-white/10 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/30">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          {video.thumbnail ? (
            <Image
              src={video.thumbnail_webp || video.thumbnail}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-surface to-background" />
          )}

          {/* Play Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 shadow-lg">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-black fill-black ml-0.5" />
            </div>
          </div>

          {/* Duration Badge */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-xs font-medium text-white">
              {formatDuration(video.duration)}
            </div>
          )}

          {/* Episode Number */}
          <div className="absolute top-2 left-2 px-2.5 py-1 bg-red-primary/90 backdrop-blur-sm rounded text-xs font-bold text-white">
            {isCourse ? 'EP' : 'PART'} {episodeNumber}
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          <h3 className="text-white font-medium line-clamp-2 mb-2 group-hover:text-red-primary transition-colors text-sm sm:text-base">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-white/50 text-xs sm:text-sm line-clamp-2 mb-3">
              {video.description}
            </p>
          )}
          <div className="flex items-center gap-1.5 text-white/40 text-xs">
            <span className="truncate">{video.channel?.name || channel?.name}</span>
            <CheckCircle className="w-3 h-3 text-red-primary flex-shrink-0" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// Skeleton Loader
function SeriesPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Skeleton */}
      <div className="relative h-[80vh] min-h-[550px]">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-surface/20 to-surface/10" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-[1800px] mx-auto">
          <div className="max-w-2xl space-y-4">
            <div className="h-7 w-24 bg-surface/50 rounded animate-pulse" />
            <div className="h-12 sm:h-16 w-3/4 bg-surface/50 rounded animate-pulse" />
            <div className="h-5 w-1/2 bg-surface/50 rounded animate-pulse" />
            <div className="h-20 w-full bg-surface/50 rounded animate-pulse" />
            <div className="flex gap-4">
              <div className="h-12 w-28 bg-surface/50 rounded animate-pulse" />
              <div className="h-12 w-28 bg-surface/50 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Skeleton */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 w-48 bg-surface/50 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-surface/40 rounded-xl overflow-hidden">
              <div className="aspect-video bg-surface/50 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-3/4 bg-surface/50 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-surface/50 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Verified Badge Component
function VerifiedBadge({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 0L9.79611 1.52786L12.1244 1.52786L12.7023 3.76393L14.7023 5.04508L14.0489 7.29814L14.7023 9.55119L12.7023 10.8323L12.1244 13.0684L9.79611 13.0684L8 14.5963L6.20389 13.0684L3.87564 13.0684L3.29772 10.8323L1.29772 9.55119L1.95106 7.29814L1.29772 5.04508L3.29772 3.76393L3.87564 1.52786L6.20389 1.52786L8 0Z"
        fill="#AB0013"
      />
      <path d="M5.5 7.5L7 9L10.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
