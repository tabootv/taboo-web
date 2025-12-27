'use client';

import { CoursePlayerPageSkeleton, LessonCardPlayer } from '@/components/courses';
import { VideoPlayerSkeleton } from '@/components/video';
import { useCourseDetail, useCoursePlay, useVideo, useMe } from '@/api/queries';
import { useToggleAutoplay } from '@/api/mutations';
import { cn, formatDuration, formatRelativeTime } from '@/lib/utils';
import type { Course, Video } from '@/types';
import { ChevronRight, Clock, Play, SkipForward } from 'lucide-react';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useCallback, useEffect, useRef, useState } from 'react';

const VideoPlayer = dynamic(
  () => import('@/features/video').then((mod) => ({ default: mod.VideoPlayer })),
  {
    loading: () => <VideoPlayerSkeleton />,
    ssr: false,
  }
);

export default function CoursePlayerPage({
  params,
}: {
  params: Promise<{ id: string; videoUuid: string }>;
}) {
  const { id: courseId, videoUuid } = use(params);
  const router = useRouter();
  const lessonsRef = useRef<HTMLDivElement>(null);

  const { data: courseData, isLoading: isLoadingCourse } = useCourseDetail(courseId);
  const { data: currentVideo, isLoading: isLoadingPlay } = useCoursePlay(videoUuid);
  const { data: meData } = useMe();
  const toggleAutoplay = useToggleAutoplay();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const isLoading = isLoadingCourse || isLoadingPlay;
  const lessons = courseData?.videos || [];
  const autoplayEnabled = meData?.user?.video_autoplay || false;

  const currentLessonIndex = lessons.findIndex((v) => v.uuid === currentVideo?.uuid);
  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < lessons.length - 1
      ? lessons[currentLessonIndex + 1]
      : null;

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

  const handleToggleAutoplay = () => {
    toggleAutoplay.mutate();
  };

  if (isLoading) {
    return <CoursePlayerPageSkeleton />;
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

  const shouldTruncateDescription =
    currentVideo.description && currentVideo.description.length > 200;
  const hasAccess = courseData.user_has_access || courseData.is_free || false;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
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
          <span className="text-white/70 truncate">Lesson {currentLessonIndex + 1}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <div className="w-full rounded-xl overflow-hidden bg-black">
              <VideoPlayer
                {...(currentVideo.thumbnail && { thumbnail: currentVideo.thumbnail })}
                hls_url={currentVideo.hls_url || currentVideo.url_hls || null}
                url_1440={currentVideo.url_1440 || null}
                url_1080={currentVideo.url_1080 || null}
                url_720={currentVideo.url_720 || null}
                url_480={currentVideo.url_480 || null}
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

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Link
                  href={`/creators/creator-profile/${
                    currentVideo.channel?.uuid || currentVideo.channel?.id
                  }`}
                  className="shrink-0"
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
                    href={`/creators/creator-profile/${
                      currentVideo.channel?.uuid || currentVideo.channel?.id
                    }`}
                    className="flex items-center gap-1.5 group"
                  >
                    <span className="font-medium text-white group-hover:text-red-primary transition-colors truncate">
                      {currentVideo.channel?.name}
                    </span>
                    <span className="shrink-0"><VerifiedBadge size={14} /></span>
                  </Link>
                  <p className="text-xs text-white/50">
                    {currentVideo.humans_publish_at ||
                      formatRelativeTime(currentVideo.published_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
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

            {currentVideo.description && (
              <button
                type="button"
                className="mt-4 w-full text-left bg-surface/50 hover:bg-surface/70 rounded-xl p-4 transition-colors"
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
                  <span className="block text-sm font-medium text-white/60 hover:text-white mt-2">
                    {isDescriptionExpanded ? 'Show less' : 'Show more'}
                  </span>
                )}
              </button>
            )}
          </div>

          <div className="w-full lg:w-[400px] shrink-0">
            <Link
              href={`/courses/${courseId}`}
              className="flex items-center gap-3 p-3 bg-surface/50 rounded-xl mb-4 group hover:bg-surface/70 transition-colors"
            >
              <div className="relative w-16 h-9 rounded-lg overflow-hidden shrink-0">
                {(courseData.course_thumbnail || courseData.card_thumbnail || courseData.thumbnail || courseData.trailer_thumbnail || courseData.desktop_banner) && (
                  <Image
                    src={courseData.course_thumbnail || courseData.card_thumbnail || courseData.thumbnail || courseData.trailer_thumbnail || courseData.desktop_banner || ''}
                    alt={courseData.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/50 mb-0.5">Education</p>
                <h3 className="text-sm font-medium text-white truncate group-hover:text-red-primary transition-colors">
                  {courseData.title}
                </h3>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/50 transition-colors" />
            </Link>

            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">All Lessons</h2>
              <span className="text-sm text-white/50">
                {currentLessonIndex + 1}/{lessons.length}
              </span>
            </div>

            <div
              ref={lessonsRef}
              className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar"
            >
              {lessons.map((video, index) => (
                <LessonCardPlayer
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
              <div className="text-center py-12 text-white/40">No lessons available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
