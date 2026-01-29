export function CreatorProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="mb-8">
          <div className="h-32 w-full bg-surface/50 rounded-lg animate-pulse mb-4" />
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-surface/50 animate-pulse -mt-12" />
            <div className="flex-1">
              <div className="h-8 w-48 bg-surface/50 rounded animate-pulse mb-2" />
              <div className="h-4 w-32 bg-surface/50 rounded animate-pulse mb-4" />
              <div className="flex gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 w-20 bg-surface/50 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="h-6 w-32 bg-surface/50 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-surface/50 rounded-lg" />
                <div className="h-4 bg-surface/50 rounded mt-2" />
                <div className="h-3 bg-surface/50 rounded mt-1 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
