'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MessageSquare, ThumbsUp, MoreHorizontal, Pencil, Trash2, ImageIcon } from 'lucide-react';
import { cn } from '@/shared/utils/formatting';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

export interface PostItem {
  id: number;
  uuid: string;
  body: string;
  created_at: string;
  published_at?: string | undefined;
  likes_count: number;
  comments_count: number;
  images?: string[];
}

interface PostsTableRowProps {
  item: PostItem;
  onEdit: (item: PostItem) => void;
  onDelete: (item: PostItem) => Promise<void>;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function PostsTableRow({ item, onEdit, onDelete }: PostsTableRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleDelete = async () => {
    await onDelete(item);
  };

  const imageCount = item.images?.length || 0;

  return (
    <>
      <tr
        className={cn(
          'border-b border-white/5 transition-colors',
          isHovered ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Post Column */}
        <td className="py-3 px-4">
          <div className="flex items-start gap-3">
            {/* Image Preview (if any) */}
            {imageCount > 0 && item.images?.[0] && (
              <div className="relative shrink-0 w-16 h-16 rounded-md overflow-hidden bg-white/5">
                <Image
                  src={item.images[0]}
                  alt="Post image"
                  fill
                  className="object-cover"
                  sizes="64px"
                />
                {imageCount > 1 && (
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded flex items-center gap-0.5">
                    <ImageIcon className="w-2.5 h-2.5" />
                    {imageCount}
                  </div>
                )}
              </div>
            )}

            {/* Body Preview */}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-text-primary line-clamp-2">
                {truncateText(item.body, 150)}
              </p>
              {/* Hover Actions */}
              <div
                className={cn(
                  'mt-2 flex items-center gap-2 transition-opacity duration-200',
                  isHovered ? 'opacity-100' : 'opacity-0'
                )}
              >
                <button
                  onClick={() => onEdit(item)}
                  className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-white/10 rounded transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="p-1.5 text-text-tertiary hover:text-red-400 hover:bg-white/10 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </td>

        {/* Date Column */}
        <td className="py-3 px-4 w-[120px]">
          <span className="text-sm text-text-secondary">
            {formatDate(item.published_at || item.created_at)}
          </span>
        </td>

        {/* Likes Column */}
        <td className="py-3 px-4 w-[100px]">
          <div className="flex items-center gap-1.5 text-sm text-text-secondary">
            <ThumbsUp className="w-4 h-4" />
            {formatNumber(item.likes_count)}
          </div>
        </td>

        {/* Comments Column */}
        <td className="py-3 px-4 w-[100px]">
          <div className="flex items-center gap-1.5 text-sm text-text-secondary">
            <MessageSquare className="w-4 h-4" />
            {formatNumber(item.comments_count)}
          </div>
        </td>

        {/* Actions Column */}
        <td className="py-3 px-4 w-[60px]">
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-white/10 rounded transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-surface border border-white/10 rounded-lg shadow-xl py-1 min-w-[140px]">
                  <button
                    onClick={() => {
                      setShowActions(false);
                      onEdit(item);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-white/5"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowActions(false);
                      setShowDeleteDialog(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-white/5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </td>
      </tr>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title={truncateText(item.body, 50)}
        type="post"
      />
    </>
  );
}
