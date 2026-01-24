export function VideoCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative aspect-video rounded-[10px] overflow-hidden bg-surface" />
      <div className="h-4 bg-surface mt-2 rounded" />
      <div className="h-3 bg-surface mt-1 rounded w-2/3" />
    </div>
  );
}

