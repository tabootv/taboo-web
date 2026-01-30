'use client';

import type { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { UploadConfig, UploadFormData } from '../../_config/types';
import type { UseFileUploadReturn } from '../../_hooks/use-file-upload';
import { StepCard } from '../shared/StepCard';

interface DetailsStepProps {
  config: UploadConfig;
  form: UseFormReturn<UploadFormData>;
  fileUpload: UseFileUploadReturn;
}

/**
 * Step 2: Title and description
 * Input fields with character counts
 */
export default function DetailsStep({ config, form }: DetailsStepProps) {
  return (
    <StepCard title="Details" description={`Add a title and description for your ${config.type}`}>
      <div className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Title <span className="text-red-primary">*</span>
              </FormLabel>
              <FormControl>
                <input
                  {...field}
                  type="text"
                  placeholder={`Enter ${config.type} title`}
                  maxLength={config.titleMaxLength}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl
                           text-text-primary placeholder:text-text-tertiary
                           focus:outline-none focus:border-red-primary transition-colors"
                />
              </FormControl>
              <div className="flex justify-between">
                <FormMessage />
                <p className="text-xs text-text-tertiary">
                  {field.value?.length || 0}/{config.titleMaxLength}
                </p>
              </div>
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  placeholder={
                    config.type === 'video' ? 'Tell viewers about your video' : 'Add a description'
                  }
                  rows={config.type === 'video' ? 5 : 3}
                  maxLength={config.descriptionMaxLength}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl
                           text-text-primary placeholder:text-text-tertiary
                           focus:outline-none focus:border-red-primary transition-colors resize-none"
                />
              </FormControl>
              <div className="flex justify-between">
                <FormMessage />
                <p className="text-xs text-text-tertiary">
                  {field.value?.length || 0}/{config.descriptionMaxLength}
                </p>
              </div>
            </FormItem>
          )}
        />
      </div>
    </StepCard>
  );
}
