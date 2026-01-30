'use client';

import { AlertTriangle } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import type { UploadConfig, UploadFormData } from '../../_config/types';
import type { UseFileUploadReturn } from '../../_hooks/use-file-upload';
import { StepCard } from '../shared/StepCard';

interface ContentRatingStepProps {
  config: UploadConfig;
  form: UseFormReturn<UploadFormData>;
  fileUpload: UseFileUploadReturn;
}

/**
 * Step 6: Content rating (video only)
 * NSFW/sensitive content toggle
 */
export default function ContentRatingStep({ form }: ContentRatingStepProps) {
  return (
    <StepCard
      title="Content Rating"
      description="Let viewers know if this content is suitable for all audiences"
    >
      <FormField
        control={form.control}
        name="isAdultContent"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <label className="flex items-start gap-4 p-4 rounded-xl bg-surface border border-border hover:border-red-primary/40 cursor-pointer transition-all">
                {/* Custom toggle */}
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className={`relative w-12 h-6 rounded-full shrink-0 mt-0.5 transition-colors ${
                    field.value ? 'bg-red-primary' : 'bg-surface-hover'
                  }`}
                  aria-label={field.value ? 'Disable adult content' : 'Enable adult content'}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      field.value ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <p className="text-text-primary font-medium">Age-restricted content (18+)</p>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    Mark this video as not suitable for younger audiences. This content will require
                    age verification before viewing.
                  </p>
                </div>
              </label>
            </FormControl>
          </FormItem>
        )}
      />

      <div className="mt-6 p-4 rounded-xl bg-surface-hover border border-border">
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
    </StepCard>
  );
}
