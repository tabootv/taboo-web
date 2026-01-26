/**
 * Redirect utility for client-side navigation.
 * Prefers Next.js router when available, falls back to window.location for external URLs.
 */

/**
 * Redirects to a URL. Uses window.location for external URLs or when router is not available.
 *
 * @param url - The URL to redirect to
 * @param external - Whether this is an external URL (default: false)
 */
export function redirect(url: string, external = false): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (external) {
    window.location.href = url;
    return;
  }

  // For internal URLs, try to use Next.js router if available
  // Note: This requires the router to be passed in or accessed via context
  // For interceptors and utilities, we'll use window.location as fallback
  window.location.href = url;
}
