'use client';

import type { Comment } from '@/types';
import { SingleComment } from './single-comment';
import { filterValidComments, getCommentKey } from './comment-utils';

interface ReplyThreadProps {
  replies: Comment[];
  videoUuid: string;
  channelUserId?: number | undefined;
  showConnector?: boolean | undefined;
}

export function ReplyThread({
  replies,
  videoUuid,
  channelUserId,
  showConnector = true,
}: ReplyThreadProps) {
  const validReplies = filterValidComments(replies);

  if (validReplies.length === 0) {
    return null;
  }

  return (
    <div className="pl-6 space-y-4 relative mt-4">
      {showConnector && (
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
  );
}
