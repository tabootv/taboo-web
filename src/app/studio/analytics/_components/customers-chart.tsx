'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface ChartDataPoint {
  formattedPeriod: string;
  customers: number;
  period?: string;
  earnings?: number;
  revenue?: number;
  count?: number;
  clicks?: number;
  signups?: number;
}

interface CustomersChartProps {
  data: ChartDataPoint[];
}

const chartConfig = {
  customers: { label: 'Customers', color: '#ab0013' },
} satisfies ChartConfig;

export default function CustomersChart({ data }: CustomersChartProps) {
  const totalCustomers = data.reduce((sum, d) => sum + d.customers, 0);

  if (!data || data.length === 0) {
    return (
      <Card className="bg-[#131315] border-white/6 mb-8">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-[#ab0013]" />
            <h3 className="text-sm font-semibold text-white">Customers Per Day</h3>
          </div>
          <div className="h-[200px] flex items-center justify-center text-white/30">
            No data for this period
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#131315] border-white/6 mb-8">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#ab0013]" />
            <h3 className="text-sm font-semibold text-white">Customers Per Day</h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#ab0013]">{totalCustomers}</p>
            <p className="text-[10px] text-white/40">total this period</p>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
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
              interval={Math.max(0, Math.floor(data.length / 8) - 1)}
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
                      <span className="text-white text-sm font-bold">
                        {Number(payload[0]?.value || 0)} customers
                      </span>
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
              fill="url(#customersGradient)"
              dot={{ r: 3, fill: '#ab0013', stroke: '#000', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#ab0013', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
