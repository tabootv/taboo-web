'use client';

import { publicClient, type TagOption } from '@/api/client/public.client';
import { studioClient } from '@/api/client/studio.client';
import type { UpdateVideoPayload } from '@/api/types';
import { LocationPicker } from '@/app/studio/_components/LocationPicker';
import { useBeforeunloadWarning, useCircuitBreaker } from '@/app/studio/_hooks';
import { useImmediateUploadV2 } from '../../hooks';
import { Button } from '@/components/ui/button';
import { fileReferenceStore } from '@/shared/stores/file-reference-store';
import { cn } from '@/shared/utils/formatting';
import { AnalyticsEvent } from '@/shared/lib/analytics/events';
import { Lock, Upload as UploadIcon, X } from 'lucide-react';
import posthog from 'posthog-js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

import {
  CircuitBreakerErrorUI,
  FooterActionButton,
  StepIndicator,
  UploadProgressSection,
  VideoPreviewContent,
} from './components';
import { ContentRatingStep, DetailsStep, PublishingStep, TagsStep, ThumbnailStep } from './steps';
import type { EditVideoData, ModalStep, PublishMode } from './types';
import {
  buildMetadataPayload,
  canProceedToNext,
  convertTagsToSlugs,
  derivePublishMode,
  getCloseConfirmMessage,
  getNextStepId,
  getPrevStepId,
  getSteps,
  handleScheduleTransition,
  shouldFetchTagsNow,
} from './utils';

// Re-export types for external consumers
export type { EditVideoData, ModalStep, PublishMode };

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialFile?: File;
  // Edit mode props
  mode?: 'upload' | 'edit';
  editVideo?: EditVideoData;
  // Resume mode: ID for resuming an existing upload
  resumeUploadId?: string;
}

