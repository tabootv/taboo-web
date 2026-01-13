'use client';

import { useState } from 'react';
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
  Clock,
  Percent,
  CreditCard,
  ArrowUpRight,
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
import { FunnelAreaChart } from '@/features/creator-studio';
import { useEarnings } from '@/api/queries';
import type { DateRange, GroupBy } from '@/types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  tooltip?: string;
  highlight?: boolean;
}

function StatCard({ title, value, icon, subtitle, tooltip, highlight }: StatCardProps) {
  return (
    <Card className="transition-all hover:scale-[1.01]">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-xs text-white/50 font-medium truncate">{title}</p>
              {tooltip && (
                <div className="relative group/info flex-shrink-0">
                  <Info className="w-3.5 h-3.5 text-white/30 cursor-help hover:text-white/60 transition-colors" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-xs text-white bg-black/95 border border-white/10 opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 w-44 text-center z-50 shadow-lg backdrop-blur-xl">
                    {tooltip}
                  </div>
                </div>
              )}
            </div>
            <p className={`text-xl font-bold leading-tight ${highlight ? 'text-[#ab0013]' : 'text-white'}`}>{value}</p>
            {subtitle && <p className="text-[11px] text-white/30 mt-1 truncate">{subtitle}</p>}
          </div>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${highlight ? 'bg-[#ab0013]/20' : 'bg-white/5'}`}>
            <div className={`${highlight ? 'text-[#ab0013]' : 'text-white/40'} [&>svg]:w-4 [&>svg]:h-4`}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
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
      return 'text-[#ab0013]';
    case 'pending':
    case 'processing':
      return 'text-muted-foreground';
    case 'denied':
    case 'failed':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
}


export default function EarningsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [groupBy, setGroupBy] = useState<GroupBy>('day');

  // Use TanStack Query hook for data fetching
  const { data, isLoading, error, refetch, isFetching } = useEarnings(dateRange, groupBy);

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
          <p className="text-muted-foreground/60 text-sm mb-4">{error?.message || 'An unexpected error occurred'}</p>
          <Button onClick={() => refetch()} variant="outline">
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
      {isFetching && !isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-40 flex items-center justify-center rounded-xl">
          <Card className="flex items-center gap-3 px-4 py-2">
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            <span className="text-sm text-muted-foreground">Updating data...</span>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Earnings Dashboard</h1>
          <p className="text-white/40 mt-1 text-sm italic">
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


      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[#ab0013]/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#ab0013]" />
              </div>
              <span className="text-white/50 text-sm font-medium">Available Balance</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(data?.balance?.current || 0)}
            </p>
            <p className="text-xs text-white/30 mt-1">Ready for payout</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white/50" />
              </div>
              <span className="text-white/50 text-sm font-medium">Pending Balance</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(data?.balance?.pending || 0)}
            </p>
            <p className="text-xs text-white/30 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white/50" />
              </div>
              <span className="text-white/50 text-sm font-medium">Total Paid Out</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(data?.balance?.paid || 0)}
            </p>
            <p className="text-xs text-white/30 mt-1">All time payouts</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats KPI Cards - Filtered by date range */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard
          title="Clicks"
          value={formatNumber(data?.summary?.clicks || 0)}
          icon={<MousePointer className="w-5 h-5" />}
          subtitle={periodLabel}
          tooltip="Referral link clicks in selected period"
        />
        <StatCard
          title="Signups"
          value={formatNumber(data?.summary?.signups || 0)}
          icon={<UserPlus className="w-5 h-5" />}
          subtitle={periodLabel}
          tooltip="New signups from your referrals"
        />
        <StatCard
          title="Customers"
          value={formatNumber(data?.summary?.customers || 0)}
          icon={<Users className="w-5 h-5" />}
          subtitle={periodLabel}
          tooltip="New paying customers"
        />
        <StatCard
          title="Sales"
          value={formatNumber(data?.summary?.sales || 0)}
          icon={<ShoppingCart className="w-5 h-5" />}
          subtitle={periodLabel}
          tooltip="Total subscription payments"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(data?.summary?.revenue || 0)}
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle={periodLabel}
          tooltip="Total revenue generated"
          highlight
        />
        <StatCard
          title="Earnings"
          value={formatCurrency(data?.summary?.earnings || 0)}
          icon={<DollarSign className="w-5 h-5" />}
          subtitle={periodLabel}
          tooltip="Your commission earned"
          highlight
        />
      </div>

      {/* All-Time Stats & Conversion Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* All-Time Performance */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[#ab0013]" />
              <span className="text-sm font-medium text-white/50">All-Time Performance</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/40 mb-1">Total Clicks</p>
                <p className="text-lg font-bold text-white">{formatNumber(data?.allTimeStats?.clicks || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Total Signups</p>
                <p className="text-lg font-bold text-white">{formatNumber(data?.allTimeStats?.signups || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Active Customers</p>
                <p className="text-lg font-bold text-[#ab0013]">{formatNumber(data?.allTimeStats?.activeCustomers || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Total Earnings</p>
                <p className="text-lg font-bold text-[#ab0013]">{formatCurrency(data?.allTimeStats?.earnings || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rates */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Percent className="w-4 h-4 text-[#ab0013]" />
              <span className="text-sm font-medium text-white/50">Conversion Rates (All-Time)</span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/40">Click to Signup</span>
                  <span className="text-sm font-medium text-white">{data?.conversionRates?.clickToSignup || 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#ab0013]/60"
                    style={{ width: `${Math.min(data?.conversionRates?.clickToSignup || 0, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/40">Signup to Customer</span>
                  <span className="text-sm font-medium text-white">{data?.conversionRates?.signupToCustomer || 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#ab0013]"
                    style={{ width: `${Math.min(data?.conversionRates?.signupToCustomer || 0, 100)}%` }}
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Payout: {data?.promoter?.payoutMethod || 'Not set'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Chart Section */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Conversion Funnel</h3>
              <p className="text-[10px] text-white/30">Track your funnel from clicks to revenue</p>
            </div>
          </div>
          <FunnelAreaChart
            data={data?.series || []}
            groupBy={data?.groupBy ?? 'day'}
          />
        </CardContent>
      </Card>

      {/* Recent Commissions & Payout History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Recent Commissions */}
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <ArrowUpRight className="w-3.5 h-3.5 text-[#ab0013]" />
              <span className="text-xs font-medium text-white/50">Recent Commissions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-2">Customer</th>
                    <th className="text-right text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-2">Sale</th>
                    <th className="text-right text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-2">Commission</th>
                    <th className="text-right text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentCommissions && data.recentCommissions.length > 0 ? (
                    data.recentCommissions.slice(0, 5).map((commission) => (
                      <tr key={commission.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="text-xs text-white truncate max-w-[120px]">{commission.referralEmail}</div>
                          <div className="text-[10px] text-white/30">{getPlanLabel(commission.planId)} · {formatDateTime(commission.createdAt)}</div>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-white/50 text-right">{formatCurrency(commission.saleAmount)}</td>
                        <td className="px-4 py-2.5 text-xs text-[#ab0013] text-right font-medium">{formatCurrency(commission.commissionAmount)}</td>
                        <td className={`px-4 py-2.5 text-[10px] text-right capitalize ${getStatusColor(commission.status)}`}>{commission.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-[10px] text-white/30">No recent commissions</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Payout History */}
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <Wallet className="w-3.5 h-3.5 text-white/40" />
              <span className="text-xs font-medium text-white/50">Payout History</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-2">Period</th>
                    <th className="text-right text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-2">Amount</th>
                    <th className="text-right text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-2">Method</th>
                    <th className="text-right text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.payoutHistory && data.payoutHistory.length > 0 ? (
                    data.payoutHistory.slice(0, 5).map((payout) => (
                      <tr key={payout.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="text-xs text-white">{formatDate(payout.periodStart)} - {formatDate(payout.periodEnd)}</div>
                          {payout.paidAt && <div className="text-[10px] text-white/30">Paid {formatDate(payout.paidAt)}</div>}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-white font-medium text-right">{formatCurrency(payout.amount)}</td>
                        <td className="px-4 py-2.5 text-xs text-white/50 text-right capitalize">{payout.payoutMethod}</td>
                        <td className={`px-4 py-2.5 text-[10px] text-right capitalize ${getStatusColor(payout.status)}`}>{payout.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-[10px] text-white/30">No payout history</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Breakdown Table */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
            <DollarSign className="w-3.5 h-3.5 text-[#ab0013]" />
            <span className="text-xs font-medium text-white/50">Earnings Breakdown</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-2">Period</th>
                  <th className="text-right text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-2">Sales</th>
                  <th className="text-right text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-2">Revenue</th>
                  <th className="text-right text-[10px] font-medium text-white/30 uppercase tracking-wider px-4 py-2">Earnings</th>
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
                      <tr key={index} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-2.5 text-xs text-white">{formattedDate}</td>
                        <td className="px-4 py-2.5 text-xs text-white/50 text-right">{row.count}</td>
                        <td className="px-4 py-2.5 text-xs text-white/50 text-right">{formatCurrency(row.revenue)}</td>
                        <td className="px-4 py-2.5 text-xs text-[#ab0013] text-right font-medium">{formatCurrency(row.earnings)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-[10px] text-white/30">No earnings data for this period</td>
                  </tr>
                )}
              </tbody>
              {data?.series && data.series.length > 0 && (
                <tfoot>
                  <tr className="bg-white/[0.02] border-t border-white/5">
                    <td className="px-4 py-2.5 text-xs font-semibold text-white">Total</td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-white text-right">
                      {data.series.reduce((sum, r) => sum + r.count, 0)}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-white text-right">
                      {formatCurrency(data.series.reduce((sum, r) => sum + r.revenue, 0))}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-[#ab0013] text-right">
                      {formatCurrency(data.series.reduce((sum, r) => sum + r.earnings, 0))}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
