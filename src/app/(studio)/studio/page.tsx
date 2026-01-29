'use client';

import Image from 'next/image';
import {
  Video,
  Film,
  MessageSquarePlus,
  Globe2,
  MapPin,
  Layers,
  GraduationCap,
  Wallet,
  Clock,
  CreditCard,
  Info,
} from 'lucide-react';
import { useMemo } from 'react';
import { useAuthStore } from '@/lib/stores';
import { formatNumber } from '@/lib/utils';
import { StatCard } from '@/components/studio';
import { Card, CardContent } from '@/components/ui/card';
import { useCreatorProfile } from '@/api/queries/creators.queries';
import { useMapStats } from '@/api/queries/studio.queries';
import { useEarnings } from '@/api/queries';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
}

export default function StudioDashboard() {
  const { user } = useAuthStore();
  const channel = user?.channel;

  // React Query hooks for data fetching with caching
  const { data: creatorProfile } = useCreatorProfile(channel?.id);
  const {
    data: mapStats,
    isLoading: isLoadingMap,
    error: mapQueryError,
  } = useMapStats(channel?.id);
  const { data: earningsData } = useEarnings('30d', 'day');

  const mapError = mapQueryError ? 'Could not load world stats right now.' : null;
  const periodLabel = 'Last 30 days';

  if (!channel) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelData = channel as Record<string, any>;
  const totals = {
    videos: creatorProfile?.videos_count ?? channelData.videos_count ?? 0,
    shorts: creatorProfile?.short_videos_count ?? creatorProfile?.shorts_count ?? channelData.short_videos_count ?? channelData.shorts_count ?? 0,
    posts: creatorProfile?.posts_count ?? channelData.posts_count ?? 0,
    series: creatorProfile?.series_count ?? channelData.series_count ?? 0,
    courses: creatorProfile?.course_count ?? channelData.course_count ?? 0,
  };

  const coverageDisplay = useMemo(() => {
    if (!mapStats) return null;
    const recorded = mapStats.countriesRecorded || 0;
    const percent = mapStats.coveragePercent
      ? mapStats.coveragePercent
      : (recorded / 195) * 100;
    return `${percent.toFixed(1)}%`;
  }, [mapStats]);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Intro */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-[#ab0013]/60 shadow-[var(--glow-strong)]">
          {channel.dp ? (
            <Image src={channel.dp} alt={channel.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#ab0013] to-[#8a0010] flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {channel.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/60 mb-1">Creator Studio</p>
          <h1 className="text-3xl font-bold text-white leading-tight">Welcome back, {channel.name}</h1>
          <p className="text-white/60 text-sm">
            Here's what's happening with your content.
          </p>
        </div>
      </div>

      {/* Earnings Summary - Compact */}
      <Card className="bg-[#131315] border-white/6">
        <CardContent className="p-4 lg:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
            {/* Ready for Payout */}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-[#ab0013]/20 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5 text-[#ab0013]" />
              </div>
              <div>
                <p className="text-xs text-white/40 flex items-center gap-1">
                  Ready for Payout
                  <span title="The confirmed commission amount that will be paid in your next payout cycle">
                    <Info className="w-3 h-3 text-white/30 cursor-help" />
                  </span>
                </p>
                <p className="text-2xl font-bold text-white">{formatCurrency(earningsData?.balance?.pending || 0)}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-10 bg-white/6" />

            {/* Total Unpaid */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/30" />
              <div>
                <p className="text-[10px] text-white/40 flex items-center gap-1">
                  Total unpaid
                  <span title="All accumulated earnings not yet paid out">
                    <Info className="w-2.5 h-2.5 text-white/30 cursor-help" />
                  </span>
                </p>
                <p className="text-sm font-semibold text-white/70">{formatCurrency(earningsData?.balance?.current || 0)}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-10 bg-white/6" />

            {/* Period Earnings */}
            <div>
              <p className="text-[10px] text-white/40 flex items-center gap-1">
                {periodLabel}
                <span title="Commissions earned during the selected time period">
                  <Info className="w-2.5 h-2.5 text-white/30 cursor-help" />
                </span>
              </p>
              <p className="text-sm font-semibold text-[#ab0013]">{formatCurrency(earningsData?.summary?.earnings || 0)}</p>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-10 bg-white/6" />

            {/* All-time */}
            <div>
              <p className="text-[10px] text-white/40 flex items-center gap-1">
                All-time
                <span title="Total commissions earned since you started">
                  <Info className="w-2.5 h-2.5 text-white/30 cursor-help" />
                </span>
              </p>
              <p className="text-sm font-semibold text-white/70">{formatCurrency(earningsData?.allTimeStats?.earnings || 0)}</p>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-10 bg-white/6" />

            {/* Payout Method */}
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-white/30" />
              <div>
                <p className="text-[10px] text-white/40">Payout via</p>
                <p className="text-sm font-semibold text-white/70 capitalize">{earningsData?.promoter?.payoutMethod || 'Not set'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hero metrics + actions */}
      <Card className="bg-[#131315] border-white/6">
        <CardContent className="p-6 lg:p-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard icon={Video} label="Videos" value={formatNumber(totals.videos)} />
            <StatCard icon={Film} label="Shorts" value={formatNumber(totals.shorts)} />
            <StatCard icon={Layers} label="Series" value={formatNumber(totals.series)} />
            <StatCard icon={GraduationCap} label="Education" value={formatNumber(totals.courses)} />
            <StatCard icon={MessageSquarePlus} label="Posts" value={formatNumber(totals.posts)} />
          </div>
        </CardContent>
      </Card>

      {/* World Takeover - Full width */}
      <Card className="bg-[#131315] border-white/6">
        <CardContent className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-xl font-semibold text-white">World Takeover</h2>
              <p className="text-white/60 text-sm">Your global content footprint.</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard
              icon={Globe2}
              label="Countries"
              value={`${formatNumber(mapStats?.countriesRecorded ?? 0)}`}
            />
            <StatCard
              icon={MapPin}
              label="Coverage"
              value={coverageDisplay || '—'}
            />
            <StatCard
              icon={Globe2}
              label="Global Reach"
              value={`${formatNumber(mapStats?.countriesRecorded ?? 0)}/195`}
            />
          </div>

          {mapError && (
            <p className="text-sm text-red-400">{mapError}</p>
          )}

          {isLoadingMap && !mapStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-white/10 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {!isLoadingMap && mapStats && mapStats.topCountries.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mapStats.topCountries.slice(0, 6).map((country, idx) => (
                <div
                  key={country.name}
                  className="flex items-center gap-3 bg-white/5 border border-white/6 rounded-xl px-4 py-3 transition-all hover:bg-white/10 hover:border-white/10"
                >
                  <div className="text-2xl" aria-hidden>
                    {country.flag}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold leading-tight">{country.name}</p>
                    <p className="text-white/60 text-sm">{country.count} videos</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#ab0013] to-[#ab0013]/70"
                        style={{ width: `${Math.min(100, (country.count / (mapStats.topCountries[0]?.count || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/60 w-8 text-right">#{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!mapError && !isLoadingMap && mapStats && mapStats.topCountries.length === 0 && (
            <p className="text-sm text-white/60">Start filming around the world to see your coverage!</p>
          )}
        </CardContent>
      </Card>

      {/* Top tags - Full width */}
      <Card className="bg-[#131315] border-white/6">
        <CardContent className="p-6 lg:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Top Tags</h2>
              <p className="text-white/60 text-sm">Your most used content tags.</p>
            </div>
            {isLoadingMap && !mapStats && <span className="text-xs text-white/60">Loading…</span>}
          </div>
          {mapError && <p className="text-sm text-red-400">{mapError}</p>}
          {!isLoadingMap && mapStats && (
            <div className="flex flex-wrap gap-2">
              {mapStats.topTags.map((t, idx) => (
                <span
                  key={t.name}
                  className={`text-sm px-4 py-2 rounded-full border transition-all hover:scale-105 ${
                    idx < 3
                      ? 'bg-[#ab0013]/20 border-[#ab0013]/30 text-white font-medium'
                      : 'bg-white/5 border-white/6 text-white/80'
                  }`}
                >
                  {t.name} <span className="text-white/60">· {t.count}</span>
                </span>
              ))}
              {mapStats.topTags.length === 0 && (
                <p className="text-sm text-white/60">No tags yet. Add tags to your videos!</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
