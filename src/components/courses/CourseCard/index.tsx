'use client';

import type { Course } from '@/types';
import { Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  // Use numeric ID for routing since the backend /courses/{id} endpoint expects numeric ID
  const courseId = course.id;
  // Try multiple thumbnail sources - API might return in different fields
  const thumbnail = course.course_thumbnail || course.card_thumbnail || course.thumbnail || course.trailer_thumbnail || course.desktop_banner;

  return (
    <Link href={`/courses/${courseId}`} className="group">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface">
        {thumbnail && (
          <Image
            src={thumbnail}
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

