'use client';

import { Button, LoadingScreen } from '@/components/ui';
import { VideoPlayerSkeleton } from '@/components/video';
import { LikeButton, SaveButton, VideoComments } from '@/features/video';
import { videos as videosApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatRelativeTime } from '@/lib/utils';
import { getTagKey, normalizeTags } from '@/lib/utils/tags';
import type { Tag, Video } from '@/types';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const VideoPlayer = dynamic(
  () => import('@/features/video').then((mod) => ({ default: mod.VideoPlayer })),
  {
    loading: () => <VideoPlayerSkeleton />,
    ssr: false,
  }
);

export default function VideoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuthStore();

  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoplayEnabled] = useState(user?.video_autoplay ?? true);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const videoRef = useRef(video);
  const relatedVideosRef = useRef(relatedVideos);
  const tagsScrollRef = useRef<HTMLDivElement>(null);
  const [showTagsLeftArrow, setShowTagsLeftArrow] = useState(false);
  const [showTagsRightArrow, setShowTagsRightArrow] = useState(false);

  const hydrateVideoTags = useCallback((videoData: Video): Video => {
    const normalizedTags = normalizeTags(videoData.tags);
    return { ...videoData, tags: normalizedTags };
  }, []);

  useEffect(() => {
    videoRef.current = video;
    relatedVideosRef.current = relatedVideos;
  }, [video, relatedVideos]);

  useEffect(() => {
    let isSubscribed = true;
    const MIN_VIDEOS = 10;

    async function fetchVideo() {
      try {
        setIsLoading(true);
        setError(null);
        const { video: videoData, videos } = await videosApi.play(id);

        let allVideos = videos || [];

        if (allVideos.length < MIN_VIDEOS) {
          try {
            const videoId = videoData.uuid || videoData.id;
            if (!videoId) return;
            const relatedResponse = await videosApi.getRelatedLongForm(videoId, 1, MIN_VIDEOS);
            const related = relatedResponse.data || [];
            const videoIds = new Set(allVideos.map((v) => v.uuid || v.id));
            related.forEach((v) => {
              const key = v.uuid || v.id;
              if (!key || videoIds.has(key) || key === (videoData.uuid || videoData.id)) return;
              if (allVideos.length < MIN_VIDEOS) {
                videoIds.add(key);
                allVideos.push(v);
              }
            });
          } catch (supplementError) {
            console.error('Failed to fetch related long-form videos:', supplementError);
          }
        }

        if (process.env.NODE_ENV === 'development') {
          const leaked = allVideos.find(
            (v: any) => v?.short === true || v?.is_short === true || v?.type === 'short'
          );
          if (leaked) {
            console.error('SHORT CONTENT LEAKED INTO /videos/[id] related list', leaked);
            throw new Error('SHORT CONTENT LEAKED INTO /videos/[id] related list');
          }
          const missingUuid = allVideos.find((v: any) => !v?.uuid);
          if (missingUuid) {
            console.error('MISSING UUID IN RELATED VIDEO', missingUuid);
            throw new Error('MISSING UUID IN RELATED VIDEO');
          }
        }

        const videoWithTags = hydrateVideoTags(videoData);
        const relatedWithTags = allVideos.map(hydrateVideoTags);

        if (!isSubscribed) return;

        setVideo(videoWithTags);
        setRelatedVideos(relatedWithTags);
        setSelectedTag(null);
      } catch (err: unknown) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
        const status = axiosError?.response?.status;

        if (status === 401) {
          if (isSubscribed) {
            setError('auth');
          }
          return;
        }

        if (status === 500) {
          console.error('Server error fetching video:', err);
          if (isSubscribed) {
            setError('server_error');
          }
          return;
        }

        console.error('Failed to fetch video:', err);
        if (isSubscribed) {
          setError('not_found');
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    if (id) {
      fetchVideo();
    }

    return () => {
      isSubscribed = false;
    };
  }, [id, hydrateVideoTags]);

  const availableTags = useMemo(() => {
    const tagMap = new Map<string, Tag>();
    const addTags = (tags?: Tag[]) => {
      tags?.forEach((tag) => {
        if (tag.should_show === false) return;
        const key = getTagKey(tag);
        if (key && !tagMap.has(key)) {
          tagMap.set(key, tag);
        }
      });
    };
    addTags(video?.tags);
    relatedVideos.forEach((v) => addTags(v.tags));
    return Array.from(tagMap.values());
  }, [video, relatedVideos]);

  const filteredVideos = useMemo(() => {
    if (!selectedTag) {
      return relatedVideos;
    }
    return relatedVideos.filter((v) => v.tags?.some((tag) => tag.name === selectedTag));
  }, [relatedVideos, selectedTag]);

  const handleTagsScroll = useCallback(() => {
    if (tagsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tagsScrollRef.current;
      setShowTagsLeftArrow(scrollLeft > 10);
      setShowTagsRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    const el = tagsScrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleTagsScroll);
      handleTagsScroll();
      return () => el.removeEventListener('scroll', handleTagsScroll);
    }
    return undefined;
  }, [handleTagsScroll, availableTags]);

  const scrollTags = (direction: 'left' | 'right') => {
    if (tagsScrollRef.current) {
      const scrollAmount = 150;
      tagsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleVideoEnded = useCallback(() => {
    if (autoplayEnabled) {
      playNextVideo();
    }
  }, [autoplayEnabled]);

  const playNextVideo = useCallback(() => {
    const currentVideo = videoRef.current;
    const videos = relatedVideosRef.current;
    if (!currentVideo || videos.length === 0) return;
    const currentKey = currentVideo.uuid || currentVideo.id;
    const currentIndex = videos.findIndex((v) => (v.uuid || v.id) === currentKey);
    if (currentIndex >= 0 && currentIndex < videos.length - 1) {
      const nextVideo = videos[currentIndex + 1];
      if (nextVideo) {
        const nextId = nextVideo.uuid || nextVideo.id;
        if (nextId) {
          router.push(`/videos/${nextId}`);
        }
      }
    } else if (videos.length > 0) {
      const firstVideo = videos[0];
      if (firstVideo) {
        const firstId = firstVideo.uuid || firstVideo.id;
        if (firstId) {
          router.push(`/videos/${firstId}`);
        }
      }
    }
  }, [router]);

  if (isLoading || error === 'auth') {
    return <LoadingScreen variant="video" />;
  }

  if (error === 'server_error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
        <p className="text-text-secondary mt-2">
          We&apos;re having trouble loading this video. Please try again later.
        </p>
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => globalThis.window.location.reload()}
            className="text-red-primary hover:underline"
          >
            Try again
          </button>
          <Link href="/home" className="text-text-secondary hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-white">Video not found</h1>
        <p className="text-text-secondary mt-2">
          The video you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/home" className="mt-4 text-red-primary hover:underline">
          Go back home
        </Link>
      </div>
    );
  }

  const shouldTruncateDescription = video.description && video.description.length > 200;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <div className="w-full rounded-lg overflow-hidden bg-black">
              <VideoPlayer
                {...(video.thumbnail && { thumbnail: video.thumbnail })}
                hls_url={video.hls_url || video.url_hls || null}
                url_1440={video.url_1440 || null}
                url_1080={video.url_1080 || null}
                url_720={video.url_720 || null}
                url_480={video.url_480 || null}
                autoplay={autoplayEnabled}
                onEnded={handleVideoEnded}
              />
            </div>

            <h1 className="font-medium text-white mt-3 leading-snug" style={{ fontSize: '24px' }}>
              {video.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-3 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Link
                  href={`/creators/creator-profile/${video.channel?.uuid || video.channel?.id}`}
                  className="shrink-0"
                >
                  <div className="relative size-10 rounded-full overflow-hidden">
                    {video.channel?.dp ? (
                      <Image
                        src={video.channel.dp}
                        alt={video.channel.name || 'Channel'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center bg-surface text-white font-semibold">
                        {video.channel?.name?.charAt(0) || 'C'}
                      </div>
                    )}
                  </div>
                </Link>
                <div className="min-w-0">
                  <Link
                    href={`/creators/creator-profile/${video.channel?.uuid || video.channel?.id}`}
                    className="flex items-center gap-1 group"
                  >
                    <span className="font-medium text-white group-hover:text-text-secondary transition-colors truncate">
                      {video.channel?.name}
                    </span>
                    <CheckCircle className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                  </Link>
                  <p className="text-xs text-text-secondary">
                    {video.humans_publish_at || formatRelativeTime(video.published_at)}
                  </p>
                </div>
                {video.channel?.paypal_link && (
                  <a
                    href={video.channel.paypal_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2"
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      className="rounded-full px-4 font-medium text-sm"
                    >
                      Donate
                    </Button>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <LikeButton video={video} onUpdate={setVideo} />
                <SaveButton video={video} />
              </div>
            </div>

            {video.description && (
              <button
                type="button"
                className="mt-3 w-full text-left bg-surface hover:bg-hover rounded-lg p-3 transition-colors"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              >
                <p
                  className={`text-sm text-text-secondary whitespace-pre-wrap ${
                    !isDescriptionExpanded && shouldTruncateDescription ? 'line-clamp-2' : ''
                  }`}
                >
                  {video.description}
                </p>
                {shouldTruncateDescription && (
                  <span className="block text-sm font-medium text-white mt-2">
                    {isDescriptionExpanded ? 'Show less' : 'Show more'}
                  </span>
                )}
              </button>
            )}

            <div className="mt-6">
              <VideoComments video={video} initialComments={video.comments || []} />
            </div>
          </div>

          <div className="w-full lg:w-[402px] shrink-0">
            {availableTags.length > 0 && (
              <div className="relative mb-3 group/tags">
                {showTagsLeftArrow && (
                  <button
                    onClick={() => scrollTags('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-background/90 rounded-full shadow-md"
                  >
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                )}

                {showTagsRightArrow && (
                  <button
                    onClick={() => scrollTags('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-background/90 rounded-full shadow-md"
                  >
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                )}

                <div
                  ref={tagsScrollRef}
                  className="flex gap-2 overflow-x-auto hide-scrollbar scroll-smooth py-1 px-1"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedTag === null
                        ? 'bg-white text-black'
                        : 'bg-surface text-white hover:bg-hover'
                    }`}
                  >
                    All
                  </button>

                  {availableTags.map((tag) => (
                    <button
                      key={getTagKey(tag)}
                      onClick={() => setSelectedTag(tag.name)}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedTag === tag.name
                          ? 'bg-white text-black'
                          : 'bg-surface text-white hover:bg-hover'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {filteredVideos.length === 0 ? (
                <p className="text-text-secondary text-sm py-4">No videos found for this tag.</p>
              ) : (
                filteredVideos.map((item) => (
                  <Link
                    key={item.id}
                    href={`/videos/${item.uuid || item.id}`}
                    prefetch={false}
                    className={`group flex gap-2 rounded-lg p-2 -mx-2 transition-colors hover:bg-surface ${
                      (item.uuid || item.id) === (video.uuid || video.id) ? 'bg-surface' : ''
                    }`}
                  >
                    <div className="relative w-[168px] h-[94px] shrink-0 rounded-md overflow-hidden bg-surface">
                      {item.thumbnail && (
                        <Image
                          src={item.thumbnail_webp || item.thumbnail}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 py-0.5">
                      <p className="text-sm font-medium text-white line-clamp-2 leading-snug group-hover:text-text-primary">
                        {item.title}
                      </p>
                      <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                        {item.channel?.name}
                        <CheckCircle className="w-3 h-3 text-text-secondary" />
                      </p>
                      <p className="text-xs text-text-secondary">
                        {formatRelativeTime(item.published_at)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
