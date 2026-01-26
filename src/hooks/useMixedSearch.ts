'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useCreators } from '@/api/queries/home.queries';
import { useMapVideos } from '@/api/queries/public.queries';
import { useDebounce } from './use-debounce';
import { calculateSimilarity, detectCountry, getCountryCode } from '@/shared/utils/search-utils';
import type { Creator, Video } from '@/types';

type MapVideo = {
  id?: string | number | undefined;
  uuid?: string | undefined;
  country?: string | undefined;
  country_name?: string | undefined;
  channel?: { id: number } | undefined;
  creator?: { channel?: { id: number } | undefined } | undefined;
} & Partial<Video>;

export interface UseMixedSearchResult {
  filteredVideos: Video[];
  filteredCreators: Creator[];
  isLoading: boolean;
  isLoadingCountryData: boolean;
  countryHeader: string;
  hasResults: boolean;
}

export function useMixedSearch(query: string): UseMixedSearchResult {
  const normalizedQuery = query.toLowerCase().trim();
  const debouncedQuery = useDebounce(normalizedQuery, 300);

  const { data: searchVideos = [], isLoading: videosLoading } = useMapVideos({
    search: debouncedQuery || undefined,
    per_page: 20,
  });

  const { data: allCreators = [], isLoading: creatorsLoading } = useCreators();

  const [countryCreators, setCountryCreators] = useState<Creator[]>([]);
  const [isLoadingCountryData, setIsLoadingCountryData] = useState(false);

  const isLoading = videosLoading || creatorsLoading;

  const filteredVideos = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 3) return [];
    return searchVideos.filter((v) => {
      const isShort = v.short || v.is_short || v.type === 'short';
      return !isShort;
    });
  }, [searchVideos, debouncedQuery]);

  const allCreatorsRef = useRef(allCreators);
  allCreatorsRef.current = allCreators;

  useEffect(() => {
    const country = detectCountry(debouncedQuery);

    if (!country) {
      if (countryCreators.length > 0) {
        setCountryCreators([]);
      }
      setIsLoadingCountryData(false);
      return;
    }

    if (videosLoading) {
      setIsLoadingCountryData(true);
      return;
    }

    setIsLoadingCountryData(true);

    try {
      const videos = (searchVideos as unknown as MapVideo[]).map((v) => ({
        ...v,
        country: (v as Record<string, unknown>).country as string | undefined,
        country_name: (v as Record<string, unknown>).country_name as string | undefined,
        channel: v.channel ?? (v as Video).channel,
      }));

      const normalizedCountryName = country.toLowerCase();
      const countryCode = getCountryCode(country);
      const normalizedCountryCode = countryCode?.toLowerCase();

      const matchingVideos = videos.filter((v) => {
        const videoCountry = ((v.country || v.country_name || '') as string).toLowerCase();
        const videoCountryUpper = videoCountry.toUpperCase();

        const matchesName =
          videoCountry === normalizedCountryName ||
          videoCountry.includes(normalizedCountryName) ||
          normalizedCountryName.includes(videoCountry);

        const matchesCode =
          normalizedCountryCode &&
          (videoCountryUpper === normalizedCountryCode ||
            videoCountryUpper.includes(normalizedCountryCode) ||
            normalizedCountryCode.includes(videoCountryUpper));

        return matchesName || matchesCode || false;
      });

      const creatorIds = new Set<number>();
      matchingVideos.forEach((v) => {
        const channelId = v.channel?.id || (v as Video).channel?.id;
        if (channelId) {
          creatorIds.add(channelId);
        }
      });

      const matchedCreators = allCreatorsRef.current.filter((c) => creatorIds.has(c.id));

      const hasChanged =
        matchedCreators.length !== countryCreators.length ||
        matchedCreators.some((c, i) => c.id !== countryCreators[i]?.id);

      if (hasChanged) {
        setCountryCreators(matchedCreators);
      }
    } catch (error) {
      console.error('Failed to match creators by country:', error);
      if (countryCreators.length > 0) {
        setCountryCreators([]);
      }
    } finally {
      setIsLoadingCountryData(false);
    }
  }, [debouncedQuery, searchVideos, videosLoading, countryCreators]);

  const nameMatchedCreators = useMemo(() => {
    if (!debouncedQuery) return [];

    const detectedCountry = detectCountry(debouncedQuery);
    if (detectedCountry) {
      return [];
    }

    const exactMatches: Array<{ creator: Creator; score: number }> = [];
    const fuzzyMatches: Array<{ creator: Creator; score: number }> = [];

    allCreators.forEach((creator) => {
      const similarity = calculateSimilarity(debouncedQuery, creator.name);

      if (creator.name.toLowerCase().includes(debouncedQuery)) {
        exactMatches.push({ creator, score: similarity });
      } else if (similarity >= 70) {
        fuzzyMatches.push({ creator, score: similarity });
      }
    });

    exactMatches.sort((a, b) => b.score - a.score);
    fuzzyMatches.sort((a, b) => b.score - a.score);

    const combined = [...exactMatches, ...fuzzyMatches].slice(0, 2).map((item) => item.creator);

    return combined;
  }, [allCreators, debouncedQuery]);

  const filteredCreators = useMemo(() => {
    const creatorIds = new Set<number>();
    const merged: Creator[] = [];

    nameMatchedCreators.forEach((creator) => {
      if (!creatorIds.has(creator.id)) {
        creatorIds.add(creator.id);
        merged.push(creator);
      }
    });

    countryCreators.forEach((creator) => {
      if (!creatorIds.has(creator.id)) {
        creatorIds.add(creator.id);
        merged.push(creator);
      }
    });

    return merged;
  }, [nameMatchedCreators, countryCreators]);

  const countryHeader = useMemo(() => {
    const country = detectCountry(debouncedQuery);
    if (country && countryCreators.length > 0) {
      return `Creators in ${country}`;
    }
    return 'Creators';
  }, [debouncedQuery, countryCreators]);

  const hasResults = filteredVideos.length > 0 || filteredCreators.length > 0;

  return {
    filteredVideos,
    filteredCreators,
    isLoading,
    isLoadingCountryData,
    countryHeader,
    hasResults,
  };
}
