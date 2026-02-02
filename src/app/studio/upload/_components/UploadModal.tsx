'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Lock,
  Loader2,
  Upload as UploadIcon,
  Film,
  Clapperboard,
  Check,
  Tag,
  AlertTriangle,
  FileText,
  Zap,
  Calendar,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/shared/utils/formatting';
import { publicClient, type TagOption } from '@/api/client/public.client';
import { studioClient } from '@/api/client/studio.client';
import { toast } from 'sonner';
import { useImmediateUpload } from '../_hooks/use-immediate-upload';
import { useCircuitBreaker } from '../_hooks/use-circuit-breaker';
import type { PublishMode } from '../_config/types';

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

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialFile?: File;
  // Edit mode props
  mode?: 'upload' | 'edit';
  editVideo?: EditVideoData;
}

type ModalStep = 'details' | 'tags' | 'content-rating' | 'thumbnail' | 'visibility';

const getSteps = (isShort: boolean): { id: ModalStep; label: string }[] => [
  { id: 'details', label: 'Details' },
  ...(isShort ? [] : [{ id: 'tags', label: 'Tags' } as const]),
  { id: 'content-rating', label: 'Rating' },
  { id: 'thumbnail', label: 'Thumbnail' },
  { id: 'visibility', label: 'Visibility' },
];

const MIN_TAGS_FOR_VIDEO = 2;

