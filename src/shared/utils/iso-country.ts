/**
 * ISO Country Code Utilities
 *
 * Centralized utilities for country code operations including:
 * - ISO 3166-1 alpha-2 country codes
 * - Country name to code conversion
 * - Flag emoji generation
 */

/**
 * All ISO 3166-1 alpha-2 country codes (249 countries)
 */
export const ISO_COUNTRY_CODES = [
  'AF',
  'AX',
  'AL',
  'DZ',
  'AS',
  'AD',
  'AO',
  'AI',
  'AQ',
  'AG',
  'AR',
  'AM',
  'AW',
  'AU',
  'AT',
  'AZ',
  'BS',
  'BH',
  'BD',
  'BB',
  'BY',
  'BE',
  'BZ',
  'BJ',
  'BM',
  'BT',
  'BO',
  'BQ',
  'BA',
  'BW',
  'BV',
  'BR',
  'IO',
  'BN',
  'BG',
  'BF',
  'BI',
  'CV',
  'KH',
  'CM',
  'CA',
  'KY',
  'CF',
  'TD',
  'CL',
  'CN',
  'CX',
  'CC',
  'CO',
  'KM',
  'CD',
  'CG',
  'CK',
  'CR',
  'CI',
  'HR',
  'CU',
  'CW',
  'CY',
  'CZ',
  'DK',
  'DJ',
  'DM',
  'DO',
  'EC',
  'EG',
  'SV',
  'GQ',
  'ER',
  'EE',
  'SZ',
  'ET',
  'FK',
  'FO',
  'FJ',
  'FI',
  'FR',
  'GF',
  'PF',
  'TF',
  'GA',
  'GM',
  'GE',
  'DE',
  'GH',
  'GI',
  'GR',
  'GL',
  'GD',
  'GP',
  'GU',
  'GT',
  'GG',
  'GN',
  'GW',
  'GY',
  'HT',
  'HM',
  'VA',
  'HN',
  'HK',
  'HU',
  'IS',
  'IN',
  'ID',
  'IR',
  'IQ',
  'IE',
  'IM',
  'IL',
  'IT',
  'JM',
  'JP',
  'JE',
  'JO',
  'KZ',
  'KE',
  'KI',
  'KP',
  'KR',
  'KW',
  'KG',
  'LA',
  'LV',
  'LB',
  'LS',
  'LR',
  'LY',
  'LI',
  'LT',
  'LU',
  'MO',
  'MK',
  'MG',
  'MW',
  'MY',
  'MV',
  'ML',
  'MT',
  'MH',
  'MQ',
  'MR',
  'MU',
  'YT',
  'MX',
  'FM',
  'MD',
  'MC',
  'MN',
  'ME',
  'MS',
  'MA',
  'MZ',
  'MM',
  'NA',
  'NR',
  'NP',
  'NL',
  'NC',
  'NZ',
  'NI',
  'NE',
  'NG',
  'NU',
  'NF',
  'MP',
  'NO',
  'OM',
  'PK',
  'PW',
  'PS',
  'PA',
  'PG',
  'PY',
  'PE',
  'PH',
  'PN',
  'PL',
  'PT',
  'PR',
  'QA',
  'RE',
  'RO',
  'RU',
  'RW',
  'BL',
  'SH',
  'KN',
  'LC',
  'MF',
  'PM',
  'VC',
  'WS',
  'SM',
  'ST',
  'SA',
  'SN',
  'RS',
  'SC',
  'SL',
  'SG',
  'SX',
  'SK',
  'SI',
  'SB',
  'SO',
  'ZA',
  'GS',
  'SS',
  'ES',
  'LK',
  'SD',
  'SR',
  'SJ',
  'SE',
  'CH',
  'SY',
  'TW',
  'TJ',
  'TZ',
  'TH',
  'TL',
  'TG',
  'TK',
  'TO',
  'TT',
  'TN',
  'TR',
  'TM',
  'TC',
  'TV',
  'UG',
  'UA',
  'AE',
  'GB',
  'US',
  'UM',
  'UY',
  'UZ',
  'VU',
  'VE',
  'VN',
  'VG',
  'VI',
  'WF',
  'EH',
  'YE',
  'ZM',
  'ZW',
] as const;

export type ISOCountryCode = (typeof ISO_COUNTRY_CODES)[number];

/**
 * Alternative country name mappings to ISO codes
 * Maps common names, abbreviations, and variations to their ISO codes
 */
export const ALT_COUNTRY_NAMES: Record<string, ISOCountryCode> = {
  'united states': 'US',
  usa: 'US',
  us: 'US',
  uk: 'GB',
  'united kingdom': 'GB',
  england: 'GB',
  scotland: 'GB',
  wales: 'GB',
  'south korea': 'KR',
  'north korea': 'KP',
  korea: 'KR',
  russia: 'RU',
  palestine: 'PS',
  'gaza strip': 'PS',
  'west bank': 'PS',
  'ivory coast': 'CI',
  "cote d'ivoire": 'CI',
  bolivia: 'BO',
  congo: 'CD',
  'democratic republic of congo': 'CD',
  'republic of congo': 'CG',
  syria: 'SY',
  egypt: 'EG',
  uae: 'AE',
  'united arab emirates': 'AE',
  'hong kong': 'HK',
  macau: 'MO',
  taiwan: 'TW',
  laos: 'LA',
  vietnam: 'VN',
  venezuela: 'VE',
  iran: 'IR',
  iraq: 'IQ',
  afghanistan: 'AF',
  china: 'CN',
  bangladesh: 'BD',
  lebanon: 'LB',
  nepal: 'NP',
};

// Intl.DisplayNames instance for region names (created lazily)
let regionNames: Intl.DisplayNames | null = null;

function getRegionNames(): Intl.DisplayNames {
  if (!regionNames) {
    regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
  }
  return regionNames;
}

/**
 * Convert a country name to its ISO 3166-1 alpha-2 code
 * Handles common name variations and abbreviations
 *
 * @param name - Country name or variation
 * @returns ISO code or null if not found
 */
export function countryNameToCode(name: string | undefined | null): ISOCountryCode | null {
  if (!name) return null;

  const target = name.trim().toLowerCase();

  // Check alternative names first (common variations)
  if (ALT_COUNTRY_NAMES[target]) {
    return ALT_COUNTRY_NAMES[target];
  }

  // Search through ISO codes using Intl.DisplayNames
  const displayNames = getRegionNames();
  for (const code of ISO_COUNTRY_CODES) {
    const display = displayNames.of(code);
    if (display && display.toLowerCase() === target) {
      return code;
    }
  }

  return null;
}

/**
 * Get the flag emoji for a country code
 * Uses Unicode regional indicator symbols
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns Flag emoji string
 */
export function getFlagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

/**
 * Get the localized display name for a country code
 *
 * @param code - ISO 3166-1 alpha-2 country code
 * @returns Localized country name or the code if not found
 */
export function getCountryDisplayName(code: string): string {
  const displayNames = getRegionNames();
  return displayNames.of(code) || code;
}

/**
 * Total number of recognized countries (UN member states + observers)
 */
export const TOTAL_COUNTRIES = 195;
