export function VideoPlayerSkeleton() {
  return (
    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black">
      {/* Branded spinner */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 border-4 border-white/10 border-t-red-primary rounded-full animate-spin" />
      </div>

      {/* Faux control bar gradient at bottom */}
      <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/60 to-transparent">
        <div className="absolute bottom-3 inset-x-4 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse" />
          <div className="flex-1 h-1 bg-white/10 rounded-full animate-pulse" />
          <div className="w-8 h-3 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
