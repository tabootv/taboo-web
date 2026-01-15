export interface FeatureFlag {
  enabled: boolean;
  name: string;
  description: string;
  impacts: string[];
  reason?: string;
}

export interface FeatureFlags {
  [key: string]: FeatureFlag;
}

// Re-export types from config for convenience
export type { FeatureName, FeatureConfig } from '@/shared/lib/config/feature-flags';
