export function CreatorCardSkeleton() {
  return (
    <div className="creator-card-bg h-full">
      <div className="h-[100px] w-full bg-gray-700 rounded-t-lg animate-pulse" />
      <div className="card-content px-2!">
        <div className="size-[88px] rounded-full bg-gray-700 -mt-[60px] animate-pulse" />
        <div className="w-full">
          <div className="flex items-center justify-between">
            <div className="w-[120px] h-[22px] bg-gray-700 rounded animate-pulse" />
            <div className="w-[86px] h-[36px] bg-gray-700 rounded-[18px] animate-pulse hidden md:block" />
          </div>
          <div className="w-[230px] h-[22px] bg-gray-700 rounded animate-pulse mt-2 md:mt-6" />
        </div>
      </div>
    </div>
  );
}

