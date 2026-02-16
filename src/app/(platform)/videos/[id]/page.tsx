import { videoClient } from '@/api/client/video.client';
import { ErrorBoundary } from '@/shared/components/error-boundary';
import { decodeCookieToken, TOKEN_KEY } from '@/shared/lib/auth/cookie-config';
import type { Video } from '@/types';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { after } from 'next/server';
import { cache, Suspense } from 'react';
import { RelatedVideosSidebar } from './_components/related-videos-sidebar';
import { ShakaPreloader } from './_components/shaka-preloader';
import { CommentsSkeleton, RelatedVideosSkeleton } from './_components/skeletons';
import { VideoCommentsSection } from './_components/video-comments-section';
import { VideoPlayerSection } from './_components/video-player-section';

const getVideoPlayData = cache(async (id: string, serverToken?: string) => {
  try {
    return await videoClient.play(id, serverToken);
  } catch {
    return null;
  }
});

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const cookieStore = await cookies();
  const serverToken = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);
  const playData = await getVideoPlayData(id, serverToken);

  if (!playData?.video) {
    return { title: 'Video | TabooTV' };
  }

  return {
    title: playData.video.title,
    description: playData.video.description?.slice(0, 160),
    openGraph: {
      title: playData.video.title,
      description: playData.video.description?.slice(0, 160),
      images: playData.video.thumbnail ? [{ url: playData.video.thumbnail }] : undefined,
      type: 'video.other',
    },
    twitter: {
      card: 'summary_large_image',
      title: playData.video.title,
      description: playData.video.description?.slice(0, 160),
      images: playData.video.thumbnail ? [playData.video.thumbnail] : undefined,
    },
  };
}

/** Extract CDN origin from a video source URL for preconnect */
function getCdnOrigin(video: Video): string | null {
  const src =
    video.hls_url ||
    video.url_hls ||
    video.url_1440 ||
    video.url_1080 ||
    video.url_720 ||
    video.url_480;
  if (!src) return null;
  try {
    return new URL(src).origin;
  } catch {
    return null;
  }
}

export default async function VideoPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const serverToken = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);
  const playData = await getVideoPlayData(id, serverToken);

  if (!playData?.video) {
    notFound();
  }

  after(async () => {
    // Non-blocking view count tracking after response streams
    // The play() endpoint already records a view on the backend;
    // this hook is reserved for future analytics (e.g. PostHog server-side events)
  });

  // --- Step 4a: Server-side tag-based related videos ---
  const tagIds = (playData.video.tags || [])
    .filter((t) => t.should_show !== false)
    .map((t) => t.id)
    .filter(Boolean);

  let relatedVideos: Video[] = playData.videos;
  if (tagIds.length > 0) {
    try {
      const tagResult = await videoClient.list(
        { tag_ids: tagIds, limit: 10, published: true, short: false, type: 'video' },
        serverToken
      );
      relatedVideos = tagResult.data.filter((v) => String(v.uuid || v.id) !== id);
    } catch {
      // Fall back to play() endpoint's videos
    }
  }

  // --- Step 5: Slim RSC serialization ---
  // Lean video for comments section (strip heavy fields)
  const commentsVideo = {
    uuid: playData.video.uuid,
    id: playData.video.id,
    comments_count: playData.video.comments_count,
    comments: playData.video.comments,
    channel: playData.video.channel ? { user_id: playData.video.channel.user_id } : undefined,
  } as Video;

  // Lean videos for sidebar (strip description, comments, captions)
  const leanRelatedVideos = relatedVideos.map(
    ({ description: _description, comments: _comments, captions: _captions, ...v }) => v
  ) as Video[];

  // --- Step 6: Dynamic CDN preconnect ---
  const hlsUrl = playData.video.hls_url || playData.video.url_hls;
  const cdnOrigin = getCdnOrigin(playData.video);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1800px] mx-auto px-6 py-4 lg:py-6 relative z-10">
        <ShakaPreloader />
        {cdnOrigin ? <link rel="preconnect" href={cdnOrigin} /> : null}
        {hlsUrl ? <link rel="preload" href={hlsUrl} as="fetch" crossOrigin="anonymous" /> : null}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <VideoPlayerSection initialPlayData={playData} videoId={id} />

            <ErrorBoundary fallback={<CommentsSkeleton />}>
              <Suspense fallback={<CommentsSkeleton />}>
                <VideoCommentsSection video={commentsVideo} />
              </Suspense>
            </ErrorBoundary>
          </div>

          <ErrorBoundary fallback={<RelatedVideosSkeleton />}>
            <Suspense fallback={<RelatedVideosSkeleton />}>
              <RelatedVideosSidebar
                initialVideos={leanRelatedVideos}
                currentVideo={playData.video}
                videoTags={playData.video.tags}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
