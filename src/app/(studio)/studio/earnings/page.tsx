'use client';

import { useState } from 'react';
import {
  DollarSign,
  Calendar,
  RefreshCw,
  Loader2,
  AlertCircle,
  Wallet,
  Clock,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Info,
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
}


export default function EarningsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [groupBy, setGroupBy] = useState<GroupBy>('day');
  const [showFunnel, setShowFunnel] = useState(false);

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


      {/* Your Money - The only thing that matters */}
      <Card className="bg-[#131315] border-white/6 mb-8">
        <CardContent className="p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ready for Payout - Main focus */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-[#ab0013]/20 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-[#ab0013]" />
                </div>
                <div>
                  <p className="text-sm text-white/60 font-medium flex items-center gap-1.5">
                    Ready for Payout
                    <span title="The confirmed commission amount that will be paid in your next payout cycle">
                      <Info className="w-3.5 h-3.5 text-white/30 cursor-help" />
                    </span>
                  </p>
                  <p className="text-xs text-white/40">Confirmed amount for your next payout</p>
                </div>
              </div>
              <p className="text-5xl lg:text-6xl font-bold text-white mb-4">
                {formatCurrency(data?.balance?.pending || 0)}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-white/40">
                  <Clock className="w-4 h-4" />
                  <span className="flex items-center gap-1">
                    Total unpaid:
                    <span title="All accumulated earnings not yet paid out, including previous months and current month">
                      <Info className="w-3 h-3 text-white/30 cursor-help" />
                    </span>
                    <span className="text-white/60 font-medium">{formatCurrency(data?.balance?.current || 0)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/40">
                  <CreditCard className="w-4 h-4" />
                  <span>Payout via: <span className="text-white/60 font-medium capitalize">{data?.promoter?.payoutMethod || 'Not set'}</span></span>
                </div>
              </div>
            </div>

            {/* Period Earnings */}
            <div className="border-t lg:border-t-0 lg:border-l border-white/6 pt-6 lg:pt-0 lg:pl-8">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1">
                {periodLabel}
                <span title="Commissions earned during the selected time period">
                  <Info className="w-3 h-3 text-white/30 cursor-help" />
                </span>
              </p>
              <p className="text-3xl font-bold text-[#ab0013] mb-1">
                {formatCurrency(data?.summary?.earnings || 0)}
              </p>
              <p className="text-sm text-white/40">earned this period</p>
              <div className="mt-4 pt-4 border-t border-white/6">
                <p className="text-xs text-white/40 mb-1 flex items-center gap-1">
                  All-time earnings
                  <span title="Total commissions earned since you started, including paid out amounts">
                    <Info className="w-3 h-3 text-white/30 cursor-help" />
                  </span>
                </p>
                <p className="text-lg font-semibold text-white">{formatCurrency(data?.allTimeStats?.earnings || 0)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Funnel - Collapsible */}
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
              <FunnelAreaChart
                data={data?.series || []}
                groupBy={data?.groupBy ?? 'day'}
              />
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
