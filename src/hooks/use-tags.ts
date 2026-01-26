import { useMemo } from 'react';
import { normalizeTags, type RawTagsInput } from '@/shared/utils/tags';
import type { Tag } from '@/types';

/**
 * React hook for normalizing tags
 * Memoizes the result to avoid unnecessary recalculations
 */
export function useNormalizedTags(tagsInput: RawTagsInput): Tag[] {
  return useMemo(() => normalizeTags(tagsInput), [tagsInput]);
}
