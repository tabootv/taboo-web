'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Send } from 'lucide-react';
import { videos as videosApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { Comment, Video } from '@/types';
import { SingleComment } from './single-comment';

interface VideoCommentsProps {
  video: Video;
  initialComments?: Comment[];
}

export function VideoComments({ video, initialComments = [] }: VideoCommentsProps) {
  const { user } = useAuthStore();
  const [commentList, setCommentList] = useState<Comment[]>(initialComments);
  const [showAllComments, setShowAllComments] = useState(true);
  const [content, setContent] = useState('');
  const [_isFocused, _setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // On mobile, collapse comments by default
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setShowAllComments(false);
    }
  }, []);

  // Update comments when video changes
  useEffect(() => {
    setCommentList(video.comments as Comment[] || initialComments);
  }, [video, initialComments]);

  const getVisibleComments = useCallback(() => {
    if (showAllComments) {
      return commentList;
    }
    return commentList.slice(0, 1);
  }, [showAllComments, commentList]);

  const postComment = useCallback(async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newComment = await videosApi.addComment(video.uuid, content);
      setCommentList((prev) => [newComment, ...prev]);
      setContent('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [content, video.uuid, isSubmitting]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      postComment();
    }
  };

  const handleReplyAdded = useCallback((reply: Comment) => {
    // Find parent comment and add reply to it
    setCommentList((prev) => {
      const parentId = reply.parent_id;
      if (!parentId) return prev;

      return prev.map((comment) => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), reply],
          };
        }
        return comment;
      });
    });
  }, []);

  return (
    <div>
      <p className="text-sm font-medium text-white/70">
        {video.comments_count} comments
      </p>

      {/* Comment Input */}
      <div className="flex items-center gap-3 mt-3 mb-3 md:my-5">
        <div className="relative size-[36px] md:size-[40px] rounded-full overflow-hidden bg-surface flex-shrink-0 border border-border">
          {user?.dp ? (
            <Image src={user.dp} alt={user.display_name || 'You'} fill className="object-cover" />
          ) : (
            <div className="size-full flex items-center justify-center bg-red-primary text-white text-xs md:text-sm font-medium">
              {user?.display_name?.charAt(0) || 'U'}
            </div>
          )}
        </div>

        <div className="flex items-center w-full">
          <div className="flex-1 relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add Comment"
              rows={1}
              className="w-full bg-surface/60 border border-border focus:border-white/20 focus:outline-none rounded-full resize-none py-2.5 px-4 text-sm text-white placeholder:text-white/60 transition-colors"
            />
          </div>
          <button
            onClick={postComment}
            disabled={isSubmitting || !content.trim()}
            className="p-2 ml-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3 md:space-y-5">
        {getVisibleComments().map((comment) => (
          <SingleComment
            key={comment.uuid}
            comment={comment}
            videoUuid={video.uuid}
            onReplyAdded={handleReplyAdded}
          />
        ))}
      </div>

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
