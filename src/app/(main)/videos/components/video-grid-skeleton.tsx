export function VideoGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`skeleton-${i}`} className="animate-pulse">
          {/* Thumbnail */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-surface" />
          {/* Title */}
          <div className="mt-2">
            <div className="h-4 bg-surface rounded w-full mb-1" />
            <div className="h-3 bg-surface rounded w-2/3" />
          </div>
          {/* Creator info */}
          <div className="flex items-center gap-2 mt-2">
            <div className="w-6 h-6 rounded-full bg-surface flex-shrink-0" />
            <div className="h-3 bg-surface rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
