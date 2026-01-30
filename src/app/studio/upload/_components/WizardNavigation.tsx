'use client';

import { ArrowLeft, ArrowRight, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UploadPhase } from '../_config/types';

interface WizardNavigationProps {
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
  isFirst: boolean;
  isLast: boolean;
  canProceed: boolean;
  uploadPhase: UploadPhase;
  contentType: 'video' | 'short';
}

/**
 * Navigation buttons for wizard (Back/Next/Submit)
 * Handles disabled states and loading during upload
 */
export function WizardNavigation({
  onBack,
  onNext,
  onCancel,
  isFirst,
  isLast,
  canProceed,
  uploadPhase,
  contentType,
}: WizardNavigationProps) {
  const isUploading = uploadPhase === 'uploading' || uploadPhase === 'preparing';
  const isProcessing = uploadPhase === 'processing';
  const isComplete = uploadPhase === 'complete';

  const getSubmitButtonContent = () => {
    if (isUploading) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Uploading...
        </>
      );
    }
    if (isProcessing) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Processing...
        </>
      );
    }
    if (isComplete) {
      return 'Complete!';
    }
    return (
      <>
        <Upload className="w-4 h-4 mr-2" />
        Upload {contentType === 'video' ? 'Video' : 'Short'}
      </>
    );
  };

  return (
    <div className="flex items-center justify-between pt-6 border-t border-border">
      <div>
        {!isFirst && (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={isUploading || isProcessing}
            className="text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isUploading || isProcessing}
          className="text-text-secondary hover:text-text-primary"
        >
          Cancel
        </Button>

        {isLast ? (
          <Button
            type="submit"
            onClick={onNext}
            disabled={!canProceed || isUploading || isProcessing || isComplete}
            className="min-w-[140px] bg-red-primary hover:bg-red-hover text-white"
          >
            {getSubmitButtonContent()}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className="bg-red-primary hover:bg-red-hover text-white"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
