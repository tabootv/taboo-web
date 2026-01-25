'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Video,
  Film,
  MessageSquarePlus,
  Globe2,
  MapPin,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/shared/stores/auth-store';
import { formatNumber } from '@/shared/utils/formatting';
import { StatCard } from './_components/StatCard';
import { Card, CardContent } from '@/components/ui/card';

type MapVideo = {
  id?: string | number;
  uuid?: string;
  country?: string;
  tags?: string[];
};

type AggregatedStats = {
  countriesRecorded: number;
  coveragePercent: number;
  topCountries: { name: string; count: number; flag: string }[];
  topTags: { name: string; count: number }[];
};

const ISO_CODES = [
  'AF','AX','AL','DZ','AS','AD','AO','AI','AQ','AG','AR','AM','AW','AU','AT','AZ','BS','BH','BD','BB','BY','BE','BZ','BJ','BM','BT','BO','BQ','BA','BW','BV','BR','IO','BN','BG','BF','BI','CV','KH','CM','CA','KY','CF','TD','CL','CN','CX','CC','CO','KM','CD','CG','CK','CR','CI','HR','CU','CW','CY','CZ','DK','DJ','DM','DO','EC','EG','SV','GQ','ER','EE','SZ','ET','FK','FO','FJ','FI','FR','GF','PF','TF','GA','GM','GE','DE','GH','GI','GR','GL','GD','GP','GU','GT','GG','GN','GW','GY','HT','HM','VA','HN','HK','HU','IS','IN','ID','IR','IQ','IE','IM','IL','IT','JM','JP','JE','JO','KZ','KE','KI','KP','KR','KW','KG','LA','LV','LB','LS','LR','LY','LI','LT','LU','MO','MK','MG','MW','MY','MV','ML','MT','MH','MQ','MR','MU','YT','MX','FM','MD','MC','MN','ME','MS','MA','MZ','MM','NA','NR','NP','NL','NC','NZ','NI','NE','NG','NU','NF','MP','NO','OM','PK','PW','PS','PA','PG','PY','PE','PH','PN','PL','PT','PR','QA','RE','RO','RU','RW','BL','SH','KN','LC','MF','PM','VC','WS','SM','ST','SA','SN','RS','SC','SL','SG','SX','SK','SI','SB','SO','ZA','GS','SS','ES','LK','SD','SR','SJ','SE','CH','SY','TW','TJ','TZ','TH','TL','TG','TK','TO','TT','TN','TR','TM','TC','TV','UG','UA','AE','GB','US','UM','UY','UZ','VU','VE','VN','VG','VI','WF','EH','YE','ZM','ZW'
];

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

const ALT_COUNTRY_CODES: Record<string, string> = {
  'united states': 'US',
  usa: 'US',
  us: 'US',
  uk: 'GB',
  'united kingdom': 'GB',
  england: 'GB',
  scotland: 'GB',
  wales: 'GB',
  'south korea': 'KR',
  'north korea': 'KP',
  korea: 'KR',
  russia: 'RU',
  'palestine': 'PS',
  'gaza strip': 'PS',
  'west bank': 'PS',
  'ivory coast': 'CI',
  "cote d'ivoire": 'CI',
  bolivia: 'BO',
  congo: 'CD',
  'democratic republic of congo': 'CD',
  'republic of congo': 'CG',
  syria: 'SY',
  egypt: 'EG',
  uae: 'AE',
  'united arab emirates': 'AE',
  'hong kong': 'HK',
  macau: 'MO',
  taiwan: 'TW',
  laos: 'LA',
  vietnam: 'VN',
  'venezuela': 'VE',
  'iran': 'IR',
  'iraq': 'IQ',
  'afghanistan': 'AF',
  'china': 'CN',
  'bangladesh': 'BD',
  'lebanon': 'LB',
  'nepal': 'NP',
};

const countryNameToCode = (name: string | undefined | null): string | null => {
  if (!name) return null;
  const target = name.trim().toLowerCase();
  if (ALT_COUNTRY_CODES[target]) {
    return ALT_COUNTRY_CODES[target];
  }
  for (const code of ISO_CODES) {
    const display = regionNames.of(code);
    if (display && display.toLowerCase() === target) {
      return code;
    }
  }
  return null;
};

