'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { PublishMode } from '../types';
import { SAVE_AS_DRAFT } from '../constants';

/**
 * Get publish button content based on state
 */
function getPublishButtonContent(
  videoUuid: string | null,
  uploadPhase: string,
  publishMode: PublishMode
): React.ReactNode {
  const isUploading =
    uploadPhase === 'uploading' || uploadPhase === 'preparing' || uploadPhase === 'processing';

  if (!videoUuid && uploadPhase !== 'idle') {
    return (
      <>
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        Preparing...
      </>
    );
  }
  if (isUploading) {
    return (
      <>
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        Uploading...
      </>
    );
  }
  return publishMode === 'none' ? SAVE_AS_DRAFT : 'Publish';
}

interface FooterActionButtonProps {
  isLastStep: boolean;
  mode: 'upload' | 'edit';
  isSaving: boolean;
  title: string;
  canProceed: boolean;
  uploadPhase: string;
  videoUuid: string | null;
  publishMode: PublishMode;
  onSaveChanges: () => void;
  onPublish: () => void;
  onNext: () => void;
}

/**
 * Footer action button - handles Next, Save changes, and Publish actions
 */
export function FooterActionButton({
  isLastStep,
  mode,
  isSaving,
  title,
  canProceed,
  uploadPhase,
  videoUuid,
  publishMode,
  onSaveChanges,
  onPublish,
  onNext,
}: FooterActionButtonProps): React.ReactNode {
  if (!isLastStep) {
    return (
      <Button
        onClick={onNext}
        disabled={!canProceed}
        className="bg-red-primary hover:bg-red-primary/90"
      >
        Next
      </Button>
    );
  }

  if (mode === 'edit') {
    return (
      <Button
        onClick={onSaveChanges}
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
    );
  }

  const isUploading =
    uploadPhase === 'uploading' || uploadPhase === 'preparing' || uploadPhase === 'processing';
  return (
    <Button
      onClick={onPublish}
      disabled={isUploading || !videoUuid}
      className="bg-red-primary hover:bg-red-primary/90 min-w-[100px]"
    >
      {getPublishButtonContent(videoUuid, uploadPhase, publishMode)}
    </Button>
  );
}
