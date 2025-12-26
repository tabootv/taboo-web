'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Play, Edit, Trash2, Eye, ThumbsUp, Clock, MoreVertical } from 'lucide-react';
import { videos as videosApi } from '@/lib/api';
import type { Video } from '@/types';
import { Button, LoadingScreen, Spinner } from '@/components/ui';
import { formatCompactNumber, formatDuration, formatRelativeTime } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';

export default function ContentVideosPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [videosList, setVideosList] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Redirect if not a creator
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user && !user.is_creator) {
      router.push('/home');
      toast.error('You need to be a creator to access this page');
    }
  }, [isAuthenticated, user, router]);

  const fetchVideos = useCallback(async (pageNum: number, reset = false) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      // Fetch creator's own videos
      const { data } = await apiClient.get('/contents/videos', { params: { page: pageNum } });
      const newVideos = data.videos?.data || data.data || [];

      if (reset) {
        setVideosList(newVideos);
      } else {
        setVideosList((prev) => [...prev, ...newVideos]);
      }

      const pagination = data.videos || data;
      setHasMore(pagination.current_page < pagination.last_page);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (user?.is_creator) {
      fetchVideos(1, true);
    }
  }, [fetchVideos, user?.is_creator]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoadingMore) {
          fetchVideos(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, isLoadingMore, page, fetchVideos]);

  const handleDelete = async (video: Video) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      await videosApi.deleteComment(video.uuid); // This should be a delete video endpoint
      setVideosList((prev) => prev.filter((v) => v.uuid !== video.uuid));
      toast.success('Video deleted');
    } catch {
      toast.error('Failed to delete video');
    }
  };

  if (!user?.is_creator) {
    return <LoadingScreen message="Checking access..." />;
  }

  if (isLoading) {
    return <LoadingScreen message="Loading your videos..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Videos</h1>
          <p className="text-text-secondary mt-1">Manage your uploaded videos</p>
        </div>
        <Link href="/contents/videos/create">
          <Button className="btn-premium">
            <Plus className="w-4 h-4 mr-2" />
            Upload Video
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <Link
          href="/contents/videos"
          className="px-6 py-3 text-sm font-medium text-red-primary border-b-2 border-red-primary"
        >
          Videos
        </Link>
        <Link
          href="/contents/shorts"
          className="px-6 py-3 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          Shorts
        </Link>
      </div>

      {/* Videos List */}
      {videosList.length === 0 ? (
        <div className="text-center py-12">
          <Play className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">No videos yet</h2>
          <p className="text-text-secondary mb-4">Upload your first video to get started</p>
          <Link href="/contents/videos/create">
            <Button className="btn-premium">
              <Plus className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {videosList.map((video) => (
            <VideoCard
              key={video.uuid}
              video={video}
              onDelete={() => handleDelete(video)}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      <div ref={loadMoreRef} className="mt-8 flex justify-center">
        {isLoadingMore && <Spinner size="lg" />}
      </div>
    </div>
  );
}

function VideoCard({ video, onDelete }: { video: Video; onDelete: () => void }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex gap-4 p-4 bg-surface rounded-lg border border-border">
      {/* Thumbnail */}
      <div className="relative w-48 aspect-video rounded-lg overflow-hidden bg-hover flex-shrink-0">
        {video.thumbnail && (
          <Image
            src={video.thumbnail_webp || video.thumbnail}
            alt={video.title}
            fill
            className="object-cover"
          />
        )}
        {video.duration && (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-text-primary line-clamp-2">{video.title}</h3>
        {video.description && (
          <p className="text-sm text-text-secondary mt-1 line-clamp-2">{video.description}</p>
        )}
        <div className="flex items-center gap-4 mt-3 text-sm text-text-secondary">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {formatCompactNumber(video.views_count ?? 0)}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            {formatCompactNumber(video.likes_count ?? 0)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatRelativeTime(video.published_at)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-start gap-2">
        <Link href={`/contents/videos/${video.id}/show`}>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
        </Link>
        <Link href={`/contents/videos/${video.id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
        </Link>
        <div className="relative">
          <Button variant="outline" size="sm" onClick={() => setShowMenu(!showMenu)}>
            <MoreVertical className="w-4 h-4" />
          </Button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-32 bg-surface border border-border rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-hover"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
