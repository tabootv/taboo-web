'use client';

import { cn } from '@/shared/utils/formatting';
import { Clock, Globe } from 'lucide-react';
import type { EditVideoData, PublishMode } from '../types';
import { PUBLISH_OPTIONS } from '../constants';
import { formatDateForInput, getMinDateTime, getVisibilityInfoText } from '../utils';

interface PublishOptionItemProps {
  value: PublishMode;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge: string | null;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (value: PublishMode) => void;
}

/**
 * Single publish option item
 */
function PublishOptionItem({
  value,
  icon: Icon,
  title,
  description,
  badge,
  isSelected,
  isDisabled,
  onSelect,
}: PublishOptionItemProps): React.ReactNode {
  return (
    <label
      className={cn(
        'flex items-start gap-4 p-4 rounded-xl border transition-all',
        isDisabled ? 'opacity-50 cursor-not-allowed bg-white/5 border-white/10' : 'cursor-pointer',
        !isDisabled && isSelected
          ? 'bg-red-primary/10 border-red-primary'
          : !isDisabled && 'bg-white/5 border-white/10 hover:border-red-primary/40'
      )}
    >
      <input
        type="radio"
        checked={isSelected}
        onChange={() => !isDisabled && onSelect(value)}
        disabled={isDisabled}
        className="sr-only"
      />
      <div
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
          isSelected ? 'border-red-primary' : 'border-white/30'
        )}
      >
        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-red-primary" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Icon className={cn('w-5 h-5', isSelected ? 'text-red-primary' : 'text-text-tertiary')} />
          <p className="text-text-primary font-medium">{title}</p>
          {badge && (
            <span className="px-2 py-0.5 bg-red-primary/20 text-red-primary text-xs rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-text-secondary mt-1">{description}</p>
      </div>
    </label>
  );
}

interface PublishingStepProps {
  mode: 'upload' | 'edit';
  editVideo: EditVideoData | undefined;
  publishMode: PublishMode;
  scheduledAt: Date | null;
  onPublishModeChange: (mode: PublishMode) => void;
  onScheduledAtChange: (date: Date | null) => void;
}

/**
 * Publishing step for selecting publish mode
 */
export function PublishingStep({
  mode,
  editVideo,
  publishMode,
  scheduledAt,
  onPublishModeChange,
  onScheduledAtChange,
}: PublishingStepProps): React.ReactNode {
  const isLive = mode === 'edit' && editVideo?.visibility === 'live';

  return (
    <div>
      {/* Show notice for live videos in edit mode */}
      {isLive && (
        <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <div className="flex items-center gap-2 text-green-500 mb-2">
            <Globe className="w-5 h-5" />
            <p className="font-medium">This video is live</p>
          </div>
          <p className="text-sm text-text-secondary">
            Live videos cannot be unpublished. You can only edit metadata and use &quot;Hide from
            Listings&quot; from the content table to control visibility.
          </p>
        </div>
      )}

      <label className="block text-sm font-medium text-text-primary mb-4">
        {isLive ? 'Publication Status' : 'How would you like to publish?'}
      </label>
      <div className="space-y-3">
        {PUBLISH_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = publishMode === option.value;
          const isDisabled = isLive && option.disabledForLive;
          const title = isLive ? option.liveTitle : option.title;
          const description = isLive ? option.liveDescription : option.description;
          const badge =
            scheduledAt && publishMode === 'scheduled' && option.value === 'scheduled'
              ? scheduledAt.toLocaleString()
              : null;

          return (
            <PublishOptionItem
              key={option.value}
              value={option.value}
              icon={Icon}
              title={title}
              description={description}
              badge={badge}
              isSelected={isSelected}
              isDisabled={isDisabled}
              onSelect={onPublishModeChange}
            />
          );
        })}
      </div>

      {/* Scheduled datetime picker */}
      {publishMode === 'scheduled' && (
        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <label className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-red-primary" />
            <span className="text-sm font-medium text-text-primary">Schedule Date & Time</span>
          </label>
          <input
            type="datetime-local"
            value={scheduledAt ? formatDateForInput(scheduledAt) : ''}
            onChange={(e) => onScheduledAtChange(e.target.value ? new Date(e.target.value) : null)}
            min={getMinDateTime()}
            className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-red-primary transition-colors"
          />
        </div>
      )}

      {/* Info text about visibility */}
      <p className="mt-4 text-xs text-text-tertiary">{getVisibilityInfoText(publishMode)}</p>
    </div>
  );
}
