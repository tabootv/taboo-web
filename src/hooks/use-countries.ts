'use client';

import { useState, useEffect } from 'react';
import { countriesClient, type Country } from '@/api/client/countries.client';

// Module-level cache: fetch once per session
let cachedCountries: Country[] | null = null;
let fetchPromise: Promise<Country[]> | null = null;

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>(cachedCountries || []);
  const [isLoading, setIsLoading] = useState(!cachedCountries);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedCountries) {
      setCountries(cachedCountries);
      setIsLoading(false);
      return;
    }

    async function fetchCountries() {
      // Deduplicate concurrent requests
      if (!fetchPromise) {
        fetchPromise = countriesClient.list();
      }

      try {
        const data = await fetchPromise;
        cachedCountries = data;
        setCountries(data);
      } catch {
        setError('Failed to load countries');
        fetchPromise = null; // Allow retry on error
      } finally {
        setIsLoading(false);
      }
    }

    fetchCountries();
  }, []);

  return { countries, isLoading, error };
}
