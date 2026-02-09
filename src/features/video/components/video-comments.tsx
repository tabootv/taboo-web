'use client';

import { useState, useCallback, useEffect } from 'react';
import posthog from 'posthog-js';
import { useAddComment } from '@/api/mutations/comments.mutations';
import { useVideoComments } from '@/api/queries/video.queries';
import { AnalyticsEvent } from '@/shared/lib/analytics/events';
import { useAuthStore } from '@/shared/stores/auth-store';
import type { Comment, Video } from '@/types';
import { CommentInput, CommentList, filterValidComments } from './_comments';

interface VideoCommentsProps {
  video: Video;
  initialComments?: Comment[];
}

export function VideoComments({ video, initialComments = [] }: VideoCommentsProps) {
  const { user } = useAuthStore();
  const [showAllComments, setShowAllComments] = useState(true);
  const [content, setContent] = useState('');

  // Subscribe to comments cache - updates automatically when mutations modify the cache
  const { data: commentsData } = useVideoComments(video.uuid);
  const comments = commentsData?.data ?? initialComments;

  const addCommentMutation = useAddComment(video.uuid);

  // On mobile, collapse comments by default
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setShowAllComments(false);
    }
  }, []);

  const getVisibleComments = useCallback(() => {
    const validComments = filterValidComments(comments);
    if (showAllComments) {
      return validComments;
    }
    return validComments.slice(0, 1);
  }, [showAllComments, comments]);

  const postComment = useCallback(() => {
    if (!content.trim() || addCommentMutation.isPending || !user) return;

    addCommentMutation.mutate(
      { content, user },
      {
        onSuccess: () => {
          posthog.capture(AnalyticsEvent.COMMENT_CREATED, {
            video_uuid: video.uuid,
            comment_length: content.trim().length,
          });
          setContent('');
        },
        onError: (error) => {
          console.error('Failed to post comment:', error);
        },
      }
    );
  }, [content, user, addCommentMutation, video.uuid]);

  return (
    <div>
      <p className="text-sm font-medium text-white/70">{video.comments_count} comments</p>

      <CommentInput
        user={user}
        value={content}
        onChange={setContent}
        onSubmit={postComment}
        isPending={addCommentMutation.isPending}
        placeholder="Add Comment"
      />

      <CommentList
        comments={getVisibleComments()}
        videoUuid={video.uuid}
        channelUserId={video.channel?.user_id}
      />

      {/* Show All/Hide Comments Toggle (Mobile Only) */}
      {video.comments_count > 1 && (
        <button
          onClick={() => setShowAllComments(!showAllComments)}
          className="text-white/60 text-sm mt-3 lg:hidden hover:text-white"
        >
          {showAllComments ? 'Hide comments' : 'See all comments'}
        </button>
      )}
    </div>
  );
}