const getFlagEmoji = (countryCode: string) =>
  countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

export default function StudioDashboard() {
  const { user } = useAuthStore();
  const channel = user?.channel;
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapStats, setMapStats] = useState<AggregatedStats | null>(null);
  const [contentTotals, setContentTotals] = useState<{ videos: number; shorts: number; posts: number; series: number; courses: number } | null>(null);

  if (!channel) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelData = channel as Record<string, any>;
  const totals = {
    videos: contentTotals?.videos ?? channelData.videos_count ?? 0,
    shorts: contentTotals?.shorts ?? channelData.short_videos_count ?? channelData.shorts_count ?? 0,
    posts: contentTotals?.posts ?? channelData.posts_count ?? 0,
    series: contentTotals?.series ?? channelData.series_count ?? 0,
    courses: contentTotals?.courses ?? channelData.course_count ?? 0,
  };

  const coverageDisplay = useMemo(() => {
    if (!mapStats) return null;
    const recorded = mapStats.countriesRecorded || 0;
    const percent = mapStats.coveragePercent
      ? mapStats.coveragePercent
      : (recorded / 195) * 100;
    return `${percent.toFixed(1)}%`;
  }, [mapStats]);

  // Load content counts from creator API
  useEffect(() => {
    const channelId = channel?.id;
    if (!channelId) return;
    let cancelled = false;
    async function loadCounts() {
      try {
        const { creatorsClient } = await import('@/api/client/creators.client');
        const creator = await creatorsClient.getProfile(Number(channelId));
        if (!cancelled) {
          setContentTotals({
            videos: creator.videos_count || 0,
            shorts: creator.short_videos_count || creator.shorts_count || 0,
            posts: creator.posts_count || 0,
            series: creator.series_count || 0,
            courses: creator.course_count || 0,
          });
        }
      } catch (err) {
        console.error('Failed to load creator counts', err);
      }
    }
    loadCounts();
    return () => {
      cancelled = true;
    };
  }, [channel?.id]);

  // Load map stats
  useEffect(() => {
    const channelId = channel?.id;
    if (!channelId) return;
    let cancelled = false;
    async function load() {
      setIsLoadingMap(true);
      setMapError(null);
      try {
        const videos = await fetchMapVideos(channelId);
        const stats = computeStats(videos);
        if (!cancelled) {
          setMapStats(stats);
        }
      } catch (err) {
        console.error('Failed to load map videos', err);
        if (!cancelled) {
          setMapError('Could not load world stats right now.');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingMap(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [channel?.id]);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Intro */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-[#ab0013]/60 shadow-[0_0_40px_rgba(171,0,19,0.4)]">
          {channel.dp ? (
            <Image src={channel.dp} alt={channel.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#ab0013] to-[#7a000e] flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {channel.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-1">Creator Studio</p>
          <h1 className="text-3xl font-bold text-white leading-tight">Welcome back, {channel.name}</h1>
          <p className="text-white/60 text-sm">
            Here’s what’s happening with your content.
          </p>
        </div>
      </div>

      {/* Hero metrics + actions */}
      <Card className="hover:translate-y-0 hover:scale-100">
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

      {/* Content pulse */}
      <Card className="hover:translate-y-0 hover:scale-100">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-xl font-semibold text-white">Content pulse</h2>
              <p className="text-white/50 text-sm">Jump straight to creation.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link
              href="/studio/upload/video"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-red-primary/15 flex items-center justify-center text-red-primary">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-semibold leading-tight">Upload video</p>
                <p className="text-xs text-white/50">Long-form drops</p>
              </div>
            </Link>
            <Link
              href="/studio/upload/short"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-red-primary/15 flex items-center justify-center text-red-primary">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-semibold leading-tight">Upload short</p>
                <p className="text-xs text-white/50">Vertical stories</p>
              </div>
            </Link>
            <Link
              href="/studio/posts"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-red-primary/15 flex items-center justify-center text-red-primary">
                <MessageSquarePlus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-semibold leading-tight">Create post</p>
                <p className="text-xs text-white/50">Community updates</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* World Takeover - Full width */}
      <Card className="hover:translate-y-0 hover:scale-100">
        <CardContent className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-xl font-semibold text-white">World Takeover</h2>
              <p className="text-white/50 text-sm">Your global content footprint.</p>
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
            <p className="text-sm text-red-300">{mapError}</p>
          )}

          {isLoadingMap && !mapStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {!isLoadingMap && mapStats && mapStats.topCountries.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mapStats.topCountries.slice(0, 6).map((country, idx) => (
                <div
                  key={country.name}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 transition-all hover:bg-white/10"
                >
                  <div className="text-2xl" aria-hidden>
                    {country.flag}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold leading-tight">{country.name}</p>
                    <p className="text-white/50 text-sm">{country.count} videos</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-primary to-red-primary/70"
                        style={{ width: `${Math.min(100, (country.count / (mapStats.topCountries[0]?.count || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/40 w-8 text-right">#{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!mapError && !isLoadingMap && mapStats && mapStats.topCountries.length === 0 && (
            <p className="text-sm text-white/50">Start filming around the world to see your coverage!</p>
          )}
        </CardContent>
      </Card>

      {/* Top tags - Full width */}
      <Card className="hover:translate-y-0 hover:scale-100">
        <CardContent className="p-6 lg:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Top Tags</h2>
              <p className="text-white/50 text-sm">Your most used content tags.</p>
            </div>
            {isLoadingMap && !mapStats && <span className="text-xs text-white/50">Loading…</span>}
          </div>
          {mapError && <p className="text-sm text-red-300">{mapError}</p>}
          {!isLoadingMap && mapStats && (
            <div className="flex flex-wrap gap-2">
              {mapStats.topTags.map((t, idx) => (
                <span
                  key={t.name}
                  className={`text-sm px-4 py-2 rounded-full border transition-all hover:scale-105 ${
                    idx < 3
                      ? 'bg-red-primary/20 border-red-primary/30 text-white font-medium'
                      : 'bg-white/5 border-white/10 text-white/80'
                  }`}
                >
                  {t.name} <span className="text-white/50">· {t.count}</span>
                </span>
              ))}
              {mapStats.topTags.length === 0 && (
                <p className="text-sm text-white/50">No tags yet. Add tags to your videos!</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Fetch map videos for a creator
async function fetchMapVideos(creatorId: string | number): Promise<MapVideo[]> {
  const videos: MapVideo[] = [];
  let page = 1;
  let lastPage = 1;

  while (page <= lastPage && page <= 5) { // Limit to 5 pages max
    const url = new URL('https://app.taboo.tv/api/public/map-videos');
    url.searchParams.set('page', String(page));
    url.searchParams.set('per_page', '50');
    url.searchParams.set('creators', String(creatorId));

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch map videos`);

    const data = await res.json();
    const pageVideos = (data?.videos || []).map((v: Record<string, unknown>) => ({
      id: v.id,
      uuid: v.uuid,
      country: (v.country || v.country_name || 'Unknown') as string,
      tags: Array.isArray(v.tags) ? v.tags : [],
    }));
    videos.push(...pageVideos);

    lastPage = data?.pagination?.last_page || page;
    page += 1;
  }

  return videos;
}

// Compute stats from videos
function computeStats(videos: MapVideo[]): AggregatedStats {
  const byCountry: Record<string, number> = {};
  const byTag: Record<string, number> = {};

  videos.forEach((v) => {
    const country = v.country || 'Unknown';
    byCountry[country] = (byCountry[country] || 0) + 1;

    (v.tags || []).forEach((t) => {
      const tagName = typeof t === 'string' ? t : (t as { name?: string }).name || '';
      if (tagName) {
        byTag[tagName] = (byTag[tagName] || 0) + 1;
      }
    });
  });

  const topCountries = Object.entries(byCountry)
    .filter(([name]) => name !== 'Unknown')
    .map(([name, count]) => {
      const code = countryNameToCode(name);
      return {
        name,
        count,
        flag: code ? getFlagEmoji(code) : '🌐',
      };
    })
    .sort((a, b) => b.count - a.count);

  const topTags = Object.entries(byTag)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const countriesRecorded = topCountries.length;
  const coveragePercent = (countriesRecorded / 195) * 100;

  return {
    countriesRecorded,
    coveragePercent,
    topCountries,
    topTags,
  };
}

