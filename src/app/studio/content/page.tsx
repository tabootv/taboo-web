'use client';

import {
  useDeleteShort,
  useDeleteStudioPost,
  useDeleteVideo,
  useUpdateShortVisibility,
  useUpdateVideoVisibility,
} from '@/api/mutations/studio.mutations';
import { useStudioPosts, useStudioShorts, useStudioVideos } from '@/api/queries/studio.queries';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/shared/stores/auth-store';
import type { ContentVisibility, StudioVideoListItem } from '@/types/studio';
import { Upload } from 'lucide-react';
import { Suspense, useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
  ContentTable,
  ContentTabs,
  PostsTable,
  type ContentItem,
  type ContentType,
  type PostItem,
  type Visibility,
} from '../_components/content-table';
import { ContentFilterBar } from '../_components/content-table/ContentFilterBar';
import { UploadModal } from '../upload/_components/UploadModal';
import { useContentFilters } from './_hooks/use-content-filters';

interface EditVideoData {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  tags?: number[];
  isAdultContent?: boolean;
  visibility: 'public' | 'private' | 'unlisted';
  isShort: boolean;
}

function ContentPageInner() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ContentType>('videos');
  const [videosPage, setVideosPage] = useState(1);
  const [shortsPage, setShortsPage] = useState(1);
  const [postsPage, setPostsPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<EditVideoData | null>(null);

  const { filters, setFilters } = useContentFilters();

  const creatorId = user?.id;
  const channelId = user?.channel?.id;

  // Map filter types for API
  const apiFilters = {
    status: filters.status,
    sortBy: filters.sortBy,
  };

  const {
    data: videosData,
    isLoading: isLoadingVideos,
    refetch: refetchVideos,
  } = useStudioVideos(creatorId, videosPage, apiFilters);
  const {
    data: shortsData,
    isLoading: isLoadingShorts,
    refetch: refetchShorts,
  } = useStudioShorts(creatorId, shortsPage, apiFilters);
  const {
    data: postsData,
    isLoading: isLoadingPosts,
    refetch: refetchPosts,
  } = useStudioPosts(channelId, postsPage);

  const deleteVideoMutation = useDeleteVideo();
  const deleteShortMutation = useDeleteShort();
  const deletePostMutation = useDeleteStudioPost();
  const updateVideoVisibilityMutation = useUpdateVideoVisibility();
  const updateShortVisibilityMutation = useUpdateShortVisibility();

  /**
   * Map video item to processing status based on API fields
   */
  const mapProcessingStatus = useCallback(
    (item: StudioVideoListItem): 'uploading' | 'processing' | 'ready' | 'failed' => {
      if (item.processing) return 'processing';

      // Bunny status: 0=queued, 1=processing, 2=encoding, 3=finished, 4=failed
      if (item.bunny_status !== undefined) {
        if (item.bunny_status === 4) return 'failed';
        if (item.bunny_status < 3) return 'processing';
      }

      // Draft without published_at likely still processing
      if (item.status === 'draft' && !item.published_at) return 'processing';

      return 'ready';
    },
    []
  );

  const transformToContentItem = useCallback(
    (item: NonNullable<typeof videosData>['videos'][0]): ContentItem => {
      const result: ContentItem = {
        id: item.id,
        uuid: item.uuid,
        title: item.title,
        description: item.description,
        thumbnail_url: item.thumbnail_url,
        visibility: (item.status === 'published' ? 'public' : 'private') as Visibility,
        scheduled_at: undefined,
        processing_status: mapProcessingStatus(item),
        restrictions: [],
        comments_count: item.comments_count || 0,
        likes_count: item.likes_count || 0,
        created_at: item.created_at,
        published_at: item.published_at,
        duration: item.duration,
      };

      if (item.progress !== undefined) {
        result.processing_progress = item.progress;
      }
      return result;
    },
    [mapProcessingStatus]
  );

  const videos: ContentItem[] = videosData?.videos?.map((v) => transformToContentItem(v)) || [];
  const shorts: ContentItem[] = shortsData?.videos?.map((v) => transformToContentItem(v)) || [];

  const posts: PostItem[] =
    postsData?.posts?.map((p) => ({
      id: p.id,
      uuid: p.uuid,
      body: p.body,
      created_at: p.created_at,
      published_at: p.published_at,
      likes_count: p.likes_count || 0,
      comments_count: p.comments_count || 0,
    })) || [];

  const currentItems = activeTab === 'videos' ? videos : shorts;
  const currentPagination =
    activeTab === 'videos' ? videosData?.pagination : shortsData?.pagination;
  const isLoading =
    activeTab === 'videos'
      ? isLoadingVideos
      : activeTab === 'shorts'
        ? isLoadingShorts
        : isLoadingPosts;

  const handlePageChange = useCallback(
    (page: number) => {
      if (activeTab === 'videos') {
        setVideosPage(page);
      } else if (activeTab === 'shorts') {
        setShortsPage(page);
      } else {
        setPostsPage(page);
      }
    },
    [activeTab]
  );

  const handleEdit = useCallback(
    (item: ContentItem) => {
      // Map visibility to supported edit values (convert draft/scheduled to private)
      let editVisibility: 'public' | 'private' | 'unlisted' = 'private';
      if (
        item.visibility === 'public' ||
        item.visibility === 'private' ||
        item.visibility === 'unlisted'
      ) {
        editVisibility = item.visibility;
      }

      // Build edit data carefully for exactOptionalPropertyTypes
      const editData: EditVideoData = {
        id: item.id,
        uuid: item.uuid,
        title: item.title,
        visibility: editVisibility,
        isShort: activeTab === 'shorts',
      };
      if (item.description) editData.description = item.description;

      setEditingVideo(editData);
    },
    [activeTab]
  );

  const handleDelete = useCallback(
    async (item: ContentItem) => {
      const isShort = activeTab === 'shorts';
      try {
        if (isShort) {
          await deleteShortMutation.mutateAsync(item.id);
          refetchShorts();
        } else {
          await deleteVideoMutation.mutateAsync(item.id);
          refetchVideos();
        }
        toast.success(`${isShort ? 'Short' : 'Video'} deleted successfully`);
      } catch {
        toast.error(`Failed to delete ${isShort ? 'short' : 'video'}`);
      }
    },
    [activeTab, deleteVideoMutation, deleteShortMutation, refetchVideos, refetchShorts]
  );

  const handleVisibilityChange = useCallback(
    async (item: ContentItem, visibility: Visibility) => {
      const isShort = activeTab === 'shorts';
      const payload = { visibility: visibility as ContentVisibility };

      try {
        if (isShort) {
          await updateShortVisibilityMutation.mutateAsync({
            videoId: item.id,
            payload,
          });
          refetchShorts();
        } else {
          await updateVideoVisibilityMutation.mutateAsync({
            videoId: item.id,
            payload,
          });
          refetchVideos();
        }
        toast.success(`Visibility updated to ${visibility}`);
      } catch {
        toast.error('Failed to update visibility');
      }
    },
    [
      activeTab,
      updateVideoVisibilityMutation,
      updateShortVisibilityMutation,
      refetchVideos,
      refetchShorts,
    ]
  );

  const handlePostEdit = useCallback((item: PostItem) => {
    // Posts still navigate to separate edit page
    window.location.href = `/studio/posts/${item.uuid}/edit`;
  }, []);

  const handlePostDelete = useCallback(
    async (item: PostItem) => {
      try {
        await deletePostMutation.mutateAsync(item.id);
        refetchPosts();
        toast.success('Post deleted successfully');
      } catch {
        toast.error('Failed to delete post');
      }
    },
    [deletePostMutation, refetchPosts]
  );

  const handleUpload = useCallback(() => {
    setIsUploadModalOpen(true);
  }, []);

  const handleUploadSuccess = useCallback(() => {
    refetchVideos();
    refetchShorts();
    toast.success('Video published successfully');
  }, [refetchVideos, refetchShorts]);

  const handleCloseUploadModal = useCallback(() => {
    setIsUploadModalOpen(false);
  }, []);

  const handleEditSuccess = useCallback(() => {
    setEditingVideo(null);
    refetchVideos();
    refetchShorts();
  }, [refetchVideos, refetchShorts]);

  const handleCloseEditModal = useCallback(() => {
    setEditingVideo(null);
  }, []);

  return (
    <div className="p-6 lg:p-8">
      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={handleCloseUploadModal}
        onSuccess={handleUploadSuccess}
      />

      {/* Edit Modal */}
      {editingVideo && (
        <UploadModal
          isOpen={true}
          mode="edit"
          editVideo={editingVideo}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-text-tertiary">Creator studio</p>
          <h1 className="text-3xl font-bold text-text-primary">Channel content</h1>
        </div>
        <Button onClick={handleUpload} className="bg-red-primary hover:bg-red-primary/90">
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>

      <ContentTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        videosCount={videosData?.pagination?.total}
        shortsCount={shortsData?.pagination?.total}
        postsCount={postsData?.pagination?.total}
      />

      {/* Filter bar - only show for videos and shorts, not posts */}
      {activeTab !== 'posts' && <ContentFilterBar filters={filters} onFilterChange={setFilters} />}

      <div className="mt-4">
        {activeTab === 'posts' ? (
          <PostsTable
            items={posts}
            isLoading={isLoadingPosts}
            pagination={
              postsData?.pagination
                ? {
                    currentPage: postsData.pagination.current_page,
                    lastPage: postsData.pagination.last_page,
                    total: postsData.pagination.total,
                    perPage: postsData.pagination.per_page,
                  }
                : undefined
            }
            onPageChange={handlePageChange}
            onEdit={handlePostEdit}
            onDelete={handlePostDelete}
          />
        ) : (
          <ContentTable
            items={currentItems}
            isShort={activeTab === 'shorts'}
            isLoading={isLoading}
            pagination={
              currentPagination
                ? {
                    currentPage: currentPagination.current_page,
                    lastPage: currentPagination.last_page,
                    total: currentPagination.total,
                    perPage: currentPagination.per_page,
                  }
                : undefined
            }
            onPageChange={handlePageChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onVisibilityChange={handleVisibilityChange}
          />
        )}
      </div>
    </div>
  );
}

export default function ContentPage() {
  return (
    <Suspense fallback={<div className="p-6 lg:p-8">Loading...</div>}>
      <ContentPageInner />
    </Suspense>
  );
}
