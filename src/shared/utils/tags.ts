import type { Tag } from '@/types';

export type RawTagInput = Tag | string | null | undefined;
export type RawTagsInput = RawTagInput[] | string | null | undefined;

/**
 * Hash a string to a number for tag ID generation
 */
export function hashStringToNumber(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    const codePoint = value.codePointAt(i);
    if (codePoint !== undefined) {
      hash = (hash << 5) - hash + codePoint;
      hash = Math.trunc(hash);
    }
  }
  return Math.abs(hash);
}

/**
 * Get a unique key for a tag
 */
export function getTagKey(tag: Tag): string {
  if (tag.slug) return tag.slug;
  if (tag.name) return tag.name;
  if (typeof tag.id === 'number' || typeof tag.id === 'string') return String(tag.id);
  return '';
}

/**
 * Normalize tags from various input formats to a consistent Tag array
 * Handles string arrays, comma-separated strings, Tag objects, and mixed inputs
 */
export function normalizeTags(tagsInput: RawTagsInput): Tag[] {
  if (!tagsInput) return [];

  const rawTags: RawTagInput[] =
    typeof tagsInput === 'string'
      ? tagsInput
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : tagsInput;

  const normalized = rawTags.reduce<Tag[]>((acc, tag, index) => {
    if (!tag) return acc;

    if (typeof tag === 'string') {
      const name = tag.trim();
      if (!name) return acc;
      const slug = name.toLowerCase().replaceAll(/\s+/g, '-');
      acc.push({
        id: hashStringToNumber(`${slug}-${index}`),
        name,
        slug,
        should_show: true,
      });
      return acc;
    }

    const name = tag.name || tag.slug || '';
    if (!name) return acc;

    const slug = tag.slug || name.toLowerCase().replaceAll(/\s+/g, '-');
    acc.push({
      ...tag,
      id: tag.id ?? hashStringToNumber(`${slug}-${index}`),
      name,
      slug,
      should_show: tag.should_show !== false,
    });
    return acc;
  }, []);

  const deduped = new Map<string, Tag>();
  normalized.forEach((tag) => {
    const key = getTagKey(tag);
    if (key && !deduped.has(key) && tag.should_show !== false) {
      deduped.set(key, tag);
    }
  });

  return Array.from(deduped.values());
}

