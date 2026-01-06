'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { creatorsClient } from '@/api/client';
import type { Creator, Video, Series } from '@/types';
import { formatDuration } from '@/lib/utils';

export default function CreatorPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const creatorId = Number(id);

  const [creator, setCreator] = useState<Creator | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (isNaN(creatorId)) {
        setError('Invalid creator ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const creatorData = await creators.get(creatorId);
        setCreator(creatorData);

        const videosData = await creators.getVideos(creatorId, { sort_by: 'newest' });
        setVideos(videosData.data?.slice(0, 6) || []);

        const seriesData = await creators.getSeries(creatorId, { sort_by: 'newest' });
        setSeries(seriesData.data?.slice(0, 4) || []);
      } catch (err) {
        console.error('Failed to fetch creator:', err);
        setError('Failed to load creator profile');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [creatorId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-border border-t-red-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading creator profile...</p>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-text-secondary">{error || 'Creator not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative pb-20">
        {/* Banner */}
        <div className="relative h-[300px] w-full">
          {creator.banner ? (
            <Image
              src={creator.banner}
              alt=""
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-primary to-red-deep" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative max-w-[800px] mx-auto -mt-[100px] px-6 text-center z-10">
          {/* Avatar */}
          <div className="relative w-[150px] h-[150px] mx-auto mb-6 rounded-full overflow-hidden border-4 border-black bg-surface">
            {creator.dp ? (
              <Image
                src={creator.dp}
                alt={creator.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center">
                <span className="text-5xl font-bold text-white">
                  {creator.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Name */}
          <h1 className="text-4xl font-bold text-white mb-4">{creator.name}</h1>

          {/* Bio */}
          <p className="text-lg text-text-secondary max-w-[600px] mx-auto mb-8 leading-relaxed">
            {creator.description}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-12 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{creator.videos_count || 0}</div>
              <div className="text-sm text-text-tertiary uppercase tracking-wide">Videos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{creator.short_videos_count || creator.shorts_count || 0}</div>
              <div className="text-sm text-text-tertiary uppercase tracking-wide">Shorts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{creator.series_count || 0}</div>
              <div className="text-sm text-text-tertiary uppercase tracking-wide">Series</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{creator.followers_count || 0}</div>
              <div className="text-sm text-text-tertiary uppercase tracking-wide">Followers</div>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href={`/creators/creator-profile/${creatorId}`}
            className="inline-block px-12 py-4 bg-red-primary hover:bg-red-hover text-white text-lg font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(171,0,19,0.4)]"
          >
            View Full Profile on TabooTV
          </Link>
        </div>
      </div>

      {/* Latest Videos */}
      {videos.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold text-white mb-6">Latest Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Link
                key={video.uuid}
                href={`/videos/${video.id}`}
                className="group"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-surface">
                  {video.thumbnail && (
                    <Image
                      src={video.thumbnail_webp || video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {video.duration && (
                    <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/85 text-white text-xs font-medium rounded">
                      {formatDuration(video.duration)}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 font-semibold text-white line-clamp-2 group-hover:text-red-primary transition-colors">
                  {video.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Series */}
      {series.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold text-white mb-6">Series</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {series.map((item) => (
              <Link
                key={item.uuid}
                href={`/series/${item.uuid}`}
                className="group"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-surface">
                  {item.thumbnail && (
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-sm text-text-secondary">{item.videos_count} episodes</span>
                  </div>
                </div>
                <h3 className="mt-3 font-bold text-white group-hover:text-red-primary transition-colors">
                  {item.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Subscribe CTA */}
      <section className="text-center py-20 bg-gradient-to-b from-black to-surface">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to unlock all content?</h2>
        <p className="text-lg text-text-secondary mb-8">Subscribe to TabooTV for unlimited access to all creators</p>
        <Link
          href="/plans"
          className="inline-block px-16 py-5 bg-gradient-to-r from-red-primary to-red-dark text-white text-xl font-bold rounded-2xl transition-all hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_16px_48px_rgba(171,0,19,0.5)]"
        >
          Subscribe Now
        </Link>
      </section>
    </div>
  );
}
