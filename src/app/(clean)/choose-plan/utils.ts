import type { Plan } from '@/types';

export const DEFAULT_BENEFITS = [
  'Watch shorts, full episodes, and exclusive Taboo series',
  'Unfiltered stories from creators around the world',
  'One membership gives you access to all creators, anywhere',
  'Show your Infinity badge in every comment',
  'Stream anywhere on mobile, web, and TVs soon',
  'Taboo Education: creator courses included free',
];

export const MAX_POLL_ATTEMPTS = 15;
export const POLL_INTERVAL_MS = 2000;

export const MUTED_TEXT_COLOR = 'rgba(255,255,255,0.5)';
export const MUTED_TEXT_LIGHT = 'rgba(255,255,255,0.6)';
export const MUTED_TEXT_LIGHTER = 'rgba(255,255,255,0.7)';
export const BRAND_COLOR = '#ab0013';
export const SURFACE_BG = 'rgba(255,255,255,0.08)';
export const TRANSITION_ALL = 'all 0.2s ease';

export function findMonthlyPlan(plans: Plan[]) {
  return plans.find((p) => p.name?.toLowerCase().includes('monthly') || p.interval === 'monthly');
}

export function findYearlyPlan(plans: Plan[]) {
  return plans.find(
    (p) =>
      p.name?.toLowerCase().includes('yearly') ||
      p.name?.toLowerCase().includes('annual') ||
      p.interval === 'yearly'
  );
}

export function calcYearlySavings(monthly?: Plan, yearly?: Plan): number {
  if (yearly?.save_percentage != null) return yearly.save_percentage;
  if (!monthly || !yearly) return 17;
  return Math.round(((monthly.price * 12 - yearly.price) / (monthly.price * 12)) * 100);
}

export function formatPrice(price: number, currency: string = 'USD') {
  try {
    const parts = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).formatToParts(price);

    const currencySymbol = parts.find((p) => p.type === 'currency')?.value || '$';
    const numberPart = parts
      .filter((p) => p.type !== 'currency')
      .map((p) => p.value)
      .join('');

    return { symbol: currencySymbol, amount: numberPart };
  } catch {
    return { symbol: '$', amount: price.toFixed(2) };
  }
}
