/**
 * Constants for MediaCard component
 */

export const MEDIA_CARD_SIZE_STYLES = {
  sm: {
    title: 'text-sm line-clamp-1',
    meta: 'text-xs',
    avatar: 'w-6 h-6',
    padding: 'p-2',
  },
  md: {
    title: 'text-base line-clamp-2',
    meta: 'text-xs',
    avatar: 'w-8 h-8',
    padding: 'p-3',
  },
  lg: {
    title: 'text-lg line-clamp-2',
    meta: 'text-sm',
    avatar: 'w-10 h-10',
    padding: 'p-4',
  },
} as const;

export const MEDIA_CARD_IMAGE_SIZES = {
  sm: '(max-width: 640px) 50vw, 25vw',
  md: '(max-width: 640px) 100vw, 33vw',
  lg: '(max-width: 640px) 100vw, 50vw',
} as const;
