export function CoursePageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[80vh] min-h-[550px]">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-surface/20 to-surface/10" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-[1800px] mx-auto">
          <div className="max-w-2xl space-y-4">
            <div className="h-8 w-28 bg-red-primary/20 rounded-lg animate-pulse" />
            <div className="h-12 sm:h-16 w-3/4 bg-surface/50 rounded animate-pulse" />
            <div className="h-5 w-1/2 bg-surface/50 rounded animate-pulse" />
            <div className="h-20 w-full bg-surface/50 rounded animate-pulse" />
            <div className="flex gap-4">
              <div className="h-12 w-36 bg-red-primary/20 rounded-lg animate-pulse" />
              <div className="h-12 w-28 bg-surface/50 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto page-px py-8">
        <div className="h-8 w-56 bg-surface/50 rounded animate-pulse mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface/40 rounded-xl overflow-hidden flex">
              <div className="hidden sm:block w-16 bg-surface/50" />
              <div className="w-full sm:w-48 aspect-video sm:aspect-auto sm:h-28 bg-surface/50 animate-pulse" />
              <div className="flex-1 p-5 space-y-2">
                <div className="h-4 w-20 bg-red-primary/20 rounded animate-pulse" />
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
