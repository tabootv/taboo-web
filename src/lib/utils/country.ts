export interface CountryObject {
  id?: number;
  name?: string;
  emoji?: string;
  iso?: string;
  name_with_flag?: string;
  emoji_code?: string;
}

export type Country = string | CountryObject | null | undefined;

/**
 * Safely extracts country name from country field
 * Handles both string and object formats
 */
export function getCountryName(country: Country): string | null {
  if (!country) return null;
  if (typeof country === 'string') return country;
  if (typeof country === 'object') {
    return country.name_with_flag || country.name || null;
  }
  return null;
}

/**
 * Safely extracts country emoji from country field
 */
export function getCountryEmoji(country: Country): string | null {
  if (!country) return null;
  if (typeof country === 'string') return null;
  if (typeof country === 'object') {
    return country.emoji || country.emoji_code || null;
  }
  return null;
}
