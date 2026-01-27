'use client';

import { useState, KeyboardEvent } from 'react';
import Image from 'next/image';
import { X, Send } from 'lucide-react';
import { useShortsStore } from '@/shared/stores/shorts-store';
import { useAuthStore } from '@/shared/stores/auth-store';
import { videoClient } from '@/api/client/video.client';
import type { Video } from '@/types';
import { formatRelativeTime } from '@/shared/utils/formatting';
import { toast } from 'sonner';

interface DesktopCommentSectionProps {
  video: Video | null;
}

interface Comment {
  uuid?: string;
  id?: string | number;
  user?: {
    dp?: string;
    name?: string;
  };
  created_at: string;
  content?: string;
  body?: string;
  replies?: Comment[];
}

export function DesktopCommentSection({ video }: DesktopCommentSectionProps) {
  const { user } = useAuthStore();
  const { showComments, toggleComments, commentList, appendComment } = useShortsStore();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePostComment = async () => {
    if (!content.trim() || !video) return;

    setIsSubmitting(true);
    try {
      const comment = await videoClient.addComment(video.uuid, content);
      appendComment(comment);
      setContent('');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePostComment();
    }
  };

  if (!showComments) return null;

  return (
    <div className="hidden md:inline absolute !z-[1000] w-full max-w-[525px] h-full max-h-[858px] bg-surface right-0 bottom-0 top-[6.5rem] rounded-l-[30px] overflow-hidden">
      {/* Sticky header */}
      <div className="w-full sticky z-50 top-0 bg-surface">
        {/* Header bar */}
        <div className="bg-red-primary px-6 py-5 flex items-center justify-between max-h-[60px]">
          <p className="text-[19px] font-bold">{video?.comments_count || 0} comments</p>
          <button
            onClick={toggleComments}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Comment input */}
        <div className="flex items-end px-6 py-3">
          {user?.dp ? (
            <Image
              src={user.dp}
              alt={user.display_name || 'User'}
              width={48}
              height={48}
              className="size-[48px] rounded-full mr-5 flex-shrink-0"
            />
          ) : (
            <div className="size-[48px] rounded-full mr-5 bg-gray-600 flex-shrink-0" />
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add Comment"
            rows={1}
            className="flex-1 bg-transparent border-b border-white/30 focus:border-white py-2 outline-none resize-none text-white placeholder:text-white/50"
          />
          <button
            onClick={handlePostComment}
            disabled={!content.trim() || isSubmitting}
            className="ml-3 p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Comments list */}
      <div className="overflow-auto max-h-[690px] h-full p-6 space-y-8">
        {commentList.map((comment) => (
          <SingleComment key={comment.uuid || comment.id} comment={comment} />
        ))}
        {commentList.length === 0 && (
          <p className="text-center text-white/50 py-8">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}

// Single comment component
function SingleComment({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-3">
      {comment.user?.dp ? (
        <Image
          src={comment.user.dp}
          alt={comment.user.name || 'User'}
          width={40}
          height={40}
          className="size-10 rounded-full flex-shrink-0"
        />
      ) : (
        <div className="size-10 rounded-full bg-gray-600 flex-shrink-0" />
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{comment.user?.name || 'Anonymous'}</span>
          <span className="text-xs text-white/50">{formatRelativeTime(comment.created_at)}</span>
        </div>
        <p className="text-sm text-white/80 mt-1">{comment.content || comment.body}</p>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 pl-4 border-l border-white/10 space-y-4">
            {comment.replies.map((reply: Comment) => (
              <SingleComment key={reply.uuid || reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
