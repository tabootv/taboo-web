'use client';

import { useAddPostComment, useLikePost } from '@/api/mutations';
import { usePost, usePostComments } from '@/api/queries/posts.queries';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { useAuthStore } from '@/shared/stores/auth-store';
import { getCreatorRoute } from '@/shared/utils/formatting';
import { ArrowLeft, Flag, Heart, MessageCircle, MoreHorizontal, Send, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useState, useTransition } from 'react';
import { toast } from 'sonner';

const ImageLightbox = dynamic(() =>
  import('@/components/ui/image-lightbox').then((mod) => ({ default: mod.ImageLightbox }))
);

interface PostDetailContentProps {
  postId: number;
  deleteAction?: (postId: number) => Promise<{ success: boolean }>;
}

export function PostDetailContent({ postId, deleteAction }: PostDetailContentProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isPending, startTransition] = useTransition();
  const { data: post } = usePost(Number.isNaN(postId) ? null : postId);
  const likePost = useLikePost();
  const addComment = useAddPostComment();
  const [showMenu, setShowMenu] = useState(false);
  const [newComment, setNewComment] = useState('');

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleBack = () => {
    try {
      const referrer = document.referrer;
      if (referrer && new URL(referrer).origin === window.location.origin) {
        router.back();
      } else {
        router.push('/community');
      }
    } catch {
      router.push('/community');
    }
  };

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (!post) return <PostDetailSkeleton />;

  const channel = post.channel;
  const isOwner = user?.id === post.user_id;

  const handleLike = () => {
    likePost.mutate(post.id, {
      onError: () => {
        toast.error('Failed to like post');
      },
    });
  };

  const handleDelete = () => {
    if (!deleteAction) return;
    startTransition(async () => {
      const result = await deleteAction(post.id);
      if (result.success) {
        toast.success('Post deleted');
        router.push('/community');
      } else {
        toast.error('Failed to delete post');
      }
    });
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment.mutate(
      { postId: post.id, content: newComment },
      {
        onSuccess: () => {
          setNewComment('');
          toast.success('Comment posted');
        },
        onError: () => {
          toast.error('Failed to post comment');
        },
      }
    );
  };

  // Determine images to display — prefer media array, fall back to post_image
  const images = post.media?.length ? post.media.filter((m) => m.original_url) : null;
  const postImages =
    !images && post.post_image?.length
      ? post.post_image.filter((url) => url && url.trim() !== '')
      : null;

  const lightboxImages = images
    ? images.map((m) => ({ id: m.id, url: m.original_url! }))
    : postImages
      ? postImages.map((url, i) => ({ id: i, url }))
      : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Navigation */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      {/* Post card */}
      <div className="bg-surface rounded-xl border border-border p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <Link href={getCreatorRoute(channel?.handler)} className="flex items-center gap-3 group">
            <Avatar
              src={channel?.dp || post.user?.dp || null}
              alt={channel?.name || post.user?.display_name || ''}
              fallback={channel?.name || post.user?.display_name || ''}
              size="lg"
              className="group-hover:ring-2 ring-red-primary transition-all"
            />
            <div>
              <h3 className="font-semibold text-text-primary group-hover:text-red-primary transition-colors">
                {channel?.name || post.user?.display_name}
              </h3>
              <p className="text-sm text-text-secondary">{post.created_at}</p>
            </div>
          </Link>

          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg text-text-secondary hover:bg-hover hover:text-text-primary transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showMenu ? (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 mt-1 w-40 bg-surface rounded-lg border border-border shadow-lg z-20 overflow-hidden">
                  {isOwner && deleteAction ? (
                    <button
                      onClick={handleDelete}
                      disabled={isPending}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-hover transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  ) : null}
                  <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors">
                    <Flag className="w-4 h-4" />
                    Report
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Caption */}
        <div
          className="text-text-primary whitespace-pre-wrap text-lg mb-6"
          dangerouslySetInnerHTML={{ __html: post.caption }}
        />

        {/* Images from media array */}
        {images && images.length > 0 && images[0] ? (
          <>
            <div className="mb-6 rounded-lg overflow-hidden">
              {images.length === 1 ? (
                <button
                  onClick={() => handleImageClick(0)}
                  className="relative aspect-video w-full cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Image
                    src={images[0].original_url || ''}
                    alt={
                      post.caption
                        ? `Post image: ${post.caption.replace(/<[^>]*>/g, '').substring(0, 100)}`
                        : 'Community post image'
                    }
                    fill
                    className="object-cover"
                    sizes="(max-width: 672px) 100vw, 672px"
                  />
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  {images.slice(0, 4).map((media, index) => (
                    <button
                      key={media.id}
                      onClick={() => handleImageClick(index)}
                      className="relative aspect-square cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <Image
                        src={media.original_url || ''}
                        alt={`Post image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 672px) 50vw, 336px"
                      />
                      {index === 3 && images.length > 4 ? (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white text-xl font-bold">+{images.length - 4}</span>
                        </div>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}

        {/* Images from post_image array (fallback) */}
        {postImages && postImages.length > 0 ? (
          <div className="mb-6 rounded-lg overflow-hidden">
            {postImages.length === 1 ? (
              <button
                onClick={() => handleImageClick(0)}
                className="relative aspect-video w-full cursor-pointer hover:opacity-90 transition-opacity"
              >
                <Image
                  src={postImages[0]!}
                  alt="Post image"
                  fill
                  className="object-cover"
                  sizes="(max-width: 672px) 100vw, 672px"
                />
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-1">
                {postImages.slice(0, 4).map((url, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageClick(index)}
                    className="relative aspect-square cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <Image
                      src={url}
                      alt={`Post image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 672px) 50vw, 336px"
                    />
                    {index === 3 && postImages.length > 4 ? (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          +{postImages.length - 4}
                        </span>
                      </div>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Audio */}
        {post.post_audio && post.post_audio.length > 0 ? (
          <div className="flex flex-col gap-4 mb-6">
            {post.post_audio.map((audio, index) => (
              <audio key={index} src={audio} controls className="w-full" />
            ))}
          </div>
        ) : null}

        {/* Lightbox */}
        {lightboxImages.length > 0 ? (
          <ImageLightbox
            images={lightboxImages}
            initialIndex={lightboxIndex}
            open={lightboxOpen}
            onOpenChange={setLightboxOpen}
          />
        ) : null}

        {/* Reactions bar */}
        <div className="flex items-center gap-6 pt-4 border-t border-border">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors ${
              post.has_liked ? 'text-red-primary' : 'text-text-secondary hover:text-red-primary'
            }`}
          >
            <Heart className={`w-6 h-6 ${post.has_liked ? 'fill-current' : ''}`} />
            <span className="font-medium">{post.likes_count || 0}</span>
          </button>
          <div className="flex items-center gap-2 text-text-secondary">
            <MessageCircle className="w-6 h-6" />
            <span className="font-medium">{post.comments_count}</span>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Comments</h2>

        {/* Add Comment */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmitComment} className="flex gap-3 mb-6">
            <Avatar
              src={user?.dp || null}
              alt={user?.display_name || ''}
              fallback={user?.display_name || ''}
              size="md"
            />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-surface border border-border rounded-lg px-4 py-2 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-red-primary"
              />
              <Button
                type="submit"
                disabled={addComment.isPending || !newComment.trim()}
                className="btn-premium"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        ) : null}

        {/* Comments List */}
        <Suspense
          fallback={
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          }
        >
          <CommentsSection postId={postId} />
        </Suspense>
      </div>
    </div>
  );
}

function PostDetailSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Skeleton className="h-5 w-36 mb-6" />
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="space-y-2 mb-6">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-5 w-3/5" />
        </div>
        <Skeleton className="aspect-video w-full rounded-lg mb-6" />
        <div className="flex items-center gap-6 pt-4 border-t border-border">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
      <div className="mt-6">
        <Skeleton className="h-6 w-28 mb-4" />
        <div className="flex gap-3 mb-6">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-8 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-3 w-16 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CommentsSection({ postId }: { postId: number }) {
  const { data: commentsData, isLoading } = usePostComments(postId, 1);
  const comments = commentsData?.data || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (comments.length === 0) {
    return <p className="text-text-secondary text-center py-8">No comments yet</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <Avatar
            src={comment.user?.dp || null}
            alt={comment.user?.display_name || ''}
            fallback={comment.user?.display_name || ''}
            size="sm"
          />
          <div className="flex-1">
            <div className="bg-surface border border-border rounded-lg p-3">
              <p className="font-medium text-text-primary text-sm">{comment.user?.display_name}</p>
              <p className="text-text-primary mt-1">{comment.content}</p>
            </div>
            <p className="text-xs text-text-secondary mt-1">{comment.created_at}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