export function UploadModal({
  isOpen,
  onClose,
  onSuccess,
  initialFile,
  mode = 'upload',
  editVideo,
  resumeUploadId,
}: UploadModalProps) {
  const [mounted, setMounted] = useState(false);
  // currentStep is now derived from store-backed state.modalStep
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // visibility state is maintained for hydration compatibility (setter used, value unused)

  const [, setVisibility] = useState<'live' | 'draft'>('draft');

  // New metadata fields
  const [tags, setTags] = useState<number[]>([]);
  const [isAdultContent, setIsAdultContent] = useState(false);
  const [location, setLocation] = useState('');
  const [countryId, setCountryId] = useState<number | null>(null);
  const [publishMode, setPublishMode] = useState<PublishMode>('none');
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);

  // Tags loading state
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [pendingTagNames, setPendingTagNames] = useState<string[]>([]);

  // Thumbnail state
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [thumbnailSource, setThumbnailSource] = useState<'custom' | 'auto'>('auto');
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  // Ref guard to prevent multiple upload starts (fixes infinite loop)
  const uploadStartedRef = useRef(false);
  // Track metadata updates to debounce
  const metadataTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Track if form has been hydrated for current resumeUploadId (prevents race condition)
  const hasHydratedRef = useRef<string | null>(null);

  // Circuit breaker for infinite loop protection
  const { isTripped, trackRender, reset: resetCircuitBreaker, trace } = useCircuitBreaker();

  const {
    state,
    storeUploadId: _storeUploadId,
    storeUpload,
    startUpload,
    updateMetadata,
    publish,
    pauseUpload,
    resumeUpload,
    retryUpload,
    // cancel is not used because we allow background upload continuation
    reset,
    setModalStep,
    attachToUpload,
  } = useImmediateUploadV2({
    onUploadComplete: () => {
      // Upload complete, user can now fill in details
    },
    onPublishComplete: () => {
      onSuccess?.();
      handleClose();
    },
    onError: (error) => {
      console.error('Upload error:', error);
    },
  });

  // Warn user when closing browser during active upload
  const isActiveUpload = ['preparing', 'uploading', 'processing'].includes(state.uploadPhase);
  useBeforeunloadWarning(isActiveUpload);

  // Track renders for circuit breaker
  useEffect(() => {
    trackRender(`modal-render-phase:${state.uploadPhase}`);
  }, [trackRender, state.uploadPhase]);

  // Edit mode: local step state (edit mode doesn't have an upload entry, so store-backed modalStep won't work)
  const [editStep, setEditStep] = useState<ModalStep>('details');

  // Derive currentStep: edit mode uses local state; upload mode uses store-backed state
  const currentStep = mode === 'edit' ? editStep : (state.modalStep ?? 'details');

  // Compute dynamic steps based on content type
  // In edit mode, use editVideo.isShort; otherwise use detected type
  const isShort = mode === 'edit' ? (editVideo?.isShort ?? false) : state.detectedType === 'short';
  const steps = getSteps(isShort);

  // Edit mode: whether we're actively saving
  const [isSaving, setIsSaving] = useState(false);

  // Mode-aware step setter: edit mode uses local state, upload mode uses store
  const changeStep = useCallback(
    (step: ModalStep) => {
      if (mode === 'edit') {
        setEditStep(step);
      } else {
        setModalStep(step);
      }
    },
    [mode, setModalStep]
  );

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Initialize form fields when in edit mode
  useEffect(() => {
    if (!isOpen || mode !== 'edit' || !editVideo) return;

    // Reset step to first when entering edit mode
    setEditStep('details');

    // Basic fields
    setTitle(editVideo.title);
    setDescription(editVideo.description || '');
    setIsAdultContent(editVideo.isAdultContent || false);
    setVisibility(editVideo.visibility);

    // Tags - IDs directly or queue names for resolution
    const hasTags = editVideo.tags && editVideo.tags.length > 0;
    const hasTagNames = editVideo.tagNames && editVideo.tagNames.length > 0;
    if (hasTags) setTags(editVideo.tags!);
    else if (hasTagNames) setPendingTagNames(editVideo.tagNames!);

    // Location fields
    setLocation(editVideo.location || '');
    setCountryId(editVideo.countryId ?? null);

    // Publish mode - derive from data if not explicit
    setPublishMode(derivePublishMode(editVideo));

    // Scheduled date
    if (editVideo.scheduledAt) setScheduledAt(new Date(editVideo.scheduledAt));

    // Thumbnail preview (existing URL, not blob)
    if (editVideo.thumbnailUrl) {
      setThumbnailPreviewUrl(editVideo.thumbnailUrl);
      setThumbnailSource('auto');
    }
  }, [isOpen, mode, editVideo]);

  // Resume upload mode: attach to existing upload and hydrate form
  // Uses hasHydratedRef to prevent re-hydration race condition when debounced updates fire
  useEffect(() => {
    if (!isOpen || !resumeUploadId || mode === 'edit') return;

    // Skip if already hydrated for this uploadId (prevents race condition with debounced metadata sync)
    if (hasHydratedRef.current === resumeUploadId) return;

    const upload = attachToUpload(resumeUploadId);
    if (!upload) return;

    // Mark as hydrated BEFORE setting state to prevent re-runs
    hasHydratedRef.current = resumeUploadId;

    // Hydrate form fields from store metadata
    setTitle(upload.metadata.title || '');
    setDescription(upload.metadata.description || '');
    setTags(upload.metadata.tags || []);
    setIsAdultContent(upload.metadata.isAdultContent || false);
    setLocation(upload.metadata.location || '');
    setCountryId(upload.metadata.countryId ?? null);
    setPublishMode(upload.metadata.publishMode || 'none');
    if (upload.metadata.scheduledAt) {
      setScheduledAt(new Date(upload.metadata.scheduledAt));
    }
  }, [isOpen, resumeUploadId, mode, attachToUpload]);

  // Create video preview URL from file reference (for resume mode)
  // Note: videoPreviewUrl intentionally NOT in deps to prevent cleanup race condition
  useEffect(() => {
    const uploadId = resumeUploadId || _storeUploadId;
    if (!uploadId || mode === 'edit') return;

    // Check if we already have a preview URL (from initial file select)
    if (videoPreviewUrl) return;

    const file = fileReferenceStore.get(uploadId);
    if (!file) return;

    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);

    // Cleanup only on unmount or uploadId change, not on videoPreviewUrl change
    return () => URL.revokeObjectURL(url);
  }, [resumeUploadId, _storeUploadId, mode]);

  // Reset upload guard when modal closes
  useEffect(() => {
    if (!isOpen) {
      uploadStartedRef.current = false;
    }
  }, [isOpen]);

  // Start upload when file is provided (with ref guard to prevent infinite loop)
  useEffect(() => {
    if (isOpen && initialFile && !uploadStartedRef.current) {
      uploadStartedRef.current = true;
      startUpload(initialFile);
      setTitle(initialFile.name.replace(/\.[^/.]+$/, ''));
    }
  }, [isOpen, initialFile, startUpload]);

  useEffect(() => {
    if (initialFile && state.uploadPhase !== 'idle') {
      const url = URL.createObjectURL(initialFile);
      setVideoPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setVideoPreviewUrl(null);
      };
    }
    setVideoPreviewUrl(null);
    return undefined;
  }, [initialFile, state.uploadPhase]);

  // Fetch tags when Tags step becomes active (video only) or in edit mode with pending tag names
  useEffect(() => {
    if (
      !shouldFetchTagsNow(
        currentStep,
        isShort,
        availableTags.length,
        isLoadingTags,
        mode,
        pendingTagNames.length
      )
    ) {
      return;
    }
    const fetchTags = async () => {
      setIsLoadingTags(true);
      setTagsError(null);
      try {
        const tagsList = await publicClient.getTags();
        setAvailableTags(tagsList);
      } catch (err) {
        console.error('Failed to fetch tags:', err);
        setTagsError('Failed to load tags. Please try again.');
      } finally {
        setIsLoadingTags(false);
      }
    };
    fetchTags();
  }, [currentStep, isShort, availableTags.length, isLoadingTags, mode, pendingTagNames.length]);

  // Resolve tag names to IDs when tags list is available (edit mode)
  useEffect(() => {
    if (pendingTagNames.length > 0 && availableTags.length > 0) {
      const resolvedIds = pendingTagNames
        .map((name) => availableTags.find((t) => t.name.toLowerCase() === name.toLowerCase())?.id)
        .filter((id): id is number => id !== undefined);
      setTags(resolvedIds);
      setPendingTagNames([]);
    }
  }, [pendingTagNames, availableTags]);

  // Update metadata when form changes (debounced)
  useEffect(() => {
    if (metadataTimeoutRef.current) clearTimeout(metadataTimeoutRef.current);

    metadataTimeoutRef.current = setTimeout(() => {
      const metadata = buildMetadataPayload(
        title,
        description,
        tags,
        availableTags,
        isAdultContent,
        location,
        countryId,
        isShort,
        publishMode,
        scheduledAt
      );
      updateMetadata(metadata as Parameters<typeof updateMetadata>[0]);
    }, 300);

    return () => {
      if (metadataTimeoutRef.current) clearTimeout(metadataTimeoutRef.current);
    };
  }, [
    title,
    description,
    tags,
    availableTags,
    isAdultContent,
    location,
    countryId,
    publishMode,
    scheduledAt,
    isShort,
    updateMetadata,
  ]);

  const handleClose = useCallback(() => {
    // Flush pending metadata updates
    if (metadataTimeoutRef.current) {
      clearTimeout(metadataTimeoutRef.current);
      metadataTimeoutRef.current = null;
      const metadata = buildMetadataPayload(
        title,
        description,
        tags,
        availableTags,
        isAdultContent,
        location,
        countryId,
        isShort,
        publishMode,
        scheduledAt
      );
      updateMetadata(metadata as Parameters<typeof updateMetadata>[0]);
    }

    // Check for active upload and confirm close
    const confirmMessage = getCloseConfirmMessage(state.uploadPhase);
    if (confirmMessage) {
      if (!window.confirm(confirmMessage)) return;
    } else {
      reset();
    }

    // Reset form state
    hasHydratedRef.current = null;
    changeStep('details');
    setTitle('');
    setDescription('');
    setVisibility('draft');
    setTags([]);
    setPendingTagNames([]);
    setIsAdultContent(false);
    setLocation('');
    setCountryId(null);
    setPublishMode('none');
    setScheduledAt(null);

    // Clean up blob URLs
    if (thumbnailPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(thumbnailPreviewUrl);
    setThumbnailFile(null);
    setThumbnailPreviewUrl(null);
    setThumbnailSource('auto');

    if (videoPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(null);

    onClose();
  }, [
    state.uploadPhase,
    reset,
    onClose,
    thumbnailPreviewUrl,
    videoPreviewUrl,
    changeStep,
    updateMetadata,
    title,
    description,
    tags,
    availableTags,
    isAdultContent,
    location,
    countryId,
    isShort,
    publishMode,
    scheduledAt,
  ]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && !uploadStartedRef.current) {
        uploadStartedRef.current = true;
        posthog.capture(AnalyticsEvent.STUDIO_UPLOAD_STARTED, {
          content_type: 'video',
          file_size_mb: Math.round((file.size / 1024 / 1024) * 100) / 100,
        });
        startUpload(file);
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
        // Note: fileReferenceStore.set is called in startUpload via the hook
        setVideoPreviewUrl(URL.createObjectURL(file));
      }
      e.target.value = '';
    },
    [startUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('video/') && !uploadStartedRef.current) {
        uploadStartedRef.current = true;
        startUpload(file);
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    },
    [startUpload]
  );

  const handlePublish = useCallback(async () => {
    // Derive visibility from publishMode:
    // - draft (none) → draft
    // - publish-now (auto) → live
    // - scheduled → live (will be scheduled server-side)
    const derivedVisibility = publishMode === 'none' ? 'draft' : 'live';
    posthog.capture(AnalyticsEvent.STUDIO_CONTENT_PUBLISHED, {
      content_type: isShort ? 'short' : 'video',
      publish_mode: publishMode,
      has_tags: tags.length > 0,
      is_adult_content: isAdultContent,
    });
    await publish(derivedVisibility, thumbnailFile);
  }, [publish, publishMode, isShort, tags.length, isAdultContent, thumbnailFile]);

  // Save handler for edit mode - uses UUID-based endpoints with schedule API
  const handleSaveChanges = useCallback(async () => {
    if (!editVideo?.uuid) return;

    setIsSaving(true);
    try {
      // Build and send metadata payload
      const metadataPayload: UpdateVideoPayload = {
        title,
        is_adult_content: isAdultContent,
      };
      if (description) metadataPayload.description = description;
      if (location) metadataPayload.location = location;
      if (countryId) metadataPayload.country_id = countryId;

      const slugs = convertTagsToSlugs(tags, availableTags);
      if (slugs.length > 0) metadataPayload.tags = slugs;

      if (thumbnailFile) metadataPayload.thumbnail = thumbnailFile;

      await studioClient.updateVideo(editVideo.uuid, metadataPayload);

      // Handle schedule transitions
      await handleScheduleTransition(editVideo, publishMode, scheduledAt);

      toast.success('Changes saved successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to save changes:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [
    editVideo,
    title,
    description,
    tags,
    availableTags,
    isAdultContent,
    location,
    countryId,
    thumbnailFile,
    publishMode,
    scheduledAt,
    onSuccess,
    onClose,
  ]);

  const handleNext = useCallback(() => {
    const nextStepId = getNextStepId(steps, currentStep);
    if (nextStepId) changeStep(nextStepId);
  }, [currentStep, steps, changeStep]);

  const handleBack = useCallback(() => {
    const prevStepId = getPrevStepId(steps, currentStep);
    if (prevStepId) changeStep(prevStepId);
  }, [currentStep, steps, changeStep]);

  const toggleTag = useCallback((tagId: number) => {
    setTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }, []);

  // Shared reset function for circuit breaker and close handlers
  const resetFormState = useCallback(() => {
    changeStep('details');
    setTitle('');
    setDescription('');
    setVisibility('draft');
    setTags([]);
    setIsAdultContent(false);
    setLocation('');
    setCountryId(null);
    setPublishMode('none');
    setScheduledAt(null);
    if (thumbnailPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(thumbnailPreviewUrl);
    setThumbnailFile(null);
    setThumbnailPreviewUrl(null);
    setThumbnailSource('auto');
    if (videoPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(null);
    uploadStartedRef.current = false;
  }, [thumbnailPreviewUrl, videoPreviewUrl, changeStep]);

  const isLastStep = currentStep === 'publishing';
  const canProceed = canProceedToNext(mode, currentStep, title, tags, isShort);

  if (!mounted) return null;
  if (!isOpen) return null;

  // Circuit breaker tripped - show error UI
  if (isTripped) {
    console.error('[UploadModal] Circuit breaker tripped. Trace:', trace);
    return (
      <CircuitBreakerErrorUI
        onClose={() => {
          resetCircuitBreaker();
          reset();
          resetFormState();
          onClose();
        }}
        onRetry={() => {
          resetCircuitBreaker();
          reset();
          resetFormState();
        }}
      />
    );
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - click disabled, modal closes only via X button */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-surface border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-text-primary line-clamp-1">
              {mode === 'edit' ? title || 'Edit video' : title || 'Upload video'}
            </h2>
            {mode === 'upload' && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded text-xs text-text-secondary">
                <Lock className="w-3 h-3" />
                Saved as private
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Step Indicator - Show when: edit mode OR file has been selected */}
        {(mode === 'edit' || state.uploadPhase !== 'idle') && (
          <StepIndicator steps={steps} currentStep={currentStep} onStepClick={changeStep} />
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {mode === 'upload' && state.uploadPhase === 'idle' ? (
            /* File Drop Zone - only in upload mode */
            <div
              className="flex flex-col items-center justify-center p-12 h-full"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <UploadIcon className="w-10 h-10 text-text-tertiary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Drag and drop video files to upload
              </h3>
              <p className="text-text-secondary mb-6">
                Your videos will be private until you publish them
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-red-primary hover:bg-red-primary/90"
              >
                Select files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            /* Form Content */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Left Column - Form */}
              <div className="space-y-4">
                {currentStep === 'details' && (
                  <DetailsStep
                    title={title}
                    description={description}
                    onTitleChange={setTitle}
                    onDescriptionChange={setDescription}
                  />
                )}

                {currentStep === 'location' && (
                  <LocationPicker
                    value={location}
                    countryId={countryId}
                    initialLatitude={editVideo?.latitude}
                    initialLongitude={editVideo?.longitude}
                    onLocationChange={(newLocation, details) => {
                      setLocation(newLocation);
                      if (details.countryId !== undefined) {
                        setCountryId(details.countryId);
                      }
                    }}
                  />
                )}

                {currentStep === 'tags' && !isShort && (
                  <TagsStep
                    tags={tags}
                    isLoadingTags={isLoadingTags}
                    tagsError={tagsError}
                    availableTags={availableTags}
                    onTagToggle={toggleTag}
                    onRetry={() => {
                      setTagsError(null);
                      setIsLoadingTags(true);
                      publicClient
                        .getTags()
                        .then((t) => setAvailableTags(t))
                        .catch((err) => {
                          console.error(err);
                          setTagsError('Failed to load tags.');
                        })
                        .finally(() => setIsLoadingTags(false));
                    }}
                  />
                )}

                {currentStep === 'content-rating' && (
                  <ContentRatingStep
                    isAdultContent={isAdultContent}
                    onToggle={() => setIsAdultContent(!isAdultContent)}
                  />
                )}

                {currentStep === 'thumbnail' && (
                  <ThumbnailStep
                    thumbnailSource={thumbnailSource}
                    thumbnailPreviewUrl={thumbnailPreviewUrl}
                    thumbnailInputRef={thumbnailInputRef}
                    onSourceChange={setThumbnailSource}
                    onThumbnailClear={() => {
                      setThumbnailFile(null);
                      setThumbnailPreviewUrl(null);
                    }}
                    onThumbnailSelect={(file) => {
                      setThumbnailFile(file);
                      setThumbnailPreviewUrl(URL.createObjectURL(file));
                    }}
                  />
                )}

                {currentStep === 'publishing' && (
                  <PublishingStep
                    mode={mode}
                    editVideo={editVideo}
                    publishMode={publishMode}
                    scheduledAt={scheduledAt}
                    onPublishModeChange={setPublishMode}
                    onScheduledAtChange={setScheduledAt}
                  />
                )}
              </div>

              {/* Right Column - Preview */}
              <div className="space-y-4">
                {/* Video Preview - Tiered fallback */}
                <div
                  className={cn(
                    'relative overflow-hidden rounded-lg bg-white/5 border border-white/10',
                    isShort ? 'aspect-[9/16] max-h-[300px] mx-auto' : 'aspect-video'
                  )}
                >
                  <VideoPreviewContent
                    videoPreviewUrl={videoPreviewUrl}
                    mode={mode}
                    editVideo={editVideo}
                    storeUpload={storeUpload}
                    isShort={isShort}
                    onFileReselected={(file) => {
                      if (storeUpload) {
                        fileReferenceStore.set(storeUpload.id, file);
                        setVideoPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                    {isShort ? 'Short' : 'Video'}
                  </div>
                </div>

                {/* Upload Progress - show during active upload, when complete, or for stale uploads */}
                {mode === 'upload' && (state.uploadPhase !== 'idle' || storeUpload?.isStale) && (
                  <UploadProgressSection
                    uploadPhase={state.uploadPhase}
                    uploadProgress={state.uploadProgress}
                    bytesUploaded={state.bytesUploaded}
                    bytesTotal={state.bytesTotal}
                    isPaused={state.isPaused}
                    error={state.error}
                    storeUpload={storeUpload}
                    onPause={pauseUpload}
                    onResume={resumeUpload}
                    onRetry={retryUpload}
                  />
                )}

                {/* Video Link - show in upload mode after upload or in edit mode */}
                {(state.videoUuid || (mode === 'edit' && editVideo)) && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-xs text-text-tertiary mb-1">
                      {isShort ? 'Short' : 'Video'} Link
                    </p>
                    <p className="text-sm text-blue-400 break-all">
                      {typeof window !== 'undefined'
                        ? window.location.origin
                        : 'https://app.taboo.tv'}
                      {isShort ? '/shorts/' : '/video/'}
                      {state.videoUuid || editVideo?.uuid}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {(mode === 'edit' || state.uploadPhase !== 'idle') && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
            {currentStep !== 'details' && (
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
            )}
            <FooterActionButton
              isLastStep={isLastStep}
              mode={mode}
              isSaving={isSaving}
              title={title}
              canProceed={canProceed}
              uploadPhase={state.uploadPhase}
              videoUuid={state.videoUuid}
              publishMode={publishMode}
              onSaveChanges={handleSaveChanges}
              onPublish={handlePublish}
              onNext={handleNext}
            />
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
