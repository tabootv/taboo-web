import {
  BannerSkeleton,
  CreatorsSkeleton,
  FeaturedSkeleton,
  ShortsSkeleton,
} from './_home/_sections/skeletons';

export default function HomeLoading() {
  return (
    <>
      <BannerSkeleton />

      <div className="w-full page-px flex flex-col gap-5 sm:gap-6 md:gap-8 lg:gap-10 mt-4 sm:mt-8 md:mt-12 relative z-10">
        <CreatorsSkeleton />
        <FeaturedSkeleton />
        <ShortsSkeleton />
      </div>
    </>
  );
}
