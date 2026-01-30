'use client';

import { useEarnings } from '@/api/queries/earnings.queries';
import { useStudioShorts, useStudioVideos } from '@/api/queries/studio.queries';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { AnalyticsHeader, DATE_RANGE_OPTIONS } from './_components/AnalyticsHeader';
import { ChartSkeleton } from './_components/chart-skeleton';
import { ConversionFunnelCard } from './_components/ConversionFunnelCard';
import { JarvisInsightsCard } from './_components/JarvisInsightsCard';
import { PayoutsCTA } from './_components/PayoutsCTA';
import { SubscriptionMetricsCard } from './_components/SubscriptionMetricsCard';
import { useAnalyticsMetrics } from './_hooks/useAnalyticsMetrics';

const CustomersChart = dynamic(() => import('./_components/customers-chart'), {
  ssr: false,
  loading: () => <ChartSkeleton height={200} />,
});

type DateRange = '7d' | '30d' | '90d' | '365d' | 'all';
type GroupBy = 'day' | 'week' | 'month';

function formatLabel(period: string, groupBy?: string) {
  const date = new Date(period);
  switch (groupBy) {
    case 'month':
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    case 'week':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    default:
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [groupBy, setGroupBy] = useState<GroupBy>('day');

  const {
    data: earningsData,
    isLoading: isEarningsLoading,
    isFetching: isEarningsRefetching,
    error: earningsError,
    refetch: refetchEarnings,
  } = useEarnings(dateRange, groupBy);

  const { data: videosData } = useStudioVideos(1);
  const { data: shortsData } = useStudioShorts(1);

  const contentStats = useMemo(() => {
    const allContent = [...(videosData?.videos || []), ...(shortsData?.videos || [])];
    const totalViews = allContent.reduce((sum, v) => sum + (v.views_count || 0), 0);
    const totalLikes = allContent.reduce((sum, v) => sum + (v.likes_count || 0), 0);
    const totalComments = allContent.reduce((sum, v) => sum + (v.comments_count || 0), 0);
    const avgEngagementRate =
      totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

    return {
      totalVideos: videosData?.pagination?.total || 0,
      totalShorts: shortsData?.pagination?.total || 0,
      totalViews,
      totalLikes,
      totalComments,
      avgEngagementRate,
    };
  }, [videosData, shortsData]);

  const { businessMetrics, jarvisInsights, funnelData } = useAnalyticsMetrics(
    earningsData,
    contentStats
  );

  const chartData = useMemo(() => {
    if (!earningsData?.series) return [];
    return earningsData.series.map((point) => ({
      ...point,
      formattedPeriod: formatLabel(point.period, earningsData.groupBy),
    }));
  }, [earningsData]);

  const isLoading = isEarningsLoading;
  const isRefetching = isEarningsRefetching && !isEarningsLoading;
  const error = earningsError instanceof Error ? earningsError.message : null;
  const periodLabel =
    DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label || 'Selected period';

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-white/60 animate-spin mx-auto mb-3" />
          <p className="text-white/60">Loading analytics data...</p>
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
          <p className="text-white/60 mb-2">Unable to load analytics data</p>
          <p className="text-white/60/60 text-sm mb-4">{error}</p>
          <Button onClick={() => refetchEarnings()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      {isRefetching && (
        <div className="absolute inset-0 bg-[#131315]/50 backdrop-blur-sm z-40 flex items-center justify-center rounded-xl">
          <Card className="bg-[#131315] border-white/6 flex items-center gap-3 px-4 py-2">
            <Loader2 className="w-4 h-4 text-white/60 animate-spin" />
            <span className="text-sm text-white/60">Updating data...</span>
          </Card>
        </div>
      )}

      <AnalyticsHeader
        promoterName={earningsData?.promoter?.name}
        dateRange={dateRange}
        groupBy={groupBy}
        onDateRangeChange={setDateRange}
        onGroupByChange={setGroupBy}
        onRefetch={refetchEarnings}
        isRefetching={isRefetching}
      />

      <JarvisInsightsCard insights={jarvisInsights} />

      <SubscriptionMetricsCard metrics={businessMetrics} periodLabel={periodLabel} />

      <CustomersChart data={chartData} />

      <ConversionFunnelCard
        funnelData={funnelData}
        conversionRates={earningsData?.conversionRates || { clickToSignup: 0, signupToCustomer: 0 }}
        periodLabel={periodLabel}
      />

      <PayoutsCTA />
    </div>
  );
}
