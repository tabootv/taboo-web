'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { posts as postsApi } from '@/lib/api';
import type { Post } from '@/types';
import { PostReactions } from './post-reactions';
import { PostCommentArea } from './post-comment-area';
import { toast } from 'sonner';

interface CommunityPostProps {
  post: Post;
  currentUserId?: number;
  onDelete: (id: number) => void;
}

export function CommunityPost({ post, currentUserId, onDelete }: CommunityPostProps) {
  const [showReplySection, setShowReplySection] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  return (
    <>
      <div className="comment-div">
        {/* User Avatar */}
        <Link href={`/creators/creator-profile/${post.user.id}`}>
          <div className="relative size-[48px] rounded-full overflow-hidden bg-surface flex-shrink-0">
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

        <div className="w-full">
          {/* Header */}
          <div className="flex items-center justify-between w-full gap-1">
            <div className="flex items-center gap-1 mb-1">
              <Link
                href={`/creators/creator-profile/${post.user.id}`}
                className="text-[15px] text-white hover:underline"
              >
                {post.user.display_name}
              </Link>
              <p className="text-[15px] font-normal">·</p>
              <p className="text-[15px] font-normal text-[#9F9F9F]">{post.created_at}</p>
            </div>

            {/* Menu Button (only for owner) */}
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4 text-[#9F9F9F]" />
                </button>

                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsMenuOpen(false)}
                    />
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
                )}
              </div>
            )}
          </div>

          {/* Caption */}
          <p
            className="text-[15px] font-normal text-white mt-1 break-words"
            dangerouslySetInnerHTML={{ __html: post.caption }}
          />

          {/* Image Carousel */}
          {post.post_image && post.post_image.length > 0 && (
            <div className="mt-4">
              {post.post_image.length === 1 ? (
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={post.post_image[0]}
                    alt="Post image"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {post.post_image.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden"
                    >
                      <Image
                        src={image}
                        alt={`Post image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Audio Players */}
          {post.post_audio && post.post_audio.length > 0 && (
            <div className="flex flex-col gap-4 mt-4">
              {post.post_audio.map((audio, index) => (
                <audio key={index} src={audio} controls className="w-full" />
              ))}
            </div>
          )}

          {/* Reactions */}
          <div className="flex items-center justify-between gap-2 mt-4">
            <PostReactions post={post} onToggleReply={toggleReply} />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
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
      )}

      {/* Comment Section */}
      {showReplySection && (
        <div className="mt-5 bg-comments animate-in slide-in-from-top-2">
          <PostCommentArea post={post} showReplySection={showReplySection} />
        </div>
      )}
    </>
  );
}
