/**
 * Route utilities for generating SEO-friendly URLs
 */

/**
 * Sanitizes a string for use in URLs
 * - Converts to lowercase
 * - Replaces spaces and special characters with hyphens
 * - Removes consecutive hyphens
 * - Trims hyphens from start/end
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/-+/g, '-') // Remove consecutive hyphens
    .replace(/^-|-$/g, ''); // Trim hyphens from ends
}

/**
 * Generates an SEO-friendly series route
 * Format: /series/{id}-{slugified-title}
 * Fallback: /series/{id} if title is missing
 */
export function getSeriesRoute(id: string | number, title?: string): string {
  const baseId = String(id);
  if (!title?.trim()) {
    return `/series/${baseId}`;
  }
  const slug = slugify(title);
  return slug ? `/series/${baseId}-${slug}` : `/series/${baseId}`;
}

/**
 * Generates an SEO-friendly series play route
 * Format: /series/{id}-{slugified-title}/play/{videoUuid}
 */
export function getSeriesPlayRoute(
  id: string | number,
  title: string | undefined,
  videoUuid: string
): string {
  const baseId = String(id);
  if (!title?.trim()) {
    return `/series/${baseId}/play/${videoUuid}`;
  }
  const slug = slugify(title);
  return slug
    ? `/series/${baseId}-${slug}/play/${videoUuid}`
    : `/series/${baseId}/play/${videoUuid}`;
}

/**
 * Extracts the numeric ID from a hybrid slug
 * Input: "15-breaking-bad" → Output: "15"
 * Input: "15" → Output: "15"
 */
export function extractIdFromSlug(slug: string): string {
  const parts = slug.split('-');
  return parts[0] || slug;
}

/**
 * Validates that a string represents a valid numeric ID
 */
export function isValidId(id: string): boolean {
  const num = parseInt(id, 10);
  return !isNaN(num) && num > 0;
}

/**
 * Generate creator profile route using handler
 * @param handler - Creator's handler/username (e.g., "arab", "johndoe")
 * @returns Route string for creator profile
 */
export function getCreatorRoute(handler: string | undefined | null): string {
  if (!handler) {
    return '/creators';
  }
  return `/creators/${handler}`;
}
