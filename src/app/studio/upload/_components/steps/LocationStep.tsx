'use client';

import { useState, useEffect } from 'react';
import { MapPin, Search } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { publicClient, type CountriesResponse } from '@/api/client/public.client';
import type { UploadConfig, UploadFormData } from '../../_config/types';
import type { UseFileUploadReturn } from '../../_hooks/use-file-upload';
import { StepCard } from '../shared/StepCard';

interface LocationStepProps {
  config: UploadConfig;
  form: UseFormReturn<UploadFormData>;
  fileUpload: UseFileUploadReturn;
}

/**
 * Step 4: Location information
 * Location name input with country dropdown
 */
export default function LocationStep({ form }: LocationStepProps) {
  const [countries, setCountries] = useState<CountriesResponse['data']>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);

  // Fetch countries on mount
  useEffect(() => {
    async function fetchCountries() {
      try {
        const response = await publicClient.getCountries();
        setCountries(response.data || []);
      } catch (error) {
        console.error('Failed to fetch countries:', error);
      } finally {
        setIsLoadingCountries(false);
      }
    }
    fetchCountries();
  }, []);

  return (
    <StepCard
      title="Location"
      description="Add location information to help viewers discover your content"
    >
      <div className="space-y-6">
        {/* Location name */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location Name
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter location (e.g., Paris, France)"
                    className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl
                             text-text-primary placeholder:text-text-tertiary
                             focus:outline-none focus:border-red-primary transition-colors"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Country dropdown */}
        <FormField
          control={form.control}
          name="countryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <select
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl
                           text-text-primary
                           focus:outline-none focus:border-red-primary transition-colors
                           appearance-none cursor-pointer"
                  disabled={isLoadingCountries}
                >
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.emoji} {country.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location hint */}
        <p className="text-sm text-text-tertiary">
          Adding location helps your content appear in location-based searches and on the map.
        </p>
      </div>
    </StepCard>
  );
}
