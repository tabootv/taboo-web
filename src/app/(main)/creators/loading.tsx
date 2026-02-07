import { PageHeader } from '@/components/ui/page-header';
import { CreatorCardSkeleton } from '@/features/creator/components/CreatorCardSkeleton';

export default function CreatorsPageLoading() {
  return (
    <div className="creators-page-atmosphere min-h-screen">
      <div className="relative z-10 max-w-[1280px] mx-auto page-px pt-6">
        <PageHeader title="Creators" />
        <div className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <CreatorCardSkeleton key={`creator-skeleton-${i}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
