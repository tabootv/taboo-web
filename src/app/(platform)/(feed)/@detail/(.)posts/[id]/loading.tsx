import { Skeleton } from '@/components/ui/skeleton';

export default function InterceptedPostLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Skeleton className="h-5 w-36 mb-6" />
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="space-y-2 mb-6">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-5 w-3/5" />
        </div>
        <Skeleton className="aspect-video w-full rounded-lg mb-6" />
        <div className="flex items-center gap-6 pt-4 border-t border-border">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
      <div className="mt-6">
        <Skeleton className="h-6 w-28 mb-4" />
        <div className="flex gap-3 mb-6">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-8 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-3 w-16 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
