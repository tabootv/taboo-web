export function VideoPlayerSkeleton() {
  return (
    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black">
      <div className="absolute inset-0 bg-surface/50 animate-pulse flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    </div>
  );
}
