/**
 * Bunny Stream CDN Configuration
 *
 * Centralized configuration for Bunny CDN video streaming and content delivery.
 * Used for HLS adaptive bitrate streaming and thumbnail generation.
 */

const STREAM_HOSTNAME =
  process.env.NEXT_PUBLIC_BUNNY_STREAM_HOSTNAME || 'vz-ef3e8794-d5f.b-cdn.net';

const CDN_HOSTNAME =
  process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME || 'taboo-cdn.b-cdn.net';

export const BUNNY_CONFIG = {
  /**
   * Bunny Stream configuration for video delivery
   */
  stream: {
    hostname: STREAM_HOSTNAME,

    /**
     * Get HLS playlist URL for a video
     * @param videoId - Bunny video ID (e.g., "abc123-def456")
     * @returns Full HLS playlist URL
     */
    getPlaylistUrl: (videoId: string): string =>
      `https://${STREAM_HOSTNAME}/${videoId}/playlist.m3u8`,

    /**
     * Get thumbnail URL for a video
     * @param videoId - Bunny video ID
     * @returns Full thumbnail URL
     */
    getThumbnailUrl: (videoId: string): string =>
      `https://${STREAM_HOSTNAME}/${videoId}/thumbnail.jpg`,

    /**
     * Get preview GIF URL for a video
     * @param videoId - Bunny video ID
     * @returns Full preview GIF URL
     */
    getPreviewUrl: (videoId: string): string =>
      `https://${STREAM_HOSTNAME}/${videoId}/preview.webp`,
  },

  /**
   * Bunny CDN configuration for static assets
   */
  cdn: {
    hostname: CDN_HOSTNAME,

    /**
     * Get CDN URL for a static asset
     * @param path - Asset path (e.g., "/images/logo.png")
     * @returns Full CDN URL
     */
    getAssetUrl: (path: string): string =>
      `https://${CDN_HOSTNAME}${path.startsWith('/') ? path : `/${path}`}`,
  },

  /**
   * Preconnect URLs for performance optimization
   * Add these to <head> for faster initial connection
   */
  preconnectUrls: [
    `https://${STREAM_HOSTNAME}`,
    `https://${CDN_HOSTNAME}`,
  ],
} as const;

/**
 * Check if a URL is from Bunny Stream
 */
export function isBunnyStreamUrl(url: string): boolean {
  return url.includes('.b-cdn.net') || url.includes('bunny');
}

/**
 * Check if a URL is an HLS manifest
 */
export function isHlsUrl(url: string): boolean {
  return url.includes('.m3u8') || url.includes('playlist');
}
