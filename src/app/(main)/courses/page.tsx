'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, GraduationCap, LogIn } from 'lucide-react';
import { useCoursesList } from '@/api/queries';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { Course } from '@/types';
import { LoadingScreen, Spinner, Button } from '@/components/ui';

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
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Education</h1>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {coursesList.map((course) => (
          <CourseCard key={course.uuid} course={course} />
        ))}
      </div>

      {/* Load More */}
      <div ref={loadMoreRef} className="mt-8 flex justify-center">
        {data && data.current_page >= data.last_page && coursesList.length > 0 && (
          <p className="text-text-secondary">No more courses to load</p>
        )}
      </div>

        {/* Empty State */}
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

function CourseCard({ course }: { course: Course }) {
  // Use numeric ID for routing since the backend /courses/{id} endpoint expects numeric ID
  const courseId = course.id;
  return (
    <Link href={`/courses/${courseId}`} className="group">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface">
        {course.thumbnail && (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-red-primary/90 flex items-center justify-center">
            <Play className="w-7 h-7 text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-red-primary text-white text-xs font-semibold rounded">
            COURSE
          </span>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-white text-lg line-clamp-2">{course.title}</h3>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-300">
            <span>{course.videos_count} lessons</span>
            {course.channel && (
              <>
                <span>•</span>
                <span>{course.channel.name}</span>
              </>
            )}
          </div>
        </div>

        {/* Hover border */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border-2 border-red-primary/50" />
      </div>

      {/* Description */}
      {course.description && (
        <p className="mt-3 text-sm text-text-secondary line-clamp-2">
          {course.description}
        </p>
      )}
    </Link>
  );
}
