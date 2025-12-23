'use client';

import { useEffect, useState, use, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Play,
  CheckCircle,
  ChevronRight,
  SkipForward,
  Clock,
  Lock,
} from 'lucide-react';
import { courses as coursesApi, videos as videosApi, auth } from '@/lib/api';
import type { Course, Video } from '@/types';
import { VideoPlayer } from '@/components/video/video-player';
import { cn, formatDuration, formatRelativeTime } from '@/lib/utils';

export default function CoursePlayerPage({
  params,
}: {
  params: Promise<{ id: string; videoUuid: string }>;
}) {
  const { id: courseId, videoUuid } = use(params);
  const router = useRouter();
  const lessonsRef = useRef<HTMLDivElement>(null);

  const [courseData, setCourseData] = useState<Course | null>(null);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [lessons, setLessons] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Find current lesson index
  const currentLessonIndex = lessons.findIndex((v) => v.uuid === currentVideo?.uuid);
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < lessons.length - 1
    ? lessons[currentLessonIndex + 1]
    : null;

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch user for autoplay setting
        try {
          const meResponse = await auth.me();
          setAutoplayEnabled(meResponse.user.video_autoplay || false);
        } catch {
          // Not logged in
        }

        // Fetch current video and course data
        const [course, video] = await Promise.all([
          coursesApi.getCourseDetail(Number(courseId)),
          videosApi.getVideo(videoUuid),
        ]);

        setCourseData(course);
        setCurrentVideo(video);
        // Videos are included in the course detail response
        setLessons(course?.videos || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        router.push(`/courses/${courseId}`);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [videoUuid, courseId, router]);

  // Scroll to current lesson in sidebar
  useEffect(() => {
    if (lessonsRef.current && currentLessonIndex >= 0) {
      const currentCard = lessonsRef.current.children[currentLessonIndex] as HTMLElement;
      if (currentCard) {
        currentCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentLessonIndex]);

  const handleVideoEnded = useCallback(() => {
    if (autoplayEnabled && nextLesson) {
      router.push(`/courses/${courseId}/play/${nextLesson.uuid}`);
    }
  }, [autoplayEnabled, nextLesson, courseId, router]);

  const playNextVideo = () => {
    if (nextLesson) {
      router.push(`/courses/${courseId}/play/${nextLesson.uuid}`);
    }
  };

  const handleToggleAutoplay = async () => {
    try {
      const response = await videosApi.toggleAutoplay();
      setAutoplayEnabled(response.video_autoplay);
    } catch {
      setAutoplayEnabled(!autoplayEnabled);
    }
  };

  if (isLoading) {
    return <PlayerPageSkeleton />;
  }

  if (!courseData || !currentVideo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Lesson not found</h1>
          <Link href={`/courses/${courseId}`} className="text-red-primary hover:underline">
            Back to course
          </Link>
        </div>
      </div>
    );
  }

  const shouldTruncateDescription = currentVideo.description && currentVideo.description.length > 200;
  const hasAccess = courseData.user_has_access || courseData.is_free || false;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/50 mb-4">
          <Link href="/courses" className="hover:text-white transition-colors">
            Education
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            href={`/courses/${courseId}`}
            className="hover:text-white transition-colors truncate max-w-[200px]"
          >
            {courseData.title}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white/70 truncate">
            Lesson {currentLessonIndex + 1}
          </span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Video Player */}
            <div className="w-full rounded-xl overflow-hidden bg-black">
              <VideoPlayer
                thumbnail={currentVideo.thumbnail}
                hls_url={currentVideo.hls_url || currentVideo.url_hls}
                url_1440={currentVideo.url_1440}
                url_1080={currentVideo.url_1080}
                url_720={currentVideo.url_720}
                url_480={currentVideo.url_480}
                autoplay={autoplayEnabled}
                onEnded={handleVideoEnded}
              />
            </div>

            {/* Video Title */}
            <h1 className="text-lg md:text-xl font-semibold text-white mt-4 leading-snug">
              {currentVideo.title}
            </h1>

            {/* Lesson Indicator */}
            <div className="flex items-center gap-3 mt-2 text-sm text-white/60">
              <span className="px-2 py-0.5 bg-red-primary/20 text-red-primary rounded font-medium">
                Lesson {currentLessonIndex + 1} of {lessons.length}
              </span>
              {currentVideo.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(currentVideo.duration)}
                </span>
              )}
            </div>

            {/* Channel Info & Actions Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pb-4 border-b border-white/10">
              {/* Channel Info */}
              <div className="flex items-center gap-3">
                <Link
                  href={`/creators/creator-profile/${currentVideo.channel?.uuid || currentVideo.channel?.id}`}
                  className="flex-shrink-0"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    {currentVideo.channel?.dp ? (
                      <Image
                        src={currentVideo.channel.dp}
                        alt={currentVideo.channel.name || 'Channel'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface text-white font-semibold">
                        {currentVideo.channel?.name?.charAt(0) || 'C'}
                      </div>
                    )}
                  </div>
                </Link>
                <div className="min-w-0">
                  <Link
                    href={`/creators/creator-profile/${currentVideo.channel?.uuid || currentVideo.channel?.id}`}
                    className="flex items-center gap-1.5 group"
                  >
                    <span className="font-medium text-white group-hover:text-red-primary transition-colors truncate">
                      {currentVideo.channel?.name}
                    </span>
                    <CheckCircle className="w-3.5 h-3.5 text-red-primary flex-shrink-0" />
                  </Link>
                  <p className="text-xs text-white/50">
                    {currentVideo.humans_publish_at || formatRelativeTime(currentVideo.published_at)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Autoplay Toggle */}
                <button
                  onClick={handleToggleAutoplay}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium',
                    autoplayEnabled
                      ? 'bg-red-primary text-white'
                      : 'bg-surface text-white hover:bg-surface/80'
                  )}
                >
                  <SkipForward className="w-4 h-4" />
                  <span className="hidden sm:inline">Autoplay</span>
                </button>

                {/* Next Lesson Button */}
                {nextLesson && (
                  <button
                    onClick={playNextVideo}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black font-medium rounded-full transition-all hover:bg-white/90 text-sm"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span className="hidden sm:inline">Next Lesson</span>
                  </button>
                )}
              </div>
            </div>

            {/* Description Box */}
            {currentVideo.description && (
              <div
                className="mt-4 bg-surface/50 hover:bg-surface/70 rounded-xl p-4 cursor-pointer transition-colors"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              >
                <p
                  className={cn(
                    'text-sm text-white/80 whitespace-pre-wrap leading-relaxed',
                    !isDescriptionExpanded && shouldTruncateDescription && 'line-clamp-2'
                  )}
                >
                  {currentVideo.description}
                </p>
                {shouldTruncateDescription && (
                  <button className="text-sm font-medium text-white/60 hover:text-white mt-2">
                    {isDescriptionExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Lessons */}
          <div className="w-full lg:w-[400px] flex-shrink-0">
            {/* Course Info Header */}
            <Link
              href={`/courses/${courseId}`}
              className="flex items-center gap-3 p-3 bg-surface/50 rounded-xl mb-4 group hover:bg-surface/70 transition-colors"
            >
              <div className="relative w-16 h-9 rounded-lg overflow-hidden flex-shrink-0">
                {courseData.thumbnail && (
                  <Image
                    src={courseData.thumbnail}
                    alt={courseData.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/50 mb-0.5">Course</p>
                <h3 className="text-sm font-medium text-white truncate group-hover:text-red-primary transition-colors">
                  {courseData.title}
                </h3>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/50 transition-colors" />
            </Link>

            {/* Lessons Header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">All Lessons</h2>
              <span className="text-sm text-white/50">
                {currentLessonIndex + 1}/{lessons.length}
              </span>
            </div>

            {/* Lesson List */}
            <div ref={lessonsRef} className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
              {lessons.map((video, index) => (
                <LessonCard
                  key={video.uuid}
                  video={video}
                  lessonNumber={index + 1}
                  isCurrent={video.uuid === currentVideo.uuid}
                  courseId={courseId}
                  hasAccess={hasAccess}
                />
              ))}
            </div>

            {lessons.length === 0 && (
              <div className="text-center py-12 text-white/40">
                No lessons available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Lesson Card Component
function LessonCard({
  video,
  lessonNumber,
  isCurrent,
  courseId,
  hasAccess,
}: {
  video: Video;
  lessonNumber: number;
  isCurrent: boolean;
  courseId: string;
  hasAccess: boolean;
}) {
  const isLocked = !hasAccess && !video.is_free;
  const href = isLocked ? '#' : `/courses/${courseId}/play/${video.uuid}`;

  return (
    <Link
      href={href}
      onClick={isLocked ? (e) => e.preventDefault() : undefined}
      className={isLocked ? 'cursor-not-allowed' : ''}
    >
      <div
        className={cn(
          'group flex gap-3 p-2 rounded-xl transition-all',
          isCurrent
            ? 'bg-red-primary/10 ring-1 ring-red-primary/30'
            : isLocked
              ? 'opacity-50'
              : 'hover:bg-surface/50'
        )}
      >
        {/* Thumbnail */}
        <div className="relative w-[140px] h-[79px] flex-shrink-0 rounded-lg overflow-hidden bg-surface">
          {video.thumbnail ? (
            <Image
              src={video.thumbnail_webp || video.thumbnail}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-surface to-background" />
          )}

          {/* Play Overlay / Lock Icon */}
          {isLocked ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Lock className="w-5 h-5 text-white/70" />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all">
              <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all shadow-lg">
                <Play className="w-4 h-4 text-black fill-black ml-0.5" />
              </div>
            </div>
          )}

          {/* Duration */}
          {video.duration && (
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-medium text-white">
              {formatDuration(video.duration)}
            </div>
          )}

          {/* Current Indicator */}
          {isCurrent && (
            <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-red-primary animate-pulse" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 py-0.5">
          {/* Lesson Number */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                'inline-block text-[10px] font-bold px-1.5 py-0.5 rounded',
                isCurrent ? 'bg-red-primary text-white' : 'bg-surface text-white/70'
              )}
            >
              LESSON {lessonNumber}
            </span>
            {video.is_free && !hasAccess && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                FREE
              </span>
            )}
          </div>

          {/* Title */}
          <p
            className={cn(
              'text-sm font-medium line-clamp-2 leading-tight',
              isCurrent ? 'text-white' : 'text-white/80 group-hover:text-white'
            )}
          >
            {video.title}
          </p>

          {/* Channel */}
          {video.channel?.name && (
            <p className="text-xs text-white/40 mt-1 flex items-center gap-1">
              {video.channel.name}
              <CheckCircle className="w-2.5 h-2.5 text-red-primary" />
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// Skeleton Loader
function PlayerPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <div className="h-5 w-64 bg-surface/50 rounded animate-pulse mb-4" />
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="aspect-video bg-surface rounded-xl animate-pulse" />
            <div className="mt-4 space-y-3">
              <div className="h-7 w-3/4 bg-surface/50 rounded animate-pulse" />
              <div className="h-5 w-32 bg-surface/50 rounded animate-pulse" />
              <div className="flex gap-3 mt-4">
                <div className="w-10 h-10 rounded-full bg-surface/50 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-surface/50 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-surface/50 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[400px]">
            <div className="h-16 bg-surface/50 rounded-xl animate-pulse mb-4" />
            <div className="h-6 w-32 bg-surface/50 rounded animate-pulse mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-2">
                  <div className="w-[140px] h-[79px] bg-surface/50 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-12 bg-surface/50 rounded animate-pulse" />
                    <div className="h-4 w-full bg-surface/50 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-surface/50 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
