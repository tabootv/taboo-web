'use client';

import { useCreateInvite } from '@/api/mutations/invite.mutations';
import { useMyInvite } from '@/api/queries/invite.queries';
import { useFeature } from '@/hooks/use-feature';
import { AnalyticsEvent } from '@/shared/lib/analytics/events';
import { Check, Copy, Loader2, Share2, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const GLASS_CARD = 'rounded-2xl backdrop-blur-xl' as const;
const GLASS_CARD_STYLE = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
} as const;

export default function InvitePage() {
  const router = useRouter();
  const inviteEnabled = useFeature('INVITE_SYSTEM');
  const { data, isLoading } = useMyInvite();
  const createInvite = useCreateInvite();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!inviteEnabled) {
      router.replace('/account');
    }
  }, [inviteEnabled, router]);

  const invite = data?.invite ?? null;
  const canCreate = data?.can_create_invite ?? false;

  const getShareUrl = useCallback(
    (code: string) => `${window.location.origin}/redeem?code=${code}`,
    []
  );

  const handleGenerate = useCallback(() => {
    createInvite.mutate(undefined, {
      onSuccess: () => {
        posthog.capture(AnalyticsEvent.INVITE_CODE_GENERATED);
        toast.success('Invite code generated!');
      },
      onError: () => {
        toast.error('Failed to generate invite code');
      },
    });
  }, [createInvite]);

  const handleCopyLink = useCallback(async () => {
    if (!invite) return;
    const url = getShareUrl(invite.code);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard');
    posthog.capture(AnalyticsEvent.INVITE_CODE_SHARED, { share_method: 'clipboard' });
    setTimeout(() => setCopied(false), 2000);
  }, [invite, getShareUrl]);

  const handleShare = useCallback(async () => {
    if (!invite) return;
    const url = getShareUrl(invite.code);

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Taboo TV!',
          text: 'Use my invite code to get access.',
          url,
        });
        posthog.capture(AnalyticsEvent.INVITE_CODE_SHARED, { share_method: 'native_share' });
      } catch {
        // User cancelled share dialog
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
      posthog.capture(AnalyticsEvent.INVITE_CODE_SHARED, { share_method: 'clipboard' });
    }
  }, [invite, getShareUrl]);

  if (!inviteEnabled) return null;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-red-primary/20 blur-xl animate-pulse" />
          <Loader2 className="w-10 h-10 text-red-primary animate-spin relative z-10" />
        </div>
        <p className="text-text-secondary mt-4">Loading invite details...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Invite a Friend</h1>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-red-primary"
          style={{
            background: 'rgba(171,0,19,0.1)',
            border: '1px solid rgba(171,0,19,0.2)',
          }}
        >
          <UserPlus className="w-3 h-3" />
          Invite
        </span>
      </div>

      {invite ? (
        /* Has invite code */
        <div className={`${GLASS_CARD} overflow-hidden`} style={GLASS_CARD_STYLE}>
          <div className="p-6 space-y-6">
            {/* Code display */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
                Your Invite Code
              </p>
              <div
                className="rounded-xl px-6 py-4 text-center"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p className="text-2xl font-mono font-bold tracking-[0.2em] text-white select-all">
                  {invite.code}
                </p>
              </div>
            </div>

            {/* Usage info */}
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-text-secondary">
                Used {invite.uses_count} of {invite.max_uses} times
              </p>
              <div
                className="h-2 w-24 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <div
                  className="h-full rounded-full bg-red-primary transition-all"
                  style={{
                    width: `${Math.min((invite.uses_count / invite.max_uses) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white uppercase tracking-wider btn-premium"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-text-primary transition-colors hover:bg-white/[0.06]"
                style={{
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            {/* Helper text */}
            <p className="text-xs text-text-tertiary text-center">
              Share your invite link with a friend. They&apos;ll be able to redeem it during
              sign-up.
            </p>
          </div>
        </div>
      ) : (
        /* No invite yet */
        <div
          className={`${GLASS_CARD} relative overflow-hidden p-10 text-center`}
          style={GLASS_CARD_STYLE}
        >
          {/* Red Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center top, rgba(171,0,19,0.15) 0%, transparent 60%)',
            }}
          />

          <div className="relative z-10">
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(171,0,19,0.1)',
                border: '1px solid rgba(171,0,19,0.2)',
              }}
            >
              <UserPlus className="w-10 h-10 text-red-primary" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Invite a Friend</h2>
            <p className="text-text-secondary text-base mb-8 max-w-md mx-auto">
              Generate an invite code to share with a friend. They&apos;ll get access to the
              platform when they redeem it.
            </p>

            {canCreate ? (
              <button
                onClick={handleGenerate}
                disabled={createInvite.isPending}
                className="btn-premium inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white uppercase tracking-wider disabled:opacity-50"
              >
                {createInvite.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Generate Invite Code
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  disabled
                  className="btn-premium inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white uppercase tracking-wider opacity-50 cursor-not-allowed"
                >
                  <UserPlus className="w-4 h-4" />
                  Generate Invite Code
                </button>
                <p className="text-sm text-text-tertiary">Requires an active paid subscription</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
