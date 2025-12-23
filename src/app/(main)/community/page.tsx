'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Rss,
  Star,
  ImageIcon,
  Mic,
  Send,
  Loader2,
  MessageCircle,
} from 'lucide-react';
import { posts as postsApi } from '@/lib/api';
import type { Post } from '@/types';
import { useAuthStore } from '@/lib/stores';
import { CommunityPost } from '@/components/community';

export default function CommunityPage() {
  const { user } = useAuthStore();
  const [postsList, setPostsList] = useState<Post[]>([]);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadMorePosts = useCallback(async () => {
    if (!nextPageUrl || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const url = new URL(nextPageUrl);
      const page = url.searchParams.get('page');
      const response = await postsApi.list({ page: page ? parseInt(page) : 1 });
      setPostsList((prev) => [...prev, ...response.data]);
      setNextPageUrl(response.next_page_url);
    } catch (error) {
      console.error('Failed to load more posts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextPageUrl, isLoadingMore]);

  // Initial fetch
  useEffect(() => {
    const fetchInitialPosts = async () => {
      setIsLoading(true);
      try {
        const response = await postsApi.list({ page: 1 });
        setPostsList(response.data || []);
        setNextPageUrl(response.next_page_url);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    };

    fetchInitialPosts();
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && nextPageUrl && !isLoading && !isLoadingMore) {
            loadMorePosts();
          }
        });
      },
      { root: null, rootMargin: '100px', threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [nextPageUrl, isLoading, isLoadingMore, loadMorePosts]);

  const handleDeletePost = (id: number) => {
    setPostsList((prev) => prev.filter((post) => post.id !== id));
  };

  const handlePostCreated = (newPost: Post) => {
    setPostsList((prev) => [newPost, ...prev]);
  };

  return (
    <div className="series-page-atmosphere min-h-screen">
      {/* Atmospheric Background */}
      <div className="series-atmosphere-bg" />

      <div className="relative z-10">
        {/* Title left-aligned, tabs centered on the same line */}
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 pt-4 pb-3">
          <div className="relative flex items-center min-h-[44px]">
            <h1 className="text-2xl md:text-3xl font-bold text-white absolute left-0">
              Community Posts
            </h1>
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
                  href="/creator"
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
        <div className="max-w-[820px] mx-auto px-4 md:px-6 lg:px-8 space-y-4 pb-12 mt-4">

          {/* Create Post Card */}
          {user?.channel && (
            <CreatePostCard user={user} onPostCreated={handlePostCreated} />
          )}

          {/* Feed Posts */}
          <div className="space-y-4">
            {isLoading ? (
              // Skeleton Loading
              Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
            ) : postsList.length > 0 ? (
              <>
                {postsList.map((post) => (
                  <FeedPost
                    key={post.id}
                    post={post}
                    currentUserId={user?.id}
                    onDelete={handleDeletePost}
                  />
                ))}

                {/* Load More Trigger */}
                <div ref={loadMoreRef} className="py-8 flex justify-center">
                  {isLoadingMore ? (
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading more posts...</span>
                    </div>
                  ) : !nextPageUrl && postsList.length > 0 ? (
                    <p className="text-text-secondary text-sm">
                      You've reached the end of the feed
                    </p>
                  ) : null}
                </div>
              </>
            ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-[#131315] flex items-center justify-center mb-6">
                  <MessageCircle className="w-8 h-8 text-red-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No posts yet
                </h3>
                <p className="text-text-secondary max-w-sm">
                  Be the first to share something with the community!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Create Post Card Component
function CreatePostCard({
  user,
  onPostCreated,
}: {
  user: any;
  onPostCreated: (post: Post) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [caption, setCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = async () => {
    if (!caption.trim()) return;

    setIsPosting(true);
    try {
      const newPost = await postsApi.create(caption);
      onPostCreated(newPost);
      setCaption('');
      setIsExpanded(false);
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="community-post-card">
      <div className="flex gap-3">
        {/* User Avatar */}
        <div className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/10">
          {user?.dp ? (
            <Image src={user.dp} alt={user.display_name || 'You'} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {(user?.display_name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-1">
          {isExpanded ? (
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-transparent text-white placeholder:text-text-secondary resize-none focus:outline-none min-h-[100px] text-[15px]"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full text-left py-2.5 px-4 rounded-full bg-white/5 text-text-secondary hover:bg-white/10 transition-colors text-[15px]"
            >
              What's on your mind?
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex gap-1">
            <button className="p-2.5 rounded-xl hover:bg-white/10 text-text-secondary hover:text-white transition-colors">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button className="p-2.5 rounded-xl hover:bg-white/10 text-text-secondary hover:text-white transition-colors">
              <Mic className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsExpanded(false);
                setCaption('');
              }}
              className="px-4 py-2 text-text-secondary hover:text-white transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!caption.trim() || isPosting}
              className="px-5 py-2 bg-red-primary hover:bg-red-hover text-white rounded-full font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isPosting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Feed Post Card Component (wraps CommunityPost with new styling)
function FeedPost({
  post,
  currentUserId,
  onDelete,
}: {
  post: Post;
  currentUserId?: number;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="community-post-card">
      <CommunityPost post={post} currentUserId={currentUserId} onDelete={onDelete} />
    </div>
  );
}

// Post Skeleton Component
function PostSkeleton() {
  return (
    <div className="community-post-card">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
          </div>
          {/* Content */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-white/10 rounded animate-pulse" />
          </div>
          {/* Actions */}
          <div className="flex gap-4 mt-4">
            <div className="h-8 w-16 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-8 w-16 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-8 w-16 bg-white/10 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
