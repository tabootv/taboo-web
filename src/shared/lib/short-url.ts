const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const BASE = BigInt(ALPHABET.length); // 62n
const SHORT_CODE_LENGTH = 22;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SHORT_CODE_RE = /^[0-9A-Za-z]{1,22}$/;

const charToValue = new Map<string, bigint>();
for (let i = 0; i < ALPHABET.length; i++) {
  charToValue.set(ALPHABET[i]!, BigInt(i));
}

export function encode(uuid: string): string {
  if (!UUID_RE.test(uuid)) {
    throw new Error(`Invalid UUID: ${uuid}`);
  }

  const hex = uuid.replace(/-/g, '');
  let num = BigInt(`0x${hex}`);

  const chars: string[] = [];
  while (num > 0n) {
    chars.push(ALPHABET[Number(num % BASE)]!);
    num /= BASE;
  }

  // Pad to fixed length (least-significant digit first → reverse for MSB-first)
  while (chars.length < SHORT_CODE_LENGTH) {
    chars.push('0');
  }

  return chars.reverse().join('');
}

export function decode(shortCode: string): string {
  if (!SHORT_CODE_RE.test(shortCode)) {
    throw new Error(`Invalid short code: ${shortCode}`);
  }

  let num = 0n;
  for (const ch of shortCode) {
    const val = charToValue.get(ch);
    if (val === undefined) {
      throw new Error(`Invalid character in short code: ${ch}`);
    }
    num = num * BASE + val;
  }

  const hex = num.toString(16).padStart(32, '0');

  if (hex.length > 32) {
    throw new Error(`Short code decodes to value larger than UUID: ${shortCode}`);
  }

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export function isValidShortCode(code: string): boolean {
  return SHORT_CODE_RE.test(code);
}

export function isUuid(str: string): boolean {
  return UUID_RE.test(str);
}
