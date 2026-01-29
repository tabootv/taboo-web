'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  BarChart3,
  Calendar,
  RefreshCw,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  PieChart,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Users,
  UserPlus,
  UserMinus,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEarnings } from '@/api/queries/earnings.queries';
import { useStudioVideos, useStudioShorts } from '@/api/queries/studio.queries';
import { ChartSkeleton } from './components/chart-skeleton';

// Lazy load chart components to reduce initial bundle size
const CustomersChart = dynamic(
  () => import('./components/customers-chart'),
  { ssr: false, loading: () => <ChartSkeleton height={200} /> }
);

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

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [groupBy, setGroupBy] = useState<GroupBy>('day');
  const [insightsExpanded, setInsightsExpanded] = useState(false);

  // React Query hooks for data fetching with caching
  const {
    data: earningsData,
    isLoading: isEarningsLoading,
    isFetching: isEarningsRefetching,
    error: earningsError,
    refetch: refetchEarnings,
  } = useEarnings(dateRange, groupBy);

  const { data: videosData } = useStudioVideos(1);
  const { data: shortsData } = useStudioShorts(1);

  // Derive content stats from videos/shorts data
  const contentStats = useMemo(() => {
    const allContent = [
      ...(videosData?.videos || []),
      ...(shortsData?.videos || []),
    ];
    const totalViews = allContent.reduce((sum, v) => sum + (v.views_count || 0), 0);
    const totalLikes = allContent.reduce((sum, v) => sum + (v.likes_count || 0), 0);
    const totalComments = allContent.reduce((sum, v) => sum + (v.comments_count || 0), 0);
    const avgEngagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

    return {
      totalVideos: videosData?.pagination?.total || 0,
      totalShorts: shortsData?.pagination?.total || 0,
      totalViews,
      totalLikes,
      totalComments,
      avgEngagementRate,
      topContent: allContent,
    };
  }, [videosData, shortsData]);

  const isLoading = isEarningsLoading;
  const isRefetching = isEarningsRefetching && !isEarningsLoading;
  const error = earningsError instanceof Error ? earningsError.message : null;

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

  // Calculate meaningful business metrics
  const businessMetrics = useMemo(() => {
    if (!earningsData) return null;

    const { summary, allTimeStats, conversionRates, series } = earningsData;

    // Churn metrics
    const totalCustomers = allTimeStats.customers;
    const activeCustomers = allTimeStats.activeCustomers;
    const churnedCustomers = totalCustomers - activeCustomers;
    const churnRate = totalCustomers > 0
      ? ((churnedCustomers / totalCustomers) * 100)
      : 0;
    const retentionRate = totalCustomers > 0
      ? ((activeCustomers / totalCustomers) * 100)
      : 0;

    // Month-over-month growth (compare last period to previous)
    let previousPeriodCustomers = 0;
    let currentPeriodCustomers = 0;
    let customerGrowthRate = 0;

    if (series.length >= 2) {
      // Split series in half to compare periods
      const midPoint = Math.floor(series.length / 2);
      const firstHalf = series.slice(0, midPoint);
      const secondHalf = series.slice(midPoint);

      previousPeriodCustomers = firstHalf.reduce((sum, p) => sum + p.customers, 0);
      currentPeriodCustomers = secondHalf.reduce((sum, p) => sum + p.customers, 0);

      if (previousPeriodCustomers > 0) {
        customerGrowthRate = ((currentPeriodCustomers - previousPeriodCustomers) / previousPeriodCustomers) * 100;
      } else if (currentPeriodCustomers > 0) {
        customerGrowthRate = 100; // Infinite growth from 0
      }
    }

    // New customers this period
    const newCustomersThisPeriod = summary.customers;

    // Revenue metrics
    const currentPeriodRevenue = summary.revenue / 100; // Convert from cents
    const currentPeriodEarnings = summary.earnings / 100;

    // Estimate MRR based on active customers (rough estimate)
    const estimatedMRR = activeCustomers > 0
      ? (allTimeStats.revenue / 100) / Math.max(1, totalCustomers) * activeCustomers
      : 0;

    return {
      // Churn & Retention
      churnRate: Math.round(churnRate * 10) / 10,
      churnedCustomers,
      retentionRate: Math.round(retentionRate * 10) / 10,
      activeCustomers,
      totalCustomers,

      // Growth
      newCustomersThisPeriod,
      previousPeriodCustomers,
      currentPeriodCustomers,
      customerGrowthRate: Math.round(customerGrowthRate * 10) / 10,

      // Revenue
      currentPeriodRevenue,
      currentPeriodEarnings,
      estimatedMRR: Math.round(estimatedMRR * 100) / 100,

      // Period stats
      clicks: summary.clicks,
      signups: summary.signups,
      customers: summary.customers,
      earnings: summary.earnings,
      revenue: summary.revenue,

      // Conversion rates
      clickToSignup: conversionRates.clickToSignup,
      signupToCustomer: conversionRates.signupToCustomer,
    };
  }, [earningsData]);

  // Generate Jarvis insights
  const jarvisInsights = useMemo(() => {
    const insights: string[] = [];

    if (earningsData) {
      const { conversionRates, allTimeStats, balance } = earningsData;

      // Referral performance
      if (businessMetrics && businessMetrics.clicks > 100) {
        insights.push(`${formatNumber(businessMetrics.clicks)} referral clicks this period. Your content is driving traffic.`);
      }

      // Conversion insight
      if (conversionRates.signupToCustomer > 20) {
        insights.push(`${conversionRates.signupToCustomer.toFixed(1)}% of signups convert to customers. That's premium audience quality.`);
      } else if (conversionRates.clickToSignup > 5) {
        insights.push(`${conversionRates.clickToSignup.toFixed(1)}% click-to-signup rate. Good engagement with your referral links.`);
      }

      // Balance insight
      if (balance.current > 0) {
        insights.push(`$${(balance.current / 100).toFixed(2)} available for payout. Time to get paid!`);
      }

      // Active subscribers insight
      if (allTimeStats.activeCustomers > 0) {
        const retentionRate = allTimeStats.customers > 0
          ? ((allTimeStats.activeCustomers / allTimeStats.customers) * 100).toFixed(0)
          : 0;
        insights.push(`${formatNumber(allTimeStats.activeCustomers)} active subscribers (${retentionRate}% retention). Recurring revenue secured.`);
      }

      // Content stats insights (if available)
      if (contentStats) {
        const { totalVideos, totalShorts, totalViews, avgEngagementRate } = contentStats;

        if (totalViews > 10000) {
          insights.push(`${formatNumber(totalViews)} total views across your content. Keep creating.`);
        }

        if (avgEngagementRate > 5) {
          insights.push(`${avgEngagementRate.toFixed(1)}% engagement rate. Your audience is locked in.`);
        }

        if (totalShorts > totalVideos && totalVideos > 0) {
          insights.push(`Shorts are your power play: ${totalShorts} shorts vs ${totalVideos} episodes.`);
        }
      }
    }

    return insights.slice(0, 4);
  }, [contentStats, earningsData, businessMetrics]);

  // Chart data
  const chartData = useMemo(() => {
    if (!earningsData?.series) return [];
    return earningsData.series.map((point) => ({
      ...point,
      formattedPeriod: formatLabel(point.period, earningsData.groupBy),
    }));
  }, [earningsData]);

  // Funnel data for visualization
  const funnelData = useMemo(() => {
    if (!earningsData) return [];
    const { summary } = earningsData;
    return [
      { name: 'Clicks', value: summary.clicks, fill: '#fca5a5' },
      { name: 'Signups', value: summary.signups, fill: '#f87171' },
      { name: 'Customers', value: summary.customers, fill: '#ab0013' },
    ];
  }, [earningsData]);

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

  const periodLabel = dateRangeOptions.find((o) => o.value === dateRange)?.label || 'Selected period';

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      {/* Refetching Overlay */}
      {isRefetching && (
        <div className="absolute inset-0 bg-[#131315]/50 backdrop-blur-sm z-40 flex items-center justify-center rounded-xl">
          <Card className="bg-[#131315] border-white/6 flex items-center gap-3 px-4 py-2">
            <Loader2 className="w-4 h-4 text-white/60 animate-spin" />
            <span className="text-sm text-white/60">Updating data...</span>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-red-primary/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#ab0013]" />
            </div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
          </div>
          <p className="text-white/60 text-sm italic">
            JARVIS, run performance analytics{earningsData?.promoter?.name && ` for ${earningsData.promoter.name}`}.
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

          <Button onClick={() => refetchEarnings()} variant="outline" size="sm" disabled={isRefetching}>
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Jarvis Insights */}
      {jarvisInsights.length > 0 && (
        <Card className="bg-[#131315] border-white/6 mb-8">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[#ab0013]" />
                <h2 className="text-sm font-semibold text-white">Jarvis Insights</h2>
              </div>
              {jarvisInsights.length > 1 && (
                <button
                  onClick={() => setInsightsExpanded(!insightsExpanded)}
                  className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 transition-colors"
                >
                  {insightsExpanded ? (
                    <>Show less <ChevronUp className="w-3.5 h-3.5" /></>
                  ) : (
                    <>{jarvisInsights.length - 1} more <ChevronDown className="w-3.5 h-3.5" /></>
                  )}
                </button>
              )}
            </div>
            <div className="space-y-3">
              {(insightsExpanded ? jarvisInsights : jarvisInsights.slice(0, 1)).map((insight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-white/5 border border-white/6 rounded-lg px-4 py-3"
                >
                  <Sparkles className="w-4 h-4 text-[#ab0013] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/60 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Metrics */}
      <Card className="bg-[#131315] border-white/6 mb-8">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-5">
            <Users className="w-4 h-4 text-[#ab0013]" />
            <h3 className="text-sm font-semibold text-white">Subscription Metrics</h3>
            <span className="text-xs text-white/40 ml-auto">{periodLabel}</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* New Subscriptions */}
            <div className="bg-white/5 border border-white/6 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="w-4 h-4 text-green-400" />
                <span className="text-xs text-white/60 flex items-center gap-1">
                  New Subscriptions
                  <span title="New customers who subscribed during this period">
                    <Info className="w-3 h-3 text-white/30 cursor-help" />
                  </span>
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{businessMetrics?.newCustomersThisPeriod || 0}</p>
            </div>

            {/* Recurring Customers */}
            <div className="bg-white/5 border border-white/6 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-white/60 flex items-center gap-1">
                  Recurring
                  <span title="Active customers from before this period (still subscribed)">
                    <Info className="w-3 h-3 text-white/30 cursor-help" />
                  </span>
                </span>
              </div>
              <p className="text-2xl font-bold text-white">
                {Math.max(0, (businessMetrics?.activeCustomers || 0) - (businessMetrics?.newCustomersThisPeriod || 0))}
              </p>
            </div>

            {/* Total Paid Customers */}
            <div className="bg-white/5 border border-[#ab0013]/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-[#ab0013]" />
                <span className="text-xs text-white/60 flex items-center gap-1">
                  Total Paid
                  <span title="All currently active paying customers (recurring + new)">
                    <Info className="w-3 h-3 text-white/30 cursor-help" />
                  </span>
                </span>
              </div>
              <p className="text-2xl font-bold text-[#ab0013]">{businessMetrics?.activeCustomers || 0}</p>
              <p className="text-[10px] text-white/40 mt-1">
                {Math.max(0, (businessMetrics?.activeCustomers || 0) - (businessMetrics?.newCustomersThisPeriod || 0))} recurring + {businessMetrics?.newCustomersThisPeriod || 0} new
              </p>
            </div>

            {/* Churned / Cancelled */}
            <div className="bg-white/5 border border-white/6 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserMinus className="w-4 h-4 text-red-400" />
                <span className="text-xs text-white/60 flex items-center gap-1">
                  Churned
                  <span title="Customers who cancelled or let their subscription expire (all-time)">
                    <Info className="w-3 h-3 text-white/30 cursor-help" />
                  </span>
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{businessMetrics?.churnedCustomers || 0}</p>
              <p className="text-[10px] text-white/40 mt-1">
                {businessMetrics?.churnRate || 0}% churn rate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Per Day Chart (Lazy Loaded) */}
      <CustomersChart data={chartData} />

      {/* Conversion Funnel */}
      <Card className="bg-[#131315] border-white/6 mb-8">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#ab0013]" />
              <h3 className="text-sm font-semibold text-white">Conversion Funnel</h3>
            </div>
            <span className="text-xs text-white/60">{periodLabel}</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {funnelData.map((item, index) => {
              const prevItem = index > 0 ? funnelData[index - 1] : null;
              const prevValue = prevItem ? prevItem.value : item.value;
              const conversionRate = prevValue > 0 ? ((item.value / prevValue) * 100).toFixed(1) : '100';
              const firstItem = funnelData[0];
              const widthPercent = firstItem && firstItem.value > 0 ? (item.value / firstItem.value) * 100 : 0;

              return (
                <div key={item.name} className="relative">
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-white/60">{item.name}</span>
                      {index > 0 && (
                        <span className="text-[10px] text-white/60">{conversionRate}% from prev</span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-white">{item.value.toLocaleString()}</p>
                  </div>
                  <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: item.fill,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-8 mt-6 text-xs text-white/60">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-3 h-3 text-[#f87171]" />
              <span>Click → Signup: {earningsData?.conversionRates?.clickToSignup || 0}%</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-3 h-3 text-[#ab0013]" />
              <span>Signup → Customer: {earningsData?.conversionRates?.signupToCustomer || 0}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payouts CTA */}
      <Link href="/studio/payouts" className="block group">
        <Card className="bg-[#131315] border-white/6 hover:border-white/10 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#ab0013]/20 flex items-center justify-center group-hover:bg-[#ab0013]/30 transition-colors">
                  <DollarSign className="w-6 h-6 text-[#ab0013]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-0.5">View Earnings & Payouts</h3>
                  <p className="text-sm text-white/40">Track revenue, balance, and payout history</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
