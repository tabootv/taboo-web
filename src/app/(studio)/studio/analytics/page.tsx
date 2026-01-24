'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Zap,
  Activity,
  Calendar,
  RefreshCw,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  LineChart,
  PieChart,
  Eye,
  ThumbsUp,
  MessageSquare,
  Play,
  Film,
  Clock,
  Award,
  Lightbulb,
  Globe2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  PolarGrid,
  PolarRadiusAxis,
  Label,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart';
import { studioClient as studio } from '@/api/client/studio.client';
import type { StudioVideoListItem } from '@/types';
import Image from 'next/image';

type DateRange = '7d' | '30d' | '90d' | '365d' | 'all';
type GroupBy = 'day' | 'week' | 'month';
type ContentFilter = 'all' | 'videos' | 'shorts';

interface EarningsData {
  promoter: {
    id: number;
    name: string;
    email: string;
    refId: string;
    referralLink: string;
    status: string;
    payoutMethod: string | null;
    joinedAt: string;
  };
  summary: {
    clicks: number;
    signups: number;
    customers: number;
    sales: number;
    revenue: number;
    earnings: number;
  };
  allTimeStats: {
    clicks: number;
    signups: number;
    customers: number;
    sales: number;
    revenue: number;
    earnings: number;
    activeCustomers: number;
  };
  balance: {
    current: number;
    pending: number;
    paid: number;
  };
  conversionRates: {
    clickToSignup: number;
    signupToCustomer: number;
  };
  series: Array<{
    period: string;
    earnings: number;
    revenue: number;
    count: number;
    clicks: number;
    signups: number;
    customers: number;
  }>;
  groupBy: GroupBy;
}

interface ContentStats {
  totalVideos: number;
  totalShorts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgEngagementRate: number;
  topContent: StudioVideoListItem[];
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: number;
  description?: string;
  highlight?: boolean;
  small?: boolean;
}

