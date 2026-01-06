/**
 * Places Query Hooks
 *
 * TanStack Query hooks for Google Maps Places API proxy
 */

import { useQuery } from '@tanstack/react-query';
import { placesClient } from '../client/places.client';

/**
 * Hook to autocomplete place search
 *
 * Stale time: 5 minutes
 */
export function usePlaceAutocomplete(input: string | null | undefined) {
  return useQuery({
    queryKey: ['places', 'autocomplete', input],
    queryFn: () => placesClient.autocomplete(input!),
    enabled: !!input && input.length > 2, // Only search if input has 3+ characters
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch place details
 *
 * Stale time: 30 minutes
 */
export function usePlaceDetails(placeId: string | null | undefined) {
  return useQuery({
    queryKey: ['places', 'details', placeId],
    queryFn: () => placesClient.getDetails(placeId!),
    enabled: !!placeId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
