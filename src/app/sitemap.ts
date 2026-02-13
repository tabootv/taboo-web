import type { MetadataRoute } from 'next';

import { coursesClient } from '@/api/client/courses.client';
import { creatorsClient } from '@/api/client/creators.client';
import { postsClient } from '@/api/client/posts.client';
import { seriesClient } from '@/api/client/series.client';
import { shortsClient } from '@/api/client/shorts.client';
import { videoClient } from '@/api/client/video.client';
import type { PaginatedResponse } from '@/types/api';
import { getSeriesRoute } from '@/shared/utils/routes';

export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.taboo.tv';

async function fetchAllPages<T>(
  fetcher: (page: number) => Promise<PaginatedResponse<T>>
): Promise<T[]> {
  const first = await fetcher(1);
  const items = [...first.data];

  if (first.last_page <= 1) return items;

  const remaining = await Promise.all(
    Array.from({ length: first.last_page - 1 }, (_, i) => fetcher(i + 2))
  );
  for (const page of remaining) {
    items.push(...page.data);
  }

  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/videos`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/shorts`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/series`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/courses`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/creators`, changeFrequency: 'weekly', priority: 0.7 },
  ];

  const [videos, series, courses, creators, shorts, posts] = await Promise.all([
    fetchAllPages((page) =>
      videoClient.list({ page, limit: 100, published: true, short: false, is_short: false })
    ).catch(() => []),
    fetchAllPages((page) => seriesClient.list({ page, per_page: 100 })).catch(() => []),
    fetchAllPages((page) => coursesClient.list({ page, per_page: 100 })).catch(() => []),
    creatorsClient
      .listPublic()
      .then((res) => res.data)
      .catch(() => []),
    fetchAllPages((page) => shortsClient.list({ page, per_page: 100 })).catch(() => []),
    fetchAllPages((page) => postsClient.list({ page })).catch(() => []),
  ]);

  const videoUrls: MetadataRoute.Sitemap = videos.map((v) => ({
    url: `${baseUrl}/videos/${v.uuid}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const seriesUrls: MetadataRoute.Sitemap = series.map((s) => ({
    url: `${baseUrl}${getSeriesRoute(s.id, s.title)}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const courseUrls: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${baseUrl}/courses/${c.id}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const creatorUrls: MetadataRoute.Sitemap = creators
    .filter((c) => c.handler)
    .map((c) => ({
      url: `${baseUrl}/creators/${c.handler}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

  const shortUrls: MetadataRoute.Sitemap = shorts.map((s) => ({
    url: `${baseUrl}/shorts/${s.uuid}`,
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  const postUrls: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${baseUrl}/posts/${p.id}`,
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...videoUrls,
    ...seriesUrls,
    ...courseUrls,
    ...creatorUrls,
    ...shortUrls,
    ...postUrls,
  ];
}
