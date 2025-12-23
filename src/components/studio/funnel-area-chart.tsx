'use client';

import { useState, useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SeriesDataPoint {
  period: string;
  earnings: number;
  revenue: number;
  count: number;
  clicks: number;
  signups: number;
  customers: number;
}

interface FunnelAreaChartProps {
  data: SeriesDataPoint[];
  groupBy?: 'day' | 'week' | 'month';
}

type MetricKey = 'clicks' | 'signups' | 'customers' | 'revenue';

interface MetricConfig {
  key: MetricKey;
  label: string;
  color: string;
  format: (value: number) => string;
  yAxisId: 'left' | 'right';
}

const METRICS: MetricConfig[] = [
  {
    key: 'clicks',
    label: 'Clicks',
    color: '#3b82f6',
    format: (v) => v.toLocaleString(),
    yAxisId: 'left',
  },
  {
    key: 'signups',
    label: 'Signups',
    color: '#8b5cf6',
    format: (v) => v.toLocaleString(),
    yAxisId: 'left',
  },
  {
    key: 'customers',
    label: 'Customers',
    color: '#10b981',
    format: (v) => v.toLocaleString(),
    yAxisId: 'left',
  },
  {
    key: 'revenue',
    label: 'Revenue',
    color: '#ef4444',
    format: (v) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(v / 100),
    yAxisId: 'right',
  },
];

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

function formatAxisCurrency(value: number): string {
  const dollars = value / 100;
  if (dollars >= 1000000) return `$${(dollars / 1000000).toFixed(1)}M`;
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(0)}K`;
  return `$${dollars.toFixed(0)}`;
}

export function FunnelAreaChart({ data, groupBy }: FunnelAreaChartProps) {
  const [visibleMetrics, setVisibleMetrics] = useState<Set<MetricKey>>(
    new Set(['clicks', 'signups', 'customers', 'revenue'])
  );

  const toggleMetric = (key: MetricKey) => {
    setVisibleMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) {
          next.delete(key);
        }
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      formattedPeriod: formatLabel(d.period, groupBy),
    }));
  }, [data, groupBy]);

  const showLeftAxis = visibleMetrics.has('clicks') || visibleMetrics.has('signups') || visibleMetrics.has('customers');
  const showRightAxis = visibleMetrics.has('revenue');


  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-white/30">
        No data for this period
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Metric Toggle Buttons */}
      <div className="flex flex-wrap gap-2">
        {METRICS.map((metric) => {
          const isActive = visibleMetrics.has(metric.key);
          return (
            <button
              key={metric.key}
              onClick={() => toggleMetric(metric.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'text-white shadow-sm'
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
              }`}
              style={
                isActive
                  ? { backgroundColor: metric.color }
                  : undefined
              }
            >
              <div
                className={`w-2 h-2 rounded-full transition-opacity ${
                  isActive ? 'bg-white' : ''
                }`}
                style={!isActive ? { backgroundColor: metric.color, opacity: 0.5 } : undefined}
              />
              {metric.label}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: showRightAxis ? 60 : 10, left: showLeftAxis ? 10 : 0, bottom: 0 }}
          >
            <defs>
              {METRICS.map((metric) => (
                <linearGradient
                  key={metric.key}
                  id={`gradient-${metric.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={metric.color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={metric.color} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="formattedPeriod"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              interval={Math.max(0, Math.floor(chartData.length / 8) - 1)}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatAxisNumber}
              domain={[0, 'auto']}
              hide={!showLeftAxis}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: 'rgba(239,68,68,0.7)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatAxisCurrency}
              domain={[0, 'auto']}
              hide={!showRightAxis}
            />
            <Tooltip
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '12px',
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}
              itemStyle={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px' }}
              formatter={(value, name) => {
                const metric = METRICS.find((m) => m.label === name);
                return metric ? metric.format(Number(value)) : String(value);
              }}
            />
            {[...METRICS].reverse().map((metric) =>
              visibleMetrics.has(metric.key) ? (
                <Area
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  name={metric.label}
                  stroke={metric.color}
                  strokeWidth={2}
                  fill={`url(#gradient-${metric.key})`}
                  fillOpacity={1}
                  dot={false}
                  yAxisId={metric.yAxisId}
                  activeDot={{
                    r: 4,
                    stroke: metric.color,
                    strokeWidth: 2,
                    fill: '#000',
                  }}
                />
              ) : null
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Axis Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/40">
        {showLeftAxis && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-white/40" />
            <span>Left axis: Counts</span>
          </div>
        )}
        {showRightAxis && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-red-500/70" />
            <span>Right axis: Revenue ($)</span>
          </div>
        )}
      </div>
    </div>
  );
}
