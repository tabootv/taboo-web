'use client';

import { FileText, Zap, Calendar, Clock } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { cn } from '@/shared/utils/formatting';
import type { UploadConfig, UploadFormData, PublishMode } from '../../_config/types';
import type { UseFileUploadReturn } from '../../_hooks/use-file-upload';
import { StepCard } from '../shared/StepCard';

interface PublishingStepProps {
  config: UploadConfig;
  form: UseFormReturn<UploadFormData>;
  fileUpload: UseFileUploadReturn;
}

interface PublishOption {
  value: PublishMode;
  icon: typeof FileText;
  title: string;
  description: string;
}

const publishOptions: PublishOption[] = [
  {
    value: 'none',
    icon: FileText,
    title: 'Save as Draft',
    description: 'Save now and publish later from your studio',
  },
  {
    value: 'auto',
    icon: Zap,
    title: 'Publish Immediately',
    description: 'Publish as soon as processing completes',
  },
  {
    value: 'scheduled',
    icon: Calendar,
    title: 'Schedule',
    description: 'Set a specific date and time to publish',
  },
];

/**
 * Step 7: Publishing options (video only)
 * Draft, auto-publish, or scheduled publish
 */
export default function PublishingStep({ form }: PublishingStepProps) {
  const publishMode = form.watch('publishMode');

  // Format date for input
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

  // Get minimum datetime (now)
  const getMinDateTime = () => {
    const now = new Date();
    return formatDateForInput(now);
  };

  return (
    <StepCard title="Publishing" description="Choose when your video will be published">
      <FormField
        control={form.control}
        name="publishMode"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="space-y-3">
                {publishOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = field.value === option.value;

                  return (
                    <label
                      key={option.value}
                      className={cn(
                        'flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all',
                        isSelected
                          ? 'bg-red-primary/10 border-red-primary'
                          : 'bg-surface border-border hover:border-red-primary/40'
                      )}
                    >
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => field.onChange(option.value)}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                          isSelected ? 'border-red-primary' : 'border-border'
                        )}
                      >
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-red-primary" />}
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
                        <p className="text-sm text-text-secondary mt-1">{option.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </FormControl>
          </FormItem>
        )}
      />

      {/* Scheduled datetime picker */}
      {publishMode === 'scheduled' && (
        <FormField
          control={form.control}
          name="scheduledAt"
          render={({ field }) => (
            <FormItem className="mt-4">
              <div className="p-4 rounded-xl bg-surface border border-border">
                <label className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-red-primary" />
                  <span className="text-sm font-medium text-text-primary">
                    Schedule Date & Time
                  </span>
                </label>
                <FormControl>
                  <input
                    type="datetime-local"
                    value={field.value ? formatDateForInput(field.value) : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      field.onChange(date);
                    }}
                    min={getMinDateTime()}
                    className="w-full px-4 py-3 bg-surface-hover border border-border rounded-xl
                             text-text-primary
                             focus:outline-none focus:border-red-primary transition-colors"
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      )}

      {/* Info note */}
      <div className="mt-6 p-4 rounded-xl bg-surface-hover border border-border">
        <p className="text-sm text-text-secondary">
          {publishMode === 'none' && (
            <>
              Your video will be saved as a draft. You can edit and publish it anytime from your
              Creator Studio.
            </>
          )}
          {publishMode === 'auto' && (
            <>
              Your video will automatically go live once processing is complete. This usually takes
              a few minutes depending on video length.
            </>
          )}
          {publishMode === 'scheduled' && (
            <>
              Your video will be published at the scheduled time. Make sure to select a time in the
              future.
            </>
          )}
        </p>
      </div>
    </StepCard>
  );
}
