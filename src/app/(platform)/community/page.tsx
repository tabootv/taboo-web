'use client';

import { useCreatePost } from '@/api/mutations';
import { usePostsList } from '@/api/queries/posts.queries';
import { useAuthStore } from '@/shared/stores/auth-store';
import { MessageCircle, Rss, Star } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useTransition } from 'react';
import { toast } from 'sonner';
import { deletePostAction } from './_actions';
import { CreatePostCard } from './_components/CreatePostCard';
import { FeedPost } from './_components/FeedPost';
import { PostSkeleton } from './_components/PostSkeleton';

export default function CommunityPage() {
  const { user } = useAuthStore();
  const [, startTransition] = useTransition();

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    usePostsList();

  const createPost = useCreatePost();

  const postsList = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const handlePostCreated = async (caption: string, image?: File) => {
    await createPost.mutateAsync({ caption, ...(image && { image }) });
  };

  const handleDeletePost = (id: number) => {
    startTransition(async () => {
      const result = await deletePostAction(id);
      if (result.success) {
        toast.success('Post deleted');
        refetch();
      } else {
        toast.error('Failed to delete post');
      }
    });
  };

  return (
    <div className="relative z-10 mx-auto page-px py-12">
      {/* Title left-aligned, tabs centered on the same line */}
      <div className="max-w-[1280px] mx-auto page-px pt-4 pb-3">
        <div className="relative flex items-center min-h-[44px]">
          <div className="w-full flex justify-center">
            <div className="flex gap-2">
              <Link
                href="/community"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-primary/10 text-red-primary border border-red-primary/30 font-medium text-sm transition-all hover:bg-red-primary/20"
              >
                <Rss className="w-4 h-4" />
                Posts
              </Link>
              <Link
                href="/creators"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 text-text-secondary border border-white/10 font-medium text-sm transition-all hover:bg-white/10 hover:text-white"
              >
                <Star className="w-4 h-4" />
                Creators
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation + Feed column centered */}
      <div className="max-w-[820px] mx-auto page-px space-y-4 pb-12 mt-4">
        {/* Create Post Card */}
        {user?.channel && <CreatePostCard user={user} onPostCreated={handlePostCreated} />}

        {/* Feed Posts */}
        <div className="space-y-4">
          {isLoading ? (
            // Skeleton Loading
            Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={`skeleton-${i}`} />)
          ) : postsList.length > 0 ? (
            <>
              {postsList.map((post) => (
                <FeedPost
                  key={post.id}
                  post={post}
                  {...(user?.id && { currentUserId: user.id })}
                  onDelete={handleDeletePost}
                />
              ))}

              {hasNextPage && (
                <div className="flex justify-center py-8">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="px-6 py-2 bg-surface hover:bg-surface/80 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isFetchingNextPage ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}

              {!hasNextPage && postsList.length > 0 && (
                <p className="text-text-secondary text-sm text-center py-8">
                  You've reached the end of the feed
                </p>
              )}
            </>
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-[#131315] flex items-center justify-center mb-6">
                <MessageCircle className="w-8 h-8 text-red-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
              <p className="text-text-secondary max-w-sm">
                Be the first to share something with the community!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
