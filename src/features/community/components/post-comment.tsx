'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ThumbsUp, ThumbsDown, Reply, Send } from 'lucide-react';
import { postsClient as postsApi } from '@/api/client';
import type { PostComment as PostCommentType } from '@/types';

interface PostCommentProps {
  comment: PostCommentType;
  index: number;
}

export function PostComment({ comment, index }: PostCommentProps) {
  const [isLiked, setIsLiked] = useState(comment.has_liked);
  const [isDisliked, setIsDisliked] = useState(comment.has_disliked);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [commentReplies, setCommentReplies] = useState<PostCommentType[]>([]);
  const [tempCommentReplies, setTempCommentReplies] = useState<PostCommentType[]>([]);
  const [newReplyText, setNewReplyText] = useState('');
  const [repliesCount, setRepliesCount] = useState(comment.replies_count || 0);

  const toggleReply = () => {
    setShowReplyInput(!showReplyInput);
  };

  const toggleLike = async () => {
    try {
      await postsApi.likeComment(comment.id);
      setIsLiked(!isLiked);
      if (!isLiked) {
        setIsDisliked(false);
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const toggleDislike = async () => {
    try {
      await postsApi.dislikeComment(comment.id);
      setIsDisliked(!isDisliked);
      if (!isDisliked) {
        setIsLiked(false);
      }
    } catch (error) {
      console.error('Failed to dislike comment:', error);
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
      // Set created_at to 'just now' for display
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

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitReply();
    }
  };

  return (
    <div className={index > 0 ? 'mt-5 md:mt-[35px]' : ''}>
      <div className="flex justify-between items-center mt-5 md:mt-[35px]">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative size-[30px] md:size-[48px] rounded-full overflow-hidden bg-surface">
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
          <p className="text-[18px] font-bold capitalize">{comment.user?.display_name}</p>
          <p className="text-[16px] font-normal text-[#9F9F9F]">{comment.created_at}</p>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <button onClick={toggleLike} className="cursor-pointer">
            <ThumbsUp
              className={`w-5 h-5 ${isLiked ? 'text-white fill-white' : 'text-[#9F9F9F]'}`}
            />
          </button>
          <button onClick={toggleDislike} className="cursor-pointer">
            <ThumbsDown
              className={`w-5 h-5 ${isDisliked ? 'text-white fill-white' : 'text-[#9F9F9F]'}`}
            />
          </button>
          <button onClick={toggleReply} className="cursor-pointer p-2">
            <Reply className="w-5 h-5 text-[#9F9F9F]" />
          </button>
        </div>
      </div>

      <p className="text-[16px] font-normal mt-4 mb-3 max-w-[90%]">{comment.content}</p>

      {/* Reply Input */}
      {showReplyInput && (
        <div className="flex items-end mt-2 animate-in slide-in-from-top-2">
          <textarea
            placeholder="Reply.."
            rows={1}
            className="flex-1 bg-transparent border-b border-white/30 focus:border-white/60 outline-none resize-none py-2 text-white placeholder:text-white/50"
            value={newReplyText}
            onChange={(e) => setNewReplyText(e.target.value)}
            onKeyUp={handleKeyUp}
          />
          <button onClick={submitReply} className="p-2 hover:bg-white/10 rounded-full">
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      )}

      {/* Replies Count */}
      {repliesCount > 0 && (
        <div>
          <button
            onClick={getAllReplies}
            className="text-[#69C9D0] text-[16px] font-medium cursor-pointer"
          >
            {repliesCount} replies
          </button>

          {/* Loaded Replies */}
          {showReplies && (
            <div className="ml-8 mt-4 space-y-4">
              {commentReplies.map((reply) => (
                <CommentReply key={reply.id} reply={reply} />
              ))}
            </div>
          )}

          {/* Temp Replies (newly added) */}
          <div className="ml-8 mt-4 space-y-4">
            {tempCommentReplies.map((reply) => (
              <CommentReply key={reply.id} reply={reply} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CommentReply({ reply }: { reply: PostCommentType }) {
  return (
    <div className="flex items-start gap-3">
      <div className="relative size-[30px] md:size-[36px] rounded-full overflow-hidden bg-surface flex-shrink-0">
        {reply.user?.dp ? (
          <Image
            src={reply.user.dp}
            alt={reply.user.display_name || 'User'}
            fill
            className="object-cover"
          />
        ) : (
          <div className="size-full flex items-center justify-center bg-red-primary text-white text-xs font-medium">
            {reply.user?.display_name?.charAt(0) || 'U'}
          </div>
        )}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-bold capitalize">{reply.user?.display_name}</p>
          <p className="text-[12px] text-[#9F9F9F]">{reply.created_at}</p>
        </div>
        <p className="text-[14px] mt-1">{reply.content}</p>
      </div>
    </div>
  );
}
