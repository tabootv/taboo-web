'use client';

import { publicClient, type TagOption } from '@/api/client/public.client';
import { studioClient } from '@/api/client/studio.client';
import type { UpdateVideoPayload } from '@/api/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/shared/utils/formatting';
import {
  AlertTriangle,
  Calendar,
  Check,
  Clapperboard,
  Clock,
  FileText,
  Film,
  Globe,
  ImageIcon,
  Loader2,
  Lock,
  Pause,
  Play,
  RotateCcw,
  Tag,
  Upload as UploadIcon,
  X,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import type { PublishMode } from '../_config/types';
import { useBeforeunloadWarning } from '../_hooks/use-beforeunload-warning';
import { useCircuitBreaker } from '../_hooks/use-circuit-breaker';
import { useImmediateUploadV2 } from '../_hooks/use-immediate-upload-v2';
import { LocationPicker } from './LocationPicker';
import { fileReferenceStore } from '@/shared/stores/file-reference-store';
import { UploadProgressBar } from '@/shared/components/upload/UploadProgressBar';
import type { ActiveUpload } from '@/shared/stores/upload-store';

interface EditVideoData {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  tags?: number[];
  tagNames?: string[]; // For tag name->ID conversion
  isAdultContent?: boolean;
  visibility: 'live' | 'draft';
  isShort: boolean;
  // Location fields
  location?: string;
  countryId?: number;
  latitude?: number;
  longitude?: number;
  // Publishing fields
  publishMode?: 'none' | 'auto' | 'scheduled';
  scheduledAt?: string;
  // Thumbnail
  thumbnailUrl?: string;
}

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

type ModalStep = 'details' | 'location' | 'tags' | 'content-rating' | 'thumbnail' | 'publishing';

const getSteps = (isShort: boolean): { id: ModalStep; label: string }[] => [
  { id: 'details', label: 'Details' },
  { id: 'location', label: 'Location' },
  ...(isShort ? [] : [{ id: 'tags', label: 'Tags' } as const]),
  { id: 'content-rating', label: 'Rating' },
  { id: 'thumbnail', label: 'Thumbnail' },
  { id: 'publishing', label: 'Publishing' },
];

const MIN_TAGS_FOR_VIDEO = 2;

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
  // Note: visibility state is maintained for hydration compatibility but
  // publishMode is used for actual save operations
  const [_visibility, setVisibility] = useState<'live' | 'draft'>('draft');

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
  // _thumbnailFile is stored for future upload integration (when backend endpoint is available)
  const [_thumbnailFile, setThumbnailFile] = useState<File | null>(null);
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

  // Derive currentStep from store-backed state (persisted across modal close/reopen)
  const currentStep = state.modalStep ?? 'details';

  // Compute dynamic steps based on content type
  // In edit mode, use editVideo.isShort; otherwise use detected type
  const isShort = mode === 'edit' ? (editVideo?.isShort ?? false) : state.detectedType === 'short';
  const steps = getSteps(isShort);

  // Edit mode: whether we're actively saving
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Initialize form fields when in edit mode
  useEffect(() => {
    if (isOpen && mode === 'edit' && editVideo) {
      // Basic fields
      setTitle(editVideo.title);
      setDescription(editVideo.description || '');
      setIsAdultContent(editVideo.isAdultContent || false);
      setVisibility(editVideo.visibility);

      // Tags - IDs directly or queue names for resolution
      if (editVideo.tags && editVideo.tags.length > 0) {
        setTags(editVideo.tags);
      } else if (editVideo.tagNames && editVideo.tagNames.length > 0) {
        setPendingTagNames(editVideo.tagNames);
      }

      // Location fields
      setLocation(editVideo.location || '');
      setCountryId(editVideo.countryId ?? null);

      // Publish mode - derive from data if not explicit
      if (editVideo.publishMode) {
        setPublishMode(editVideo.publishMode);
      } else if (editVideo.visibility === 'live') {
        setPublishMode('auto');
      } else {
        setPublishMode('none');
      }

      // Scheduled date
      if (editVideo.scheduledAt) {
        setScheduledAt(new Date(editVideo.scheduledAt));
      }

      // Thumbnail preview (existing URL, not blob)
      if (editVideo.thumbnailUrl) {
        setThumbnailPreviewUrl(editVideo.thumbnailUrl);
        setThumbnailSource('auto'); // Mark as existing, not custom upload
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const shouldFetchTags =
      (currentStep === 'tags' && !isShort && availableTags.length === 0 && !isLoadingTags) ||
      (mode === 'edit' &&
        pendingTagNames.length > 0 &&
        availableTags.length === 0 &&
        !isLoadingTags);

    if (shouldFetchTags) {
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
    }
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
    if (metadataTimeoutRef.current) {
      clearTimeout(metadataTimeoutRef.current);
    }
    metadataTimeoutRef.current = setTimeout(() => {
      // Build metadata object, only including defined values
      // to satisfy exactOptionalPropertyTypes
      const metadata: Parameters<typeof updateMetadata>[0] = { title };
      if (description) metadata.description = description;
      if (tags.length > 0) {
        metadata.tags = tags;
        // Convert IDs to slugs for API (store both for UI and API usage)
        if (availableTags.length > 0) {
          const slugs = tags
            .map((id) => availableTags.find((t) => t.id === id)?.slug)
            .filter((slug): slug is string => Boolean(slug));
          if (slugs.length > 0) {
            metadata.tagSlugs = slugs;
          }
        }
      }
      metadata.isAdultContent = isAdultContent;
      if (location) metadata.location = location;
      if (countryId) metadata.countryId = countryId;
      if (!isShort) metadata.publishMode = publishMode;
      if (publishMode === 'scheduled' && scheduledAt) metadata.scheduledAt = scheduledAt;
      updateMetadata(metadata);
    }, 300);
    return () => {
      if (metadataTimeoutRef.current) {
        clearTimeout(metadataTimeoutRef.current);
      }
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
    // FLUSH: Clear any pending debounced metadata updates and sync immediately
    if (metadataTimeoutRef.current) {
      clearTimeout(metadataTimeoutRef.current);
      metadataTimeoutRef.current = null;

      // Build and sync final metadata state
      const metadata: Parameters<typeof updateMetadata>[0] = { title };
      if (description) metadata.description = description;
      if (tags.length > 0) {
        metadata.tags = tags;
        // Convert IDs to slugs for API
        if (availableTags.length > 0) {
          const slugs = tags
            .map((id) => availableTags.find((t) => t.id === id)?.slug)
            .filter((slug): slug is string => Boolean(slug));
          if (slugs.length > 0) {
            metadata.tagSlugs = slugs;
          }
        }
      }
      metadata.isAdultContent = isAdultContent;
      if (location) metadata.location = location;
      if (countryId) metadata.countryId = countryId;
      if (!isShort) metadata.publishMode = publishMode;
      if (publishMode === 'scheduled' && scheduledAt) metadata.scheduledAt = scheduledAt;
      updateMetadata(metadata);
    }

    // Check if upload is actively in progress
    const isActivelyUploading =
      state.uploadPhase === 'uploading' || state.uploadPhase === 'preparing';
    const isProcessing = state.uploadPhase === 'processing';

    // Helper to reset thumbnail state and clean up object URL
    // Only revoke blob URLs, not HTTP URLs (from edit mode)
    const resetThumbnail = () => {
      if (thumbnailPreviewUrl && thumbnailPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
      setThumbnailFile(null);
      setThumbnailPreviewUrl(null);
      setThumbnailSource('auto');
    };

    const resetVideoPreview = () => {
      if (videoPreviewUrl && videoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
      setVideoPreviewUrl(null);
    };

    if (isActivelyUploading || isProcessing) {
      const message = isActivelyUploading
        ? 'Upload is in progress. It will continue in the background. Close anyway?'
        : 'Video is being processed. It will continue in the background. Close anyway?';

      const confirmed = window.confirm(message);
      if (!confirmed) return;

      // Don't cancel - let upload continue in background
      // Only reset local form state
      hasHydratedRef.current = null;
      setModalStep('details');
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
      resetThumbnail();
      resetVideoPreview();
      onClose();
      return;
    }

    hasHydratedRef.current = null;
    reset();
    setModalStep('details');
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
    resetThumbnail();
    resetVideoPreview();
    onClose();
  }, [
    state.uploadPhase,
    reset,
    onClose,
    thumbnailPreviewUrl,
    videoPreviewUrl,
    setModalStep,
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
    await publish(derivedVisibility);
  }, [publish, publishMode]);

  // Save handler for edit mode - uses UUID-based endpoints with schedule API
  const handleSaveChanges = useCallback(async () => {
    if (!editVideo?.uuid) return; // Use uuid, not id

    setIsSaving(true);
    try {
      // Step 1: Build metadata payload (no publish_mode)
      const metadataPayload: UpdateVideoPayload = {
        title,
        is_adult_content: isAdultContent,
      };
      if (description) metadataPayload.description = description;
      if (location) metadataPayload.location = location;
      if (countryId) metadataPayload.country_id = countryId;

      // Tag slugs conversion: Convert IDs to slugs using availableTags
      if (tags.length > 0 && availableTags.length > 0) {
        const slugs = tags
          .map((id) => availableTags.find((t) => t.id === id)?.slug)
          .filter((slug): slug is string => Boolean(slug));
        if (slugs.length > 0) {
          metadataPayload.tags = slugs;
        }
      }

      // Update metadata
      await studioClient.updateVideo(editVideo.uuid, metadataPayload);

      // Step 2: Handle publish mode changes via schedule API
      const originalMode =
        editVideo.publishMode || (editVideo.visibility === 'live' ? 'auto' : 'none');
      const isOriginallyLive = editVideo.visibility === 'live';
      const hasOriginalSchedule = editVideo.publishMode === 'scheduled';

      // IMPORTANT: Live videos cannot be unpublished (backend limitation)
      // Only handle transitions that are allowed

      if (publishMode !== originalMode) {
        if (isOriginallyLive) {
          // Live videos: Cannot unpublish, only warn if user tries
          // (UI should prevent this, but just in case)
          if (publishMode === 'none') {
            toast.error('Live videos cannot be unpublished');
          }
          // No action needed - video stays live
        } else if (publishMode === 'auto') {
          // Draft/Scheduled -> Live: POST /schedule with auto
          await studioClient.createSchedule(editVideo.uuid, { publish_mode: 'auto' });
        } else if (publishMode === 'scheduled' && scheduledAt) {
          if (hasOriginalSchedule) {
            // Scheduled -> Scheduled (edit): PATCH /schedule
            await studioClient.updateSchedule(editVideo.uuid, {
              scheduled_at: scheduledAt.toISOString(),
            });
          } else {
            // Draft -> Scheduled: POST /schedule
            await studioClient.createSchedule(editVideo.uuid, {
              publish_mode: 'scheduled',
              scheduled_at: scheduledAt.toISOString(),
            });
          }
        } else if (publishMode === 'none' && hasOriginalSchedule) {
          // Scheduled -> Draft: DELETE /schedule
          await studioClient.deleteSchedule(editVideo.uuid);
        }
      }

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
    publishMode,
    scheduledAt,
    onSuccess,
    onClose,
  ]);

  const handleNext = useCallback(() => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      if (nextStep) {
        setModalStep(nextStep.id);
      }
    }
  }, [currentStep, steps, setModalStep]);

  const handleBack = useCallback(() => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      if (prevStep) {
        setModalStep(prevStep.id);
      }
    }
  }, [currentStep, steps, setModalStep]);

  const toggleTag = useCallback((tagId: number) => {
    setTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }, []);

  const isLastStep = currentStep === 'publishing';

  // Validation logic
  const canProceed = (() => {
    // Edit mode: allow free navigation between tabs
    if (mode === 'edit') {
      return true;
    }

    // Upload mode: enforce validation
    if (currentStep === 'details') {
      return title.trim().length > 0;
    }
    if (currentStep === 'tags' && !isShort) {
      return tags.length >= MIN_TAGS_FOR_VIDEO;
    }
    return true;
  })();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format date for datetime-local input
  const formatDateForInput = (date: Date | null) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getMinDateTime = () => formatDateForInput(new Date());

  if (!mounted) return null;
  if (!isOpen) return null;

  // Circuit breaker tripped - show error UI
  if (isTripped) {
    console.error('[UploadModal] Circuit breaker tripped. Trace:', trace);
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-md bg-surface border border-white/10 rounded-2xl shadow-2xl p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">Something went wrong</h2>
            <p className="text-sm text-text-secondary mb-6">
              The upload form encountered an error. Please try again.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  resetCircuitBreaker();
                  reset();
                  setModalStep('details');
                  setTitle('');
                  setDescription('');
                  setVisibility('draft');
                  setTags([]);
                  setIsAdultContent(false);
                  setLocation('');
                  setCountryId(null);
                  setPublishMode('none');
                  setScheduledAt(null);
                  if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
                  setThumbnailFile(null);
                  setThumbnailPreviewUrl(null);
                  if (videoPreviewUrl && videoPreviewUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(videoPreviewUrl);
                  }
                  setVideoPreviewUrl(null);
                  setThumbnailSource('auto');
                  uploadStartedRef.current = false;
                  onClose();
                }}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  resetCircuitBreaker();
                  reset();
                  if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
                  setThumbnailFile(null);
                  setThumbnailPreviewUrl(null);
                  setThumbnailSource('auto');
                  uploadStartedRef.current = false;
                }}
                className="bg-red-primary hover:bg-red-primary/90"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>,
      document.body
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
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isPast = steps.findIndex((s) => s.id === currentStep) > index;
                return (
                  <div key={step.id} className="flex items-center flex-1">
                    {/* Step circle */}
                    <button
                      onClick={() => setModalStep(step.id)}
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors',
                        isActive && 'border-red-primary bg-red-primary text-white',
                        isPast && 'border-red-primary bg-transparent text-red-primary',
                        !isActive && !isPast && 'border-white/20 text-text-tertiary'
                      )}
                    >
                      {isPast ? <Check className="w-4 h-4" /> : index + 1}
                    </button>
                    {/* Label */}
                    <span
                      className={cn(
                        'ml-2 text-sm',
                        isActive ? 'text-text-primary' : 'text-text-tertiary'
                      )}
                    >
                      {step.label}
                    </span>
                    {/* Connector line */}
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          'flex-1 h-0.5 mx-4',
                          isPast ? 'bg-red-primary' : 'bg-white/10'
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
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
                  <>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Add a title that describes your video"
                        maxLength={100}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-red-primary/50 focus:border-red-primary"
                      />
                      <p className="text-xs text-text-tertiary mt-1 text-right">
                        {title.length}/100
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Tell viewers about your video"
                        rows={5}
                        maxLength={5000}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-red-primary/50 focus:border-red-primary resize-none"
                      />
                      <p className="text-xs text-text-tertiary mt-1 text-right">
                        {description.length}/5000
                      </p>
                    </div>
                  </>
                )}

                {currentStep === 'location' && (
                  <LocationPicker
                    value={location}
                    countryId={countryId}
                    onLocationChange={(newLocation, details) => {
                      setLocation(newLocation);
                      if (details.countryId !== undefined) {
                        setCountryId(details.countryId);
                      }
                    }}
                  />
                )}

                {currentStep === 'tags' && !isShort && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                      <Tag className="w-4 h-4" />
                      Select Tags
                      <span className="text-text-tertiary text-xs font-normal">
                        ({tags.length} selected, min {MIN_TAGS_FOR_VIDEO})
                      </span>
                    </label>

                    {isLoadingTags ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-red-primary animate-spin" />
                      </div>
                    ) : tagsError ? (
                      <div className="text-center py-8">
                        <p className="text-red-400 mb-2">{tagsError}</p>
                        <button
                          type="button"
                          onClick={() => {
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
                          className="text-red-primary hover:underline"
                        >
                          Retry
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => {
                          const isSelected = tags.includes(tag.id);
                          return (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => toggleTag(tag.id)}
                              className={cn(
                                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                'flex items-center gap-1.5',
                                isSelected
                                  ? 'bg-red-primary text-white'
                                  : 'bg-surface border border-white/10 text-text-secondary hover:border-red-primary/40 hover:text-text-primary'
                              )}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                              {tag.name}
                              {tag.count > 0 && (
                                <span className="text-xs opacity-60">({tag.count})</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {tags.length < MIN_TAGS_FOR_VIDEO && (
                      <p className="mt-4 text-sm text-yellow-500">
                        Please select at least {MIN_TAGS_FOR_VIDEO} tags to continue
                      </p>
                    )}
                  </div>
                )}

                {currentStep === 'content-rating' && (
                  <div>
                    <label className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-red-primary/40 cursor-pointer transition-all">
                      <button
                        type="button"
                        onClick={() => setIsAdultContent(!isAdultContent)}
                        className={cn(
                          'relative w-12 h-6 rounded-full shrink-0 mt-0.5 transition-colors',
                          isAdultContent ? 'bg-red-primary' : 'bg-white/20'
                        )}
                        aria-label={
                          isAdultContent ? 'Disable adult content' : 'Enable adult content'
                        }
                      >
                        <span
                          className={cn(
                            'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                            isAdultContent ? 'left-7' : 'left-1'
                          )}
                        />
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          <p className="text-text-primary font-medium">
                            Age-restricted content (18+)
                          </p>
                        </div>
                        <p className="text-sm text-text-secondary mt-1">
                          Mark this video as not suitable for younger audiences. This content will
                          require age verification before viewing.
                        </p>
                      </div>
                    </label>

                    <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                      <h3 className="text-sm font-medium text-text-primary mb-2">
                        When to mark as age-restricted:
                      </h3>
                      <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                        <li>Content with explicit language or themes</li>
                        <li>Violence or graphic content</li>
                        <li>Adult-oriented discussions or topics</li>
                        <li>Content not suitable for minors</li>
                      </ul>
                    </div>
                  </div>
                )}

                {currentStep === 'thumbnail' && (
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Thumbnail
                    </label>
                    <p className="text-sm text-text-secondary mb-4">
                      Upload a custom thumbnail or use the auto-generated one from your video.
                    </p>

                    {/* Thumbnail source toggle */}
                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setThumbnailSource('auto')}
                        className={cn(
                          'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          thumbnailSource === 'auto'
                            ? 'bg-red-primary text-white'
                            : 'bg-white/5 border border-white/10 text-text-secondary hover:border-white/20'
                        )}
                      >
                        Auto-generated
                      </button>
                      <button
                        type="button"
                        onClick={() => setThumbnailSource('custom')}
                        className={cn(
                          'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          thumbnailSource === 'custom'
                            ? 'bg-red-primary text-white'
                            : 'bg-white/5 border border-white/10 text-text-secondary hover:border-white/20'
                        )}
                      >
                        Custom upload
                      </button>
                    </div>

                    {thumbnailSource === 'auto' ? (
                      <div className="p-6 bg-white/5 border border-white/10 rounded-lg text-center">
                        <ImageIcon className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
                        <p className="text-sm text-text-secondary">
                          A thumbnail will be automatically generated from your video after
                          processing completes.
                        </p>
                      </div>
                    ) : (
                      <div>
                        {/* Custom thumbnail preview or upload zone */}
                        {thumbnailPreviewUrl ? (
                          <div className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element -- Local blob URL preview doesn't benefit from Next.js Image optimization */}
                            <img
                              src={thumbnailPreviewUrl}
                              alt="Custom thumbnail preview"
                              className="w-full aspect-video object-cover rounded-lg border border-white/10"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setThumbnailFile(null);
                                setThumbnailPreviewUrl(null);
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                            <button
                              type="button"
                              onClick={() => thumbnailInputRef.current?.click()}
                              className="absolute bottom-2 right-2 px-3 py-1.5 bg-black/60 hover:bg-black/80 rounded-lg text-sm text-white transition-colors"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => thumbnailInputRef.current?.click()}
                            className="w-full p-8 bg-white/5 border-2 border-dashed border-white/20 rounded-lg hover:border-red-primary/40 transition-colors group"
                          >
                            <UploadIcon className="w-10 h-10 text-text-tertiary mx-auto mb-3 group-hover:text-red-primary transition-colors" />
                            <p className="text-sm text-text-primary font-medium mb-1">
                              Click to upload thumbnail
                            </p>
                            <p className="text-xs text-text-tertiary">
                              JPG, PNG, or WebP. Max 2MB. Recommended: 1280x720
                            </p>
                          </button>
                        )}

                        {/* Hidden file input */}
                        <input
                          ref={thumbnailInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Validate file size (2MB max)
                              if (file.size > 2 * 1024 * 1024) {
                                toast.error('Thumbnail must be less than 2MB');
                                return;
                              }
                              setThumbnailFile(file);
                              // Create preview URL
                              const url = URL.createObjectURL(file);
                              setThumbnailPreviewUrl(url);
                            }
                            // Reset input so same file can be selected again
                            e.target.value = '';
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 'publishing' && (
                  <div>
                    {/* Show notice for live videos in edit mode */}
                    {mode === 'edit' && editVideo?.visibility === 'live' && (
                      <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                        <div className="flex items-center gap-2 text-green-500 mb-2">
                          <Globe className="w-5 h-5" />
                          <p className="font-medium">This video is live</p>
                        </div>
                        <p className="text-sm text-text-secondary">
                          Live videos cannot be unpublished. You can only edit metadata and use
                          &quot;Hide from Listings&quot; from the content table to control
                          visibility.
                        </p>
                      </div>
                    )}

                    <label className="block text-sm font-medium text-text-primary mb-4">
                      {mode === 'edit' && editVideo?.visibility === 'live'
                        ? 'Publication Status'
                        : 'How would you like to publish?'}
                    </label>
                    <div className="space-y-3">
                      {[
                        {
                          value: 'none' as PublishMode,
                          icon: FileText,
                          title: 'Save as Draft',
                          description: 'Keep private and publish later from your studio',
                          badge: null,
                          disabled: mode === 'edit' && editVideo?.visibility === 'live',
                        },
                        {
                          value: 'auto' as PublishMode,
                          icon: Zap,
                          title:
                            mode === 'edit' && editVideo?.visibility === 'live'
                              ? 'Published'
                              : 'Publish Now',
                          description:
                            mode === 'edit' && editVideo?.visibility === 'live'
                              ? 'This video is currently live and public'
                              : 'Make public as soon as processing completes',
                          badge: null,
                          disabled: false,
                        },
                        {
                          value: 'scheduled' as PublishMode,
                          icon: Calendar,
                          title: 'Schedule',
                          description: 'Set a specific date and time to go public',
                          badge:
                            scheduledAt && publishMode === 'scheduled'
                              ? scheduledAt.toLocaleString()
                              : null,
                          disabled: mode === 'edit' && editVideo?.visibility === 'live',
                        },
                      ].map((option) => {
                        const Icon = option.icon;
                        const isSelected = publishMode === option.value;
                        const isDisabled = option.disabled;

                        return (
                          <label
                            key={option.value}
                            className={cn(
                              'flex items-start gap-4 p-4 rounded-xl border transition-all',
                              isDisabled
                                ? 'opacity-50 cursor-not-allowed bg-white/5 border-white/10'
                                : 'cursor-pointer',
                              !isDisabled && isSelected
                                ? 'bg-red-primary/10 border-red-primary'
                                : !isDisabled &&
                                    'bg-white/5 border-white/10 hover:border-red-primary/40'
                            )}
                          >
                            <input
                              type="radio"
                              checked={isSelected}
                              onChange={() => !isDisabled && setPublishMode(option.value)}
                              disabled={isDisabled}
                              className="sr-only"
                            />
                            <div
                              className={cn(
                                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                                isSelected ? 'border-red-primary' : 'border-white/30'
                              )}
                            >
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-red-primary" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Icon
                                  className={cn(
                                    'w-5 h-5',
                                    isSelected ? 'text-red-primary' : 'text-text-tertiary'
                                  )}
                                />
                                <p className="text-text-primary font-medium">{option.title}</p>
                                {option.badge && (
                                  <span className="px-2 py-0.5 bg-red-primary/20 text-red-primary text-xs rounded-full">
                                    {option.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-text-secondary mt-1">
                                {option.description}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {/* Scheduled datetime picker */}
                    {publishMode === 'scheduled' && (
                      <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                        <label className="flex items-center gap-2 mb-3">
                          <Clock className="w-4 h-4 text-red-primary" />
                          <span className="text-sm font-medium text-text-primary">
                            Schedule Date & Time
                          </span>
                        </label>
                        <input
                          type="datetime-local"
                          value={scheduledAt ? formatDateForInput(scheduledAt) : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : null;
                            setScheduledAt(date);
                          }}
                          min={getMinDateTime()}
                          className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-red-primary transition-colors"
                        />
                      </div>
                    )}

                    {/* Info text about visibility */}
                    <p className="mt-4 text-xs text-text-tertiary">
                      {publishMode === 'none'
                        ? 'Your video will be saved as a private draft.'
                        : publishMode === 'auto'
                          ? 'Your video will become public once processing is complete.'
                          : 'Your video will become public at the scheduled time.'}
                    </p>
                  </div>
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
                  {/* Tier 1: Local file preview (from current session or file reference store) */}
                  {videoPreviewUrl ? (
                    <video
                      src={videoPreviewUrl}
                      className="absolute inset-0 w-full h-full object-cover"
                      controls
                      playsInline
                      muted
                    />
                  ) : mode === 'edit' && editVideo?.thumbnailUrl ? (
                    /* Tier 2: Edit mode thumbnail */
                    // eslint-disable-next-line @next/next/no-img-element -- Edit thumbnail from API
                    <img
                      src={editVideo.thumbnailUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : storeUpload?.isStale ? (
                    /* Tier 3: Stale upload - show re-select message */
                    <StaleUploadPreview
                      upload={storeUpload}
                      onFileReselected={(file) => {
                        // Store the file reference and create preview
                        fileReferenceStore.set(storeUpload.id, file);
                        setVideoPreviewUrl(URL.createObjectURL(file));
                      }}
                    />
                  ) : (
                    /* Default placeholder */
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isShort ? (
                        <Clapperboard className="w-12 h-12 text-text-tertiary" />
                      ) : (
                        <Film className="w-12 h-12 text-text-tertiary" />
                      )}
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                    {isShort ? 'Short' : 'Video'}
                  </div>
                </div>

                {/* Upload Progress - show during active upload, when complete, or for stale uploads */}
                {mode === 'upload' && (state.uploadPhase !== 'idle' || storeUpload?.isStale) && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-text-primary flex items-center gap-2">
                        {storeUpload?.isStale && (
                          <>
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            Session expired
                          </>
                        )}
                        {!storeUpload?.isStale &&
                          state.uploadPhase === 'preparing' &&
                          'Preparing...'}
                        {!storeUpload?.isStale &&
                          state.uploadPhase === 'uploading' &&
                          !state.isPaused &&
                          `Uploading... ${state.uploadProgress}%`}
                        {!storeUpload?.isStale &&
                          state.uploadPhase === 'uploading' &&
                          state.isPaused && (
                            <>
                              <Pause className="w-4 h-4 text-yellow-500" />
                              Upload paused - Click resume to continue
                            </>
                          )}
                        {!storeUpload?.isStale &&
                          state.uploadPhase === 'processing' &&
                          'Processing...'}
                        {!storeUpload?.isStale && state.uploadPhase === 'error' && 'Upload failed'}
                        {!storeUpload?.isStale && state.uploadPhase === 'complete' && (
                          <>
                            <Check className="w-4 h-4 text-green-500" />
                            Upload complete!
                          </>
                        )}
                      </span>
                      {state.uploadPhase === 'uploading' &&
                        !state.isPaused &&
                        !storeUpload?.isStale && (
                          <span className="text-xs text-text-tertiary">
                            {formatBytes(state.bytesUploaded)} / {formatBytes(state.bytesTotal)}
                          </span>
                        )}
                    </div>
                    <UploadProgressBar
                      phase={storeUpload?.phase ?? state.uploadPhase}
                      progress={storeUpload?.progress ?? state.uploadProgress}
                      isPaused={storeUpload?.isPaused ?? state.isPaused}
                      isStale={storeUpload?.isStale ?? false}
                    />

                    {/* Pause/Resume buttons */}
                    {state.uploadPhase === 'uploading' && !storeUpload?.isStale && (
                      <div className="flex items-center gap-2 mt-3">
                        {state.isPaused ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={resumeUpload}
                            className="flex items-center gap-1.5"
                          >
                            <Play className="w-4 h-4" />
                            Resume
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={pauseUpload}
                            className="flex items-center gap-1.5"
                          >
                            <Pause className="w-4 h-4" />
                            Pause
                          </Button>
                        )}
                      </div>
                    )}

                    {state.error && !storeUpload?.isStale && (
                      <div className="mt-2">
                        <p className="text-xs text-red-400">{state.error}</p>
                        {state.uploadPhase === 'error' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={retryUpload}
                            className="mt-2 flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Retry Upload
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
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
            {isLastStep ? (
              mode === 'edit' ? (
                <Button
                  onClick={handleSaveChanges}
                  disabled={isSaving || !title.trim()}
                  className="bg-red-primary hover:bg-red-primary/90 min-w-[100px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save changes'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handlePublish}
                  disabled={
                    state.uploadPhase === 'uploading' ||
                    state.uploadPhase === 'preparing' ||
                    state.uploadPhase === 'processing' ||
                    !state.videoUuid // UUID GUARD
                  }
                  className="bg-red-primary hover:bg-red-primary/90 min-w-[100px]"
                >
                  {!state.videoUuid && state.uploadPhase !== 'idle' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Preparing...
                    </>
                  ) : state.uploadPhase === 'uploading' ||
                    state.uploadPhase === 'preparing' ||
                    state.uploadPhase === 'processing' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : publishMode === 'none' ? (
                    'Save as Draft'
                  ) : (
                    'Publish'
                  )}
                </Button>
              )
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="bg-red-primary hover:bg-red-primary/90"
              >
                Next
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

/**
 * StaleUploadPreview - Shows message and file re-select for stale uploads
 * Stale uploads are those hydrated from localStorage without a live TUS client
 */
function StaleUploadPreview({
  upload,
  onFileReselected,
}: {
  upload: ActiveUpload;
  onFileReselected: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file matches original (basic check by name and size)
    if (file.name !== upload.fileName || file.size !== upload.fileSize) {
      toast.error('Please select the original file to restore preview');
      e.target.value = '';
      return;
    }

    onFileReselected(file);
    e.target.value = '';
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
      <AlertTriangle className="w-10 h-10 text-orange-500 mb-3" />
      <p className="text-sm text-text-secondary mb-2">Session expired</p>
      <p className="text-xs text-text-tertiary mb-4">
        Re-select the original file to restore preview
      </p>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-primary border border-red-primary/30 rounded-lg hover:bg-red-primary/10 transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        Select file
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <p className="text-[10px] text-text-tertiary mt-2 max-w-[200px]">
        Looking for: {upload.fileName}
      </p>
    </div>
  );
}
