/**
 * Places API Client (Google Maps Proxy)
 *
 * API Endpoints:
 * - GET /places/autocomplete → { predictions: Array<{ place_id: string; description: string }> }
 * - GET /places/details → PlaceDetails
 */

import { apiClient } from './base-client';

export interface PlacePrediction {
  place_id: string;
  description: string;
}

export interface AutocompleteResponse {
  predictions: PlacePrediction[];
}

export const placesClient = {
  /**
   * Autocomplete place search
   */
  autocomplete: async (input: string): Promise<AutocompleteResponse> => {
    return await apiClient.get<AutocompleteResponse>('/places/autocomplete', {
      params: { input },
    });
  },

  /**
   * Get place details by ID
   */
  getDetails: async (placeId: string): Promise<Record<string, unknown>> => {
    return await apiClient.get<Record<string, unknown>>('/places/details', {
      params: { place_id: placeId },
    });
  },
};
