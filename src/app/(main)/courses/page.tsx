'use client';

import { useCoursesList } from '@/api/queries';
import { CourseCard } from '@/components/courses';
import { Button, ContentGrid, LoadingScreen, PageHeader } from '@/components/ui';
import { useAuthStore } from '@/lib/stores/auth-store';
import { GraduationCap, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

export default function CoursesPage() {
  const { data, isLoading, isError } = useCoursesList({ page: 1 });
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();

  const coursesList = data?.data || [];
  const error = isError ? 'Unable to load courses' : null;

  if (isLoading) {
    return <LoadingScreen message="Loading courses..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 py-6">
        <PageHeader title="Education" />

        <ContentGrid columns={{ default: 1, sm: 2, lg: 3 }} gap="lg" className="mt-6">
          {coursesList.map((course) => (
            <CourseCard key={course.uuid || course.id} course={course} />
          ))}
        </ContentGrid>

        <div ref={loadMoreRef} className="mt-8 flex justify-center">
          {data && data.current_page >= data.last_page && coursesList.length > 0 && (
            <p className="text-text-secondary">No more courses to load</p>
          )}
        </div>

        {!isLoading && coursesList.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            {error && !isAuthenticated ? (
              <>
                <p className="text-text-primary font-medium mb-2">Sign in to view courses</p>
                <p className="text-text-secondary mb-4">Access exclusive educational content</p>
                <Link href="/sign-in">
                  <Button className="btn-premium">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              </>
            ) : (
              <p className="text-text-secondary">No courses available yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
