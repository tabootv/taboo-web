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
import { cn } from '@/shared/utils/formatting';
import { Download, MoreVertical, Pencil, Play, Share2, Trash2 } from 'lucide-react';
import Link from 'next/link';
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
  const videoUrl = isShort ? `/shorts/${videoUuid}` : `/videos/${videoUuid}`;

  const handleShare = async () => {
    const url = `${window.location.origin}${videoUrl}`;
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
          <TooltipTrigger asChild>
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
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              asChild
              className={cn(
                'text-text-tertiary hover:text-text-primary',
                visibility !== 'live' ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
              )}
              disabled={visibility !== 'live'}
            >
              <Link href={videoUrl} target="_blank">
                <Play className="w-4 h-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>View on TabooTV</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
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
            <DropdownMenuItem
              onClick={handleShare}
              disabled={visibility !== 'live'}
              className={cn(
                visibility !== 'live' ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
              )}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
