export function PostSkeleton() {
  return (
    <div className="community-post-card">
      <div className="flex gap-3">
        <div className="w-11 h-11 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="flex gap-4 mt-4">
            <div className="h-8 w-16 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-8 w-16 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-8 w-16 bg-white/10 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
