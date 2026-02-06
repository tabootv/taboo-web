'use client';

import {
  useCreateSchedule,
  useDeleteSchedule,
  useDeleteShort,
  useDeleteStudioPost,
  useDeleteVideo,
  useToggleVideoHidden,
  useUpdateSchedule,
} from '@/api/mutations/studio.mutations';
import { useStudioPosts, useStudioShorts, useStudioVideos } from '@/api/queries/studio.queries';
import { Button } from '@/components/ui/button';
import { UploadModal } from '@/features/upload';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useUploadStore } from '@/shared/stores/upload-store';
import type { StudioVideoListItem } from '@/types/studio';
import { Upload } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useContentFilters } from './_hooks/use-content-filters';
import {
  deriveProcessingStatus,
  deriveVideoDisplayState,
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
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<ContentType>('videos');
  const [videosPage, setVideosPage] = useState(1);
  const [shortsPage, setShortsPage] = useState(1);
  const [postsPage, setPostsPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<EditVideoData | null>(null);
  // Resume mode: uploadId for resuming an in-progress upload
  const [resumeUploadId, setResumeUploadId] = useState<string | null>(null);

  // Track if we've processed this uploadId to prevent re-triggers
  const processedUploadIdRef = useRef<string | null>(null);

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
  const createScheduleMutation = useCreateSchedule();
  const updateScheduleMutation = useUpdateSchedule();
  const deleteScheduleMutation = useDeleteSchedule();
  const toggleHiddenMutation = useToggleVideoHidden();

  /**
   * Handle uploadId query parameter - opens modal for background upload
   * Supports both in-progress (resume mode) and complete (edit mode) uploads
   */
  const uploadId = searchParams.get('uploadId');
  useEffect(() => {
    // Skip if no uploadId or already processed
    if (!uploadId || processedUploadIdRef.current === uploadId) return;

    const upload = useUploadStore.getState().getUpload(uploadId);
    if (!upload) {
      window.history.replaceState(null, '', '/studio/content');
      return;
    }

    // Mark as processed BEFORE opening modal to prevent race conditions
    processedUploadIdRef.current = uploadId;

    // Set modal open in store (prevents auto-clear)
    useUploadStore.getState().setModalOpen(uploadId, true);

    const isInProgress = ['preparing', 'uploading', 'processing'].includes(upload.phase);
    const isComplete = upload.phase === 'complete';

    if (isInProgress || upload.isStale) {
      // Resume mode: open modal attached to existing upload
      setResumeUploadId(uploadId);
    } else if (isComplete && upload.videoUuid) {
      // Edit mode: build edit data from store
      const editData: EditVideoData = {
        id: upload.videoId ?? 0,
        uuid: upload.videoUuid,
        title: upload.metadata.title,
        visibility: 'draft',
        isShort: upload.contentType === 'short',
      };

      // Map optional metadata fields
      if (upload.metadata.description) editData.description = upload.metadata.description;
      if (upload.metadata.tags?.length) editData.tags = upload.metadata.tags;
      if (upload.metadata.location) editData.location = upload.metadata.location;
      if (upload.metadata.countryId) editData.countryId = upload.metadata.countryId;
      if (upload.metadata.publishMode) editData.publishMode = upload.metadata.publishMode;
      if (upload.metadata.scheduledAt) editData.scheduledAt = upload.metadata.scheduledAt;

      // Open the edit modal
      setEditingVideo(editData);
    }

    // Clean up URL to prevent re-triggering on page refresh
    // Use replaceState instead of router.replace to avoid triggering Next.js navigation
    // which can cause auth state race conditions and extra history entries
    window.history.replaceState(null, '', '/studio/content');
  }, [uploadId]);

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
      hidden: item.hidden,
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
          // Use UUID-based delete endpoint
          await deleteVideoMutation.mutateAsync(item.uuid);
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
    async (item: ContentItem, visibility: Visibility, scheduledAt?: Date) => {
      // Find the raw video to check current state
      const rawVideo = videosData?.videos?.find((v) => v.id === item.id);
      const hasSchedule = !!rawVideo?.publish_schedule?.scheduled_at;
      const isPublished = rawVideo?.published === true;

      try {
        if (visibility === 'live' && !isPublished) {
          // Draft -> Live: POST /schedule with auto
          await createScheduleMutation.mutateAsync({
            videoUuid: item.uuid,
            payload: { publish_mode: 'auto' },
          });
          toast.success('Published');
        } else if (visibility === 'scheduled' && scheduledAt) {
          if (hasSchedule) {
            // Scheduled -> Scheduled (edit): PATCH /schedule
            await updateScheduleMutation.mutateAsync({
              videoUuid: item.uuid,
              payload: { scheduled_at: scheduledAt.toISOString() },
            });
            toast.success('Schedule updated');
          } else {
            // Draft -> Scheduled: POST /schedule
            await createScheduleMutation.mutateAsync({
              videoUuid: item.uuid,
              payload: { publish_mode: 'scheduled', scheduled_at: scheduledAt.toISOString() },
            });
            toast.success('Scheduled for publication');
          }
        }
        // Note: Live -> Draft NOT SUPPORTED by backend (handled in UI by hiding that option)
      } catch {
        toast.error('Failed to update visibility');
      }
    },
    [videosData?.videos, createScheduleMutation, updateScheduleMutation]
  );

  const handleScheduleCancel = useCallback(
    async (item: ContentItem) => {
      try {
        // Scheduled -> Draft: DELETE /schedule
        await deleteScheduleMutation.mutateAsync(item.uuid);
        toast.success('Schedule cancelled');
      } catch {
        toast.error('Failed to cancel schedule');
      }
    },
    [deleteScheduleMutation]
  );

  const handleToggleHidden = useCallback(
    async (item: ContentItem) => {
      try {
        const response = await toggleHiddenMutation.mutateAsync(item.uuid);
        const newState = response.data.hidden ? 'hidden from listings' : 'visible in listings';
        toast.success(`Video is now ${newState}`);
      } catch {
        toast.error('Failed to toggle visibility');
      }
    },
    [toggleHiddenMutation]
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
    setResumeUploadId(null);
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
        isOpen={isUploadModalOpen || !!resumeUploadId}
        {...(resumeUploadId ? { resumeUploadId } : {})}
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
            onScheduleCancel={handleScheduleCancel}
            onToggleHidden={handleToggleHidden}
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
