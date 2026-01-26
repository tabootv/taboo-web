'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Play, Edit, Trash2, Eye, ThumbsUp, MoreVertical } from 'lucide-react';
import type { Video } from '@/types';
import { Button } from '@/components/ui/button';
import { LoadingScreen, Spinner } from '@/components/ui/spinner';
import { formatCompactNumber } from '@/shared/utils/formatting';
import { useAuthStore } from '@/shared/stores/auth-store';
import { toast } from 'sonner';
import { apiClient } from '@/api/client/base-client';

export default function ContentShortsPage() {
  const { user } = useAuthStore();
  const [shortsList, setShortsList] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchShorts = useCallback(async (pageNum: number, reset = false) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      interface ShortsResponse {
        videos?: { data?: Video[]; current_page?: number; last_page?: number };
        data?: Video[];
        current_page?: number;
        last_page?: number;
      }
      const response = await apiClient.get<ShortsResponse>('/contents/shorts', {
        params: { page: pageNum },
      });
      const newShorts = response.videos?.data || response.data || [];

      if (reset) {
        setShortsList(newShorts);
      } else {
        setShortsList((prev) => [...prev, ...newShorts]);
      }

      const pagination = response.videos || response;
      setHasMore((pagination.current_page ?? 1) < (pagination.last_page ?? 1));
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch shorts:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (user?.is_creator) {
      fetchShorts(1, true);
    }
  }, [fetchShorts, user?.is_creator]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoadingMore) {
          fetchShorts(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, isLoadingMore, page, fetchShorts]);

  const handleDelete = async (short: Video) => {
    if (!confirm('Are you sure you want to delete this short?')) return;

    try {
      await apiClient.delete(`/contents/shorts/${short.uuid}`);
      setShortsList((prev) => prev.filter((s) => s.uuid !== short.uuid));
      toast.success('Short deleted');
    } catch {
      toast.error('Failed to delete short');
    }
  };

  if (!user?.is_creator) {
    return <LoadingScreen message="Checking access..." />;
  }

  if (isLoading) {
    return <LoadingScreen message="Loading your shorts..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Shorts</h1>
          <p className="text-text-secondary mt-1">Manage your uploaded shorts</p>
        </div>
        <Link href="/contents/shorts/create">
          <Button className="btn-premium">
            <Plus className="w-4 h-4 mr-2" />
            Upload Short
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <Link
          href="/contents/videos"
          className="px-6 py-3 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          Videos
        </Link>
        <Link
          href="/contents/shorts"
          className="px-6 py-3 text-sm font-medium text-red-primary border-b-2 border-red-primary"
        >
          Shorts
        </Link>
      </div>

      {/* Shorts Grid */}
      {shortsList.length === 0 ? (
        <div className="text-center py-12">
          <Play className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">No shorts yet</h2>
          <p className="text-text-secondary mb-4">Upload your first short to get started</p>
          <Link href="/contents/shorts/create">
            <Button className="btn-premium">
              <Plus className="w-4 h-4 mr-2" />
              Upload Short
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {shortsList.map((short) => (
            <ShortCard key={short.uuid} short={short} onDelete={() => handleDelete(short)} />
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

function ShortCard({ short, onDelete }: { short: Video; onDelete: () => void }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative group">
      {/* Thumbnail */}
      <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-hover">
        {short.thumbnail && (
          <Image
            src={short.thumbnail_webp || short.thumbnail}
            alt={short.title}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Stats overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-xs line-clamp-2 mb-2">{short.title}</p>
          <div className="flex items-center gap-3 text-xs text-white/80">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatCompactNumber(short.views_count ?? 0)}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              {formatCompactNumber(short.likes_count ?? 0)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 bg-black/50 hover:bg-black/70 rounded-full"
            >
              <MoreVertical className="w-4 h-4 text-white" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-28 bg-surface border border-border rounded-lg shadow-lg z-50">
                  <Link
                    href={`/contents/shorts/${short.uuid}/show`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-hover"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                  <Link
                    href={`/contents/shorts/${short.uuid}/edit`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-hover"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-hover"
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
    </div>
  );
}