export function UploadModal({
  isOpen,
  onClose,
  onSuccess,
  initialFile,
  mode = 'upload',
  editVideo,
}: UploadModalProps) {
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState<ModalStep>('details');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'unlisted'>('private');

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  // Ref guard to prevent multiple upload starts (fixes infinite loop)
  const uploadStartedRef = useRef(false);
  // Track metadata updates to debounce
  const metadataTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Circuit breaker for infinite loop protection
  const { isTripped, trackRender, reset: resetCircuitBreaker, trace } = useCircuitBreaker();

  const {
    state,
    startUpload,
    updateMetadata,
    publish,
    // cancel is not used because we allow background upload continuation
    reset,
  } = useImmediateUpload({
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

  // Track renders for circuit breaker
  useEffect(() => {
    trackRender(`modal-render-phase:${state.uploadPhase}`);
  }, [trackRender, state.uploadPhase]);

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
      setTitle(editVideo.title);
      setDescription(editVideo.description || '');
      setTags(editVideo.tags || []);
      setIsAdultContent(editVideo.isAdultContent || false);
      setVisibility(editVideo.visibility);
    }
  }, [isOpen, mode, editVideo]);

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

  // Fetch tags when Tags step becomes active (video only)
  useEffect(() => {
    if (currentStep === 'tags' && !isShort && availableTags.length === 0 && !isLoadingTags) {
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
  }, [currentStep, isShort, availableTags.length, isLoadingTags]);

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
      if (tags.length > 0) metadata.tags = tags;
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
    isAdultContent,
    location,
    countryId,
    publishMode,
    scheduledAt,
    isShort,
    updateMetadata,
  ]);

  const handleClose = useCallback(() => {
    // Check if upload is actively in progress
    const isActivelyUploading =
      state.uploadPhase === 'uploading' || state.uploadPhase === 'preparing';
    const isProcessing = state.uploadPhase === 'processing';

    if (isActivelyUploading || isProcessing) {
      const message = isActivelyUploading
        ? 'Upload is in progress. It will continue in the background. Close anyway?'
        : 'Video is being processed. It will continue in the background. Close anyway?';

      const confirmed = window.confirm(message);
      if (!confirmed) return;

      // Don't cancel - let upload continue in background
      // Only reset local form state
      setCurrentStep('details');
      setTitle('');
      setDescription('');
      setVisibility('private');
      setTags([]);
      setIsAdultContent(false);
      setLocation('');
      setCountryId(null);
      setPublishMode('none');
      setScheduledAt(null);
      onClose();
      return;
    }

    // For idle, complete, or error states, do full reset
    reset();
    setCurrentStep('details');
    setTitle('');
    setDescription('');
    setVisibility('private');
    setTags([]);
    setIsAdultContent(false);
    setLocation('');
    setCountryId(null);
    setPublishMode('none');
    setScheduledAt(null);
    onClose();
  }, [state.uploadPhase, reset, onClose]);

  // Handle backdrop click - only close if safe to do so
  const handleBackdropClick = useCallback(() => {
    const safeToClose = ['idle', 'complete', 'error'].includes(state.uploadPhase);
    if (safeToClose) {
      handleClose();
    }
    // During upload phases, do nothing (backdrop is locked)
  }, [state.uploadPhase, handleClose]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && !uploadStartedRef.current) {
        uploadStartedRef.current = true;
        startUpload(file);
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      // Reset input so same file can be selected again
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
    await publish(visibility);
  }, [publish, visibility]);

  // Save handler for edit mode
  const handleSaveChanges = useCallback(async () => {
    if (!editVideo) return;

    setIsSaving(true);
    try {
      // Update metadata - build payload carefully for exactOptionalPropertyTypes
      const metadataPayload: Parameters<typeof studioClient.updateVideoMetadata>[1] = {
        title,
        is_adult_content: isAdultContent,
      };
      if (description) metadataPayload.description = description;
      if (tags.length > 0) metadataPayload.tags = tags;

      await studioClient.updateVideoMetadata(editVideo.id, metadataPayload);

      // Update visibility if changed
      if (visibility !== editVideo.visibility) {
        if (editVideo.isShort) {
          await studioClient.updateShortVisibility(editVideo.id, { visibility });
        } else {
          await studioClient.updateVideoVisibility(editVideo.id, { visibility });
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
  }, [editVideo, title, description, tags, isAdultContent, visibility, onSuccess, onClose]);

  const handleNext = useCallback(() => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      if (nextStep) {
        setCurrentStep(nextStep.id);
      }
    }
  }, [currentStep, steps]);

  const handleBack = useCallback(() => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      if (prevStep) {
        setCurrentStep(prevStep.id);
      }
    }
  }, [currentStep, steps]);

  const toggleTag = useCallback((tagId: number) => {
    setTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }, []);

  const isLastStep = currentStep === 'visibility';

  // Validation logic
  const canProceed = (() => {
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
                  setCurrentStep('details');
                  setTitle('');
                  setDescription('');
                  setVisibility('private');
                  setTags([]);
                  setIsAdultContent(false);
                  setLocation('');
                  setCountryId(null);
                  setPublishMode('none');
                  setScheduledAt(null);
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
      {/* Backdrop - click behavior depends on upload state */}
      <div
        className={cn(
          'fixed inset-0 bg-black/70 backdrop-blur-sm',
          !['idle', 'complete', 'error'].includes(state.uploadPhase) && 'cursor-not-allowed'
        )}
        onClick={handleBackdropClick}
      />

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
                      onClick={() => setCurrentStep(step.id)}
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
                      Select or upload a picture that shows what&apos;s in your video. A good
                      thumbnail stands out and draws viewers&apos; attention.
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="aspect-video bg-white/5 border border-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:border-white/20 transition-colors"
                        >
                          <span className="text-text-tertiary text-sm">Auto #{i}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 'visibility' && (
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-4">
                      Visibility
                    </label>
                    <div className="space-y-3">
                      {[
                        {
                          value: 'public',
                          label: 'Public',
                          description: 'Everyone can see this video',
                        },
                        {
                          value: 'unlisted',
                          label: 'Unlisted',
                          description: 'Anyone with the link can view',
                        },
                        {
                          value: 'private',
                          label: 'Private',
                          description: 'Only you can see this video',
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={cn(
                            'flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors',
                            visibility === option.value
                              ? 'border-red-primary bg-red-primary/10'
                              : 'border-white/10 hover:border-white/20'
                          )}
                        >
                          <input
                            type="radio"
                            name="visibility"
                            value={option.value}
                            checked={visibility === option.value}
                            onChange={(e) => setVisibility(e.target.value as typeof visibility)}
                            className="sr-only"
                          />
                          <div
                            className={cn(
                              'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                              visibility === option.value ? 'border-red-primary' : 'border-white/30'
                            )}
                          >
                            {visibility === option.value && (
                              <div className="w-2.5 h-2.5 rounded-full bg-red-primary" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">{option.label}</p>
                            <p className="text-xs text-text-secondary">{option.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Publishing options for videos only */}
                    {!isShort && (
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-text-primary mb-4">
                          Publishing
                        </label>
                        <div className="space-y-3">
                          {[
                            {
                              value: 'none' as PublishMode,
                              icon: FileText,
                              title: 'Save as Draft',
                              description: 'Save now and publish later from your studio',
                            },
                            {
                              value: 'auto' as PublishMode,
                              icon: Zap,
                              title: 'Publish Immediately',
                              description: 'Publish as soon as processing completes',
                            },
                            {
                              value: 'scheduled' as PublishMode,
                              icon: Calendar,
                              title: 'Schedule',
                              description: 'Set a specific date and time to publish',
                            },
                          ].map((option) => {
                            const Icon = option.icon;
                            const isSelected = publishMode === option.value;

                            return (
                              <label
                                key={option.value}
                                className={cn(
                                  'flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all',
                                  isSelected
                                    ? 'bg-red-primary/10 border-red-primary'
                                    : 'bg-white/5 border-white/10 hover:border-red-primary/40'
                                )}
                              >
                                <input
                                  type="radio"
                                  checked={isSelected}
                                  onChange={() => setPublishMode(option.value)}
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
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column - Preview */}
              <div className="space-y-4">
                {/* Video Preview */}
                <div
                  className={cn(
                    'relative overflow-hidden rounded-lg bg-white/5 border border-white/10',
                    isShort ? 'aspect-[9/16] max-h-[300px] mx-auto' : 'aspect-video'
                  )}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isShort ? (
                      <Clapperboard className="w-12 h-12 text-text-tertiary" />
                    ) : (
                      <Film className="w-12 h-12 text-text-tertiary" />
                    )}
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                    {isShort ? 'Short' : 'Video'}
                  </div>
                </div>

                {/* Upload Progress - only show in upload mode when not complete */}
                {mode === 'upload' && state.uploadPhase !== 'complete' && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-text-primary">
                        {state.uploadPhase === 'preparing' && 'Preparing...'}
                        {state.uploadPhase === 'uploading' &&
                          `Uploading... ${state.uploadProgress}%`}
                        {state.uploadPhase === 'processing' && 'Processing...'}
                        {state.uploadPhase === 'error' && 'Upload failed'}
                      </span>
                      {state.uploadPhase === 'uploading' && (
                        <span className="text-xs text-text-tertiary">
                          {formatBytes(state.bytesUploaded)} / {formatBytes(state.bytesTotal)}
                        </span>
                      )}
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-300',
                          state.uploadPhase === 'error' ? 'bg-red-500' : 'bg-red-primary'
                        )}
                        style={{ width: `${state.uploadProgress}%` }}
                      />
                    </div>
                    {state.error && <p className="text-xs text-red-400 mt-2">{state.error}</p>}
                  </div>
                )}

                {/* Video Link - show in upload mode after upload or in edit mode */}
                {(state.videoUuid || (mode === 'edit' && editVideo)) && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-xs text-text-tertiary mb-1">Video link</p>
                    <p className="text-sm text-blue-400 break-all">
                      https://taboo.tv/watch/{state.videoUuid || editVideo?.uuid}
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
                    state.uploadPhase === 'processing'
                  }
                  className="bg-red-primary hover:bg-red-primary/90 min-w-[100px]"
                >
                  {state.uploadPhase === 'uploading' ||
                  state.uploadPhase === 'preparing' ||
                  state.uploadPhase === 'processing' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Uploading...
                    </>
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
