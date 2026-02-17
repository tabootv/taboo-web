'use client';

import { placesClient } from '@/api/client/places.client';
import { publicClient } from '@/api/client/public.client';
import { usePlaceAutocomplete, usePlaceDetails } from '@/api/queries/places.queries';
import { cn } from '@/shared/utils/formatting';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronDown, Loader2, MapPin, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

const WORLD_VIEW_CENTER = { lat: 20, lng: 0 };
const WORLD_VIEW_ZOOM = 2;
const LOCATION_ZOOM = 13;

const MapPreview = dynamic(() => import('./MapPreview'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ backgroundColor: '#242f3e' }}
    >
      <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
    </div>
  ),
});

/** Probe common Google Places API response wrappers to find geometry + address_components */
function extractPlaceData(raw: unknown): {
  lat: number | undefined;
  lng: number | undefined;
  addressComponents: Array<{ long_name: string; short_name: string; types: string[] }> | undefined;
} {
  // Backend may return: { result: { geometry, address_components } }
  // or: { geometry, address_components } (unwrapped)
  // or: { data: { result: { ... } } }
  const candidates = [
    raw,
    (raw as Record<string, unknown>)?.place,
    (raw as Record<string, unknown>)?.result,
    (raw as Record<string, unknown>)?.data,
    ((raw as Record<string, unknown>)?.data as Record<string, unknown>)?.result,
  ];

  for (const obj of candidates) {
    if (obj && typeof obj === 'object' && 'geometry' in obj) {
      const geo = (obj as Record<string, unknown>).geometry as
        | { location?: { lat?: number; lng?: number } }
        | undefined;
      return {
        lat: geo?.location?.lat,
        lng: geo?.location?.lng,
        addressComponents: (obj as Record<string, unknown>).address_components as
          | Array<{ long_name: string; short_name: string; types: string[] }>
          | undefined,
      };
    }
  }

  return { lat: undefined, lng: undefined, addressComponents: undefined };
}

interface LocationDetails {
  countryId?: number | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
}

interface LocationPickerProps {
  value: string;
  countryId: number | null;
  onLocationChange: (location: string, details: LocationDetails) => void;
  initialLatitude?: number | undefined;
  initialLongitude?: number | undefined;
}

// Rate limit guard: max 30 API calls per minute
const API_CALL_LIMIT = 30;
const RATE_LIMIT_WINDOW = 60000; // 1 minute

/**
 * LocationPicker with Google Maps Places autocomplete
 * Uses existing usePlaceAutocomplete hook (3+ char trigger, 5min cache)
 */
