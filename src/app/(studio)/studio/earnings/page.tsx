'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  MousePointer,
  UserPlus,
  Users,
  ShoppingCart,
  TrendingUp,
  Calendar,
  RefreshCw,
  Loader2,
  AlertCircle,
  Wallet,
  Info,
  Copy,
  Check,
  Link2,
  Clock,
  Percent,
  CreditCard,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { FunnelAreaChart } from '@/features/creator-studio';

type DateRange = '7d' | '30d' | '90d' | '365d' | 'all';
type GroupBy = 'day' | 'week' | 'month';

interface Commission {
  id: number;
  status: string;
  saleAmount: number;
  commissionAmount: number;
  planId: string;
  referralEmail: string;
  rewardName: string;
  createdAt: string;
}

interface Payout {
  id: number;
  status: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  paidAt: string | null;
  payoutMethod: string;
}

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
  recentCommissions: Commission[];
  payoutHistory: Payout[];
  groupBy: GroupBy;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  tooltip?: string;
}

function StatCard({ title, value, icon, color, subtitle, tooltip }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-5 transition-all hover:scale-[1.02] relative group/card"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-sm text-white/50">{title}</p>
            {tooltip && (
              <div className="relative group/info">
                <Info className="w-3.5 h-3.5 text-white/30 cursor-help hover:text-white/50 transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs text-white bg-black/95 border border-white/10 opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 w-48 text-center z-50 shadow-xl">
                  {tooltip}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/95" />
                </div>
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-white/40 mt-1">{subtitle}</p>}
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
    </div>
  );
}


function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getPlanLabel(planId: string): string {
  if (planId.includes('yearly') || planId.includes('year')) return 'Yearly';
  if (planId.includes('monthly') || planId.includes('month')) return 'Monthly';
  return planId;
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'approved':
    case 'paid':
      return 'text-green-500';
    case 'pending':
    case 'processing':
      return 'text-yellow-500';
    case 'denied':
    case 'failed':
      return 'text-red-500';
    default:
      return 'text-white/50';
  }
}

