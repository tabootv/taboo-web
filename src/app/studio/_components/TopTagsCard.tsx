import { Card, CardContent } from '@/components/ui/card';
import type { AggregatedStats } from '@/api/queries/studio.queries';

interface TopTagsCardProps {
  mapStats: AggregatedStats | null | undefined;
  isLoading: boolean;
  error: string | null;
}

export function TopTagsCard({ mapStats, isLoading, error }: TopTagsCardProps) {
  return (
    <Card className="hover:translate-y-0 hover:scale-100">
      <CardContent className="p-6 lg:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Top Tags</h2>
            <p className="text-white/50 text-sm">Your most used content tags.</p>
          </div>
          {isLoading && !mapStats && <span className="text-xs text-white/50">Loading…</span>}
        </div>

        {error && <p className="text-sm text-red-300">{error}</p>}

        {!isLoading && mapStats && (
          <div className="flex flex-wrap gap-2">
            {mapStats.topTags.map((t, idx) => (
              <span
                key={t.name}
                className={`text-sm px-4 py-2 rounded-full border transition-all hover:scale-105 ${
                  idx < 3
                    ? 'bg-red-primary/20 border-red-primary/30 text-white font-medium'
                    : 'bg-white/5 border-white/10 text-white/80'
                }`}
              >
                {t.name} <span className="text-white/50">· {t.count}</span>
              </span>
            ))}
            {mapStats.topTags.length === 0 && (
              <p className="text-sm text-white/50">No tags yet. Add tags to your videos!</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
