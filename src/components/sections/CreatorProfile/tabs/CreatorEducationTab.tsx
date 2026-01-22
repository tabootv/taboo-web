'use client';

import { useCreatorCoursesInfinite } from '@/api/queries/creators.queries';
import { SeriesPremiumCard } from '@/components/series/SeriesPremiumCard';
import type { Course, Creator } from '@/types';
import { useMemo } from 'react';
import { EmptyState, InfiniteScrollLoader, SeriesGridSkeleton } from './shared';

interface CreatorEducationTabProps {
  creator: Creator;
}

export function CreatorEducationTab({ creator }: CreatorEducationTabProps) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useCreatorCoursesInfinite(creator.id, { sort_by: 'latest' });

  const courses = useMemo(() => {
    if (!data?.pages) return [];
    const allCourses = data.pages.flatMap((page) => page.data || []);

    // Deduplicate by id
    const uniqueMap = new Map<number, Course>();
    allCourses.forEach((course) => {
      if (!uniqueMap.has(course.id)) uniqueMap.set(course.id, course);
    });

    return Array.from(uniqueMap.values());
  }, [data]);

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-9">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white mb-6">
          Education
        </h2>
        <SeriesGridSkeleton count={6} />
      </section>
    );
  }

  if (courses.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-9">
        <EmptyState message="No courses found." />
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-9">
      <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white mb-6">
        Education
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course) => (
          <SeriesPremiumCard key={course.id} series={course} />
        ))}
      </div>
      <InfiniteScrollLoader
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        skeleton={
          <div className="mt-5">
            <SeriesGridSkeleton count={3} />
          </div>
        }
      />
    </section>
  );
}
