/**
 * Social media URL utilities
 */

export function buildSocialUrl(platform: string, handle: string | null | undefined): string | null {
  if (!handle) return null;
  if (handle.startsWith('http://') || handle.startsWith('https://')) return handle;
  const cleanHandle = handle.replace(/^@/, '');
  switch (platform) {
    case 'x':
      return `https://x.com/${cleanHandle}`;
    case 'tiktok':
      return `https://tiktok.com/@${cleanHandle}`;
    case 'instagram':
      return `https://instagram.com/${cleanHandle}`;
    case 'facebook':
      return `https://facebook.com/${cleanHandle}`;
    case 'youtube':
      return `https://youtube.com/@${cleanHandle}`;
    default:
      return null;
  }
}
