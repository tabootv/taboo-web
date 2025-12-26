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
import { useAuthStore } from '@/lib/stores';
import { formatNumber } from '@/lib/utils';
import { StatCard } from '@/components/studio';
import { Card, CardContent } from '@/components/ui/card';

type MapVideo = {
  id?: string | number;
  uuid?: string;
  latitude?: number;
  longitude?: number;
  country?: string;
  title?: string;
  tags?: string[];
  short?: boolean;
  channel?: { id?: string | number; name?: string; dp?: string } | undefined;
};

type MapTotals = {
  totalVideos: number;
  totalShorts: number;
  countriesRecorded: number;
};

type AggregatedStats = {
  totalVideos: number;
  totalShorts: number;
  countriesRecorded: number;
  coveragePercent: number;
  topCountries: { name: string; count: number }[];
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
    return `${recorded}/195 (${percent.toFixed(1)}%)`;
  }, [mapStats]);

  useEffect(() => {
    const channelId = channel?.id;
    if (!channelId) return;
    let cancelled = false;
    async function loadCounts() {
      try {
        const { creators: creatorsApi } = await import('@/lib/api');
        const creator = await creatorsApi.get(Number(channelId));
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

  useEffect(() => {
    const channelId = channel?.id;
    if (!channelId) return;
    let cancelled = false;
    async function load() {
      setIsLoadingMap(true);
      setMapError(null);
      try {
        const { videos, totals: apiTotals } = await fetchAllMapVideos(channelId);
        const stats = computeStats(videos, apiTotals);
        if (!cancelled) {
          setMapStats(stats);
        }
      } catch (err) {
        console.error('Failed to load map videos', err);
        if (!cancelled) {
          setMapError('Could not load world stories right now.');
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
  }, []);

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
      <Card className="overflow-hidden bg-gradient-to-r from-black via-[#120508] to-[#1a0b0c] border border-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
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
      <Card className="border border-white/10">
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

      {/* World stories */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-white/10">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-xl font-semibold text-white">World Takeover</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard
                icon={Globe2}
                label="Countries filmed"
                value={`${formatNumber(mapStats?.countriesRecorded ?? 0)}/${195}`}
              />
              <StatCard
                icon={MapPin}
                label="Coverage"
                value={coverageDisplay || '—'}
              />
            </div>

            {mapError && (
              <p className="text-sm text-red-300">{mapError}</p>
            )}

            {isLoadingMap && !mapStats && (
              <p className="text-sm text-white/60">Loading world metrics...</p>
            )}

            {!isLoadingMap && mapStats && (
              <>
                <div className="grid gap-3">
                  {(mapStats.topCountries || []).slice(0, 5).map((country) => (
                    <div
                      key={country.name}
                      className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2"
                    >
                      <div className="text-2xl" aria-hidden>
                        {(() => {
                          if (country.name === 'Unknown') return '🌐';
                          const code = countryNameToCode(country.name);
                          if (code) return getFlagEmoji(code);
                          return '🌐';
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold leading-tight">{country.name}</p>
                        <p className="text-white/50 text-sm">Videos: {country.count}</p>
                      </div>
                      <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-primary"
                          style={{ width: `${Math.min(100, (country.count / (mapStats.topCountries[0]?.count || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {!mapError && !isLoadingMap && mapStats && mapStats.topCountries.length === 0 && (
              <p className="text-sm text-white/50">No country data yet.</p>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Top tags */}
      <Card className="border border-white/10">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Top tags</h3>
            {isLoadingMap && !mapStats && <span className="text-xs text-white/50">Loading…</span>}
          </div>
          {mapError && <p className="text-sm text-red-300">{mapError}</p>}
          {!isLoadingMap && mapStats && (
            <div className="flex flex-wrap gap-2">
              {(mapStats.topTags || []).slice(0, 20).map((t) => (
                <span
                  key={t.name}
                  className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white"
                >
                  {t.name} · {t.count}
                </span>
              ))}
              {mapStats.topTags.length === 0 && (
                <p className="text-sm text-white/50">No tags yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function fetchAllMapVideos(creatorId?: string | number): Promise<{ videos: MapVideo[]; totals: MapTotals }> {
  const videos: MapVideo[] = [];
  let page = 1;
  let lastPage = 1;
  let totals: MapTotals = { totalVideos: 0, totalShorts: 0, countriesRecorded: 0 };

  while (page <= lastPage) {
    const url = new URL('https://app.taboo.tv/api/public/map-videos');
    url.searchParams.set('page', String(page));
    url.searchParams.set('per_page', '50');
    url.searchParams.set('short', 'false');
    url.searchParams.set('sort_by', 'latest');
    if (creatorId) {
      url.searchParams.set('creators', String(creatorId));
    }

    const res = await fetch(url.toString(), { cache: 'no-store' });

    if (!res.ok) {
      throw new Error(`Failed to fetch map videos (page ${page}): ${res.statusText}`);
    }

    const data = await res.json();
    const pageVideos: MapVideo[] = (data?.videos || []).map(normalizeMapVideo);
    videos.push(...pageVideos);

    totals = {
      totalVideos: data?.total_videos || totals.totalVideos,
      totalShorts: data?.total_shorts || totals.totalShorts,
      countriesRecorded: data?.countries_recorded || totals.countriesRecorded,
    };

    lastPage = data?.pagination?.last_page || page;
    page += 1;
  }

  return { videos, totals };
}

function normalizeMapVideo(raw: any): MapVideo {
  const country = raw?.country || raw?.country_name || raw?.countryCode || 'Unknown';
  const tags = Array.isArray(raw?.tags) ? raw.tags : [];
  return {
    id: raw?.id,
    uuid: raw?.uuid,
    latitude: raw?.latitude,
    longitude: raw?.longitude,
    country,
    title: raw?.title,
    tags,
    short: raw?.short,
    channel: raw?.channel
      ? {
          id: raw.channel.id,
          name: raw.channel.name,
          dp: raw.channel.dp,
        }
      : undefined,
  };
}

function computeStats(videos: MapVideo[], totals: MapTotals): AggregatedStats {
  const byCountry: Record<string, { count: number; creators: Set<string> }> = {};
  const byTag: Record<string, number> = {};

  videos.forEach((v) => {
    const country = v.country || 'Unknown';
    const creator = v.channel?.name || 'Unknown';

    byCountry[country] = byCountry[country] || { count: 0, creators: new Set() };
    byCountry[country].count += 1;
    byCountry[country].creators.add(creator);

    (v.tags || []).forEach((t) => {
      byTag[t] = (byTag[t] || 0) + 1;
    });
  });

  const topCountries = Object.entries(byCountry)
    .map(([name, info]) => ({ name, count: info.count, creators: info.creators.size }))
    .sort((a, b) => b.count - a.count);

  const topTags = Object.entries(byTag)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const countriesRecorded =
    totals.countriesRecorded || topCountries.filter((c) => c.name !== 'Unknown').length;
  const coveragePercent = (countriesRecorded / 195) * 100;

  return {
    totalVideos: totals.totalVideos || videos.length,
    totalShorts: totals.totalShorts,
    countriesRecorded,
    coveragePercent,
    topCountries,
    topTags,
  };
}
