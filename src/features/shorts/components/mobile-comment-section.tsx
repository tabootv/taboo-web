'use client';

import { useState, KeyboardEvent } from 'react';
import Image from 'next/image';
import { X, Send } from 'lucide-react';
import { useShortsStore } from '@/lib/stores/shorts-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { videoClient } from '@/api/client';
import type { Video } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

interface MobileCommentSectionProps {
  video: Video | null;
}

export function MobileCommentSection({ video }: MobileCommentSectionProps) {
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

  return (
    <>
      {/* Backdrop */}
      {showComments && (
        <div
          className="absolute z-40 inset-0 md:hidden"
          onClick={toggleComments}
        />
      )}

      {/* Comment panel with slide-up animation */}
      <div
        className={`z-50 absolute bottom-0 left-0 right-0 p-3 space-y-3 md:hidden transition-transform duration-300 ${
          showComments ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Comments container */}
        <div
          className="rounded-[12px] bg-white/10 h-[390px] w-full py-2 pl-2 overflow-hidden"
          style={{ backdropFilter: 'blur(15px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between sticky px-2">
            <p className="font-bold text-sm">{video?.comments_count || 0} comments</p>
            <button
              onClick={toggleComments}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Comments list */}
          <div className="h-full w-full space-y-5 overflow-y-auto overflow-x-hidden max-h-[340px] pr-2">
            {commentList.map((comment) => (
              <MobileComment key={comment.uuid || comment.id} comment={comment} />
            ))}
            {commentList.length === 0 && (
              <p className="text-center text-white/50 py-8 text-sm">No comments yet</p>
            )}
          </div>
        </div>

        {/* Input container */}
        <div
          className="rounded-[12px] bg-white/10 w-full flex items-center gap-3 p-2 relative"
          style={{ backdropFilter: 'blur(15px)' }}
        >
          {user?.dp ? (
            <Image
              src={user.dp}
              alt={user.display_name || 'User'}
              width={30}
              height={30}
              className="size-[30px] rounded-full flex-shrink-0"
            />
          ) : (
            <div className="size-[30px] rounded-full bg-gray-600 flex-shrink-0" />
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add Comment"
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-white text-sm placeholder:text-white/50 py-1"
          />
          <button
            onClick={handlePostComment}
            disabled={!content.trim() || isSubmitting}
            className="absolute right-2 p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </>
  );
}

// Mobile single comment component
function MobileComment({ comment }: { comment: any }) {
  return (
    <div className="flex gap-2 px-2">
      {comment.user?.dp ? (
        <Image
          src={comment.user.dp}
          alt={comment.user.name || 'User'}
          width={32}
          height={32}
          className="size-8 rounded-full flex-shrink-0"
        />
      ) : (
        <div className="size-8 rounded-full bg-gray-600 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-xs truncate">{comment.user?.name || 'Anonymous'}</span>
          <span className="text-[10px] text-white/50 flex-shrink-0">
            {formatRelativeTime(comment.created_at)}
          </span>
        </div>
        <p className="text-xs text-white/80 mt-0.5 break-words">{comment.content || comment.body}</p>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 pl-3 border-l border-white/10 space-y-2">
            {comment.replies.map((reply: any) => (
              <MobileComment key={reply.uuid || reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
