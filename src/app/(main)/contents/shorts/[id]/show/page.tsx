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

export default function ShowShortPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [short, setShort] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchShort() {
      try {
        setIsLoading(true);
        const { data } = await apiClient.get(`/contents/shorts/${id}`);
        setShort(data.video || data.data || data);
      } catch (err) {
        console.error('Failed to fetch short:', err);
        toast.error('Failed to load short');
        router.push('/contents/shorts');
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.is_creator) {
      fetchShort();
    }
  }, [id, router, user?.is_creator]);

  if (isLoading || !short) {
    return <LoadingScreen message="Loading short..." />;
  }

  const hasVideoUrl = short.url_720 || short.url_480 || short.hls_url;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/contents/shorts"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shorts
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Short Preview</h1>
          <div className="flex items-center gap-2">
            <Link href={`/shorts?id=${short.uuid}`} target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Public
              </Button>
            </Link>
            <Link href={`/contents/shorts/${id}/edit`}>
              <Button size="sm" className="btn-premium">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Video Player - Vertical format */}
        <div className="flex justify-center">
          <div className="w-full max-w-[300px] aspect-[9/16] rounded-xl overflow-hidden bg-black">
            {hasVideoUrl ? (
              <VideoPlayer
                thumbnail={short.thumbnail || ''}
                url_720={short.url_720 ?? null}
                url_480={short.url_480 ?? null}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full relative flex items-center justify-center">
                {short.thumbnail && (
                  <Image src={short.thumbnail} alt={short.title} fill className="object-cover" />
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <p className="text-white">Video not available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          {/* Title & Description */}
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-4">{short.title}</h2>

            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-4">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {formatCompactNumber(short.views_count ?? 0)} views
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" />
                {formatCompactNumber(short.likes_count ?? 0)} likes
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {formatCompactNumber(short.comments_count ?? 0)} comments
              </span>
              {short.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(short.duration)}
                </span>
              )}
            </div>

            {short.description && (
              <div className="p-4 bg-surface rounded-lg border border-border">
                <h3 className="font-medium text-text-primary mb-2">Description</h3>
                <p className="text-text-secondary whitespace-pre-wrap">{short.description}</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-surface rounded-lg border border-border p-4">
            <h3 className="font-medium text-text-primary mb-4">Short Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Published</span>
                <span className="text-text-primary">{formatRelativeTime(short.published_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Status</span>
                <span className="text-green-500">Published</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Content Type</span>
                <span className="text-text-primary">
                  {short.is_adult_content ? 'Adult' : 'General'}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {short.tags && short.tags.length > 0 && (
            <div className="bg-surface rounded-lg border border-border p-4">
              <h3 className="font-medium text-text-primary mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {short.tags.map((tag) => (
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
