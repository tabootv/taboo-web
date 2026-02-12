export function PostSkeleton() {
  return (
    <div className="py-6 border-b border-[#1f1f1f]">
      <div className="flex gap-3.5">
        <div className="size-12 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-16 bg-white/8 rounded animate-pulse" />
            <div className="h-3 w-12 bg-white/8 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="flex gap-2 mt-3">
            <div className="h-8 w-20 bg-white/10 rounded-full animate-pulse" />
            <div className="h-8 w-20 bg-white/10 rounded-full animate-pulse" />
            <div className="h-8 w-20 bg-white/10 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
