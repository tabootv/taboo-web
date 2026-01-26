export function WatchlistCardSkeleton() {
  return (
    <div className="series-card-clean">
      <div className="aspect-video w-full bg-[#1e1f23] rounded-t-xl animate-pulse" />
      <div className="p-4">
        <div className="h-5 w-3/4 bg-[#1e1f23] rounded animate-pulse mb-3" />
        <div className="h-5 w-1/2 bg-[#1e1f23] rounded animate-pulse mb-3" />
        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#1e1f23] animate-pulse" />
            <div className="h-4 w-20 bg-[#1e1f23] rounded animate-pulse" />
          </div>
          <div className="h-4 w-16 bg-[#1e1f23] rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
