import { Video, Film, Layers, GraduationCap, MessageSquarePlus } from 'lucide-react';
import { formatNumber } from '@/shared/utils/formatting';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from './StatCard';

interface ContentTotals {
  videos: number;
  shorts: number;
  series: number;
  courses: number;
  posts: number;
}

interface ContentMetricsGridProps {
  totals: ContentTotals;
}

export function ContentMetricsGrid({ totals }: ContentMetricsGridProps) {
  return (
    <Card className="hover:translate-y-0 hover:scale-100">
      <CardContent className="p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard icon={Video} label="Videos" value={formatNumber(totals.videos)} />
          <StatCard icon={Film} label="Shorts" value={formatNumber(totals.shorts)} />
          <StatCard icon={Layers} label="Series" value={formatNumber(totals.series)} />
          <StatCard icon={GraduationCap} label="Education" value={formatNumber(totals.courses)} />
          <StatCard icon={MessageSquarePlus} label="Posts" value={formatNumber(totals.posts)} />
        </div>
      </CardContent>
    </Card>
  );
}
