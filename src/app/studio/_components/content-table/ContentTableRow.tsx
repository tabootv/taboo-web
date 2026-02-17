'use client';

import { cn } from '@/shared/utils/formatting';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { ContentTableActions } from './ContentTableActions';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { VisibilityDropdown, type Visibility } from './VisibilityDropdown';

export interface ContentItem {
  id: number;
  uuid: string;
  title: string;
  description: string | undefined;
  thumbnail: string | undefined;
  visibility: Visibility;
  scheduled_at: string | undefined;
  processing_status: 'uploading' | 'processing' | 'ready';
  /** Whether video is hidden from public listings */
  hidden?: boolean | undefined;

  processing_progress?: number | undefined;
  restrictions: string[];
  comments_count: number;
  likes_count: number;
  created_at: string;
  published_at: string | undefined;
  duration: number | undefined;
}

interface ContentTableRowProps {
  item: ContentItem;
  isShort: boolean;
  onEdit: (item: ContentItem) => void;
  onDelete: (item: ContentItem) => Promise<void>;
  onVisibilityChange: (
    item: ContentItem,
    visibility: Visibility,
    scheduledAt?: Date
  ) => Promise<void>;
  onScheduleCancel?: ((item: ContentItem) => Promise<void>) | undefined;
  onToggleHidden?: ((item: ContentItem) => Promise<void>) | undefined;
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

function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function ProcessingBadge({
  status,
  progress,
}: {
  status: ContentItem['processing_status'];
  progress?: number;
}) {
  switch (status) {
    case 'uploading':
      return (
        <span className="inline-flex items-center gap-1 text-xs text-blue-400">
          <Loader2 className="w-3 h-3 animate-spin" />
          {progress !== undefined ? `Uploading ${progress}%` : 'Uploading'}
        </span>
      );
    case 'processing':
      return (
        <span className="inline-flex items-center gap-1 text-xs text-amber-400">
          <Loader2 className="w-3 h-3 animate-spin" />
          {progress !== undefined ? `Processing ${progress}%` : 'Processing'}
        </span>
      );
    case 'ready':
    default:
      return null;
  }
}

function RestrictionsBadge({ restrictions }: { restrictions: string[] | undefined }) {
  if (!restrictions || restrictions.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-500">
        <CheckCircle2 className="w-3 h-3" />
        None
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-400">
      <AlertCircle className="w-3 h-3" />
      {restrictions.length} issue{restrictions.length > 1 ? 's' : ''}
    </span>
  );
}

export function ContentTableRow({
  item,
  isShort,
  onEdit,
  onDelete,
  onVisibilityChange,
  onScheduleCancel,
  onToggleHidden,
}: ContentTableRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleVisibilityChange = async (visibility: Visibility, scheduledAt?: Date) => {
    await onVisibilityChange(item, visibility, scheduledAt);
  };

  const handleScheduleCancel = async () => {
    if (onScheduleCancel) {
      await onScheduleCancel(item);
    }
  };

  const handleToggleHidden = async () => {
    if (onToggleHidden) {
      await onToggleHidden(item);
    }
  };

  const handleDelete = async () => {
    await onDelete(item);
  };

  return (
    <>
      <tr
        className={cn(
          'border-b border-white/5 transition-colors',
          isHovered ? 'bg-white/3' : 'hover:bg-white/2'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <td className="py-3 px-8">
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <div
                className={cn(
                  'relative overflow-hidden rounded-md bg-white/5',
                  isShort ? 'w-14 h-[78px]' : 'w-28 h-16'
                )}
              >
                {item.thumbnail ? (
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes={isShort ? '56px' : '112px'}
                  />
                ) : item.processing_status !== 'ready' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-text-tertiary">
                    <Loader2 className="w-4 h-4 animate-spin mb-1" />
                    <span className="text-[10px]">Processing</span>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-tertiary text-xs">
                    No thumbnail
                  </div>
                )}
                {item.duration && (
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">
                    {formatDuration(item.duration)}
                  </div>
                )}
              </div>
              {item.processing_status !== 'ready' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                  <ProcessingBadge
                    status={
                      item.processing_status as Exclude<ContentItem['processing_status'], 'ready'>
                    }
                    {...(item.processing_progress !== undefined && {
                      progress: item.processing_progress,
                    })}
                  />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-text-primary line-clamp-1">{item.title}</h3>
              {item.description && (
                <p className="text-xs text-text-tertiary line-clamp-1 mt-0.5">{item.description}</p>
              )}

              <div
                className={cn(
                  'mt-2 transition-opacity duration-200',
                  isHovered ? 'opacity-100' : 'opacity-0'
                )}
              >
                <ContentTableActions
                  videoUuid={item.uuid}
                  isShort={isShort}
                  visibility={item.visibility}
                  hidden={item.hidden}
                  onEdit={() => onEdit(item)}
                  onDelete={() => setShowDeleteDialog(true)}
                />
              </div>
            </div>
          </div>
        </td>

        <td className="py-3 px-8 w-[140px]">
          <VisibilityDropdown
            visibility={item.visibility}
            scheduledAt={item.scheduled_at}
            hidden={item.hidden}
            onVisibilityChange={handleVisibilityChange}
            onScheduleCancel={onScheduleCancel ? handleScheduleCancel : undefined}
            onToggleHidden={onToggleHidden ? handleToggleHidden : undefined}
            disabled={item.processing_status !== 'ready'}
          />
        </td>

        <td className="py-3 px-8 w-[120px]">
          <RestrictionsBadge restrictions={item.restrictions} />
        </td>

        <td className="py-3 px-8 w-[120px]">
          <span className="text-sm text-text-secondary">
            {formatDate(item.published_at || item.created_at)}
          </span>
        </td>

        <td className="py-3 px-8 w-[80px] text-right">
          <span className="text-sm text-text-secondary">{formatNumber(item.comments_count)}</span>
        </td>

        <td className="py-3 px-8 w-[80px] text-right">
          <span className="text-sm text-text-secondary">{formatNumber(item.likes_count)}</span>
        </td>
      </tr>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title={item.title}
        type={isShort ? 'short' : 'video'}
      />
    </>
  );
}
