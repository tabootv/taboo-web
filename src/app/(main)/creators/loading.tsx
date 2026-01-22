import { CreatorCardSkeleton } from '@/components/creator';
import { PageHeader } from '@/components/ui';

export default function CreatorsPageLoading() {
  return (
    <div className="creators-page-atmosphere min-h-screen">
      <div className="creators-atmosphere-bg" />
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 pt-6">
        <PageHeader title="Creators" />
        <div className="mt-4">
          <div className="grid-creators">
            {Array.from({ length: 6 }).map((_, i) => (
              <CreatorCardSkeleton key={`creator-skeleton-${i}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

