import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a duration in seconds to a human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted string like "1:23" or "1:23:45"
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format a number to a compact string (e.g., 1.2K, 3.5M)
 * @param num - Number to format
 * @returns Formatted string
 */
export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return '0';

  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

/**
 * Alias for formatNumber - for backward compatibility
 * @param num - Number to format
 * @returns Formatted string
 */
export const formatCompactNumber = formatNumber;

/**
 * Format a date to a relative time string (e.g., "2 hours ago", "3 days ago")
 * Uses dayjs for better i18n support
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow();
}

/**
 * Format a date to a localized string
 * Supports both dayjs format string and Intl.DateTimeFormat options
 * @param date - Date string or Date object
 * @param formatOrOptions - dayjs format string (default: 'MMM D, YYYY') or Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  formatOrOptions: string | Intl.DateTimeFormatOptions = 'MMM D, YYYY'
): string {
  if (typeof formatOrOptions === 'string') {
    return dayjs(date).format(formatOrOptions);
  }
  const d = new Date(date);
  return d.toLocaleDateString('en-US', formatOrOptions);
}

/**
 * Truncate text to a specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Generate a random ID
 * @param length - Length of the ID
 * @returns Random string
 */
export function generateId(length: number = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

/**
 * Debounce a function
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Sleep for a specified duration
 * @param ms - Duration in milliseconds
 * @returns Promise that resolves after the duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if running on client side
 */
export const isClient = typeof window !== 'undefined';

/**
 * Check if running on server side
 */
export const isServer = typeof window === 'undefined';

/**
 * Parse query string to object
 * @param queryString - Query string to parse
 * @returns Object with query parameters
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Build query string from object
 * @param params - Object with query parameters
 * @returns Query string
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}
