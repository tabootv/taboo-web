'use client';

import { useSeriesDetail } from '@/api/queries';
import { cn, formatDuration } from '@/lib/utils';
import type { Series, Video } from '@/types';
import { ChevronDown, Clock, Info, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { EpisodeCard, SeriesPageSkeleton, TrailerModal } from '@/components/series';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';

export default function SeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.id as string;
  const { data: seriesData, isLoading } = useSeriesDetail(seriesId);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const videos = seriesData?.videos || [];

  const handleTrailerEnded = () => {
    setShowTrailer(false);
    const firstVideo = videos[0];
    if (firstVideo?.uuid) {
      router.push(`/series/${seriesId}/play/${firstVideo.uuid}`);
    }
  };

  const handlePlaySeries = () => {
    const firstVideo = videos[0];
    if (firstVideo?.uuid) {
      router.push(`/series/${seriesId}/play/${firstVideo.uuid}`);
    }
  };

  const handleWatchTrailer = () => {
    setShowTrailer(true);
  };

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

  const heroImage =
    seriesData.trailer_thumbnail || seriesData.thumbnail || seriesData.card_thumbnail;
  const isCourse = seriesData.module_type === 'course';

  return (
    <div className="min-h-screen bg-background">
      <div ref={heroRef} className="relative">
        <div className="absolute inset-0 h-[80vh] min-h-[550px]">
          {heroImage && (
            <Image src={heroImage} alt={seriesData.title} fill className="object-cover" priority />
          )}

          <div className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 pt-16 pb-8 min-h-[80vh] flex flex-col justify-end">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl space-y-5 animate-fade-in">
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

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                  {seriesData.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/70 text-sm">
                  <span className="text-green-400 font-semibold px-2 py-0.5 bg-green-400/10 rounded">
                    New
                  </span>
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

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                  <button
                    onClick={handlePlaySeries}
                    disabled={videos.length === 0}
                    className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white hover:bg-white/90 text-black font-semibold rounded-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Play className="w-5 sm:w-6 h-5 sm:h-6 fill-black" />
                    <span>Play</span>
                  </button>
                  {seriesData.trailer_url && (
                    <button
                      onClick={handleWatchTrailer}
                      className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-md backdrop-blur-sm transition-all border border-white/10"
                    >
                      <Info className="w-5 h-5" />
                      <span>Trailer</span>
                    </button>
                  )}
                </div>

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
                      <div className="w-11 h-11 rounded-full bg-linear-to-br from-red-primary to-red-dark flex items-center justify-center ring-2 ring-white/20">
                        <span className="text-base font-bold text-white">
                          {(seriesData.channel?.name || 'C').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <VerifiedBadge size={14} />
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
          </div>
        </div>
      </div>

      <div className="relative z-20 pt-8 pb-16">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              {isCourse ? 'Course Episodes' : 'Episodes'}
            </h2>
            <span className="text-white/50 text-sm">
              {videos.length} {videos.length === 1 ? 'episode' : 'episodes'}
            </span>
          </div>

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

      <TrailerModal
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        trailerUrl={seriesData.trailer_url || ''}
        thumbnail={heroImage || ''}
        title={seriesData.title}
        onEnded={handleTrailerEnded}
      />
    </div>
  );
}
