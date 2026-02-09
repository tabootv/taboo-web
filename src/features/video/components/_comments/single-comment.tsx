'use client';

import { useAddComment, useDeleteComment } from '@/api/mutations/comments.mutations';
import { AnalyticsEvent } from '@/shared/lib/analytics/events';
import { useAuthStore } from '@/shared/stores/auth-store';
import type { Comment } from '@/types';
import { Reply, Send, Trash2 } from 'lucide-react';
import Image from 'next/image';
import posthog from 'posthog-js';
import { useCallback, useState, useTransition } from 'react';
import { filterValidComments, getCommentKey } from './comment-utils';

interface SingleCommentProps {
  comment: Comment;
  videoUuid: string;
  channelUserId?: number | undefined;
  isReply?: boolean | undefined;
}

export function SingleComment({
  comment,
  videoUuid,
  channelUserId,
  isReply = false,
}: SingleCommentProps) {
  const { user } = useAuthStore();
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isDeleting, startDeleteTransition] = useTransition();

  const deleteComment = useDeleteComment(videoUuid);
  const addReplyMutation = useAddComment(videoUuid);

  // User can delete their own comments or channel owner can delete any comment
  const canDelete = user?.id === comment.user?.id || user?.id === channelUserId;

  // Read replies directly from comment prop (comes from cache)
  const validReplies = filterValidComments(comment.replies || []);

  const postReply = useCallback(() => {
    if (!replyContent.trim() || addReplyMutation.isPending || !user) return;

    const parentId = comment.parent_id ?? comment.id;
    addReplyMutation.mutate(
      { content: replyContent, parentId, user },
      {
        onSuccess: () => {
          posthog.capture(AnalyticsEvent.COMMENT_REPLY_CREATED, {
            video_uuid: videoUuid,
            parent_comment_id: comment.parent_id ?? comment.id,
          });
          setReplyContent('');
          setShowReplies(true);
          setShowReplyInput(false);
        },
        onError: (error) => {
          console.error('Failed to post reply:', error);
        },
      }
    );
  }, [comment.id, comment.parent_id, replyContent, user, addReplyMutation]);

  const handleDelete = useCallback(() => {
    if (!comment.uuid || isDeleting) return;

    startDeleteTransition(async () => {
      try {
        await deleteComment.mutateAsync(comment.uuid);
        posthog.capture(AnalyticsEvent.COMMENT_DELETED, { video_uuid: videoUuid });
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    });
  }, [comment.uuid, isDeleting, deleteComment]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      postReply();
    }
  };

  // Dynamic reply toggle text based on count and state
  const getReplyToggleText = () => {
    const count = validReplies.length;
    if (showReplies) return 'Hide replies';
    if (count === 1) return 'View reply';
    return `View ${count} replies`;
  };

  const isOptimistic = comment._optimistic;

  return (
    <div
      className={`w-full transition-opacity duration-300 ${isOptimistic ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-fit">
          <div className="relative size-[34px] md:size-[40px] rounded-full overflow-hidden bg-surface border border-border">
            {comment.user?.dp ? (
              <Image
                src={comment.user.dp}
                alt={comment.user.display_name || 'User'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="size-full flex items-center justify-center bg-red-primary text-white text-xs md:text-sm font-medium">
                {comment.user?.display_name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[13px] md:text-[15px] font-semibold leading-tight">
              {comment.user?.display_name}
            </p>
            {comment.user?.badge && (
              <Image
                src={comment.user.badge}
                alt="Badge"
                width={15}
                height={15}
                className="h-[15px] w-auto"
              />
            )}
          </div>
          <span className="text-[12px] md:text-[13px] text-[#807E81]">{comment.created_at}</span>
        </div>

        <div className="flex items-center gap-1">
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="min-h-[38px] p-1.5 flex items-center hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
              title="Delete comment"
            >
              <Trash2 className="w-4 h-4 text-white/70 hover:text-red-400" />
            </button>
          )}
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="min-h-[38px] p-1.5 flex items-center hover:bg-white/10 rounded-full transition-colors"
          >
            <Reply className="w-4 h-4 text-white" style={{ transform: 'scaleX(-1)' }} />
          </button>
        </div>
      </div>

      <p className="text-[14px] md:text-[15px] font-normal whitespace-pre-wrap break-words mt-2 leading-[20px] md:leading-[22px]">
        {comment.content}
      </p>

      {/* Reply Input */}
      {showReplyInput && (
        <div className="mt-4">
          {comment.user?.display_name && (
            <p className="text-xs text-white/50 mb-2">Replying to @{comment.user.display_name}</p>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Reply Comment"
              rows={1}
              className="flex-1 bg-transparent border-b border-white/30 focus:border-white/60 outline-none resize-none py-2 text-white placeholder:text-white/50"
            />
            <button
              onClick={postReply}
              disabled={addReplyMutation.isPending || !replyContent.trim()}
              className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Show Replies Toggle */}
      {validReplies.length > 0 && (
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="text-[13px] md:text-[16px] font-medium text-primary leading-[18px] mt-2 lg:mt-3"
        >
          {getReplyToggleText()}
        </button>
      )}

      {/* Replies */}
      {showReplies && validReplies.length > 0 && (
        <div className="pl-6 space-y-4 relative mt-4">
          {!isReply && (
            <svg
              className="absolute -left-0 top-3 size-[13px] md:size-[22px] text-white/50"
              viewBox="0 0 22 22"
              fill="none"
            >
              <path
                d="M1 1V15C1 18.3137 3.68629 21 7 21H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
          {validReplies.map((reply, index) => (
            <SingleComment
              key={getCommentKey(reply, index)}
              comment={reply}
              videoUuid={videoUuid}
              channelUserId={channelUserId}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
