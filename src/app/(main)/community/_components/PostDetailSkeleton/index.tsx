export function PostDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[820px] mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="h-6 w-24 bg-surface/50 rounded animate-pulse mb-4" />
          <div className="h-8 w-3/4 bg-surface/50 rounded animate-pulse" />
        </div>

        <div className="community-post-card">
          <div className="flex gap-3">
            <div className="w-11 h-11 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
              </div>
              <div className="flex gap-4 mt-4">
                <div className="h-8 w-16 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-8 w-16 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-8 w-16 bg-white/10 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="h-6 w-32 bg-surface/50 rounded animate-pulse mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="community-post-card">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-white/10 rounded animate-pulse mb-2" />
                    <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
