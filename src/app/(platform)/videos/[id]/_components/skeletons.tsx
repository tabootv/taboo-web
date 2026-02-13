export function VideoPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1800px] mx-auto page-px py-4 lg:py-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Player */}
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-surface animate-pulse" />

            {/* Title */}
            <div className="h-7 w-3/4 bg-surface/80 rounded animate-pulse mt-3" />

            {/* Channel row */}
            <div className="flex items-center justify-between mt-3 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-surface/50 animate-pulse" />
                <div>
                  <div className="h-4 w-32 bg-surface/50 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-surface/50 rounded animate-pulse mt-1.5" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-24 bg-surface/50 rounded-full animate-pulse" />
                <div className="h-9 w-20 bg-surface/50 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Description */}
            <div className="bg-surface/60 rounded-xl p-4">
              <div className="h-3 w-full bg-surface/50 rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-surface/50 rounded animate-pulse mt-2" />
            </div>

            {/* Divider */}
            <div className="h-px bg-white/50 my-6" />

            {/* Comments skeleton */}
            <CommentsSkeleton />
          </div>

          {/* Sidebar */}
          <RelatedVideosSkeleton />
        </div>
      </div>
    </div>
  );
}

export function RelatedVideosSkeleton() {
  return (
    <div className="w-full lg:w-[402px] shrink-0">
      {/* Tag chips */}
      <div className="flex gap-1 mb-3 px-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="h-8 rounded-full bg-surface/80 animate-pulse"
            style={{ width: 48 + i * 12 }}
          />
        ))}
      </div>

      {/* Related video cards */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex gap-2 p-2 -mx-2">
            <div className="w-[168px] h-[94px] shrink-0 rounded-md bg-surface/80 animate-pulse" />
            <div className="flex-1 min-w-0 py-0.5">
              <div className="h-3.5 w-full bg-surface/50 rounded animate-pulse" />
              <div className="h-3.5 w-2/3 bg-surface/50 rounded animate-pulse mt-1.5" />
              <div className="h-3 w-24 bg-surface/50 rounded animate-pulse mt-2" />
              <div className="h-3 w-16 bg-surface/50 rounded animate-pulse mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CommentsSkeleton() {
  return (
    <div className="bg-surface/60 border border-border rounded-xl p-4">
      {/* Comment count */}
      <div className="h-4 w-24 bg-surface/50 rounded animate-pulse" />

      {/* Comment input */}
      <div className="flex items-center gap-3 mt-3">
        <div className="size-8 rounded-full bg-surface/50 animate-pulse shrink-0" />
        <div className="h-10 flex-1 bg-surface/50 rounded-lg animate-pulse" />
      </div>

      {/* Comment rows */}
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex gap-3 mt-4">
          <div className="size-8 rounded-full bg-surface/50 animate-pulse shrink-0" />
          <div className="flex-1">
            <div className="h-3.5 w-28 bg-surface/50 rounded animate-pulse" />
            <div className="h-3 w-full bg-surface/50 rounded animate-pulse mt-2" />
            <div className="h-3 w-1/2 bg-surface/50 rounded animate-pulse mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
