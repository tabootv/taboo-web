export function PlayerPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <div className="h-5 w-64 bg-surface/50 rounded animate-pulse mb-4" />
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="aspect-video bg-surface rounded-xl animate-pulse" />
            <div className="mt-4 space-y-3">
              <div className="h-7 w-3/4 bg-surface/50 rounded animate-pulse" />
              <div className="h-5 w-32 bg-surface/50 rounded animate-pulse" />
              <div className="flex gap-3 mt-4">
                <div className="w-10 h-10 rounded-full bg-surface/50 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-surface/50 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-surface/50 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[400px]">
            <div className="h-16 bg-surface/50 rounded-xl animate-pulse mb-4" />
            <div className="h-6 w-32 bg-surface/50 rounded animate-pulse mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={`skeleton-episode-${i}`} className="flex gap-3 p-2">
                  <div className="w-[140px] h-[79px] bg-surface/50 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-12 bg-surface/50 rounded animate-pulse" />
                    <div className="h-4 w-full bg-surface/50 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-surface/50 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
