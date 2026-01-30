import { Globe2, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/shared/utils/formatting';
import { StatCard } from './StatCard';
import type { AggregatedStats } from '@/api/queries/studio.queries';

interface WorldTakeoverCardProps {
  mapStats: AggregatedStats | null | undefined;
  isLoading: boolean;
  error: string | null;
}

export function WorldTakeoverCard({ mapStats, isLoading, error }: WorldTakeoverCardProps) {
  const coverageDisplay = mapStats ? `${mapStats.coveragePercent.toFixed(1)}%` : '—';

  return (
    <Card className="hover:translate-y-0 hover:scale-100">
      <CardContent className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold text-white">World Takeover</h2>
            <p className="text-white/50 text-sm">Your global content footprint.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            icon={Globe2}
            label="Countries"
            value={`${formatNumber(mapStats?.countriesRecorded ?? 0)}`}
          />
          <StatCard icon={MapPin} label="Coverage" value={coverageDisplay} />
          <StatCard
            icon={Globe2}
            label="Global Reach"
            value={`${formatNumber(mapStats?.countriesRecorded ?? 0)}/195`}
          />
        </div>

        {error && <p className="text-sm text-red-300">{error}</p>}

        {isLoading && !mapStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && mapStats && mapStats.topCountries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mapStats.topCountries.slice(0, 6).map((country, idx) => (
              <div
                key={country.name}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 transition-all hover:bg-white/10"
              >
                <div className="text-2xl" aria-hidden>
                  {country.flag}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold leading-tight">{country.name}</p>
                  <p className="text-white/50 text-sm">{country.count} videos</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-primary to-red-primary/70"
                      style={{
                        width: `${Math.min(100, (country.count / (mapStats.topCountries[0]?.count || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-white/40 w-8 text-right">#{idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!error && !isLoading && mapStats && mapStats.topCountries.length === 0 && (
          <p className="text-sm text-white/50">
            Start filming around the world to see your coverage!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
