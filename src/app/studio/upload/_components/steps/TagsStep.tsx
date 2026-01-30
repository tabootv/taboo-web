'use client';

import { useEffect, useState } from 'react';
import { Tag, Check, Loader2 } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/shared/utils/formatting';
import { publicClient, type TagOption } from '@/api/client/public.client';
import type { UploadConfig, UploadFormData } from '../../_config/types';
import type { UseFileUploadReturn } from '../../_hooks/use-file-upload';
import { StepCard } from '../shared/StepCard';

interface TagsStepProps {
  config: UploadConfig;
  form: UseFormReturn<UploadFormData>;
  fileUpload: UseFileUploadReturn;
}

/**
 * Step 5: Tags selection (video only)
 * Fetches tags from API and displays as selectable pills
 */
export default function TagsStep({ config, form }: TagsStepProps) {
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedTags = form.watch('tags') || [];
  const minTags = config.minTags;

  // Fetch tags on mount
  useEffect(() => {
    async function fetchTags() {
      try {
        setIsLoading(true);
        const tags = await publicClient.getTags();
        setAvailableTags(tags);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch tags:', err);
        setError('Failed to load tags. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTags();
  }, []);

  const toggleTag = (tagId: number) => {
    const currentTags = form.getValues('tags') || [];
    if (currentTags.includes(tagId)) {
      form.setValue(
        'tags',
        currentTags.filter((id) => id !== tagId)
      );
    } else {
      form.setValue('tags', [...currentTags, tagId]);
    }
  };

  const isSelected = (tagId: number) => selectedTags.includes(tagId);

  return (
    <StepCard
      title="Tags"
      description={`Select at least ${minTags} tags to help viewers find your content`}
    >
      <FormField
        control={form.control}
        name="tags"
        render={() => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Select Tags
              <span className="text-text-tertiary text-xs font-normal">
                ({selectedTags.length} selected{minTags > 0 ? `, min ${minTags}` : ''})
              </span>
            </FormLabel>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-red-primary animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-400 mb-2">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="text-red-primary hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                      'flex items-center gap-1.5',
                      isSelected(tag.id)
                        ? 'bg-red-primary text-white'
                        : 'bg-surface border border-border text-text-secondary hover:border-red-primary/40 hover:text-text-primary'
                    )}
                  >
                    {isSelected(tag.id) && <Check className="w-3 h-3" />}
                    {tag.name}
                    {tag.count > 0 && <span className="text-xs opacity-60">({tag.count})</span>}
                  </button>
                ))}
              </div>
            )}

            <FormMessage />
          </FormItem>
        )}
      />

      {minTags > 0 && selectedTags.length < minTags && (
        <p className="mt-4 text-sm text-yellow-500">
          Please select at least {minTags} tags to continue
        </p>
      )}
    </StepCard>
  );
}