export const LocationPicker = memo(function LocationPicker({
  value,
  countryId,
  onLocationChange,
  initialLatitude,
  initialLongitude,
}: LocationPickerProps) {
  const [searchInput, setSearchInput] = useState(value);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(WORLD_VIEW_CENTER);
  const [mapZoom, setMapZoom] = useState(WORLD_VIEW_ZOOM);
  const [hasLocation, setHasLocation] = useState(false);

  // Rate limiting - track calls count in state to avoid ref access during render
  const apiCallsRef = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prefetchedIds = useRef(new Set<string>());
  const queryClient = useQueryClient();

  // Initialize map center from edit mode coordinates
  useEffect(() => {
    if (initialLatitude != null && initialLongitude != null && !hasLocation) {
      setMapCenter({ lat: initialLatitude, lng: initialLongitude });
      setMapZoom(LOCATION_ZOOM);
      setHasLocation(true);
    }
  }, [initialLatitude, initialLongitude]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch countries for dropdown
  const { data: countriesData, isLoading: isLoadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: () => publicClient.getCountries(),
    staleTime: 1000 * 60 * 60, // 1 hour (countries rarely change)
  });

  const countries = useMemo(() => countriesData?.data || [], [countriesData?.data]);

  // Track API call and update rate limit state
  const trackApiCall = useCallback(() => {
    const now = Date.now();
    // Remove calls older than rate limit window
    apiCallsRef.current = apiCallsRef.current.filter(
      (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
    );
    apiCallsRef.current.push(now);
    // Update rate limited state
    setIsRateLimited(apiCallsRef.current.length >= API_CALL_LIMIT);
  }, []);

  // Only enable autocomplete if input has 3+ chars and not rate limited
  const shouldFetchAutocomplete = searchInput.length >= 3 && !isRateLimited;
  const { data: autocompleteData, isLoading: isLoadingAutocomplete } = usePlaceAutocomplete(
    shouldFetchAutocomplete ? searchInput : null
  );

  // Track autocomplete API calls
  useEffect(() => {
    if (shouldFetchAutocomplete && autocompleteData) {
      trackApiCall();
    }
  }, [shouldFetchAutocomplete, autocompleteData, trackApiCall]);

  // Fetch place details when a place is selected
  const { data: placeDetails, isLoading: isLoadingDetails } = usePlaceDetails(selectedPlaceId);

  // Update location when place details are fetched
  useEffect(() => {
    if (placeDetails && selectedPlaceId) {
      trackApiCall();

      const { lat, lng, addressComponents } = extractPlaceData(placeDetails);

      // Try to find country from address components
      let detectedCountryId: number | undefined;
      const countryComponent = addressComponents?.find((comp) => comp.types.includes('country'));

      if (countryComponent && countries.length > 0) {
        // Match country by ISO code or name (case-insensitive, partial match)
        const matchedCountry = countries.find((c) => {
          const cName = c.name.toLowerCase();
          const longName = countryComponent.long_name.toLowerCase();
          return (
            c.iso === countryComponent.short_name || // 3-letter ISO exact match
            cName === longName || // exact name (case-insensitive)
            cName.includes(longName) || // DB name contains Google name
            longName.includes(cName) // Google name contains DB name
          );
        });
        if (matchedCountry) {
          detectedCountryId = matchedCountry.id;
        }
      }

      if (lat != null && lng != null) {
        setMapCenter({ lat, lng });
        setMapZoom(LOCATION_ZOOM);
        setHasLocation(true);
      }

      onLocationChange(searchInput, {
        latitude: lat,
        longitude: lng,
        countryId: detectedCountryId,
      });

      setSelectedPlaceId(null); // Reset so we don't refetch
    }
  }, [placeDetails, selectedPlaceId, searchInput, countries, onLocationChange, trackApiCall]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        setIsCountryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchInput(newValue);
    setIsDropdownOpen(newValue.length >= 3);
  }, []);

  const handlePlaceSelect = useCallback((placeId: string, description: string) => {
    setSearchInput(description);
    setIsDropdownOpen(false);
    setSelectedPlaceId(placeId);
    // Location details will be updated when placeDetails loads
  }, []);

  const handleCountrySelect = useCallback(
    (selectedCountryId: number) => {
      setIsCountryDropdownOpen(false);
      onLocationChange(value, { countryId: selectedCountryId });
    },
    [value, onLocationChange]
  );

  const handleClearLocation = useCallback(() => {
    setSearchInput('');
    setMapCenter(WORLD_VIEW_CENTER);
    setMapZoom(WORLD_VIEW_ZOOM);
    setHasLocation(false);
    onLocationChange('', {});
  }, [onLocationChange]);

  const handlePrefetchPlace = useCallback(
    (placeId: string) => {
      if (prefetchedIds.current.has(placeId)) return;
      prefetchedIds.current.add(placeId);
      queryClient.prefetchQuery({
        queryKey: ['places', 'details', placeId],
        queryFn: () => placesClient.getDetails(placeId),
        staleTime: 1000 * 60 * 30,
      });
    },
    [queryClient]
  );

  const selectedCountry = countries.find((c) => c.id === countryId);

  return (
    <div className="space-y-4" ref={dropdownRef}>
      {/* Location Search Input */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
          <MapPin className="w-4 h-4" />
          Location
        </label>
        <div className="relative z-30">
          <input
            ref={inputRef}
            type="text"
            value={searchInput}
            onChange={handleInputChange}
            onFocus={() => searchInput.length >= 3 && setIsDropdownOpen(true)}
            placeholder="Search for a location..."
            className="w-full px-4 py-3 pr-10 border border-white/10 rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-red-primary/50 focus:border-red-primary"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearLocation}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-text-tertiary" />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && (
            <div className="absolute z-50 top-full mt-1 w-full bg-surface border border-white/10 rounded-lg shadow-lg overflow-hidden">
              {isLoadingAutocomplete || isLoadingDetails ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 text-red-primary animate-spin" />
                </div>
              ) : autocompleteData?.predictions && autocompleteData.predictions.length > 0 ? (
                <div className="max-h-60 overflow-y-auto">
                  {autocompleteData.predictions.map((prediction) => (
                    <button
                      key={prediction.place_id}
                      type="button"
                      onClick={() => handlePlaceSelect(prediction.place_id, prediction.description)}
                      onMouseEnter={() => handlePrefetchPlace(prediction.place_id)}
                      className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-start gap-3"
                    >
                      <MapPin className="w-4 h-4 text-text-tertiary mt-0.5 shrink-0" />
                      <span className="text-sm text-text-primary">{prediction.description}</span>
                    </button>
                  ))}
                </div>
              ) : searchInput.length >= 3 ? (
                <div className="px-4 py-3 text-sm text-text-tertiary">No locations found</div>
              ) : null}
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-text-tertiary">
          Start typing to search for a location (min. 3 characters)
        </p>
      </div>

      {/* Map Preview */}
      <div className="aspect-video border border-white/10 rounded-lg overflow-hidden relative">
        <MapPreview
          lat={mapCenter.lat}
          lng={mapCenter.lng}
          zoom={mapZoom}
          showMarker={hasLocation}
          locationLabel={value}
        />
        {isLoadingDetails && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Country Dropdown */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">Country</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
            className={cn(
              'w-full px-4 py-3 border border-white/10 rounded-lg text-left flex items-center justify-between',
              'hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-red-primary/50 focus:border-red-primary transition-colors'
            )}
          >
            <span className={selectedCountry ? 'text-text-primary' : 'text-text-tertiary'}>
              {selectedCountry ? (
                <>
                  {selectedCountry.emoji} {selectedCountry.name}
                </>
              ) : (
                'Select a country'
              )}
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-text-tertiary transition-transform',
                isCountryDropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Country Dropdown List */}
          {isCountryDropdownOpen && (
            <div className="absolute z-50 bottom-full mb-1 w-full bg-surface border border-white/10 rounded-lg shadow-lg overflow-hidden">
              {isLoadingCountries ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 text-red-primary animate-spin" />
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto bg-white/5">
                  {countries.map((country) => (
                    <button
                      key={country.id}
                      type="button"
                      onClick={() => handleCountrySelect(country.id)}
                      className={cn(
                        'w-full px-4 py-2 text-left hover:bg-white/5 transition-colors flex items-center justify-between',
                        country.id === countryId && 'bg-red-primary/10'
                      )}
                    >
                      <span className="text-sm text-text-primary">
                        {country.emoji} {country.name}
                      </span>
                      {country.id === countryId && <Check className="w-4 h-4 text-red-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-text-tertiary">
          Country is auto-detected from location, but you can change it manually
        </p>
      </div>
    </div>
  );
});
