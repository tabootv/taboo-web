import { studioClient } from '@/api/client/studio.client';
import type { TagOption } from '@/api/client/public.client';
import { toast } from 'sonner';
import type { ModalStep, PublishMode, EditVideoData } from './types';
import { MIN_TAGS_FOR_VIDEO } from './constants';

/**
 * Generate wizard steps based on content type
 */
export function getSteps(isShort: boolean): { id: ModalStep; label: string }[] {
  return [
    { id: 'details', label: 'Details' },
    { id: 'location', label: 'Location' },
    ...(isShort ? [] : [{ id: 'tags', label: 'Tags' } as const]),
    { id: 'content-rating', label: 'Rating' },
    { id: 'publishing', label: 'Publishing' },
  ];
}

/**
 * Get visibility info text based on publish mode
 */
export function getVisibilityInfoText(publishMode: PublishMode): string {
  if (publishMode === 'none') return 'Your video will be saved as a private draft.';
  if (publishMode === 'auto') return 'Your video will become public once processing is complete.';
  return 'Your video will become public at the scheduled time.';
}

/**
 * Format bytes for display
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Format date for datetime-local input
 */
export function formatDateForInput(date: Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Get minimum datetime (now)
 */
export function getMinDateTime(): string {
  return formatDateForInput(new Date());
}

/**
 * Convert tag IDs to slugs
 */
export function convertTagsToSlugs(tagIds: number[], availableTags: TagOption[]): string[] {
  return tagIds
    .map((id) => availableTags.find((t) => t.id === id)?.slug)
    .filter((slug): slug is string => Boolean(slug));
}

/**
 * Derive publish mode from edit video data
 */
export function derivePublishMode(editVideo: EditVideoData): PublishMode {
  if (editVideo.publishMode) return editVideo.publishMode;
  if (editVideo.visibility === 'live') return 'auto';
  return 'none';
}

/**
 * Check if user can proceed to next step
 */
export function canProceedToNext(
  mode: 'upload' | 'edit',
  currentStep: ModalStep,
  title: string,
  tags: number[],
  isShort: boolean
): boolean {
  if (mode === 'edit') return true;
  if (currentStep === 'details') return title.trim().length > 0;
  if (currentStep === 'tags' && !isShort) return tags.length >= MIN_TAGS_FOR_VIDEO;
  return true;
}

/**
 * Determine if tags should be fetched
 */
export function shouldFetchTagsNow(
  currentStep: ModalStep,
  isShort: boolean,
  availableTagsLength: number,
  isLoadingTags: boolean,
  mode: 'upload' | 'edit',
  pendingTagNamesLength: number
): boolean {
  const needsForStep =
    currentStep === 'tags' && !isShort && availableTagsLength === 0 && !isLoadingTags;
  const needsForEditMode =
    mode === 'edit' && pendingTagNamesLength > 0 && availableTagsLength === 0 && !isLoadingTags;
  return needsForStep || needsForEditMode;
}

/**
 * Get close confirmation message based on upload state
 */
export function getCloseConfirmMessage(uploadPhase: string): string | null {
  const isActivelyUploading = uploadPhase === 'uploading' || uploadPhase === 'preparing';
  const isProcessing = uploadPhase === 'processing';
  if (isActivelyUploading)
    return 'Upload is in progress. It will continue in the background. Close anyway?';
  if (isProcessing)
    return 'Video is being processed. It will continue in the background. Close anyway?';
  return null;
}

/**
 * Get next step ID
 */
export function getNextStepId(
  steps: { id: ModalStep; label: string }[],
  currentStep: ModalStep
): ModalStep | null {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);
  if (currentIndex < steps.length - 1) return steps[currentIndex + 1]?.id ?? null;
  return null;
}

/**
 * Get previous step ID
 */
export function getPrevStepId(
  steps: { id: ModalStep; label: string }[],
  currentStep: ModalStep
): ModalStep | null {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);
  if (currentIndex > 0) return steps[currentIndex - 1]?.id ?? null;
  return null;
}

/**
 * Build metadata object for update
 */
export function buildMetadataPayload(
  title: string,
  description: string,
  tags: number[],
  availableTags: TagOption[],
  isAdultContent: boolean,
  location: string,
  countryId: number | null,
  isShort: boolean,
  publishMode: PublishMode,
  scheduledAt: Date | null
): Record<string, unknown> {
  const metadata: Record<string, unknown> = { title };
  if (description) metadata.description = description;
  if (tags.length > 0) {
    metadata.tags = tags;
    const slugs = convertTagsToSlugs(tags, availableTags);
    if (slugs.length > 0) metadata.tagSlugs = slugs;
  }
  metadata.isAdultContent = isAdultContent;
  if (location) metadata.location = location;
  if (countryId) metadata.countryId = countryId;
  if (!isShort) metadata.publishMode = publishMode;
  if (publishMode === 'scheduled' && scheduledAt) metadata.scheduledAt = scheduledAt;
  return metadata;
}

/**
 * Handle schedule API transitions
 */
export async function handleScheduleTransition(
  editVideo: EditVideoData,
  publishMode: PublishMode,
  scheduledAt: Date | null
): Promise<void> {
  const originalMode = editVideo.publishMode || (editVideo.visibility === 'live' ? 'auto' : 'none');
  const isOriginallyLive = editVideo.visibility === 'live';
  const hasOriginalSchedule = editVideo.publishMode === 'scheduled';

  if (publishMode === originalMode) return;

  if (isOriginallyLive) {
    if (publishMode === 'none') {
      toast.error('Live videos cannot be unpublished');
    }
    return;
  }

  if (publishMode === 'auto') {
    await studioClient.createSchedule(editVideo.uuid, { publish_mode: 'auto' });
  } else if (publishMode === 'scheduled' && scheduledAt) {
    if (hasOriginalSchedule) {
      await studioClient.updateSchedule(editVideo.uuid, {
        scheduled_at: scheduledAt.toISOString(),
      });
    } else {
      await studioClient.createSchedule(editVideo.uuid, {
        publish_mode: 'scheduled',
        scheduled_at: scheduledAt.toISOString(),
      });
    }
  } else if (publishMode === 'none' && hasOriginalSchedule) {
    await studioClient.deleteSchedule(editVideo.uuid);
  }
}
