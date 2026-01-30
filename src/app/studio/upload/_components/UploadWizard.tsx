'use client';

import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { studioClient } from '@/api/client/studio.client';
import { useUploadForm } from '../_hooks/use-upload-form';
import { useFileUpload } from '../_hooks/use-file-upload';
import { useUploadProgress } from '../_hooks/use-upload-progress';
import { StepIndicator } from './StepIndicator';
import { WizardNavigation } from './WizardNavigation';
import { UploadProgress } from './UploadProgress';
import type { UploadConfig, StepId, UploadPhase } from '../_config/types';

// Lazy load step components for code splitting
const VideoFileStep = lazy(() => import('./steps/VideoFileStep'));
const DetailsStep = lazy(() => import('./steps/DetailsStep'));
const ThumbnailStep = lazy(() => import('./steps/ThumbnailStep'));
const LocationStep = lazy(() => import('./steps/LocationStep'));
const TagsStep = lazy(() => import('./steps/TagsStep'));
const ContentRatingStep = lazy(() => import('./steps/ContentRatingStep'));
const PublishingStep = lazy(() => import('./steps/PublishingStep'));

interface UploadWizardProps {
  config: UploadConfig;
}

function StepLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-red-primary animate-spin" />
    </div>
  );
}

/**
 * Main upload wizard orchestrator
 * Manages step navigation, form state, file uploads, and submission
 */
export function UploadWizard({ config }: UploadWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set());
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('idle');

  // Form hook
  const { form, validateStep } = useUploadForm({ config });

  // File upload hook
  const fileUpload = useFileUpload({
    config,
    onVideoSelect: (file) => {
      // Auto-fill title from filename if empty
      const currentTitle = form.getValues('title');
      if (!currentTitle) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        form.setValue('title', nameWithoutExt);
      }
    },
  });

  // Upload progress hook
  const uploadProgress = useUploadProgress({
    onComplete: () => {
      toast.success(`${config.type === 'video' ? 'Video' : 'Short'} uploaded successfully!`);
      setTimeout(() => router.push('/studio'), 1500);
    },
    onError: (error) => {
      toast.error(error);
      setUploadPhase('error');
    },
  });

  const { steps } = config;
  const currentStepConfig = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  // Check if current step can proceed
  const canProceed = useMemo(() => {
    const stepId = currentStepConfig?.id;

    // Video file step requires a file
    if (stepId === 'video-file') {
      return !!fileUpload.videoFile;
    }

    // Details step requires title
    if (stepId === 'details') {
      const title = form.watch('title');
      return !!title?.trim();
    }

    // Tags step requires minimum tags for videos
    if (stepId === 'tags' && config.type === 'video') {
      const tags = form.watch('tags');
      return tags.length >= config.minTags;
    }

    // Other steps can proceed
    return true;
  }, [currentStepConfig?.id, fileUpload.videoFile, form, config]);

  // Handle next step
  const handleNext = useCallback(async () => {
    const stepId = currentStepConfig?.id;
    if (!stepId) return;

    // Validate current step
    const isValid = await validateStep(stepId);
    if (!isValid && stepId !== 'video-file') {
      return;
    }

    // Mark step as completed
    setCompletedSteps((prev) => new Set([...prev, stepId]));

    // If last step, submit
    if (isLast) {
      await handleSubmit();
      return;
    }

    // Go to next step
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepConfig?.id, validateStep, isLast, steps.length]);

  // Handle back
  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  // Handle cancel
  const handleCancel = useCallback(() => {
    router.push('/studio');
  }, [router]);

  // Handle step click in indicator
  const handleStepClick = useCallback((stepIndex: number) => {
    setCurrentStep(stepIndex);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!fileUpload.videoFile) {
      toast.error('Please select a video file');
      return;
    }

    const formData = form.getValues();
    setUploadPhase('preparing');

    try {
      // Step 1: Prepare upload (metadata only - no file!)
      // This bypasses the server action 2MB body limit
      const prepareResponse = await studioClient.prepareBunnyUpload({
        title: formData.title,
        description: formData.description || undefined,
        short: config.type === 'short',
        tags: formData.tags?.length ? formData.tags : undefined,
        is_adult_content: formData.isAdultContent,
        country_id: formData.countryId ?? undefined,
        location: formData.location || undefined,
        latitude: formData.latitude ?? undefined,
        longitude: formData.longitude ?? undefined,
        thumbnail_path: formData.thumbnailPath ?? undefined,
        publish_mode: config.type === 'video' ? formData.publishMode : undefined,
        scheduled_at:
          formData.publishMode === 'scheduled' && formData.scheduledAt
            ? formData.scheduledAt.toISOString()
            : undefined,
      });

      // Step 2: Start TUS upload directly to Bunny CDN
      // This bypasses the server entirely for the large video file
      setUploadPhase('uploading');
      uploadProgress.startUpload(fileUpload.videoFile, prepareResponse.upload_config);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadPhase('error');
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to prepare upload. Please try again.';
      toast.error(errorMessage);
    }
  }, [fileUpload.videoFile, form, config.type, uploadProgress]);

  // Render current step component
  const renderStep = () => {
    const stepId = currentStepConfig?.id;
    const commonProps = {
      config,
      form,
      fileUpload,
    };

    switch (stepId) {
      case 'video-file':
        return <VideoFileStep {...commonProps} />;
      case 'details':
        return <DetailsStep {...commonProps} />;
      case 'thumbnail':
        return <ThumbnailStep {...commonProps} />;
      case 'location':
        return <LocationStep {...commonProps} />;
      case 'tags':
        return <TagsStep {...commonProps} />;
      case 'content-rating':
        return <ContentRatingStep {...commonProps} />;
      case 'publishing':
        return <PublishingStep {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="pt-6 lg:pt-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-text-tertiary">Creator studio</p>
        <h1 className="text-3xl font-bold text-text-primary">{config.title}</h1>
        <p className="text-text-secondary">{config.subtitle}</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Current Step Title */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary">{currentStepConfig?.title}</h2>
        {currentStepConfig?.description && (
          <p className="text-text-secondary">{currentStepConfig.description}</p>
        )}
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Step Content */}
          <Suspense fallback={<StepLoader />}>{renderStep()}</Suspense>

          {/* Upload Progress */}
          {uploadPhase !== 'idle' && (
            <UploadProgress
              phase={uploadPhase}
              progress={uploadProgress.state.progress}
              bytesUploaded={uploadProgress.state.bytesUploaded}
              bytesTotal={uploadProgress.state.bytesTotal}
              error={uploadProgress.state.error}
              contentType={config.type}
            />
          )}

          {/* Navigation */}
          <WizardNavigation
            onBack={handleBack}
            onNext={handleNext}
            onCancel={handleCancel}
            isFirst={isFirst}
            isLast={isLast}
            canProceed={canProceed}
            uploadPhase={uploadPhase}
            contentType={config.type}
          />
        </form>
      </Form>
    </div>
  );
}
