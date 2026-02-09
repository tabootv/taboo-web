export function BannerSkeleton() {
  return (
    <div className="w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.35/1] bg-black animate-pulse">
      <div className="h-full w-full flex flex-col justify-end items-start p-6 md:p-12 lg:p-16 pb-20">
        <div className="w-48 h-6 bg-surface rounded mb-4" />
        <div className="w-96 h-12 bg-surface rounded mb-4" />
        <div className="w-64 h-4 bg-surface rounded mb-6" />
        <div className="w-40 h-12 bg-surface rounded-full" />
      </div>
    </div>
  );
}

export function CreatorsSkeleton() {
  return (
    <section className="relative">
      <div className="flex items-center mb-4">
        <div className="h-7 w-28 bg-surface rounded animate-pulse" />
      </div>
      <div className="flex gap-4 md:gap-6 overflow-hidden px-2 py-6">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="shrink-0 text-center" style={{ width: 110 }}>
            <div
              className="w-[90px] h-[90px] rounded-full bg-surface animate-pulse mx-auto"
              style={{ boxShadow: '0 0 20px rgba(171, 0, 19, 0.2)' }}
            />
            <div className="w-20 h-4 bg-surface rounded animate-pulse mx-auto mt-3" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function FeaturedSkeleton() {
  return (
    <section className="relative">
      <div className="flex items-center mb-4">
        <div className="h-7 w-32 bg-surface rounded animate-pulse" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex-shrink-0 w-[200px] md:w-[280px]">
            <div className="aspect-video rounded-lg bg-surface animate-pulse" />
            <div className="w-3/4 h-4 bg-surface rounded animate-pulse mt-2" />
            <div className="w-1/2 h-3 bg-surface rounded animate-pulse mt-2" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ShortsSkeleton() {
  return (
    <section className="relative">
      <div className="flex items-center mb-4">
        <div className="h-7 w-24 bg-surface rounded animate-pulse" />
      </div>
      <div className="flex gap-3 md:gap-6 overflow-hidden">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[169px] md:w-[190px] aspect-[9/16] rounded-lg bg-surface animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}

export function RecommendedSkeleton() {
  return (
    <section className="relative">
      <div className="flex items-center mb-4">
        <div className="h-7 w-48 bg-surface rounded animate-pulse" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex-shrink-0 w-[200px] md:w-[280px]">
            <div className="aspect-video rounded-lg bg-surface animate-pulse" />
            <div className="w-3/4 h-4 bg-surface rounded animate-pulse mt-2" />
            <div className="w-1/2 h-3 bg-surface rounded animate-pulse mt-2" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function SeriesSkeleton() {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="h-7 w-32 bg-surface rounded animate-pulse" />
        <div className="h-5 w-20 bg-surface rounded animate-pulse" />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div className="lg:w-[320px] xl:w-[340px] flex-shrink-0">
          <div className="flex lg:flex-col gap-3 lg:gap-1.5 overflow-hidden">
            {Array.from({ length: 7 }, (_, i) => (
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

export function PlaylistsSkeleton() {
  return (
    <>
      {Array.from({ length: 2 }, (_, rail) => (
        <section key={rail} className="relative">
          <div className="flex items-center mb-4">
            <div className="h-7 w-48 bg-surface rounded animate-pulse" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex-shrink-0 w-[200px] md:w-[280px]">
                <div className="aspect-video rounded-lg bg-surface animate-pulse" />
                <div className="w-3/4 h-4 bg-surface rounded animate-pulse mt-2" />
                <div className="w-1/2 h-3 bg-surface rounded animate-pulse mt-2" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
