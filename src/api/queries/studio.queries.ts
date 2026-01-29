/**
 * Studio Query Hooks
 *
 * TanStack Query hooks for studio-related data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { studioClient } from '../client';

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

/**
 * Hook to fetch studio dashboard
 */
export function useStudioDashboard() {
  return useQuery({
    queryKey: ['studio', 'dashboard'],
    queryFn: () => studioClient.getDashboard(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch creator's videos
 */
export function useStudioVideos(page = 1) {
  return useQuery({
    queryKey: ['studio', 'videos', page],
    queryFn: () => studioClient.getVideos(page),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch creator's shorts
 */
export function useStudioShorts(page = 1) {
  return useQuery({
    queryKey: ['studio', 'shorts', page],
    queryFn: () => studioClient.getShorts(page),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// ISO country codes for flag generation
const ISO_CODES = [
  'AF','AX','AL','DZ','AS','AD','AO','AI','AQ','AG','AR','AM','AW','AU','AT','AZ','BS','BH','BD','BB','BY','BE','BZ','BJ','BM','BT','BO','BQ','BA','BW','BV','BR','IO','BN','BG','BF','BI','CV','KH','CM','CA','KY','CF','TD','CL','CN','CX','CC','CO','KM','CD','CG','CK','CR','CI','HR','CU','CW','CY','CZ','DK','DJ','DM','DO','EC','EG','SV','GQ','ER','EE','SZ','ET','FK','FO','FJ','FI','FR','GF','PF','TF','GA','GM','GE','DE','GH','GI','GR','GL','GD','GP','GU','GT','GG','GN','GW','GY','HT','HM','VA','HN','HK','HU','IS','IN','ID','IR','IQ','IE','IM','IL','IT','JM','JP','JE','JO','KZ','KE','KI','KP','KR','KW','KG','LA','LV','LB','LS','LR','LY','LI','LT','LU','MO','MK','MG','MW','MY','MV','ML','MT','MH','MQ','MR','MU','YT','MX','FM','MD','MC','MN','ME','MS','MA','MZ','MM','NA','NR','NP','NL','NC','NZ','NI','NE','NG','NU','NF','MP','NO','OM','PK','PW','PS','PA','PG','PY','PE','PH','PN','PL','PT','PR','QA','RE','RO','RU','RW','BL','SH','KN','LC','MF','PM','VC','WS','SM','ST','SA','SN','RS','SC','SL','SG','SX','SK','SI','SB','SO','ZA','GS','SS','ES','LK','SD','SR','SJ','SE','CH','SY','TW','TJ','TZ','TH','TL','TG','TK','TO','TT','TN','TR','TM','TC','TV','UG','UA','AE','GB','US','UM','UY','UZ','VU','VE','VN','VG','VI','WF','EH','YE','ZM','ZW'
];

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

const ALT_COUNTRY_CODES: Record<string, string> = {
  'united states': 'US', usa: 'US', us: 'US', uk: 'GB', 'united kingdom': 'GB',
  england: 'GB', scotland: 'GB', wales: 'GB', 'south korea': 'KR', 'north korea': 'KP',
  korea: 'KR', russia: 'RU', palestine: 'PS', 'gaza strip': 'PS', 'west bank': 'PS',
  'ivory coast': 'CI', "cote d'ivoire": 'CI', bolivia: 'BO', congo: 'CD',
  'democratic republic of congo': 'CD', 'republic of congo': 'CG', syria: 'SY',
  egypt: 'EG', uae: 'AE', 'united arab emirates': 'AE', 'hong kong': 'HK',
  macau: 'MO', taiwan: 'TW', laos: 'LA', vietnam: 'VN', venezuela: 'VE',
  iran: 'IR', iraq: 'IQ', afghanistan: 'AF', china: 'CN', bangladesh: 'BD',
  lebanon: 'LB', nepal: 'NP',
};

function countryNameToCode(name: string | undefined | null): string | null {
  if (!name) return null;
  const target = name.trim().toLowerCase();
  if (ALT_COUNTRY_CODES[target]) return ALT_COUNTRY_CODES[target];
  for (const code of ISO_CODES) {
    const display = regionNames.of(code);
    if (display && display.toLowerCase() === target) return code;
  }
  return null;
}

function getFlagEmoji(countryCode: string) {
  return countryCode.toUpperCase().replace(/./g, (char) =>
    String.fromCodePoint(127397 + char.charCodeAt(0))
  );
}

async function fetchMapVideos(creatorId: string | number): Promise<MapVideo[]> {
  const videos: MapVideo[] = [];
  let page = 1;
  let lastPage = 1;

  while (page <= lastPage && page <= 5) {
    const url = new URL('https://app.taboo.tv/api/public/map-videos');
    url.searchParams.set('page', String(page));
    url.searchParams.set('per_page', '50');
    url.searchParams.set('creators', String(creatorId));

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch map videos');

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

function computeStats(videos: MapVideo[]): AggregatedStats {
  const byCountry: Record<string, number> = {};
  const byTag: Record<string, number> = {};

  videos.forEach((v) => {
    const country = v.country || 'Unknown';
    byCountry[country] = (byCountry[country] || 0) + 1;

    (v.tags || []).forEach((t) => {
      const tagName = typeof t === 'string' ? t : (t as { name?: string }).name || '';
      if (tagName) byTag[tagName] = (byTag[tagName] || 0) + 1;
    });
  });

  const topCountries = Object.entries(byCountry)
    .filter(([name]) => name !== 'Unknown')
    .map(([name, count]) => ({
      name,
      count,
      flag: countryNameToCode(name) ? getFlagEmoji(countryNameToCode(name)!) : '🌐',
    }))
    .sort((a, b) => b.count - a.count);

  const topTags = Object.entries(byTag)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return {
    countriesRecorded: topCountries.length,
    coveragePercent: (topCountries.length / 195) * 100,
    topCountries,
    topTags,
  };
}

/**
 * Hook to fetch map stats for a creator
 */
export function useMapStats(creatorId: string | number | null | undefined) {
  return useQuery({
    queryKey: ['studio', 'mapStats', creatorId],
    queryFn: async () => {
      const videos = await fetchMapVideos(creatorId!);
      return computeStats(videos);
    },
    enabled: !!creatorId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

export type { AggregatedStats };