function MetricCard({ title, value, icon, subtitle, trend, description, highlight, small }: MetricCardProps) {
  return (
    <Card className="group transition-all hover:scale-[1.01]">
      <CardContent className={small ? 'p-4' : 'p-5'}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-white/50 font-medium mb-1">{title}</p>
            <p className={`font-bold leading-tight ${highlight ? 'text-[#ab0013]' : 'text-white'} ${small ? 'text-xl' : 'text-2xl'}`}>
              {value}
            </p>
            {subtitle && (
              <div className="flex items-center gap-2 mt-1.5">
                {trend !== undefined && (
                  <span className={`flex items-center text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(trend).toFixed(1)}%
                  </span>
                )}
                <span className="text-[11px] text-white/30">{subtitle}</span>
              </div>
            )}
            {description && (
              <p className="text-[10px] text-white/25 mt-2 leading-relaxed">{description}</p>
            )}
          </div>
          <div className={`rounded-xl flex items-center justify-center flex-shrink-0 transition-shadow duration-300 ${highlight ? 'bg-[#ab0013]/20 group-hover:shadow-[0_0_30px_rgba(171,0,19,0.5)]' : 'bg-white/5'} ${small ? 'w-8 h-8' : 'w-10 h-10'}`}>
            <div className={`${highlight ? 'text-[#ab0013]' : 'text-white/40'} ${small ? '[&>svg]:w-4 [&>svg]:h-4' : '[&>svg]:w-5 [&>svg]:h-5'}`}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Chart configurations
const growthChartConfig = {
  signups: { label: 'Signups', color: '#f87171' },
  customers: { label: 'Customers', color: '#ab0013' },
} satisfies ChartConfig;

const funnelChartConfig = {
  clicks: { label: 'Clicks', color: '#fca5a5' },
  signups: { label: 'Signups', color: '#f87171' },
  customers: { label: 'Customers', color: '#ab0013' },
} satisfies ChartConfig;

const customersChartConfig = {
  customers: { label: 'Customers', color: '#ab0013' },
} satisfies ChartConfig;

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

function formatAxisNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function AnalyticsPage() {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [contentStats, setContentStats] = useState<ContentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [groupBy, setGroupBy] = useState<GroupBy>('day');
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all');
  const [sortBy, setSortBy] = useState<'views' | 'likes' | 'comments' | 'recent'>('views');

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

  const getDateParams = useCallback(() => {
    const endDate = new Date();
    const startDate = new Date();
    let group: GroupBy = groupBy;

    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        if (groupBy === 'month') group = 'day';
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        if (groupBy === 'day') group = 'week';
        break;
      case '365d':
        startDate.setFullYear(endDate.getFullYear() - 1);
        if (groupBy === 'day') group = 'month';
        break;
      case 'all':
        startDate.setFullYear(2020, 0, 1);
        group = 'month';
        break;
    }

    return {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      group_by: group,
    };
  }, [dateRange, groupBy]);

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }
    setError(null);

    try {
      const params = getDateParams();
      const searchParams = new URLSearchParams({
        start_date: params.start_date,
        end_date: params.end_date,
        group_by: params.group_by,
      });

      // Fetch earnings data (required)
      const earningsResponse = await fetch(`/api/creator-studio/earnings?${searchParams}`);
      const earningsResult = await earningsResponse.json();

      if (!earningsResponse.ok) {
        throw new Error(earningsResult.error || 'Failed to fetch analytics data');
      }

      setEarningsData(earningsResult);

      // Fetch content stats (optional - gracefully handle if endpoints don't exist)
      try {
        const [videosResponse, shortsResponse] = await Promise.all([
          studio.getVideos(1).catch(() => null),
          studio.getShorts(1).catch(() => null),
        ]);

        // Calculate content stats if we got any data
        const allContent = [
          ...(videosResponse?.videos || []),
          ...(shortsResponse?.videos || []),
        ];
        const totalViews = allContent.reduce((sum, v) => sum + (v.views_count || 0), 0);
        const totalLikes = allContent.reduce((sum, v) => sum + (v.likes_count || 0), 0);
        const totalComments = allContent.reduce((sum, v) => sum + (v.comments_count || 0), 0);
        const avgEngagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

        setContentStats({
          totalVideos: videosResponse?.pagination?.total || 0,
          totalShorts: shortsResponse?.pagination?.total || 0,
          totalViews,
          totalLikes,
          totalComments,
          avgEngagementRate,
          topContent: allContent,
        });
      } catch (contentErr) {
        // Content stats are optional - just log and continue
        console.warn('Could not fetch content stats:', contentErr);
        setContentStats(null);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, [getDateParams]);

  useEffect(() => {
    fetchData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoading) return;
    fetchData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, groupBy]);

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

  // Filtered and sorted top content
  const filteredContent = useMemo(() => {
    if (!contentStats?.topContent) return [];

    let content = [...contentStats.topContent];

    // Filter by type
    if (contentFilter === 'videos') {
      content = content.filter(c => (c.duration || 0) > 60);
    } else if (contentFilter === 'shorts') {
      content = content.filter(c => (c.duration || 0) <= 60);
    }

    // Sort
    switch (sortBy) {
      case 'views':
        content.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
        break;
      case 'likes':
        content.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        break;
      case 'comments':
        content.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0));
        break;
      case 'recent':
        content.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return content.slice(0, 10);
  }, [contentStats, contentFilter, sortBy]);

  // Determine content badges
  const getContentBadges = (item: StudioVideoListItem) => {
    const badges: { label: string; color: string }[] = [];
    const views = item.views_count || 0;
    const likes = item.likes_count || 0;
    const comments = item.comments_count || 0;

    const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;

    if (engagementRate > 10) badges.push({ label: 'High Engagement', color: 'bg-emerald-500/20 text-emerald-400' });
    if (views > 1000) badges.push({ label: 'Trending', color: 'bg-[#ab0013]/20 text-[#ab0013]' });
    if (comments > 50) badges.push({ label: 'Conversation Starter', color: 'bg-blue-500/20 text-blue-400' });

    return badges.slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">Loading analytics data...</p>
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
          <p className="text-muted-foreground mb-2">Unable to load analytics data</p>
          <p className="text-muted-foreground/60 text-sm mb-4">{error}</p>
          <Button onClick={() => fetchData(true)} variant="outline">
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
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-40 flex items-center justify-center rounded-xl">
          <Card className="flex items-center gap-3 px-4 py-2">
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            <span className="text-sm text-muted-foreground">Updating data...</span>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#ab0013]/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#ab0013]" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          </div>
          <p className="text-white/40 text-sm italic">
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

          <Button onClick={() => fetchData(false)} variant="outline" size="sm" disabled={isRefetching}>
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Jarvis Insights */}
      {jarvisInsights.length > 0 && (
        <Card className="mb-8 hover:translate-y-0 hover:scale-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-[#ab0013]" />
              <h2 className="text-sm font-semibold text-white">Jarvis Insights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {jarvisInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3"
                >
                  <Sparkles className="w-4 h-4 text-[#ab0013] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/70 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Performance KPIs */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-[#ab0013]" />
          <h2 className="text-sm font-semibold text-white">Content Performance</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <MetricCard
            title="Total Views"
            value={formatNumber(contentStats?.totalViews || 0)}
            icon={<Eye />}
            subtitle="all content"
            highlight
            small
          />
          <MetricCard
            title="Total Likes"
            value={formatNumber(contentStats?.totalLikes || 0)}
            icon={<ThumbsUp />}
            subtitle="engagement"
            small
          />
          <MetricCard
            title="Comments"
            value={formatNumber(contentStats?.totalComments || 0)}
            icon={<MessageSquare />}
            subtitle="interactions"
            small
          />
          <MetricCard
            title="Videos"
            value={contentStats?.totalVideos || 0}
            icon={<Film />}
            subtitle="episodes"
            small
          />
          <MetricCard
            title="Shorts"
            value={contentStats?.totalShorts || 0}
            icon={<Play />}
            subtitle="vertical"
            small
          />
          <MetricCard
            title="Engagement Rate"
            value={`${(contentStats?.avgEngagementRate || 0).toFixed(1)}%`}
            icon={<Activity />}
            subtitle="likes + comments / views"
            highlight
            small
          />
        </div>
      </div>

      {/* Key Business Metrics - Radial Charts */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-[#ab0013]" />
          <h2 className="text-sm font-semibold text-white">Business Health</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Customer Retention Radial */}
          <Card className="hover:translate-y-0 hover:scale-100">
            <CardContent className="p-4">
              <ChartContainer
                config={{ retention: { label: 'Retention', color: '#22c55e' } }}
                className="mx-auto aspect-square h-[140px]"
              >
                <RadialBarChart
                  data={[{ value: businessMetrics?.retentionRate || 0, fill: '#22c55e' }]}
                  startAngle={90}
                  endAngle={90 - (360 * (businessMetrics?.retentionRate || 0) / 100)}
                  innerRadius={50}
                  outerRadius={65}
                >
                  <PolarGrid
                    gridType="circle"
                    radialLines={false}
                    stroke="none"
                    className="first:fill-white/5 last:fill-transparent"
                    polarRadius={[54, 46]}
                  />
                  <RadialBar dataKey="value" background={{ fill: 'rgba(255,255,255,0.05)' }} cornerRadius={10} />
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy} className="fill-white text-2xl font-bold">
                                {businessMetrics?.retentionRate || 0}%
                              </tspan>
                            </text>
                          );
                        }
                        return null;
                      }}
                    />
                  </PolarRadiusAxis>
                </RadialBarChart>
              </ChartContainer>
              <div className="text-center mt-1">
                <p className="text-xs font-medium text-white">Retention</p>
                <p className="text-[10px] text-white/40">{businessMetrics?.activeCustomers || 0} of {businessMetrics?.totalCustomers || 0} active</p>
              </div>
            </CardContent>
          </Card>

          {/* Churn Rate Radial */}
          <Card className="hover:translate-y-0 hover:scale-100">
            <CardContent className="p-4">
              <ChartContainer
                config={{ churn: { label: 'Churn', color: '#ef4444' } }}
                className="mx-auto aspect-square h-[140px]"
              >
                <RadialBarChart
                  data={[{ value: businessMetrics?.churnRate || 0, fill: '#ef4444' }]}
                  startAngle={90}
                  endAngle={90 - (360 * (businessMetrics?.churnRate || 0) / 100)}
                  innerRadius={50}
                  outerRadius={65}
                >
                  <PolarGrid
                    gridType="circle"
                    radialLines={false}
                    stroke="none"
                    className="first:fill-white/5 last:fill-transparent"
                    polarRadius={[54, 46]}
                  />
                  <RadialBar dataKey="value" background={{ fill: 'rgba(255,255,255,0.05)' }} cornerRadius={10} />
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy} className="fill-white text-2xl font-bold">
                                {businessMetrics?.churnRate || 0}%
                              </tspan>
                            </text>
                          );
                        }
                        return null;
                      }}
                    />
                  </PolarRadiusAxis>
                </RadialBarChart>
              </ChartContainer>
              <div className="text-center mt-1">
                <p className="text-xs font-medium text-white">Churn Rate</p>
                <p className="text-[10px] text-white/40">{businessMetrics?.churnedCustomers || 0} customers lost</p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Growth Radial */}
          <Card className="hover:translate-y-0 hover:scale-100">
            <CardContent className="p-4">
              <ChartContainer
                config={{ growth: { label: 'Growth', color: '#ab0013' } }}
                className="mx-auto aspect-square h-[140px]"
              >
                <RadialBarChart
                  data={[{ value: Math.min(100, Math.abs(businessMetrics?.customerGrowthRate || 0)), fill: (businessMetrics?.customerGrowthRate || 0) >= 0 ? '#22c55e' : '#ef4444' }]}
                  startAngle={90}
                  endAngle={90 - (360 * Math.min(100, Math.abs(businessMetrics?.customerGrowthRate || 0)) / 100)}
                  innerRadius={50}
                  outerRadius={65}
                >
                  <PolarGrid
                    gridType="circle"
                    radialLines={false}
                    stroke="none"
                    className="first:fill-white/5 last:fill-transparent"
                    polarRadius={[54, 46]}
                  />
                  <RadialBar dataKey="value" background={{ fill: 'rgba(255,255,255,0.05)' }} cornerRadius={10} />
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          const rate = businessMetrics?.customerGrowthRate || 0;
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy} className={`text-2xl font-bold ${rate >= 0 ? 'fill-emerald-400' : 'fill-red-400'}`}>
                                {rate >= 0 ? '+' : ''}{rate}%
                              </tspan>
                            </text>
                          );
                        }
                        return null;
                      }}
                    />
                  </PolarRadiusAxis>
                </RadialBarChart>
              </ChartContainer>
              <div className="text-center mt-1">
                <p className="text-xs font-medium text-white">Growth Rate</p>
                <p className="text-[10px] text-white/40">vs previous period</p>
              </div>
            </CardContent>
          </Card>

          {/* New Customers This Period */}
          <Card className="hover:translate-y-0 hover:scale-100">
            <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <div className="w-[130px] h-[130px] rounded-full bg-gradient-to-br from-[#ab0013]/20 to-[#ab0013]/5 border border-[#ab0013]/20 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{businessMetrics?.newCustomersThisPeriod || 0}</p>
                  <p className="text-[10px] text-white/50">new</p>
                </div>
              </div>
              <div className="text-center mt-3">
                <p className="text-xs font-medium text-white">New Customers</p>
                <p className="text-[10px] text-white/40">{periodLabel.toLowerCase()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Customers Per Day - Simple Chart */}
      <Card className="mb-8">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#ab0013]" />
              <h3 className="text-sm font-semibold text-white">Customers Per Day</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-2xl font-bold text-[#ab0013]">
                  {chartData.reduce((sum, d) => sum + d.customers, 0)}
                </p>
                <p className="text-[10px] text-white/40">total this period</p>
              </div>
            </div>
          </div>
          <ChartContainer config={customersChartConfig} className="h-[200px] w-full">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="customersOnlyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ab0013" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#ab0013" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="formattedPeriod"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                interval={Math.max(0, Math.floor(chartData.length / 8) - 1)}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 shadow-xl">
                      <div className="text-white/60 text-[11px] font-medium mb-1">{label}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#ab0013]" />
                        <span className="text-white text-sm font-bold">{Number(payload[0]?.value || 0)} customers</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="customers"
                stroke="#ab0013"
                strokeWidth={2}
                fill="url(#customersOnlyGradient)"
                dot={{ r: 3, fill: '#ab0013', stroke: '#000', strokeWidth: 2 }}
                activeDot={{ r: 5, fill: '#ab0013', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Revenue & Balance */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Period Earnings"
          value={`$${(businessMetrics?.currentPeriodEarnings || 0).toFixed(2)}`}
          icon={<Zap />}
          subtitle={periodLabel.toLowerCase()}
          highlight
          small
        />
        <MetricCard
          title="Available Balance"
          value={`$${((earningsData?.balance?.current || 0) / 100).toFixed(2)}`}
          icon={<Award />}
          subtitle="ready to withdraw"
          highlight
          small
        />
        <MetricCard
          title="Pending"
          value={`$${((earningsData?.balance?.pending || 0) / 100).toFixed(2)}`}
          icon={<Clock />}
          subtitle="awaiting clearance"
          small
        />
        <MetricCard
          title="Total Paid"
          value={`$${((earningsData?.balance?.paid || 0) / 100).toFixed(2)}`}
          icon={<TrendingUp />}
          subtitle="all time"
          small
        />
      </div>

      {/* User Growth Chart */}
      <Card className="mb-8">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LineChart className="w-4 h-4 text-[#ab0013]" />
              <h3 className="text-sm font-semibold text-white">User Growth Over Time</h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#f87171]" />
                <span className="text-white/50">Signups</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#ab0013]" />
                <span className="text-white/50">Customers</span>
              </div>
            </div>
          </div>
          <ChartContainer config={growthChartConfig} className="h-[280px] w-full">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="signupsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f87171" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="customersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ab0013" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#ab0013" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="formattedPeriod"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                interval={Math.max(0, Math.floor(chartData.length / 8) - 1)}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatAxisNumber}
              />
              <ChartTooltip
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2.5 shadow-xl">
                      <div className="text-white/60 text-[11px] font-medium mb-2">{label}</div>
                      {payload.map((entry) => (
                        <div key={entry.dataKey} className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-white/50 text-xs capitalize">{entry.dataKey}</span>
                          </div>
                          <span className="text-white text-xs font-medium">{Number(entry.value).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="signups"
                stroke="#f87171"
                strokeWidth={2}
                fill="url(#signupsGradient)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="customers"
                stroke="#ab0013"
                strokeWidth={2}
                fill="url(#customersGradient)"
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card className="mb-8">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#ab0013]" />
              <h3 className="text-sm font-semibold text-white">Conversion Funnel</h3>
            </div>
            <span className="text-xs text-white/30">{periodLabel}</span>
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
                        <span className="text-[10px] text-white/40">{conversionRate}% from prev</span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-white">{item.value.toLocaleString()}</p>
                  </div>
                  <div className="h-3 rounded-full bg-white/5 overflow-hidden">
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
          <div className="flex items-center justify-center gap-8 mt-6 text-xs text-white/40">
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

      {/* Top Content Table */}
      <Card className="mb-8">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#ab0013]" />
              <h3 className="text-sm font-semibold text-white">Top Content</h3>
            </div>
            <div className="flex items-center gap-2">
              <Select value={contentFilter} onValueChange={(value) => setContentFilter(value as ContentFilter)}>
                <SelectTrigger className="w-[100px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="videos">Videos</SelectItem>
                  <SelectItem value="shorts">Shorts</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className="w-[100px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="views">Views</SelectItem>
                  <SelectItem value="likes">Likes</SelectItem>
                  <SelectItem value="comments">Comments</SelectItem>
                  <SelectItem value="recent">Recent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto">
            {filteredContent.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-[10px] font-medium text-white/30 uppercase tracking-wider px-5 py-3">Content</th>
                    <th className="text-right text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-3">Views</th>
                    <th className="text-right text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-3">Likes</th>
                    <th className="text-right text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-3">Comments</th>
                    <th className="text-right text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-3">Engagement</th>
                    <th className="text-left text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-3">Badges</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContent.map((item, index) => {
                    const views = item.views_count || 0;
                    const likes = item.likes_count || 0;
                    const comments = item.comments_count || 0;
                    const engagement = views > 0 ? ((likes + comments) / views * 100).toFixed(1) : '0';
                    const badges = getContentBadges(item);
                    const isShort = (item.duration || 0) <= 60;

                    return (
                      <tr key={item.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-16 h-9 rounded overflow-hidden bg-white/5 flex-shrink-0">
                              {item.thumbnail_url && (
                                <Image
                                  src={item.thumbnail_url}
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                />
                              )}
                              {item.duration && (
                                <span className="absolute bottom-0.5 right-0.5 px-1 py-0.5 text-[9px] bg-black/80 rounded text-white">
                                  {formatDuration(item.duration)}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-white font-medium truncate max-w-[200px]">{item.title}</p>
                              <p className="text-[10px] text-white/40 flex items-center gap-1">
                                {isShort ? <Play className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                                {isShort ? 'Short' : 'Episode'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-white text-right font-medium">{formatNumber(views)}</td>
                        <td className="px-4 py-3 text-xs text-white/60 text-right">{formatNumber(likes)}</td>
                        <td className="px-4 py-3 text-xs text-white/60 text-right">{formatNumber(comments)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-xs font-medium ${parseFloat(engagement) > 5 ? 'text-[#ab0013]' : 'text-white/50'}`}>
                            {engagement}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {badges.map((badge, i) => (
                              <span key={i} className={`text-[9px] px-2 py-0.5 rounded-full ${badge.color}`}>
                                {badge.label}
                              </span>
                            ))}
                            {index === 0 && <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">Top Performer</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="px-5 py-12 text-center">
                <Globe2 className="w-8 h-8 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/40">No content found</p>
                <p className="text-xs text-white/30">Upload videos or shorts to see performance data</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Referral Funnel Trend */}
      <Card className="mb-8">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#ab0013]" />
              <h3 className="text-sm font-semibold text-white">Referral Funnel Trend</h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#fca5a5]" />
                <span className="text-white/50">Clicks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#f87171]" />
                <span className="text-white/50">Signups</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#ab0013]" />
                <span className="text-white/50">Customers</span>
              </div>
            </div>
          </div>
          <ChartContainer config={funnelChartConfig} className="h-[220px] w-full">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fca5a5" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#fca5a5" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="formattedPeriod"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                interval={Math.max(0, Math.floor(chartData.length / 8) - 1)}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatAxisNumber}
              />
              <ChartTooltip
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2.5 shadow-xl">
                      <div className="text-white/60 text-[11px] font-medium mb-2">{label}</div>
                      {payload.map((entry) => (
                        <div key={entry.dataKey} className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-white/50 text-xs capitalize">{String(entry.dataKey)}</span>
                          </div>
                          <span className="text-white text-xs font-medium">
                            {Number(entry.value).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="#fca5a5"
                strokeWidth={1}
                fill="url(#clicksGradient)"
                dot={false}
              />
              <Bar dataKey="signups" fill="#f87171" opacity={0.6} radius={[2, 2, 0, 0]} />
              <Line
                type="monotone"
                dataKey="customers"
                stroke="#ab0013"
                strokeWidth={2}
                dot={{ r: 3, fill: '#ab0013', stroke: '#000', strokeWidth: 2 }}
                activeDot={{ r: 5, fill: '#ab0013', stroke: '#fff', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Period Breakdown Table */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
            <Clock className="w-3.5 h-3.5 text-[#ab0013]" />
            <span className="text-xs font-medium text-white/50">Period Breakdown</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-2">Period</th>
                  <th className="text-right text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-2">Clicks</th>
                  <th className="text-right text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-2">Signups</th>
                  <th className="text-right text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-2">Customers</th>
                  <th className="text-right text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-2">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {chartData && chartData.length > 0 ? (
                  [...chartData].reverse().slice(0, 10).map((row, index) => (
                    <tr key={index} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-2.5 text-xs text-white">{row.formattedPeriod}</td>
                      <td className="px-4 py-2.5 text-xs text-white/50 text-right">{row.clicks.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-xs text-white/50 text-right">{row.signups.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-xs text-white/50 text-right">{row.customers.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-xs text-right">
                        <span className={`font-medium ${row.earnings > 0 ? 'text-[#ab0013]' : 'text-white/50'}`}>
                          ${(row.earnings / 100).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-[10px] text-white/30">No data for this period</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
