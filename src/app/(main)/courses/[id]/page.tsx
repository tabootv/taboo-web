'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Play,
  Clock,
  CheckCircle,
  ChevronDown,
  GraduationCap,
  BookOpen,
  Users,
  LogIn,
} from 'lucide-react';
import { courses as coursesApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { Series, Video, Channel, Course } from '@/types';
import { VideoPlayer } from '@/components/video/video-player';
import { cn, formatDuration } from '@/lib/utils';

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [courseData, setCourseData] = useState<(Series | Course) | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    async function fetchCourse() {
      setIsLoading(true);
      setError(null);

      // Use getCourseByUuid which handles both numeric IDs and UUIDs
      // The API /courses/{id} returns { series: { ...course, videos: [...] } }
      const course = await coursesApi.getCourseByUuid(id);
      if (course) {
        setCourseData(course);
        setVideos(course.videos || []);
        setIsLoading(false);
        return;
      }

      // All attempts failed
      setError('Unable to load course');
      setIsLoading(false);
    }

    if (id) {
      fetchCourse();
    }
  }, [id]);

  const handleTrailerEnded = () => {
    setShowTrailer(false);
    if (videos.length > 0) {
      router.push(`/courses/${id}/play/${videos[0].uuid}`);
    }
  };

  const handleStartCourse = () => {
    if (videos.length > 0) {
      router.push(`/courses/${id}/play/${videos[0].uuid}`);
    }
  };

  const handleWatchTrailer = () => {
    setShowTrailer(true);
    heroRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Calculate total duration
  const totalDuration = videos.reduce((acc, v) => acc + (v.duration || 0), 0);

  if (isLoading) {
    return <CoursePageSkeleton />;
  }

  // Error or auth required state
  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <GraduationCap className="w-20 h-20 text-white/20 mx-auto mb-6" />
          {!isAuthenticated ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-3">Sign in to access courses</h1>
              <p className="text-white/60 mb-6">
                Unlock exclusive educational content and track your learning progress
              </p>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-primary hover:bg-red-primary/90 text-white font-semibold rounded-lg transition-colors"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-3">Course not found</h1>
              <p className="text-white/60 mb-6">
                The course you&apos;re looking for doesn&apos;t exist or has been removed
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
              >
                Browse Courses
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  const heroImage = courseData.desktop_banner || courseData.trailer_thumbnail || courseData.thumbnail || courseData.card_thumbnail;

  return (
    <div className="min-h-screen bg-background">
      {/* Netflix-style Hero Section with Educational Accent */}
      <div ref={heroRef} className="relative">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 h-[80vh] min-h-[550px]">
          {heroImage && (
            <Image
              src={heroImage}
              alt={courseData.title}
              fill
              className="object-cover"
              priority
            />
          )}
          {/* Multi-layer gradient overlay for cinematic effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-black/20" />
          {/* Educational accent - subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJ3aGl0ZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIi8+PC9nPjwvc3ZnPg==')]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 pt-16 pb-8 min-h-[80vh] flex flex-col justify-end">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
            {/* Trailer Player (shows when clicked) */}
            {showTrailer && courseData.trailer_url && (
              <div className="mb-8 max-w-4xl animate-fade-in">
                <VideoPlayer
                  thumbnail={heroImage}
                  url_1080={courseData.trailer_url}
                  autoplay={true}
                  onEnded={handleTrailerEnded}
                />
              </div>
            )}

            {/* Course Info */}
            {!showTrailer && (
              <div className="max-w-2xl space-y-5 animate-fade-in">
                {/* Education Badge with Taboo Styling */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-primary to-red-dark text-white text-sm font-bold rounded-lg tracking-wide shadow-lg shadow-red-primary/20">
                    <GraduationCap className="w-4 h-4" />
                    EDUCATION
                  </span>
                  {courseData.categories?.map((cat) => (
                    <span
                      key={cat.id}
                      className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white/90 text-sm rounded-lg border border-white/10"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                  {courseData.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/70 text-sm">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    {videos.length} {videos.length === 1 ? 'Lesson' : 'Lessons'}
                  </span>
                  {totalDuration > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {formatDuration(totalDuration)} total
                    </span>
                  )}
                  {courseData.channel && (
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      By {courseData.channel.name}
                    </span>
                  )}
                </div>

                {/* Description */}
                {courseData.description && (
                  <div className="relative">
                    <p
                      className={cn(
                        'text-base sm:text-lg text-white/80 leading-relaxed transition-all duration-300',
                        !isDescriptionExpanded && 'line-clamp-3'
                      )}
                    >
                      {courseData.description}
                    </p>
                    {courseData.description.length > 150 && (
                      <button
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="mt-2 text-white/60 hover:text-white text-sm flex items-center gap-1 transition-colors"
                      >
                        {isDescriptionExpanded ? 'Show less' : 'Show more'}
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 transition-transform duration-200',
                            isDescriptionExpanded && 'rotate-180'
                          )}
                        />
                      </button>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                  <button
                    onClick={handleStartCourse}
                    disabled={videos.length === 0}
                    className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-red-primary hover:bg-red-primary/90 text-white font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-red-primary/30"
                  >
                    <Play className="w-5 sm:w-6 h-5 sm:h-6 fill-white" />
                    <span>Start Learning</span>
                  </button>
                  {courseData.trailer_url && !showTrailer && (
                    <button
                      onClick={handleWatchTrailer}
                      className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg backdrop-blur-sm transition-all border border-white/10"
                    >
                      <Play className="w-5 h-5" />
                      <span>Preview</span>
                    </button>
                  )}
                </div>

                {/* Instructor Info */}
                {courseData.channel && (
                  <Link
                    href={`/creators/creator-profile/${courseData.channel.id}`}
                    className="inline-flex items-center gap-3 pt-2 group"
                  >
                    <div className="relative">
                      {courseData.channel.dp ? (
                        <Image
                          src={courseData.channel.dp}
                          alt={courseData.channel.name || 'Instructor'}
                          width={44}
                          height={44}
                          className="rounded-full object-cover ring-2 ring-red-primary/30 group-hover:ring-red-primary/60 transition-all"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center ring-2 ring-red-primary/30">
                          <span className="text-base font-bold text-white">
                            {(courseData.channel.name || 'I').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5">
                        <VerifiedBadge size={16} />
                      </div>
                    </div>
                    <p className="text-white font-medium group-hover:text-red-primary transition-colors">
                      {courseData.channel.name}
                    </p>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Lessons Section */}
      <div className="relative z-20 mt-8 pb-16">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6 pt-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-primary/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-red-primary" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white">
                  All Lessons
                </h2>
                <p className="text-white/50 text-sm">
                  {videos.length} {videos.length === 1 ? 'lesson' : 'lessons'} •{' '}
                  {formatDuration(totalDuration)} total runtime
                </p>
              </div>
            </div>
          </div>

          {/* Lesson List */}
          <div className="space-y-3">
            {videos.map((video, index) => (
              <LessonCard
                key={video.uuid}
                video={video}
                lessonNumber={index + 1}
                courseId={id}
                channel={courseData.channel}
                isFirst={index === 0}
              />
            ))}
          </div>

          {videos.length === 0 && (
            <div className="text-center py-16 bg-surface/30 rounded-2xl border border-white/5">
              <GraduationCap className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 text-lg">No lessons available yet</p>
              <p className="text-white/40 text-sm mt-2">Check back soon for new content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Lesson Card Component - Educational Style
function LessonCard({
  video,
  lessonNumber,
  courseId,
  channel,
  isFirst,
}: {
  video: Video;
  lessonNumber: number;
  courseId: string;
  channel?: Channel;
  isFirst: boolean;
}) {
  const href = `/courses/${courseId}/play/${video.uuid}`;

  return (
    <Link href={href} className="group block">
      <div className="relative bg-surface/40 rounded-xl overflow-hidden transition-all duration-300 hover:bg-surface/70 hover:ring-1 hover:ring-red-primary/30 hover:shadow-xl hover:shadow-red-primary/5">
        <div className="flex flex-col sm:flex-row">
          {/* Lesson Number */}
          <div className="hidden sm:flex items-center justify-center w-16 bg-surface/50 border-r border-white/5">
            <span className="text-2xl font-bold text-white/30 group-hover:text-red-primary transition-colors">
              {String(lessonNumber).padStart(2, '0')}
            </span>
          </div>

          {/* Thumbnail */}
          <div className="relative w-full sm:w-48 aspect-video sm:aspect-auto sm:h-28 flex-shrink-0 overflow-hidden">
            {video.thumbnail ? (
              <Image
                src={video.thumbnail_webp || video.thumbnail}
                alt={video.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-surface to-background flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white/20" />
              </div>
            )}

            {/* Play Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
              <div className="w-10 h-10 rounded-full bg-red-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 shadow-lg">
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              </div>
            </div>

            {/* Duration Badge */}
            {video.duration && (
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm rounded text-xs font-medium text-white">
                {formatDuration(video.duration)}
              </div>
            )}

            {/* Lesson Badge - Mobile */}
            <div className="sm:hidden absolute top-2 left-2 px-2 py-1 bg-red-primary/90 backdrop-blur-sm rounded text-xs font-bold text-white">
              LESSON {lessonNumber}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="hidden sm:inline-block px-2 py-0.5 bg-red-primary/10 text-red-primary text-xs font-semibold rounded">
                    LESSON {lessonNumber}
                  </span>
                  {isFirst && (
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded">
                      START HERE
                    </span>
                  )}
                </div>
                <h3 className="text-white font-semibold line-clamp-1 mb-1 group-hover:text-red-primary transition-colors text-base sm:text-lg">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="text-white/50 text-sm line-clamp-2">{video.description}</p>
                )}
              </div>

              {/* Play Indicator */}
              <div className="hidden sm:flex items-center gap-2 text-white/40 group-hover:text-red-primary transition-colors">
                <span className="text-sm font-medium">Watch</span>
                <Play className="w-4 h-4 fill-current" />
              </div>
            </div>

            {/* Bottom Meta */}
            <div className="flex items-center gap-3 mt-3 text-white/40 text-xs">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(video.duration || 0)}
              </span>
              {(video.channel?.name || channel?.name) && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 truncate">
                    {video.channel?.name || channel?.name}
                    <CheckCircle className="w-3 h-3 text-red-primary flex-shrink-0" />
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Skeleton Loader
function CoursePageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Skeleton */}
      <div className="relative h-[80vh] min-h-[550px]">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-surface/20 to-surface/10" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-[1800px] mx-auto">
          <div className="max-w-2xl space-y-4">
            <div className="h-8 w-28 bg-red-primary/20 rounded-lg animate-pulse" />
            <div className="h-12 sm:h-16 w-3/4 bg-surface/50 rounded animate-pulse" />
            <div className="h-5 w-1/2 bg-surface/50 rounded animate-pulse" />
            <div className="h-20 w-full bg-surface/50 rounded animate-pulse" />
            <div className="flex gap-4">
              <div className="h-12 w-36 bg-red-primary/20 rounded-lg animate-pulse" />
              <div className="h-12 w-28 bg-surface/50 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Lessons Skeleton */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 w-56 bg-surface/50 rounded animate-pulse mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface/40 rounded-xl overflow-hidden flex">
              <div className="hidden sm:block w-16 bg-surface/50" />
              <div className="w-full sm:w-48 aspect-video sm:aspect-auto sm:h-28 bg-surface/50 animate-pulse" />
              <div className="flex-1 p-5 space-y-2">
                <div className="h-4 w-20 bg-red-primary/20 rounded animate-pulse" />
                <div className="h-5 w-3/4 bg-surface/50 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-surface/50 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Verified Badge Component
function VerifiedBadge({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 0L9.79611 1.52786L12.1244 1.52786L12.7023 3.76393L14.7023 5.04508L14.0489 7.29814L14.7023 9.55119L12.7023 10.8323L12.1244 13.0684L9.79611 13.0684L8 14.5963L6.20389 13.0684L3.87564 13.0684L3.29772 10.8323L1.29772 9.55119L1.95106 7.29814L1.29772 5.04508L3.29772 3.76393L3.87564 1.52786L6.20389 1.52786L8 0Z"
        fill="#AB0013"
      />
      <path d="M5.5 7.5L7 9L10.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
