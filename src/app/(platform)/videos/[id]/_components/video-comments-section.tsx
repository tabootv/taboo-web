'use client';

import { VideoComments } from '@/features/video/components/video-comments';
import type { Video } from '@/types';

interface VideoCommentsSectionProps {
  video: Video;
}

export function VideoCommentsSection({ video }: VideoCommentsSectionProps) {
  return (
    <div className="mt-4 bg-surface/60 border border-border rounded-xl p-4">
      <VideoComments video={video} initialComments={video.comments || []} />
    </div>
  );
}
