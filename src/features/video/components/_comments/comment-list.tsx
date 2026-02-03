'use client';

import type { Comment } from '@/types';
import { SingleComment } from './single-comment';
import { filterValidComments, getCommentKey } from './comment-utils';

interface CommentListProps {
  comments: Comment[];
  videoUuid: string;
  channelUserId?: number | undefined;
}

export function CommentList({ comments, videoUuid, channelUserId }: CommentListProps) {
  const validComments = filterValidComments(comments);

  if (validComments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 md:space-y-5">
      {validComments.map((comment, index) => (
        <SingleComment
          key={getCommentKey(comment, index)}
          comment={comment}
          videoUuid={videoUuid}
          channelUserId={channelUserId}
        />
      ))}
    </div>
  );
}
