import { useMemo } from 'react';

interface EarningsData {
  summary: {
    clicks: number;
    signups: number;
    customers: number;
    earnings: number;
    revenue: number;
  };
  allTimeStats: {
    customers: number;
    activeCustomers: number;
    revenue: number;
    earnings: number;
  };
  conversionRates: {
    clickToSignup: number;
    signupToCustomer: number;
  };
  series: Array<{
    period: string;
    customers: number;
  }>;
  balance: {
    current: number;
    pending: number;
  };
}

interface ContentStats {
  totalVideos: number;
  totalShorts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgEngagementRate: number;
}

interface BusinessMetrics {
  churnRate: number;
  churnedCustomers: number;
  retentionRate: number;
  activeCustomers: number;
  totalCustomers: number;
  newCustomersThisPeriod: number;
  previousPeriodCustomers: number;
  currentPeriodCustomers: number;
  customerGrowthRate: number;
  currentPeriodRevenue: number;
  currentPeriodEarnings: number;
  estimatedMRR: number;
  clicks: number;
  signups: number;
  customers: number;
  earnings: number;
  revenue: number;
  clickToSignup: number;
  signupToCustomer: number;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function useAnalyticsMetrics(
  earningsData: EarningsData | undefined,
  contentStats: ContentStats | undefined
) {
  const businessMetrics = useMemo<BusinessMetrics | null>(() => {
    if (!earningsData) return null;

    const { summary, allTimeStats, conversionRates, series } = earningsData;

    // Churn metrics
    const totalCustomers = allTimeStats.customers;
    const activeCustomers = allTimeStats.activeCustomers;
    const churnedCustomers = totalCustomers - activeCustomers;
    const churnRate = totalCustomers > 0 ? (churnedCustomers / totalCustomers) * 100 : 0;
    const retentionRate = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;

    // Month-over-month growth
    let previousPeriodCustomers = 0;
    let currentPeriodCustomers = 0;
    let customerGrowthRate = 0;

    if (series.length >= 2) {
      const midPoint = Math.floor(series.length / 2);
      const firstHalf = series.slice(0, midPoint);
      const secondHalf = series.slice(midPoint);

      previousPeriodCustomers = firstHalf.reduce((sum, p) => sum + p.customers, 0);
      currentPeriodCustomers = secondHalf.reduce((sum, p) => sum + p.customers, 0);

      if (previousPeriodCustomers > 0) {
        customerGrowthRate =
          ((currentPeriodCustomers - previousPeriodCustomers) / previousPeriodCustomers) * 100;
      } else if (currentPeriodCustomers > 0) {
        customerGrowthRate = 100;
      }
    }

    const newCustomersThisPeriod = summary.customers;
    const currentPeriodRevenue = summary.revenue / 100;
    const currentPeriodEarnings = summary.earnings / 100;
    const estimatedMRR =
      activeCustomers > 0
        ? (allTimeStats.revenue / 100 / Math.max(1, totalCustomers)) * activeCustomers
        : 0;

    return {
      churnRate: Math.round(churnRate * 10) / 10,
      churnedCustomers,
      retentionRate: Math.round(retentionRate * 10) / 10,
      activeCustomers,
      totalCustomers,
      newCustomersThisPeriod,
      previousPeriodCustomers,
      currentPeriodCustomers,
      customerGrowthRate: Math.round(customerGrowthRate * 10) / 10,
      currentPeriodRevenue,
      currentPeriodEarnings,
      estimatedMRR: Math.round(estimatedMRR * 100) / 100,
      clicks: summary.clicks,
      signups: summary.signups,
      customers: summary.customers,
      earnings: summary.earnings,
      revenue: summary.revenue,
      clickToSignup: conversionRates.clickToSignup,
      signupToCustomer: conversionRates.signupToCustomer,
    };
  }, [earningsData]);

  const jarvisInsights = useMemo<string[]>(() => {
    const insights: string[] = [];

    if (earningsData) {
      const { conversionRates, allTimeStats, balance } = earningsData;

      if (businessMetrics && businessMetrics.clicks > 100) {
        insights.push(
          `${formatNumber(businessMetrics.clicks)} referral clicks this period. Your content is driving traffic.`
        );
      }

      if (conversionRates.signupToCustomer > 20) {
        insights.push(
          `${conversionRates.signupToCustomer.toFixed(1)}% of signups convert to customers. That's premium audience quality.`
        );
      } else if (conversionRates.clickToSignup > 5) {
        insights.push(
          `${conversionRates.clickToSignup.toFixed(1)}% click-to-signup rate. Good engagement with your referral links.`
        );
      }

      if (balance.current > 0) {
        insights.push(
          `$${(balance.current / 100).toFixed(2)} available for payout. Time to get paid!`
        );
      }

      if (allTimeStats.activeCustomers > 0) {
        const retentionRate =
          allTimeStats.customers > 0
            ? ((allTimeStats.activeCustomers / allTimeStats.customers) * 100).toFixed(0)
            : 0;
        insights.push(
          `${formatNumber(allTimeStats.activeCustomers)} active subscribers (${retentionRate}% retention). Recurring revenue secured.`
        );
      }

      if (contentStats) {
        const { totalVideos, totalShorts, totalViews, avgEngagementRate } = contentStats;

        if (totalViews > 10000) {
          insights.push(
            `${formatNumber(totalViews)} total views across your content. Keep creating.`
          );
        }

        if (avgEngagementRate > 5) {
          insights.push(
            `${avgEngagementRate.toFixed(1)}% engagement rate. Your audience is locked in.`
          );
        }

        if (totalShorts > totalVideos && totalVideos > 0) {
          insights.push(
            `Shorts are your power play: ${totalShorts} shorts vs ${totalVideos} episodes.`
          );
        }
      }
    }

    return insights.slice(0, 4);
  }, [contentStats, earningsData, businessMetrics]);

  const funnelData = useMemo(() => {
    if (!earningsData) return [];
    const { summary } = earningsData;
    return [
      { name: 'Clicks', value: summary.clicks, fill: '#fca5a5' },
      { name: 'Signups', value: summary.signups, fill: '#f87171' },
      { name: 'Customers', value: summary.customers, fill: '#ab0013' },
    ];
  }, [earningsData]);

  return {
    businessMetrics,
    jarvisInsights,
    funnelData,
  };
}
