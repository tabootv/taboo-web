const ISO_CODES = [
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
];

const ALT_COUNTRY_CODES: Record<string, string> = {
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

let regionNames: Intl.DisplayNames | null = null;

function getRegionNames(): Intl.DisplayNames {
  regionNames ??= new Intl.DisplayNames(['en'], { type: 'region' });
  return regionNames;
}

export function detectCountry(query: string): string | null {
  if (!query || query.trim().length < 3) return null;

  const normalized = query.trim().toLowerCase();


  if (ALT_COUNTRY_CODES[normalized]) {
    const code = ALT_COUNTRY_CODES[normalized];
    return getRegionNames().of(code) || normalized;
  }

  const regionNames = getRegionNames();

  for (const code of ISO_CODES) {
    const displayName = regionNames.of(code);
    if (displayName && displayName.toLowerCase() === normalized) {
      return displayName;
    }
  }

  for (const code of ISO_CODES) {
    const displayName = regionNames.of(code);
    if (displayName && displayName.toLowerCase().startsWith(normalized)) {
      return displayName;
    }
  }

  return null;
}

/**
 * Get the country code (ISO 3166-1 alpha-2) for a given country name
 * Returns null if the country name is not found
 */
export function getCountryCode(countryName: string): string | null {
  if (!countryName) return null;

  const normalized = countryName.trim().toLowerCase();
  const regionNames = getRegionNames();

  // Check if it's already a country code
  if (ISO_CODES.includes(normalized.toUpperCase())) {
    return normalized.toUpperCase();
  }

  // Check alternative names first
  if (ALT_COUNTRY_CODES[normalized]) {
    return ALT_COUNTRY_CODES[normalized];
  }

  // Search through ISO codes to find matching country name
  for (const code of ISO_CODES) {
    const displayName = regionNames.of(code);
    if (displayName && displayName.toLowerCase() === normalized) {
      return code;
    }
  }

  return null;
}

export function calculateLevenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  const firstRow = matrix[0];
  if (firstRow) {
    for (let j = 0; j <= len2; j++) {
      firstRow[j] = j;
    }
  }

  for (let i = 1; i <= len1; i++) {
    const currentRow = matrix[i];
    const prevRow = matrix[i - 1];
    if (!currentRow || !prevRow) continue;

    for (let j = 1; j <= len2; j++) {
      const char1 = str1[i - 1];
      const char2 = str2[j - 1];
      const prevDiag = prevRow[j - 1] ?? 0;
      const prevUp = prevRow[j] ?? 0;
      const prevLeft = currentRow[j - 1] ?? 0;

      if (char1 === char2) {
        currentRow[j] = prevDiag;
      } else {
        currentRow[j] = Math.min(prevUp + 1, prevLeft + 1, prevDiag + 1);
      }
    }
  }

  return matrix[len1]?.[len2] ?? Math.max(len1, len2);
}

export function calculateSimilarity(query: string, name: string): number {
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedName = name.toLowerCase().trim();

  if (normalizedQuery === normalizedName) return 100;
  if (normalizedName.includes(normalizedQuery)) return 90;

  const maxLength = Math.max(normalizedQuery.length, normalizedName.length);
  if (maxLength === 0) return 0;

  const distance = calculateLevenshteinDistance(normalizedQuery, normalizedName);
  const similarity = (1 - distance / maxLength) * 100;

  return Math.max(0, similarity);
}
