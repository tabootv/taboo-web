'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AnalyticsEvent } from '@/shared/lib/analytics/events';
import { cn } from '@/shared/utils/formatting';
import { Download, MoreVertical, Pencil, Play, Share2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import posthog from 'posthog-js';
import { toast } from 'sonner';
import type { Visibility } from './VisibilityDropdown';

interface ContentTableActionsProps {
  videoUuid: string;
  isShort: boolean;
  visibility: Visibility;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export function ContentTableActions({
  videoUuid,
  isShort,
  visibility,
  onEdit,
  onDelete,
  className,
}: ContentTableActionsProps) {
  const isProcessing = visibility === 'processing';
  const videoPath = isShort ? `/shorts/${videoUuid}` : `/videos/${videoUuid}`;

  const handleShare = async () => {
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || '';
    const url = `${origin}${videoPath}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link copied to clipboard');
    }
  };

  const handleDownload = () => {
    toast.info('Download feature coming soon');
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild className="hover:bg-surface rounded-full">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onEdit}
              className="text-text-tertiary hover:text-text-primary"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild className="hover:bg-surface rounded-full">
            <Button
              variant="ghost"
              size="icon-sm"
              asChild
              className={cn(
                'text-text-tertiary hover:text-text-primary',
                isProcessing ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
              )}
              disabled={isProcessing}
            >
              <Link href={videoPath} target="_blank">
                <Play className="w-4 h-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>View on TabooTV</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild className="hover:bg-surface rounded-full">
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-text-tertiary hover:text-text-primary"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>More options</TooltipContent>
          </Tooltip>

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                posthog.capture(AnalyticsEvent.STUDIO_CONTENT_DELETED, {
                  content_type: isShort ? 'short' : 'video',
                  video_uuid: videoUuid,
                });
                onDelete();
              }}
              className="text-red-500 focus:text-red-500"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
