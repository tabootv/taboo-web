'use client';

import { postsClient as postsApi } from '@/api/client/posts.client';
import { useDeletePostComment } from '@/api/mutations';
import { MentionText } from '@/features/video/components/_comments/mention-text';
import { useAuthStore } from '@/shared/stores/auth-store';
import { cn } from '@/shared/utils/formatting';
import type { PostComment as PostCommentType } from '@/types';
import { ChevronDown, ChevronUp, Heart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { PostCommentInput } from './post-comment-input';

interface PostCommentProps {
  comment: PostCommentType;
  index: number;
  onCommentDeleted?: (commentId: number) => void;
}

export function PostComment({ comment, index, onCommentDeleted }: PostCommentProps) {
  const { user: authUser } = useAuthStore();
  const [isLiked, setIsLiked] = useState(comment.has_liked);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [commentReplies, setCommentReplies] = useState<PostCommentType[]>([]);
  const [tempCommentReplies, setTempCommentReplies] = useState<PostCommentType[]>([]);
  const [newReplyText, setNewReplyText] = useState('');
  const [repliesCount, setRepliesCount] = useState(comment.replies_count || 0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const canDelete = authUser?.id === comment.user?.id;
  const deleteComment = useDeletePostComment();

  const toggleReply = () => {
    if (!showReplyInput && comment.user?.handler) {
      setNewReplyText(`@${comment.user.handler} `);
    } else if (!showReplyInput) {
      setNewReplyText('');
    }
    setShowReplyInput(!showReplyInput);
  };

  const handleDelete = () => {
    deleteComment.mutate(
      { commentUuid: comment.uuid, postId: comment.post_id },
      {
        onSuccess: () => {
          setShowDeleteDialog(false);
          toast.success('Comment deleted');
          onCommentDeleted?.(comment.id);
        },
        onError: () => toast.error('Failed to delete comment'),
      }
    );
  };

  const toggleLike = async () => {
    try {
      await postsApi.likeComment(comment.id);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const getAllReplies = async () => {
    if (!showReplies) {
      setTempCommentReplies([]);
      try {
        const response = await postsApi.getCommentReplies(comment.id);
        setCommentReplies(response.data || []);
        setShowReplies(true);
      } catch (error) {
        console.error('Failed to get replies:', error);
      }
    } else {
      setShowReplies(false);
    }
  };

  const submitReply = async () => {
    if (!newReplyText.trim()) {
      alert('Comment cannot be empty or just spaces.');
      return;
    }

    try {
      const myComment = await postsApi.postComment(comment.post_id, newReplyText, comment.id);
      const commentWithTime = { ...myComment, created_at: 'just now' };

      if (showReplies) {
        setCommentReplies([...commentReplies, commentWithTime]);
        setTempCommentReplies([]);
      } else {
        setTempCommentReplies([...tempCommentReplies, commentWithTime]);
      }
      setNewReplyText('');
      setRepliesCount(repliesCount + 1);
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  return (
    <div className={index > 0 ? 'mt-4' : 'mt-3'}>
      <div className="flex items-start gap-2.5">
        <div className="relative size-8 rounded-full overflow-hidden bg-surface flex-shrink-0">
          {comment.user?.dp ? (
            <Image
              src={comment.user.dp}
              alt={comment.user.display_name || 'User'}
              fill
              className="object-cover"
            />
          ) : (
            <div className="size-full flex items-center justify-center bg-red-primary text-white text-xs font-medium">
              {comment.user?.display_name?.charAt(0) || 'U'}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {comment.user?.handler ? (
              <Link
                href={`/profile/${comment.user.handler}`}
                className="text-sm font-medium text-white hover:underline"
              >
                @{comment.user.handler}
              </Link>
            ) : (
              <span className="text-sm font-medium text-white capitalize">
                {comment.user?.display_name}
              </span>
            )}
            <span className="text-xs text-text-tertiary">{comment.created_at}</span>
          </div>

          <p className="text-sm text-text-primary mt-0.5">
            <MentionText content={comment.content} />
          </p>

          {/* Actions Row */}
          <div className="flex items-center gap-3 mt-1.5">
            <button
              onClick={toggleLike}
              className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
            >
              <Heart
                className={cn('w-3.5 h-3.5', isLiked ? 'fill-[#ef4444] text-[#ef4444]' : '')}
              />
            </button>
            <button
              onClick={toggleReply}
              className="text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
            >
              Reply
            </button>
            {canDelete && (
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-1 text-xs text-text-tertiary hover:text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reply Input */}
      {showReplyInput ? (
        <div className="ml-11 mt-2">
          {(comment.user?.handler || comment.user?.display_name) && (
            <p className="text-xs text-text-tertiary mb-1.5">
              Replying to{' '}
              {comment.user.handler ? (
                <Link
                  href={`/profile/${comment.user.handler}`}
                  className="text-red-primary hover:underline"
                >
                  @{comment.user.handler}
                </Link>
              ) : (
                comment.user.display_name
              )}
            </p>
          )}
          <PostCommentInput
            variant="reply"
            value={newReplyText}
            onChange={setNewReplyText}
            onSubmit={submitReply}
            placeholder="Reply..."
          />
        </div>
      ) : null}

      {/* Replies Toggle */}
      {repliesCount > 0 ? (
        <div className="ml-11 mt-2">
          <button
            onClick={getAllReplies}
            className="flex items-center gap-1 text-primary text-xs font-medium cursor-pointer hover:underline"
          >
            {repliesCount} replies
            {showReplies ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Loaded Replies */}
          {showReplies ? (
            <div className="mt-3 space-y-3">
              {commentReplies.map((reply) => (
                <CommentReply key={reply.id} reply={reply} />
              ))}
            </div>
          ) : null}

          {/* Temp Replies (newly added) */}
          {tempCommentReplies.length > 0 ? (
            <div className="mt-3 space-y-3">
              {tempCommentReplies.map((reply) => (
                <CommentReply key={reply.id} reply={reply} />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowDeleteDialog(false)}
            aria-hidden="true"
          />
          <div className="relative bg-surface border-2 border-[rgba(126,1,1,0.37)] rounded-[20px] p-6 max-w-[400px] w-full mx-4">
            <h2 className="text-xl font-bold text-text-primary mb-4">Delete Comment</h2>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 rounded-lg text-text-secondary hover:bg-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteComment.isPending}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleteComment.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CommentReply({ reply }: { reply: PostCommentType }) {
  return (
    <div className="flex items-start gap-2">
      <div className="relative size-6 rounded-full overflow-hidden bg-surface flex-shrink-0">
        {reply.user?.dp ? (
          <Image
            src={reply.user.dp}
            alt={reply.user.display_name || 'User'}
            fill
            className="object-cover"
          />
        ) : (
          <div className="size-full flex items-center justify-center bg-red-primary text-white text-[10px] font-medium">
            {reply.user?.display_name?.charAt(0) || 'U'}
          </div>
        )}
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          {reply.user?.handler ? (
            <Link
              href={`/profile/${reply.user.handler}`}
              className="text-xs font-medium text-white hover:underline"
            >
              @{reply.user.handler}
            </Link>
          ) : (
            <span className="text-xs font-medium text-white capitalize">
              {reply.user?.display_name}
            </span>
          )}
          <span className="text-[10px] text-text-tertiary">{reply.created_at}</span>
        </div>
        <p className="text-xs text-text-primary mt-0.5">
          <MentionText content={reply.content} />
        </p>
      </div>
    </div>
  );
}
