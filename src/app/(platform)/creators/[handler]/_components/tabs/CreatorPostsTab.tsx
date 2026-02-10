'use client';

import { useCreatorPostsInfinite } from '@/api/queries/creators.queries';
import { CommunityPost } from '@/features/community/components/community-post';
import type { Creator, Post } from '@/types';
import { useMemo } from 'react';
import { InfiniteScrollLoader } from './shared/InfiniteScrollLoader';
import { EmptyState, PostsListSkeleton } from './shared/TabSkeletons';

interface CreatorPostsTabProps {
  creator: Creator;
}

export function CreatorPostsTab({ creator }: CreatorPostsTabProps) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useCreatorPostsInfinite(creator.id);

  const posts = useMemo(() => {
    if (!data?.pages) return [];
    const allPosts = data.pages.flatMap((page) => page.data || []);

    // Deduplicate by id
    const uniqueMap = new Map<number, Post>();
    allPosts.forEach((post) => {
      if (!uniqueMap.has(post.id)) uniqueMap.set(post.id, post);
    });

    return Array.from(uniqueMap.values());
  }, [data]);

  const handleDelete = (id: number) => {
    // Posts are refetched, so we don't need to do anything here
    console.log('Post deleted:', id);
  };

  if (isLoading) {
    return (
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-9">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white mb-6">
          Posts
        </h2>
        <PostsListSkeleton count={3} />
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-9">
        <EmptyState message="No posts found." />
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-9">
      <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white mb-6">
        Posts
      </h2>
      <div className="space-y-6">
        {posts.map((post) => (
          <CommunityPost key={post.id} post={post} onDelete={handleDelete} />
        ))}
      </div>
      <InfiniteScrollLoader
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        skeleton={
          <div className="mt-6">
            <PostsListSkeleton count={2} />
          </div>
        }
      />
    </section>
  );
}
