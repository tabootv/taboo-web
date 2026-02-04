'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/shared/utils/formatting';
import { Calendar, ChevronDown, Globe, Loader2, Lock } from 'lucide-react';
import { useState } from 'react';

/**
 * Visibility states aligned with API publication modes:
 * - 'live': published (publish_mode: 'auto')
 * - 'draft': not published, no schedule (publish_mode: 'none')
 * - 'scheduled': not published, has schedule (publish_mode: 'scheduled')
 * - 'processing': video is being processed by Bunny CDN
 */
export type Visibility = 'live' | 'draft' | 'scheduled' | 'processing';

interface VisibilityDropdownProps {
  visibility: Visibility;
  scheduledAt: string | undefined;
  onVisibilityChange: (visibility: Visibility) => Promise<void>;
  disabled?: boolean;
}

const visibilityConfig: Record<
  Visibility,
  { icon: typeof Globe; label: string; color: string; description: string }
> = {
  live: {
    icon: Globe,
    label: 'Live',
    color: 'text-green-500',
    description: 'Everyone can see this video',
  },
  draft: {
    icon: Lock,
    label: 'Draft',
    color: 'text-text-tertiary',
    description: 'Not published yet',
  },
  scheduled: {
    icon: Calendar,
    label: 'Scheduled',
    color: 'text-blue-500',
    description: 'Will publish at scheduled time',
  },
  processing: {
    icon: Loader2,
    label: 'Processing',
    color: 'text-amber-500',
    description: 'Video is being processed',
  },
};

export function VisibilityDropdown({
  visibility,
  scheduledAt,
  onVisibilityChange,
  disabled,
}: VisibilityDropdownProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [open, setOpen] = useState(false);

  const config = visibilityConfig[visibility];
  const Icon = config.icon;

  const handleVisibilityChange = async (newVisibility: Visibility) => {
    if (newVisibility === visibility) {
      setOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onVisibilityChange(newVisibility);
      setOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatScheduledDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger
            disabled={disabled || isUpdating}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-md text-sm transition-colors',
              'hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-primary/50',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin text-text-secondary" />
            ) : (
              <Icon className={cn('w-4 h-4', config.color)} />
            )}
            <span className={cn('text-sm', config.color)}>{config.label}</span>
            <ChevronDown className="w-3 h-3 text-text-tertiary" />
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="font-medium">{config.label}</p>
          <p className="text-xs text-white/70">{config.description}</p>
          {visibility === 'scheduled' && scheduledAt && (
            <p className="text-xs text-blue-400 mt-1">
              Publishes: {formatScheduledDate(scheduledAt)}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem
          onClick={() => handleVisibilityChange('live')}
          className="flex items-start gap-3 py-2"
        >
          <Globe className={cn('w-4 h-4 mt-0.5 shrink-0', visibilityConfig.live.color)} />
          <div>
            <p className={cn('text-sm font-medium', visibilityConfig.live.color)}>Publish Now</p>
            <p className="text-xs text-text-tertiary">Make video visible to everyone</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleVisibilityChange('draft')}
          className="flex items-start gap-3 py-2"
        >
          <Lock className={cn('w-4 h-4 mt-0.5 shrink-0', visibilityConfig.draft.color)} />
          <div>
            <p className={cn('text-sm font-medium', visibilityConfig.draft.color)}>Save as Draft</p>
            <p className="text-xs text-text-tertiary">Hide video from public</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
