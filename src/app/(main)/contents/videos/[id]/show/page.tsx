'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Edit, Eye, ThumbsUp, MessageCircle, Clock, ExternalLink } from 'lucide-react';
import { Button, LoadingScreen } from '@/components/ui';
import { VideoPlayer } from '@/features/video';
import { useAuthStore } from '@/lib/stores';
import { formatCompactNumber, formatDuration, formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';
import { apiClient } from '@/api/client';
import type { Video } from '@/types';

export default function ShowVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();

  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchVideo() {
      try {
        setIsLoading(true);
        const response = await apiClient.get<{ video?: Video; data?: Video } | Video>(`/contents/videos/${id}`);
        const videoData = response && typeof response === 'object' && 'video' in response
          ? response.video
          : response && typeof response === 'object' && 'data' in response
            ? response.data
            : response as Video;
        setVideo(videoData ?? null);
      } catch (err) {
        console.error('Failed to fetch video:', err);
        toast.error('Failed to load video');
        router.push('/contents/videos');
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.is_creator) {
      fetchVideo();
    }
  }, [id, router, user?.is_creator]);

  if (isLoading || !video) {
    return <LoadingScreen message="Loading video..." />;
  }

  const hasVideoUrl = video.url_720 || video.url_480 || video.hls_url;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/contents/videos"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Videos
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Video Preview</h1>
          <div className="flex items-center gap-2">
            <Link href={`/videos/${video.id}`} target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Public
              </Button>
            </Link>
            <Link href={`/contents/videos/${id}/edit`}>
              <Button size="sm" className="btn-premium">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="aspect-video rounded-xl overflow-hidden bg-black mb-6">
        {hasVideoUrl ? (
          <VideoPlayer
            thumbnail={video.thumbnail || ''}
            url_1080={video.url_1080 ?? null}
            url_720={video.url_720 ?? null}
            url_480={video.url_480 ?? null}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {video.thumbnail && (
              <Image src={video.thumbnail} alt={video.title} fill className="object-cover" />
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <p className="text-white">Video not available</p>
            </div>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-text-primary">{video.title}</h2>

          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {formatCompactNumber(video.views_count ?? 0)} views
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              {formatCompactNumber(video.likes_count ?? 0)} likes
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {formatCompactNumber(video.comments_count ?? 0)} comments
            </span>
            {video.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(video.duration)}
              </span>
            )}
          </div>

          {video.description && (
            <div className="p-4 bg-surface rounded-lg border border-border">
              <h3 className="font-medium text-text-primary mb-2">Description</h3>
              <p className="text-text-secondary whitespace-pre-wrap">{video.description}</p>
            </div>
          )}
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          <div className="bg-surface rounded-lg border border-border p-4">
            <h3 className="font-medium text-text-primary mb-4">Video Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Published</span>
                <span className="text-text-primary">{formatRelativeTime(video.published_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Status</span>
                <span className="text-green-500">Published</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Visibility</span>
                <span className="text-text-primary">{video.is_free ? 'Free' : 'Premium'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Content Type</span>
                <span className="text-text-primary">
                  {video.is_adult_content ? 'Adult' : 'General'}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="bg-surface rounded-lg border border-border p-4">
              <h3 className="font-medium text-text-primary mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 bg-hover text-text-secondary text-sm rounded"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
