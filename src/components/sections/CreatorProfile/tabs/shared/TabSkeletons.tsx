'use client';

export function VideoCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-white/5" />
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
      </div>
    </div>
  );
}

export function VideoGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={`video-skeleton-${i}`} />
      ))}
    </div>
  );
}

export function ShortCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-white/5" />
      <div className="mt-2 space-y-1">
        <div className="h-3 bg-white/5 rounded w-2/3" />
      </div>
    </div>
  );
}

export function ShortsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ShortCardSkeleton key={`short-skeleton-${i}`} />
      ))}
    </div>
  );
}

export function SeriesCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-white/5" />
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
        <div className="h-3 bg-white/5 rounded w-1/3" />
      </div>
    </div>
  );
}

export function SeriesGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <SeriesCardSkeleton key={`series-skeleton-${i}`} />
      ))}
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="animate-pulse bg-white/5 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/10 rounded w-1/4" />
          <div className="h-3 bg-white/10 rounded w-1/6" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 bg-white/10 rounded w-full" />
        <div className="h-4 bg-white/10 rounded w-3/4" />
      </div>
    </div>
  );
}

export function PostsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={`post-skeleton-${i}`} />
      ))}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-white/40 text-sm">{message}</p>
    </div>
  );
}
