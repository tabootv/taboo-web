export function CreatorCardSkeleton() {
  return (
    <div className="creator-card-bg h-full opacity-60">
      {/* Banner skeleton */}
      <div className="h-[100px] w-full rounded-t-lg skeleton" />

      <div className="card-content px-2!">
        {/* Avatar skeleton */}
        <div className="size-[88px] rounded-full -mt-[60px] skeleton" />

        <div className="w-full">
          <div className="flex items-center justify-between">
            {/* Name skeleton */}
            <div className="w-[120px] h-[20px] rounded skeleton" />
            {/* Follow button skeleton */}
            <div className="w-[80px] h-[32px] rounded-full skeleton hidden md:block" />
          </div>
          {/* Description skeleton */}
          <div className="w-[180px] h-[16px] rounded skeleton mt-3" />
        </div>
      </div>
    </div>
  );
}
