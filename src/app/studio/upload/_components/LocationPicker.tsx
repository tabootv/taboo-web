'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, X, ChevronDown, Loader2, Check } from 'lucide-react';
import { cn } from '@/shared/utils/formatting';
import { usePlaceAutocomplete, usePlaceDetails } from '@/api/queries/places.queries';
import { useQuery } from '@tanstack/react-query';
import { publicClient } from '@/api/client/public.client';

interface LocationDetails {
  countryId?: number | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
}

interface LocationPickerProps {
  value: string;
  countryId: number | null;
  onLocationChange: (location: string, details: LocationDetails) => void;
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
}: LocationPickerProps) {
  const [searchInput, setSearchInput] = useState(value);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Rate limiting - track calls count in state to avoid ref access during render
  const apiCallsRef = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

      // Extract coordinates and country from place details
      // The structure depends on the backend's Google Places API response
      const details = placeDetails as {
        geometry?: { location?: { lat?: number; lng?: number } };
        address_components?: Array<{
          long_name: string;
          short_name: string;
          types: string[];
        }>;
        formatted_address?: string;
      };

      const lat = details.geometry?.location?.lat;
      const lng = details.geometry?.location?.lng;

      // Try to find country from address components
      let detectedCountryId: number | undefined;
      const countryComponent = details.address_components?.find((comp) =>
        comp.types.includes('country')
      );

      if (countryComponent && countries.length > 0) {
        // Match country by ISO code
        const matchedCountry = countries.find(
          (c) => c.iso === countryComponent.short_name || c.name === countryComponent.long_name
        );
        if (matchedCountry) {
          detectedCountryId = matchedCountry.id;
        }
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
    onLocationChange('', {});
  }, [onLocationChange]);

  const selectedCountry = countries.find((c) => c.id === countryId);

  return (
    <div className="space-y-4" ref={dropdownRef}>
      {/* Location Search Input */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
          <MapPin className="w-4 h-4" />
          Location
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchInput}
            onChange={handleInputChange}
            onFocus={() => searchInput.length >= 3 && setIsDropdownOpen(true)}
            placeholder="Search for a location..."
            className="w-full px-4 py-3 pr-10 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-red-primary/50 focus:border-red-primary"
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
            <div className="absolute z-20 top-full mt-1 w-full bg-surface border border-white/10 rounded-lg shadow-lg overflow-hidden">
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

      {/* Map Preview (Static placeholder - actual map would require Google Maps embed) */}
      {value && (
        <div className="aspect-video bg-white/5 border border-white/10 rounded-lg overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-red-primary mx-auto mb-2" />
              <p className="text-sm text-text-secondary">{value}</p>
              <p className="text-xs text-text-tertiary mt-1">
                Map preview available after location is set
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Country Dropdown */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">Country</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
            className={cn(
              'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-left flex items-center justify-between',
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
            <div className="absolute z-20 top-full mt-1 w-full bg-surface border border-white/10 rounded-lg shadow-lg overflow-hidden">
              {isLoadingCountries ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 text-red-primary animate-spin" />
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
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
