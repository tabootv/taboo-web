import { encode } from '@/shared/lib/short-url';

interface VideoLinkParams {
  uuid: string;
  isShort: boolean;
  isPublished: boolean;
  isHidden?: boolean | undefined;
}

/**
 * Get the appropriate link for a video based on its visibility state.
 *
 * - Published + not hidden → public URL (/videos/ or /shorts/)
 * - Everything else → studio preview (/studio/watch?v=)
 */
export function getVideoLink({ uuid, isShort, isPublished, isHidden }: VideoLinkParams): string {
  if (isPublished && !isHidden) {
    return isShort ? `/shorts/${uuid}` : `/videos/${uuid}`;
  }
  return `/studio/watch?v=${uuid}`;
}

/**
 * Get a full shareable URL for a video.
 */
export function getVideoShareUrl(origin: string, params: VideoLinkParams): string {
  return `${origin}${getVideoLink(params)}`;
}

/**
 * Get a short URL path for a video by its UUID.
 * Returns a path like `/v/7B2xkQ4mRt6Fp3nYwZ9sLa`.
 */
export function getShortUrl(uuid: string): string {
  return `/v/${encode(uuid)}`;
}
