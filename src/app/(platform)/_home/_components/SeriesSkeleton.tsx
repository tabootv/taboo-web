/**
 * Skeleton loading state for series section
 */

export function SeriesSkeleton() {
  return (
    <section className="mt-10 md:mt-12">
      <div className="flex items-center justify-between mb-5">
        <div className="h-7 w-32 bg-surface rounded animate-pulse" />
        <div className="h-5 w-20 bg-surface rounded animate-pulse" />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div className="lg:w-[320px] xl:w-[340px] flex-shrink-0">
          <div className="flex lg:flex-col gap-3 lg:gap-1.5 overflow-hidden">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[140px] lg:w-full flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 p-1.5 lg:p-2 rounded-lg"
              >
                <div className="w-full lg:w-20 aspect-video lg:aspect-[16/10] rounded-md bg-surface animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-3/4 bg-surface rounded animate-pulse" />
                  <div className="h-2.5 w-1/2 bg-surface rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:block flex-1 min-h-[520px] bg-surface/30 rounded-2xl animate-pulse" />
      </div>
    </section>
  );
}
