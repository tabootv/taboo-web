'use client';

import { postsClient as postsApi } from '@/api/client/posts.client';
import { getCreatorRoute } from '@/shared/utils/formatting';
import type { Post } from '@/types';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { PostCommentArea } from './post-comment-area';
import { PostReactions } from './post-reactions';

const ImageLightbox = dynamic(() =>
  import('@/components/ui/image-lightbox').then((mod) => ({ default: mod.ImageLightbox }))
);

interface CommunityPostProps {
  post: Post;
  currentUserId?: number;
  onDelete: (id: number) => void;
}

export function CommunityPost({ post, currentUserId, onDelete }: CommunityPostProps) {
  const [showReplySection, setShowReplySection] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // SECURITY: Frontend-only guard. Backend needs server-side Policy/Middleware
  // to verify post ownership before allowing deletion.
  const isOwner = currentUserId === post.user_id;

  const toggleReply = () => {
    setShowReplySection(!showReplySection);
  };

  const confirmDelete = () => {
    setShowDeleteDialog(true);
    setIsMenuOpen(false);
  };

  const deletePost = async () => {
    try {
      await postsApi.delete(post.id);
      setShowDeleteDialog(false);
      onDelete(post.id);
      toast.success('Post deleted successfully!');
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    }
  };

  const hasImages = post.post_image ? post.post_image.length > 0 : false;
  const hasAudio = post.post_audio ? post.post_audio.length > 0 : false;

  return (
    <>
      <div className="py-6 border-b border-[#1f1f1f] [content-visibility:auto] [contain-intrinsic-size:0_200px]">
        <div className="flex gap-3.5">
          {/* Avatar */}
          <Link href={getCreatorRoute(post.user.channel?.handler)} className="flex-shrink-0">
            <div className="relative size-12 rounded-full overflow-hidden bg-surface">
              {post.user.small_dp || post.user.dp ? (
                <Image
                  src={post.user.small_dp || post.user.dp || ''}
                  alt={post.user.display_name || 'User'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="size-full flex items-center justify-center bg-red-primary text-white text-sm font-medium">
                  {post.user.display_name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          </Link>

          {/* Content Column */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between w-full gap-1">
              <div className="flex items-center gap-1.5">
                <Link
                  href={getCreatorRoute(post.user.channel?.handler)}
                  className="text-[15px] font-medium text-white hover:underline truncate"
                >
                  {post.user.display_name}
                </Link>
                {post.user.channel?.handler ? (
                  <span className="text-[13px] text-text-tertiary truncate">
                    @{post.user.channel.handler}
                  </span>
                ) : null}
                <span className="text-text-tertiary">·</span>
                <span className="text-[13px] text-text-tertiary whitespace-nowrap">
                  {post.created_at}
                </span>
              </div>

              {isOwner ? (
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4 text-text-tertiary" />
                  </button>

                  {isMenuOpen ? (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                      <div className="absolute right-0 mt-1 w-[170px] bg-surface rounded-lg border border-border shadow-lg z-20 overflow-hidden">
                        <button
                          onClick={confirmDelete}
                          className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-500 hover:bg-hover transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>

            <Link href={`/posts/${post.id}`} scroll={false}>
              <p
                className="text-[15px] font-normal text-white mt-1 break-words"
                dangerouslySetInnerHTML={{ __html: post.caption }}
              />
            </Link>

            {hasImages ? (
              <div className="mt-3">
                {post.post_image!.length === 1 ? (
                  <button
                    onClick={() => handleImageClick(0)}
                    className="relative aspect-video w-full rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <Image
                      src={post.post_image![0]!}
                      alt="Post image"
                      fill
                      className="object-cover"
                    />
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
                    {post.post_image!.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => handleImageClick(index)}
                        className="relative aspect-square cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        <Image
                          src={image}
                          alt={`Post image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {hasImages ? (
              <ImageLightbox
                images={post
                  .post_image!.filter((url) => url && url.trim() !== '')
                  .map((url, index) => ({ id: index, url }))}
                initialIndex={lightboxIndex}
                open={lightboxOpen}
                onOpenChange={setLightboxOpen}
              />
            ) : null}

            {hasAudio ? (
              <div className="flex flex-col gap-4 mt-3">
                {post.post_audio!.map((audio, index) => (
                  <audio key={index} src={audio} controls className="w-full" />
                ))}
              </div>
            ) : null}

            {/* Reactions */}
            <div className="mt-4 -ml-3">
              <PostReactions post={post} onToggleReply={toggleReply} />
            </div>
          </div>
        </div>

        {/* Comment Section */}
        {showReplySection ? (
          <div className="pl-[62px] mt-4 animate-in slide-in-from-top-2">
            <PostCommentArea post={post} showReplySection={showReplySection} />
          </div>
        ) : null}
      </div>

      {showDeleteDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowDeleteDialog(false)}
          />
          <div className="relative bg-surface border-2 border-[rgba(126,1,1,0.37)] rounded-[20px] p-6 max-w-[400px] w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="text-[#9F9F9F] mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-[#9F9F9F] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deletePost}
                className="px-4 py-2 text-red-500 hover:text-red-400 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
