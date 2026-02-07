export function SeriesPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[80vh] min-h-[550px]">
        <div className="absolute inset-0 bg-linear-to-t from-background via-surface/20 to-surface/10" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-[1800px] mx-auto">
          <div className="max-w-2xl space-y-4">
            <div className="h-7 w-24 bg-surface/50 rounded animate-pulse" />
            <div className="h-12 sm:h-16 w-3/4 bg-surface/50 rounded animate-pulse" />
            <div className="h-5 w-1/2 bg-surface/50 rounded animate-pulse" />
            <div className="h-20 w-full bg-surface/50 rounded animate-pulse" />
            <div className="flex gap-4">
              <div className="h-12 w-28 bg-surface/50 rounded animate-pulse" />
              <div className="h-12 w-28 bg-surface/50 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto page-px py-8">
        <div className="h-8 w-48 bg-surface/50 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={`episode-skeleton-${i}`} className="bg-surface/40 rounded-xl overflow-hidden">
              <div className="aspect-video bg-surface/50 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-3/4 bg-surface/50 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-surface/50 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