function ReferralLinkCard({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-4 h-4 text-white/50" />
        <span className="text-sm font-medium text-white/70">Your Referral Link</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 truncate">
          {link}
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-primary hover:bg-red-hover text-white text-sm font-medium transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default function EarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [groupBy, setGroupBy] = useState<GroupBy>('day');

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

      const response = await fetch(`/api/creator-studio/earnings?${searchParams}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch earnings data');
      }

      setData(result);
    } catch (err) {
      console.error('Failed to fetch earnings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load earnings data');
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

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-white/50 animate-spin mx-auto mb-3" />
          <p className="text-white/50">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-white/70 mb-2">Unable to load earnings data</p>
          <p className="text-white/40 text-sm mb-4">{error}</p>
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
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-surface border border-white/10">
            <Loader2 className="w-4 h-4 text-white/70 animate-spin" />
            <span className="text-sm text-white/70">Updating data...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Earnings Dashboard</h1>
          <p className="text-white/50 mt-1">
            Track your referral performance and earnings
            {data?.promoter?.name && (
              <span className="text-white/30"> &middot; {data.promoter.name}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
            <Calendar className="w-4 h-4 text-white/50" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="bg-transparent text-sm text-white border-none outline-none cursor-pointer appearance-none pr-6"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right center',
              }}
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-elevated text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              className="bg-transparent text-sm text-white border-none outline-none cursor-pointer appearance-none pr-6"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right center',
              }}
            >
              {groupByOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-elevated text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={() => fetchData(false)} variant="outline" size="sm" disabled={isRefetching}>
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Referral Link */}
      {data?.promoter?.referralLink && (
        <div className="mb-6">
          <ReferralLinkCard link={data.promoter.referralLink} />
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div
          className="rounded-xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.05) 100%)',
            border: '1px solid rgba(34,197,94,0.2)',
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-5 h-5 text-green-500" />
            <span className="text-white/60 text-sm">Available Balance</span>
          </div>
          <p className="text-3xl font-bold text-green-500">
            {formatCurrency(data?.balance?.current || 0)}
          </p>
          <p className="text-xs text-white/40 mt-1">Ready for payout</p>
        </div>
        <div
          className="rounded-xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(234,179,8,0.1) 0%, rgba(234,179,8,0.05) 100%)',
            border: '1px solid rgba(234,179,8,0.2)',
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className="text-white/60 text-sm">Pending Balance</span>
          </div>
          <p className="text-3xl font-bold text-yellow-500">
            {formatCurrency(data?.balance?.pending || 0)}
          </p>
          <p className="text-xs text-white/40 mt-1">Awaiting approval</p>
        </div>
        <div
          className="rounded-xl p-6"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-white/50" />
            <span className="text-white/60 text-sm">Total Paid Out</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(data?.balance?.paid || 0)}
          </p>
          <p className="text-xs text-white/40 mt-1">All time payouts</p>
        </div>
      </div>

      {/* Stats KPI Cards - Filtered by date range */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard
          title="Clicks"
          value={formatNumber(data?.summary?.clicks || 0)}
          icon={<MousePointer className="w-5 h-5" />}
          color="#3b82f6"
          subtitle={periodLabel}
          tooltip="Referral link clicks in selected period"
        />
        <StatCard
          title="Signups"
          value={formatNumber(data?.summary?.signups || 0)}
          icon={<UserPlus className="w-5 h-5" />}
          color="#8b5cf6"
          subtitle={periodLabel}
          tooltip="New signups from your referrals"
        />
        <StatCard
          title="Customers"
          value={formatNumber(data?.summary?.customers || 0)}
          icon={<Users className="w-5 h-5" />}
          color="#10b981"
          subtitle={periodLabel}
          tooltip="New paying customers"
        />
        <StatCard
          title="Sales"
          value={formatNumber(data?.summary?.sales || 0)}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="#f59e0b"
          subtitle={periodLabel}
          tooltip="Total subscription payments"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(data?.summary?.revenue || 0)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="#ef4444"
          subtitle={periodLabel}
          tooltip="Total revenue generated"
        />
        <StatCard
          title="Earnings"
          value={formatCurrency(data?.summary?.earnings || 0)}
          icon={<DollarSign className="w-5 h-5" />}
          color="#22c55e"
          subtitle={periodLabel}
          tooltip="Your commission earned"
        />
      </div>

      {/* All-Time Stats & Conversion Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* All-Time Performance */}
        <div
          className="rounded-xl p-5"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h3 className="text-sm font-medium text-white/70 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            All-Time Performance
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-white/40 mb-1">Total Clicks</p>
              <p className="text-xl font-bold text-white">{formatNumber(data?.allTimeStats?.clicks || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Total Signups</p>
              <p className="text-xl font-bold text-white">{formatNumber(data?.allTimeStats?.signups || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Active Customers</p>
              <p className="text-xl font-bold text-green-500">{formatNumber(data?.allTimeStats?.activeCustomers || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Total Earnings</p>
              <p className="text-xl font-bold text-green-500">{formatCurrency(data?.allTimeStats?.earnings || 0)}</p>
            </div>
          </div>
        </div>

        {/* Conversion Rates */}
        <div
          className="rounded-xl p-5"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h3 className="text-sm font-medium text-white/70 mb-4 flex items-center gap-2">
            <Percent className="w-4 h-4" />
            Conversion Rates (All-Time)
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/40">Click to Signup</span>
                <span className="text-sm font-medium text-white">{data?.conversionRates?.clickToSignup || 0}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${Math.min(data?.conversionRates?.clickToSignup || 0, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/40">Signup to Customer</span>
                <span className="text-sm font-medium text-white">{data?.conversionRates?.signupToCustomer || 0}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: `${Math.min(data?.conversionRates?.signupToCustomer || 0, 100)}%` }}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Payout method: {data?.promoter?.payoutMethod || 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Funnel Chart Section */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Conversion Funnel</h2>
            <p className="text-xs text-white/40 mt-1">Track your funnel from clicks to revenue</p>
          </div>
        </div>

        <FunnelAreaChart
          data={data?.series || []}
          groupBy={data?.groupBy}
        />
      </div>

      {/* Recent Commissions & Payout History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Commissions */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-green-500" />
              Recent Commissions
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-4 py-3">Customer</th>
                  <th className="text-right text-xs font-medium text-white/50 uppercase tracking-wider px-4 py-3">Sale</th>
                  <th className="text-right text-xs font-medium text-white/50 uppercase tracking-wider px-4 py-3">Commission</th>
                  <th className="text-right text-xs font-medium text-white/50 uppercase tracking-wider px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentCommissions && data.recentCommissions.length > 0 ? (
                  data.recentCommissions.slice(0, 5).map((commission) => (
                    <tr key={commission.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm text-white truncate max-w-[150px]">{commission.referralEmail}</div>
                        <div className="text-xs text-white/40">{getPlanLabel(commission.planId)} &middot; {formatDateTime(commission.createdAt)}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/70 text-right">{formatCurrency(commission.saleAmount)}</td>
                      <td className="px-4 py-3 text-sm text-green-500 text-right font-medium">{formatCurrency(commission.commissionAmount)}</td>
                      <td className={`px-4 py-3 text-xs text-right capitalize ${getStatusColor(commission.status)}`}>{commission.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-white/30">No recent commissions</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payout History */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-white/50" />
              Payout History
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-4 py-3">Period</th>
                  <th className="text-right text-xs font-medium text-white/50 uppercase tracking-wider px-4 py-3">Amount</th>
                  <th className="text-right text-xs font-medium text-white/50 uppercase tracking-wider px-4 py-3">Method</th>
                  <th className="text-right text-xs font-medium text-white/50 uppercase tracking-wider px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.payoutHistory && data.payoutHistory.length > 0 ? (
                  data.payoutHistory.slice(0, 5).map((payout) => (
                    <tr key={payout.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm text-white">{formatDate(payout.periodStart)} - {formatDate(payout.periodEnd)}</div>
                        {payout.paidAt && <div className="text-xs text-white/40">Paid {formatDate(payout.paidAt)}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-white font-medium text-right">{formatCurrency(payout.amount)}</td>
                      <td className="px-4 py-3 text-sm text-white/70 text-right capitalize">{payout.payoutMethod}</td>
                      <td className={`px-4 py-3 text-xs text-right capitalize ${getStatusColor(payout.status)}`}>{payout.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-white/30">No payout history</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Earnings Breakdown Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Earnings Breakdown</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-4 py-3">Period</th>
                <th className="text-right text-xs font-medium text-white/50 uppercase tracking-wider px-4 py-3">Sales</th>
                <th className="text-right text-xs font-medium text-white/50 uppercase tracking-wider px-4 py-3">Revenue</th>
                <th className="text-right text-xs font-medium text-white/50 uppercase tracking-wider px-4 py-3">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {data?.series && data.series.length > 0 ? (
                [...data.series].reverse().map((row, index) => {
                  const date = new Date(row.period);
                  const actualGroupBy = data.groupBy || 'day';
                  const formattedDate = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: actualGroupBy === 'day' || actualGroupBy === 'week' ? 'numeric' : undefined,
                    year: actualGroupBy === 'month' ? 'numeric' : undefined,
                  });

                  return (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm text-white">{formattedDate}</td>
                      <td className="px-4 py-3 text-sm text-white/70 text-right">{row.count}</td>
                      <td className="px-4 py-3 text-sm text-white/70 text-right">{formatCurrency(row.revenue)}</td>
                      <td className="px-4 py-3 text-sm text-green-500 text-right font-medium">{formatCurrency(row.earnings)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-white/30">No earnings data for this period</td>
                </tr>
              )}
            </tbody>
            {data?.series && data.series.length > 0 && (
              <tfoot>
                <tr className="bg-white/5">
                  <td className="px-4 py-3 text-sm font-semibold text-white">Total (period)</td>
                  <td className="px-4 py-3 text-sm font-semibold text-white text-right">
                    {data.series.reduce((sum, r) => sum + r.count, 0)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-white text-right">
                    {formatCurrency(data.series.reduce((sum, r) => sum + r.revenue, 0))}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-500 text-right">
                    {formatCurrency(data.series.reduce((sum, r) => sum + r.earnings, 0))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
