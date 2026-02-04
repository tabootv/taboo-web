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
import type { PublicationMode, StudioVideoListItem } from '@/types/studio';
import { Upload } from 'lucide-react';
import { Suspense, useCallback, useMemo, useState } from 'react';
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
import {
  deriveVideoDisplayState,
  deriveProcessingStatus,
  filterVideosByStatus,
} from './_utils/video-status';

interface EditVideoData {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  tags?: number[];
  tagNames?: string[];
  isAdultContent?: boolean;
  visibility: 'live' | 'draft';
  isShort: boolean;
  location?: string;
  countryId?: number;
  latitude?: number;
  longitude?: number;
  publishMode?: 'none' | 'auto' | 'scheduled';
  scheduledAt?: string;
  thumbnailUrl?: string;
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

  const {
    data: videosData,
    isLoading: isLoadingVideos,
    refetch: refetchVideos,
  } = useStudioVideos({
    page: videosPage,
    per_page: 20,
    types: ['videos', 'series'],
    sort_by: filters.sortBy === 'newest' ? 'latest' : 'oldest',
  });
  const {
    data: shortsData,
    isLoading: isLoadingShorts,
    refetch: refetchShorts,
  } = useStudioShorts(creatorId, shortsPage, {
    status: filters.status,
    sortBy: filters.sortBy,
  });
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
   * Transform API video item to ContentItem for UI display
   * Uses deriveVideoDisplayState for visibility and deriveProcessingStatus for processing
   */
  const transformToContentItem = useCallback((item: StudioVideoListItem): ContentItem => {
    const result: ContentItem = {
      id: item.id,
      uuid: item.uuid,
      title: item.title,
      description: item.description,
      thumbnail: item.thumbnail,
      visibility: deriveVideoDisplayState(item) as Visibility,
      scheduled_at: item.publish_schedule?.scheduled_at,
      processing_status: deriveProcessingStatus(item),
      restrictions: [],
      comments_count: item.comments_count || 0,
      likes_count: item.likes_count || 0,
      created_at: item.created_at,
      published_at: item.published_at,
      duration: item.duration,
    };

    // Use bunny_encode_progress if available, otherwise fall back to progress
    const progressValue = item.bunny_encode_progress ?? item.progress;
    if (progressValue !== undefined) {
      result.processing_progress = progressValue;
    }
    return result;
  }, []);

  // Apply client-side filtering based on status filter
  const videos: ContentItem[] = useMemo(() => {
    const allVideos = videosData?.videos || [];
    const filtered = filterVideosByStatus(allVideos, filters.status);
    return filtered.map((v) => transformToContentItem(v));
  }, [videosData?.videos, filters.status, transformToContentItem]);

  const shorts: ContentItem[] = useMemo(() => {
    const allShorts = shortsData?.videos || [];
    const filtered = filterVideosByStatus(allShorts, filters.status);
    return filtered.map((v) => transformToContentItem(v));
  }, [shortsData?.videos, filters.status, transformToContentItem]);

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
      // Get raw StudioVideoListItem to access all fields
      const rawVideo = (activeTab === 'shorts' ? shortsData?.videos : videosData?.videos)?.find(
        (v) => v.id === item.id
      );

      // Map visibility to edit values (only 'live' or 'draft' for editing)
      // Processing and scheduled states are treated as draft for editing purposes
      const editVisibility: 'live' | 'draft' = item.visibility === 'live' ? 'live' : 'draft';

      // Build edit data carefully for exactOptionalPropertyTypes
      const editData: EditVideoData = {
        id: item.id,
        uuid: item.uuid,
        title: item.title,
        visibility: editVisibility,
        isShort: activeTab === 'shorts',
      };

      // Map optional fields from ContentItem
      if (item.description) editData.description = item.description;

      // Map optional fields from raw API data
      if (rawVideo?.tags) editData.tagNames = rawVideo.tags; // string[] from API
      if (rawVideo?.location) editData.location = rawVideo.location;
      if (rawVideo?.country_id) editData.countryId = rawVideo.country_id;
      if (rawVideo?.latitude) editData.latitude = rawVideo.latitude;
      if (rawVideo?.longitude) editData.longitude = rawVideo.longitude;
      if (rawVideo?.thumbnail) editData.thumbnailUrl = rawVideo.thumbnail;

      // Derive publish mode from schedule or visibility
      if (rawVideo?.publish_schedule?.scheduled_at) {
        editData.scheduledAt = rawVideo.publish_schedule.scheduled_at;
        editData.publishMode = 'scheduled';
      } else if (editVisibility === 'live') {
        editData.publishMode = 'auto';
      } else {
        editData.publishMode = 'none';
      }

      setEditingVideo(editData);
    },
    [activeTab, videosData?.videos, shortsData?.videos]
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

      // Map UI visibility to API publish_mode
      const publishModeMap: Record<Visibility, PublicationMode> = {
        live: 'auto',
        draft: 'none',
        scheduled: 'scheduled',
        processing: 'none', // Processing videos default to draft mode
      };

      const payload = { publish_mode: publishModeMap[visibility] };

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

        const visibilityLabel = visibility === 'live' ? 'Published' : 'Saved as draft';
        toast.success(visibilityLabel);
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
