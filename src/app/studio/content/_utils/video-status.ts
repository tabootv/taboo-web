import type { StudioVideoListItem, VideoDisplayState, ProcessingStatus } from '@/types/studio';
import type { VideoStatusFilter } from '../_types/filters';

/**
 * Derive the display state of a video based on API fields
 *
 * Priority order:
 * 1. If bunny_status < 3 OR processing=true -> 'processing'
 * 2. If published=true -> 'live'
 * 3. If publish_schedule exists -> 'scheduled'
 * 4. Otherwise -> 'draft'
 */
export function deriveVideoDisplayState(video: StudioVideoListItem): VideoDisplayState {
  // Non-Bunny legacy videos: if published with published_at and uuid, treat as live
  if (!video.is_bunny_video && video.published === true && video.published_at && video.uuid) {
    return 'live';
  }

  // Check if video is still processing
  if (video.processing === true) {
    return 'processing';
  }

  // Bunny status: 0=queued, 1=processing, 2=encoding, 3=finished
  if (video.bunny_status !== undefined && video.bunny_status < 3) {
    return 'processing';
  }

  // Check if video is published/live
  if (video.published === true) {
    return 'live';
  }

  // Check if video is scheduled
  if (video.publish_schedule?.scheduled_at) {
    return 'scheduled';
  }

  // Default to draft
  return 'draft';
}

/**
 * Derive the processing status for progress display
 */
export function deriveProcessingStatus(video: StudioVideoListItem): ProcessingStatus {
  // Non-Bunny legacy videos: if published with published_at and uuid, treat as ready
  if (!video.is_bunny_video && video.published === true && video.published_at && video.uuid) {
    return 'ready';
  }

  if (video.processing === true) {
    return 'processing';
  }

  // Bunny status: 0=queued, 1=processing, 2=encoding, 3=finished
  if (video.bunny_status !== undefined) {
    if (video.bunny_status === 0) {
      return 'uploading';
    }
    if (video.bunny_status < 3) {
      return 'processing';
    }
  }

  return 'ready';
}

/**
 * Check if a video matches the given filter
 */
export function matchesFilter(video: StudioVideoListItem, filter: VideoStatusFilter): boolean {
  if (filter === 'all') {
    return true;
  }

  const displayState = deriveVideoDisplayState(video);

  switch (filter) {
    case 'processing':
      return displayState === 'processing';
    case 'published':
      // Only show as published if processing is complete
      return displayState === 'live';
    case 'draft':
      return displayState === 'draft';
    case 'scheduled':
      return displayState === 'scheduled';
    default:
      return true;
  }
}

/**
 * Filter an array of videos by status
 */
export function filterVideosByStatus(
  videos: StudioVideoListItem[],
  filter: VideoStatusFilter
): StudioVideoListItem[] {
  if (filter === 'all') {
    return videos;
  }
  return videos.filter((video) => matchesFilter(video, filter));
}
