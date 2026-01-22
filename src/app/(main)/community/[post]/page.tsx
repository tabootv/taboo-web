'use client';

import { useAddPostComment, useDeletePost, useLikePost } from '@/api/mutations';
import { usePost, usePostComments } from '@/api/queries';
import { Avatar, Button, LoadingScreen, Spinner } from '@/components/ui';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { useAuthStore } from '@/lib/stores';
import { getCreatorRoute } from '@/lib/utils';
import { ArrowLeft, Flag, Heart, MessageCircle, MoreHorizontal, Send, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function SinglePostPage({ params }: { params: Promise<{ post: string }> }) {
  const { post: postId } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const postIdNum = Number(postId);
  const { data: post, isLoading } = usePost(Number.isNaN(postIdNum) ? null : postIdNum);
  const { data: commentsData, isLoading: isLoadingComments } = usePostComments(
    Number.isNaN(postIdNum) ? null : postIdNum,
    1
  );
  const likePost = useLikePost();
  const addComment = useAddPostComment();
  const deletePost = useDeletePost();
  const [showMenu, setShowMenu] = useState(false);
  const [newComment, setNewComment] = useState('');
  const comments = commentsData?.data || [];

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  useEffect(() => {
    if (!postId || Number.isNaN(postIdNum)) {
      toast.error('Invalid post');
      router.push('/community');
    }
  }, [postId, postIdNum, router]);

  const handleLike = () => {
    if (!post) return;
    likePost.mutate(post.id, {
      onError: () => {
        toast.error('Failed to like post');
      },
    });
  };

  const handleDelete = () => {
    if (!post) return;
    deletePost.mutate(post.id, {
      onSuccess: () => {
        toast.success('Post deleted');
        router.push('/community');
      },
      onError: () => {
        toast.error('Failed to delete post');
      },
    });
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !newComment.trim()) return;
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

  if (isLoading) {
    return <LoadingScreen message="Loading post..." />;
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-text-secondary">Post not found</p>
      </div>
    );
  }

  const channel = post.channel;
  const isOwner = user?.id === post.user_id;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Community
      </button>

      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <Link
            href={getCreatorRoute(channel?.handler)}
            className="flex items-center gap-3 group"
          >
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

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg text-text-secondary hover:bg-hover hover:text-text-primary transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 mt-1 w-40 bg-surface rounded-lg border border-border shadow-lg z-20 overflow-hidden">
                  {isOwner && (
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-hover transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                  <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors">
                    <Flag className="w-4 h-4" />
                    Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <p
          className="text-text-primary whitespace-pre-wrap text-lg mb-6"
          dangerouslySetInnerHTML={{ __html: post.caption }}
        />

        {post.media && post.media.length > 0 && post.media[0] && (
          <>
            <div className="mb-6 rounded-lg overflow-hidden">
              {post.media.length === 1 ? (
                <button
                  onClick={() => handleImageClick(0)}
                  className="relative aspect-video w-full cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Image
                    src={post.media[0]?.original_url || ''}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  {post.media.slice(0, 4).map((media, index) => (
                    <button
                      key={media.id}
                      onClick={() => handleImageClick(index)}
                      className="relative aspect-square cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <Image src={media.original_url || ''} alt="" fill className="object-cover" />
                      {index === 3 && post.media && post.media.length > 4 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white text-xl font-bold">
                            +{post.media.length - 4}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <ImageLightbox
              images={post.media
                .filter((m) => m.original_url) // Filtra apenas mídias com URL válida
                .map((m) => ({ id: m.id, url: m.original_url! }))} // Non-null assertion após filter
              initialIndex={lightboxIndex}
              open={lightboxOpen}
              onOpenChange={setLightboxOpen}
            />
          </>
        )}


        <div className="flex items-center gap-6 pt-4 border-t border-border">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors ${post.has_liked ? 'text-red-primary' : 'text-text-secondary hover:text-red-primary'
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
        {isAuthenticated && (
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
        )}

        {/* Comments List */}
        {(() => {
          if (isLoadingComments) {
            return (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            );
          }
          if (comments.length > 0) {
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
                        <p className="font-medium text-text-primary text-sm">
                          {comment.user?.display_name}
                        </p>
                        <p className="text-text-primary mt-1">{comment.content}</p>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">{comment.created_at}</p>
                    </div>
                  </div>
                ))}
              </div>
            );
          }
          return <p className="text-text-secondary text-center py-8">No comments yet</p>;
        })()}
      </div>
    </div>
  );
}
