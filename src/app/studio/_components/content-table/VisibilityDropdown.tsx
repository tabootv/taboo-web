'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/shared/utils/formatting';
import { Calendar, ChevronDown, Eye, EyeOff, Globe, Loader2, Lock, X } from 'lucide-react';
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
  hidden?: boolean | undefined;
  onVisibilityChange: (visibility: Visibility, scheduledAt?: Date) => Promise<void>;
  onScheduleCancel?: (() => Promise<void>) | undefined;
  onToggleHidden?: (() => Promise<void>) | undefined;
  disabled?: boolean | undefined;
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
  hidden,
  onVisibilityChange,
  onScheduleCancel,
  onToggleHidden,
  disabled,
}: VisibilityDropdownProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const config = visibilityConfig[visibility];
  const Icon = config.icon;

  const handlePublishNow = async () => {
    setIsUpdating(true);
    try {
      await onVisibilityChange('live');
      setOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleScheduleConfirm = async () => {
    if (!selectedDate) return;

    setIsUpdating(true);
    try {
      await onVisibilityChange('scheduled', new Date(selectedDate));
      setOpen(false);
      setShowSchedulePicker(false);
      setSelectedDate('');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelSchedule = async () => {
    if (!onScheduleCancel) return;

    setIsUpdating(true);
    try {
      await onScheduleCancel();
      setOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleHidden = async () => {
    if (!onToggleHidden) return;

    setIsUpdating(true);
    try {
      await onToggleHidden();
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

  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (visibility === 'processing') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-md text-sm',
              'opacity-50 cursor-not-allowed'
            )}
          >
            <Loader2 className={cn('w-4 h-4 animate-spin', config.color)} />
            <span className={cn('text-sm', config.color)}>{config.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="font-medium">{config.label}</p>
          <p className="text-xs text-white/70">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

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
            {hidden && (
              <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-500 text-xs rounded">
                Hidden
              </span>
            )}
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
          {hidden && <p className="text-xs text-amber-400 mt-1">Hidden from public listings</p>}
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="start" className="w-64">
        {/* Draft state: Show Publish Now and Schedule options */}
        {visibility === 'draft' && (
          <>
            <DropdownMenuItem
              onClick={handlePublishNow}
              className="flex items-start gap-3 py-2"
              disabled={isUpdating}
            >
              <Globe className={cn('w-4 h-4 mt-0.5 shrink-0', visibilityConfig.live.color)} />
              <div>
                <p className={cn('text-sm font-medium', visibilityConfig.live.color)}>
                  Publish Now
                </p>
                <p className="text-xs text-text-tertiary">Make video visible to everyone</p>
              </div>
            </DropdownMenuItem>

            {!showSchedulePicker ? (
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  setShowSchedulePicker(true);
                }}
                className="flex items-start gap-3 py-2"
              >
                <Calendar
                  className={cn('w-4 h-4 mt-0.5 shrink-0', visibilityConfig.scheduled.color)}
                />
                <div>
                  <p className={cn('text-sm font-medium', visibilityConfig.scheduled.color)}>
                    Schedule
                  </p>
                  <p className="text-xs text-text-tertiary">Set a publish date and time</p>
                </div>
              </DropdownMenuItem>
            ) : (
              <div className="p-3 space-y-3">
                <div className="flex items-center gap-2 text-sm text-text-primary">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Schedule Publish</span>
                </div>
                <input
                  type="datetime-local"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDateTime()}
                  className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-text-primary focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowSchedulePicker(false);
                      setSelectedDate('');
                    }}
                    className="flex-1 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary rounded-md hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleScheduleConfirm}
                    disabled={!selectedDate || isUpdating}
                    className="flex-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUpdating ? 'Scheduling...' : 'Confirm'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Scheduled state: Show Edit Schedule and Cancel Schedule options */}
        {visibility === 'scheduled' && (
          <>
            {scheduledAt && (
              <div className="px-3 py-2 border-b border-white/10">
                <p className="text-xs text-text-tertiary">Scheduled for</p>
                <p className="text-sm text-blue-400 font-medium">
                  {formatScheduledDate(scheduledAt)}
                </p>
              </div>
            )}

            {!showSchedulePicker ? (
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  setShowSchedulePicker(true);
                  // Pre-fill with current scheduled date
                  if (scheduledAt) {
                    const date = new Date(scheduledAt);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    setSelectedDate(`${year}-${month}-${day}T${hours}:${minutes}`);
                  }
                }}
                className="flex items-start gap-3 py-2"
              >
                <Calendar
                  className={cn('w-4 h-4 mt-0.5 shrink-0', visibilityConfig.scheduled.color)}
                />
                <div>
                  <p className={cn('text-sm font-medium', visibilityConfig.scheduled.color)}>
                    Edit Schedule
                  </p>
                  <p className="text-xs text-text-tertiary">Change the publish date and time</p>
                </div>
              </DropdownMenuItem>
            ) : (
              <div className="p-3 space-y-3">
                <div className="flex items-center gap-2 text-sm text-text-primary">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Edit Schedule</span>
                </div>
                <input
                  type="datetime-local"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDateTime()}
                  className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-text-primary focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowSchedulePicker(false);
                      setSelectedDate('');
                    }}
                    className="flex-1 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary rounded-md hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleScheduleConfirm}
                    disabled={!selectedDate || isUpdating}
                    className="flex-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUpdating ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>
            )}

            {!showSchedulePicker && onScheduleCancel && (
              <DropdownMenuItem
                onClick={handleCancelSchedule}
                className="flex items-start gap-3 py-2"
                disabled={isUpdating}
              >
                <X className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-500">Cancel Schedule</p>
                  <p className="text-xs text-text-tertiary">Revert to draft status</p>
                </div>
              </DropdownMenuItem>
            )}
          </>
        )}

        {/* Live state: Only show Toggle Hidden option (NO unpublish) */}
        {visibility === 'live' && onToggleHidden && (
          <>
            <div className="px-3 py-2 border-b border-white/10">
              <p className="text-xs text-text-tertiary">Status</p>
              <p className="text-sm text-green-500 font-medium flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Published
              </p>
            </div>

            <DropdownMenuItem
              onClick={handleToggleHidden}
              className="flex items-start gap-3 py-2"
              disabled={isUpdating}
            >
              {hidden ? (
                <>
                  <Eye className="w-4 h-4 mt-0.5 shrink-0 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-green-500">Show in Listings</p>
                    <p className="text-xs text-text-tertiary">Make visible in public listings</p>
                  </div>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-amber-500">Hide from Listings</p>
                    <p className="text-xs text-text-tertiary">
                      Video accessible via direct link only
                    </p>
                  </div>
                </>
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <div className="px-3 py-2">
              <p className="text-xs text-text-tertiary">
                Live videos cannot be unpublished. Use &quot;Hide from Listings&quot; to remove from
                public feeds while keeping the video accessible via direct link.
              </p>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
