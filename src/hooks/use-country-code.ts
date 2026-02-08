import { useEffect, useState } from 'react';

/**
 * Detects the user's country code via the /api/geo route.
 * Caches the result in module scope so it only fetches once per session.
 */

let cachedCountry: string | null = null;
let fetchPromise: Promise<string | null> | null = null;

async function detectCountry(): Promise<string | null> {
  try {
    const res = await fetch('/api/geo');
    if (!res.ok) return null;
    const data = await res.json();
    return data.country || null;
  } catch {
    return null;
  }
}

export function useCountryCode(): string | undefined {
  const [country, setCountry] = useState<string | undefined>(cachedCountry ?? undefined);

  useEffect(() => {
    if (cachedCountry) {
      setCountry(cachedCountry);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = detectCountry();
    }

    fetchPromise.then((result) => {
      cachedCountry = result;
      setCountry(result ?? undefined);
    });
  }, []);

  return country;
}
