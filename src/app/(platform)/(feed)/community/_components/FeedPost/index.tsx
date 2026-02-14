import type { Post } from '@/types';
import { CommunityPost } from '@/features/community';

interface FeedPostProps {
  post: Post;
  currentUserId?: number;
  onDelete: (id: number) => void;
}

export function FeedPost({ post, currentUserId, onDelete }: FeedPostProps) {
  return <CommunityPost post={post} currentUserId={currentUserId ?? 0} onDelete={onDelete} />;
}
