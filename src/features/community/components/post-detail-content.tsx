'use client';

import {
  useAddPostComment,
  useDeletePostComment,
  useLikePost,
  useLikePostComment,
} from '@/api/mutations';
import { usePost, usePostComments } from '@/api/queries/posts.queries';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { CreatorFollowButton } from '@/features/creator/components/CreatorFollowButton';
import { MentionText } from '@/features/video/components/_comments/mention-text';
import { useCreatorProfile } from '@/api/queries/creators.queries';
import { useAuthStore } from '@/shared/stores/auth-store';
import { cn, formatCompactNumber, getCreatorRoute } from '@/shared/utils/formatting';
import type { PostComment } from '@/types';
import type { Creator } from '@/types/channel';
import { ArrowLeft, Flag, Heart, MoreHorizontal, Share2, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { PostCommentInput } from './post-comment-input';

const ImageLightbox = dynamic(() =>
  import('@/components/ui/image-lightbox').then((mod) => ({ default: mod.ImageLightbox }))
);

const detailPillBase =
  'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-text-secondary transition-all cursor-pointer';

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

  const channel = post?.channel ?? post?.user?.channel;
  const { data: creatorProfile } = useCreatorProfile(channel?.id);

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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  if (!post) return <PostDetailSkeleton />;

  const isOwner = user?.id === post.user_id;

  const enrichedCreator = channel
    ? ({ ...channel, following: creatorProfile?.following ?? channel.following } as Creator)
    : null;

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

  const handleSubmitComment = () => {
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

      {/* Author Header */}
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
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-text-primary group-hover:text-red-primary transition-colors">
                {channel?.name || post.user?.display_name}
              </h3>
              {channel?.handler ? (
                <span className="text-sm text-text-tertiary">@{channel.handler}</span>
              ) : null}
            </div>
            <p className="text-sm text-text-secondary">{post.created_at}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {!isOwner && enrichedCreator ? (
            <CreatorFollowButton creator={enrichedCreator} size="sm" />
          ) : null}

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
      </div>

      {/* Caption */}
      <div
        className="text-text-primary whitespace-pre-wrap text-lg mb-6"
        dangerouslySetInnerHTML={{ __html: post.caption }}
      />

      {/* Images from media array */}
      {images && images.length > 0 && images[0] ? (
        <div className="mb-6 rounded-xl overflow-hidden">
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
      ) : null}

      {/* Images from post_image array (fallback) */}
      {postImages && postImages.length > 0 ? (
        <div className="mb-6 rounded-xl overflow-hidden">
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
                      <span className="text-white text-xl font-bold">+{postImages.length - 4}</span>
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

      {/* Engagement Bar */}
      <div className="flex items-center gap-4 py-3 border-t border-b border-[#1f1f1f] text-sm text-text-secondary">
        <span className="font-medium text-text-primary">
          {formatCompactNumber(post.likes_count || 0)} Likes
        </span>
        <span className="text-text-tertiary">|</span>
        <span className="font-medium text-text-primary">
          {formatCompactNumber(post.comments_count || 0)} Comments
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 py-2 border-b border-[#1f1f1f]">
        <button
          onClick={handleLike}
          className={cn(
            detailPillBase,
            post.has_liked
              ? 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]'
              : 'hover:bg-[rgba(239,68,68,0.1)] hover:text-[#ef4444]'
          )}
        >
          <Heart className={cn('w-5 h-5', post.has_liked ? 'fill-current' : '')} />
          <span>Like</span>
        </button>
        <button
          onClick={handleShare}
          className={cn(detailPillBase, 'hover:bg-[rgba(59,130,246,0.1)] hover:text-[#3b82f6]')}
        >
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>

      {/* Comments Section */}
      <div className="mt-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Comments ({formatCompactNumber(post.comments_count || 0)})
          </h2>
        </div>

        {/* Add Comment */}
        {isAuthenticated ? (
          <div className="mb-6">
            <PostCommentInput
              value={newComment}
              onChange={setNewComment}
              onSubmit={handleSubmitComment}
              isPending={addComment.isPending}
              avatarSrc={user?.dp}
              avatarFallback={user?.display_name || ''}
            />
          </div>
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

      {/* Author header skeleton */}
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* Caption skeleton */}
      <div className="space-y-2 mb-6">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-3/5" />
      </div>

      <Skeleton className="aspect-video w-full rounded-xl mb-6" />

      {/* Engagement bar skeleton */}
      <div className="py-3 border-t border-[#1f1f1f] border-b border-[#1f1f1f]">
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Action buttons skeleton */}
      <div className="flex gap-2 py-3 border-b border-[#1f1f1f]">
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>

      {/* Comments skeleton */}
      <div className="mt-6">
        <Skeleton className="h-6 w-36 mb-4" />
        <div className="flex gap-3 mb-6">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-10 flex-1 rounded-full" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-8 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-16 w-full rounded-lg" />
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
    <div className="detail-comments space-y-0">
      {comments.map((comment) => (
        <DetailComment key={comment.id} comment={comment} postId={postId} />
      ))}
    </div>
  );
}

function DetailComment({ comment, postId }: { comment: PostComment; postId: number }) {
  const { user: authUser } = useAuthStore();
  const [isLiked, setIsLiked] = useState(comment.has_liked);
  const [likesCount, setLikesCount] = useState(comment.likes_count);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const likeComment = useLikePostComment();
  const addComment = useAddPostComment();
  const deleteCommentMutation = useDeletePostComment();

  const canDelete = authUser?.id === comment.user?.id;

  const handleToggleReply = () => {
    if (!showReplyInput && comment.user?.handler) {
      setReplyText(`@${comment.user.handler} `);
    } else if (!showReplyInput) {
      setReplyText('');
    }
    setShowReplyInput((prev) => !prev);
  };

  const handleDeleteComment = () => {
    deleteCommentMutation.mutate(
      { commentUuid: comment.uuid, postId },
      {
        onSuccess: () => {
          setShowDeleteDialog(false);
          toast.success('Comment deleted');
        },
        onError: () => toast.error('Failed to delete comment'),
      }
    );
  };

  const handleLikeComment = () => {
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked((prev) => !prev);
    setLikesCount((prev) => (prevLiked ? prev - 1 : prev + 1));

    likeComment.mutate(
      { commentId: comment.id, postId },
      {
        onError: () => {
          setIsLiked(prevLiked);
          setLikesCount(prevCount);
          toast.error('Failed to like comment');
        },
      }
    );
  };

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    addComment.mutate(
      { postId, content: replyText, parentId: comment.id },
      {
        onSuccess: () => {
          setReplyText('');
          setShowReplyInput(false);
          toast.success('Reply posted');
        },
        onError: () => {
          toast.error('Failed to post reply');
        },
      }
    );
  };

  return (
    <div className="relative py-3">
      <div className="flex gap-3">
        <Avatar
          src={comment.user?.dp || null}
          alt={comment.user?.display_name || ''}
          fallback={comment.user?.display_name || ''}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {comment.user?.handler ? (
              <Link
                href={`/profile/${comment.user.handler}`}
                className="font-medium text-text-primary text-sm hover:underline"
              >
                @{comment.user.handler}
              </Link>
            ) : (
              <span className="font-medium text-text-primary text-sm">
                {comment.user?.display_name}
              </span>
            )}
            <span className="text-xs text-text-tertiary">{comment.created_at}</span>
          </div>
          <p className="text-text-primary text-sm">
            <MentionText content={comment.content} />
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <button
              onClick={handleLikeComment}
              className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
            >
              <Heart
                className={cn('w-3.5 h-3.5', isLiked ? 'fill-[#ef4444] text-[#ef4444]' : '')}
              />
              {likesCount > 0 ? <span>{likesCount}</span> : null}
            </button>
            <button
              onClick={handleToggleReply}
              className="text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
            >
              Reply
            </button>
            {canDelete && (
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-1 text-xs text-text-tertiary hover:text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Reply Input */}
          {showReplyInput ? (
            <div className="mt-2">
              {(comment.user?.handler || comment.user?.display_name) && (
                <p className="text-xs text-text-tertiary mb-1.5">
                  Replying to{' '}
                  {comment.user.handler ? (
                    <Link
                      href={`/profile/${comment.user.handler}`}
                      className="text-red-primary hover:underline"
                    >
                      @{comment.user.handler}
                    </Link>
                  ) : (
                    comment.user.display_name
                  )}
                </p>
              )}
              <PostCommentInput
                variant="reply"
                value={replyText}
                onChange={setReplyText}
                onSubmit={handleSubmitReply}
                isPending={addComment.isPending}
                placeholder="Write a reply..."
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Thread line + nested replies */}
      {comment.replies && comment.replies.length > 0 ? (
        <div className="relative ml-10 mt-1">
          <div className="absolute left-[-21px] top-0 bottom-0 w-0.5 bg-[#1f1f1f]" />
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex gap-3 py-2">
              <Avatar
                src={reply.user?.dp || null}
                alt={reply.user?.display_name || ''}
                fallback={reply.user?.display_name || ''}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {reply.user?.handler ? (
                    <Link
                      href={`/profile/${reply.user.handler}`}
                      className="font-medium text-text-primary text-sm hover:underline"
                    >
                      @{reply.user.handler}
                    </Link>
                  ) : (
                    <span className="font-medium text-text-primary text-sm">
                      {reply.user?.display_name}
                    </span>
                  )}
                  <span className="text-xs text-text-tertiary">{reply.created_at}</span>
                </div>
                <p className="text-text-primary text-sm">
                  <MentionText content={reply.content} />
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowDeleteDialog(false)}
            aria-hidden="true"
          />
          <div className="relative bg-surface border-2 border-[rgba(126,1,1,0.37)] rounded-[20px] p-6 max-w-[400px] w-full mx-4">
            <h2 className="text-xl font-bold text-text-primary mb-4">Delete Comment</h2>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 rounded-lg text-text-secondary hover:bg-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteComment}
                disabled={deleteCommentMutation.isPending}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleteCommentMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
