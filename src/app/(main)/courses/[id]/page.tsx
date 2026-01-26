'use client';
import { useCourseDetail } from '@/api/queries/courses.queries';
import { CoursePageSkeleton } from '../_components/CoursePageSkeleton';
import { LessonCard } from '../_components/LessonCard';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { VideoPlayerSkeleton } from '@/features/video/components/VideoPlayerSkeleton';
import { useAuthStore } from '@/shared/stores/auth-store';
import { cn, formatDuration, getCreatorRoute } from '@/shared/utils/formatting';
import { BookOpen, ChevronDown, Clock, GraduationCap, LogIn, Play, Users } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useRef, useState } from 'react';

const VideoPlayer = dynamic(
  () =>
    import('@/features/video/components/video-player').then((mod) => ({
      default: mod.VideoPlayer,
    })),
  {
    loading: () => <VideoPlayerSkeleton />,
    ssr: false,
  }
);

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: courseData, isLoading, isError } = useCourseDetail(id);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();

  const videos = courseData?.videos || [];
  const error = isError ? 'Unable to load course' : null;

  const handleTrailerEnded = () => {
    setShowTrailer(false);
    if (videos.length > 0 && videos[0]) {
      router.push(`/courses/${id}/play/${videos[0].uuid}`);
    }
  };

  const handleStartCourse = () => {
    if (videos.length > 0 && videos[0]) {
      router.push(`/courses/${id}/play/${videos[0].uuid}`);
    }
  };

  const handleWatchTrailer = () => {
    setShowTrailer(true);
    heroRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const totalDuration = videos.reduce((acc, v) => acc + (v.duration || 0), 0);

  if (isLoading) {
    return <CoursePageSkeleton />;
  }

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

  const heroImage =
    courseData.course_thumbnail ||
    courseData.card_thumbnail ||
    courseData.thumbnail ||
    courseData.trailer_thumbnail ||
    courseData.desktop_banner;

  return (
    <div className="min-h-screen bg-background">
      <div ref={heroRef} className="relative">
        <div className="absolute inset-0 h-[80vh] min-h-[550px]">
          {heroImage && (
            <Image src={heroImage} alt={courseData.title} fill className="object-cover" priority />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJ3aGl0ZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIi8+PC9nPjwvc3ZnPg==')]" />
        </div>

        <div className="relative z-10 pt-16 pb-8 min-h-[80vh] flex flex-col justify-end">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
            {showTrailer && courseData.trailer_url && (
              <div className="mb-8 max-w-4xl animate-fade-in">
                <VideoPlayer
                  thumbnail={heroImage || ''}
                  url_1080={courseData.trailer_url}
                  autoplay={true}
                  onEnded={handleTrailerEnded}
                />
              </div>
            )}

            {!showTrailer && (
              <div className="max-w-2xl space-y-5 animate-fade-in">
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

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                  {courseData.title}
                </h1>

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

                {courseData.channel && (
                  <Link
                    href={getCreatorRoute(courseData.channel.handler)}
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
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-20 mt-8 pb-16">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 pt-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-primary/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-red-primary" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white">All Lessons</h2>
                <p className="text-white/50 text-sm">
                  {videos.length} {videos.length === 1 ? 'lesson' : 'lessons'} •{' '}
                  {formatDuration(totalDuration)} total runtime
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {videos.map((video, index) => (
              <LessonCard
                key={video.uuid}
                video={video}
                lessonNumber={index + 1}
                courseId={id}
                channel={courseData.channel}
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
