'use client';

import { useEarnings } from '@/api/queries/earnings.queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FunnelAreaChart } from '@/features/creator-studio/components/funnel-area-chart';
import { useFeature } from '@/hooks/use-feature';
import type { DateRange, GroupBy } from '@/types';
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EarningsCard } from '../_components/EarningsCard';

export default function EarningsPage() {
  const studioEarningsEnabled = useFeature('STUDIO_EARNINGS');
  const router = useRouter();

  useEffect(() => {
    if (!studioEarningsEnabled) router.replace('/studio');
  }, [studioEarningsEnabled, router]);

  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [groupBy, setGroupBy] = useState<GroupBy>('day');
  const [showFunnel, setShowFunnel] = useState(false);

  const { data, isLoading, error, refetch, isFetching } = useEarnings(dateRange, groupBy);

  if (!studioEarningsEnabled) return null;

  const dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '365d', label: 'Last year' },
    { value: 'all', label: 'All time' },
  ];

  const groupByOptions: { value: GroupBy; label: string }[] = [
    { value: 'day', label: 'Daily' },
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4 mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-muted-foreground mb-2">Unable to load earnings data</p>
          <p className="text-muted-foreground/60 text-sm mb-4">
            {error?.message || 'An unexpected error occurred'}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const periodLabel =
    dateRangeOptions.find((o) => o.value === dateRange)?.label || 'Selected period';

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      {isFetching && !isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-40 flex items-center justify-center rounded-xl">
          <Card className="flex items-center gap-3 px-4 py-2">
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            <span className="text-sm text-muted-foreground">Updating data...</span>
          </Card>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Earnings Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm italic">
            JARVIS, run the earnings report{data?.promoter?.name && ` for ${data.promoter.name}`}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={groupBy} onValueChange={(value) => setGroupBy(value as GroupBy)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {groupByOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isFetching}>
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <EarningsCard
          data={data}
          periodLabel={periodLabel}
          showPeriodEarnings
          showAllTimeEarnings
        />
      </div>

      <Card className="bg-[#131315] border-white/6 mb-6">
        <CardContent className="p-0">
          <button
            onClick={() => setShowFunnel(!showFunnel)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#ab0013]" />
              <span className="text-sm font-semibold text-white">Conversion Funnel</span>
              <span className="text-xs text-white/40 ml-2">{periodLabel}</span>
            </div>
            {showFunnel ? (
              <ChevronUp className="w-4 h-4 text-white/40" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/40" />
            )}
          </button>
          {showFunnel && (
            <div className="px-5 pb-5">
              <FunnelAreaChart data={data?.series || []} groupBy={data?.groupBy ?? 'day'} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
