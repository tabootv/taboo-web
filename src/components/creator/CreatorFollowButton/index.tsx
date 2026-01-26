'use client';

import { useToggleFollowCreator } from '@/api/mutations';
import { cn } from '@/shared/utils/formatting';
import type { Creator } from '@/types';
import { Check, Loader2 } from 'lucide-react';

export interface CreatorFollowButtonProps {
  creator: Creator;
  size?: 'sm' | 'lg';
  className?: string;
}

export function CreatorFollowButton({ creator, size = 'sm', className }: CreatorFollowButtonProps) {
  const toggleFollowMutation = useToggleFollowCreator();

  const isFollowing = creator.following ?? false;
  const isPending = toggleFollowMutation.isPending;

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPending) return;

    toggleFollowMutation.mutate({
      creatorId: creator.id,
      currentFollowing: isFollowing,
    });
  };

  const sizeStyles = {
    sm: 'btn btn-sm min-w-24 rounded-lg',
    lg: 'btn btn-sm px-8 py-3 text-sm font-semibold rounded-lg min-w-[140px]',
  };

  const followingStyles = isFollowing
    ? 'bg-transparent border! border-white/10! text-white/80 hover:border-white/50 hover:text-white hover:bg-white/5'
    : size === 'lg'
      ? 'bg-red-primary text-white hover:scale-105 hover:shadow-[0_6px_20px_rgba(171,0,19,0.35)]'
      : 'btn-primary';

  return (
    <button
      onClick={handleFollow}
      aria-pressed={isFollowing}
      disabled={isPending}
      className={cn(
        'flex items-center justify-center gap-2 transition-all duration-200',
        sizeStyles[size],
        followingStyles,
        className
      )}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <Check className="w-4 h-4" />
          Following
        </>
      ) : (
        'Follow'
      )}
    </button>
  );
}
