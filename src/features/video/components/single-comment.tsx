'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Comment } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

interface SingleCommentProps {
  comment: Comment;
  videoUuid: string;
  isReply?: boolean;
}

export function SingleComment({
  comment,
  videoUuid,
  isReply = false,
}: SingleCommentProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies] = useState<Comment[]>(comment.replies || []);

  return (
    <div className="w-full">
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
          <span className="text-[12px] md:text-[13px] text-[#807E81]">
            {formatRelativeTime(comment.created_at)}
          </span>
        </div>

      </div>

      <p className="text-[14px] md:text-[15px] font-normal whitespace-pre-wrap break-words mt-2 leading-[20px] md:leading-[22px]">
        {comment.content}
      </p>

      {/* Show Replies Toggle */}
      {replies.length > 0 && (
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="text-[13px] md:text-[16px] font-medium text-[#69C9D0] leading-[18px] mt-[8px] lg:mt-[12px]"
        >
          {showReplies ? 'Hide' : 'Replies'}
        </button>
      )}

      {/* Replies */}
      {showReplies && replies.length > 0 && (
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
          {replies.map((reply) => (
            <SingleComment
              key={reply.uuid}
              comment={reply}
              videoUuid={videoUuid}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
