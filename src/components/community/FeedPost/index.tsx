import type { Post } from '@/types';
import { CommunityPost } from '@/features/community';

interface FeedPostProps {
  post: Post;
  currentUserId?: number;
  onDelete: (id: number) => void;
}

export function FeedPost({ post, currentUserId, onDelete }: FeedPostProps) {
  return (
    <div className="community-post-card">
      <CommunityPost post={post} currentUserId={currentUserId} onDelete={onDelete} />
    </div>
  );
}

