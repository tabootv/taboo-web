/**
 * Checkout Intent Utilities
 *
 * JWT signing/verification for the payment-first onboarding flow.
 * Used by API routes to create and validate checkout intent cookies.
 */

import { SignJWT, jwtVerify } from 'jose';
import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const INTENT_EXPIRY = '10m';
const PW_HINT_ALGORITHM = 'aes-256-gcm';

function getSecret(): Uint8Array {
  const secret =
    process.env.CHECKOUT_INTENT_SECRET ||
    createHash('sha256')
      .update(process.env.NEXT_PUBLIC_API_URL || 'taboo-checkout-intent-fallback')
      .digest('hex')
      .slice(0, 32);
  return new TextEncoder().encode(secret);
}

function getDerivedKey(): Buffer {
  const secret =
    process.env.CHECKOUT_INTENT_SECRET ||
    createHash('sha256')
      .update(process.env.NEXT_PUBLIC_API_URL || 'taboo-checkout-intent-fallback')
      .digest('hex')
      .slice(0, 32);
  return createHash('sha256').update(secret).digest();
}

export interface CheckoutIntentPayload {
  email: string;
  plan_id: string;
}

export async function signCheckoutIntent(email: string, planId: string): Promise<string> {
  return new SignJWT({ email, plan_id: planId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(INTENT_EXPIRY)
    .sign(getSecret());
}

export async function verifyCheckoutIntent(token: string): Promise<CheckoutIntentPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  if (!payload.email || !payload.plan_id) {
    throw new Error('Invalid checkout intent payload');
  }
  return {
    email: payload.email as string,
    plan_id: payload.plan_id as string,
  };
}

export function encryptPasswordHint(password: string): string {
  const key = getDerivedKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(PW_HINT_ALGORITHM, key, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptPasswordHint(encrypted: string): string {
  const [ivHex, authTagHex, data] = encrypted.split(':');
  if (!ivHex || !authTagHex || !data) {
    throw new Error('Invalid encrypted password hint format');
  }
  const key = getDerivedKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = createDecipheriv(PW_HINT_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
