import { PieChart, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FunnelDataItem {
  name: string;
  value: number;
  fill: string;
}

interface ConversionFunnelCardProps {
  funnelData: FunnelDataItem[];
  conversionRates: {
    clickToSignup: number;
    signupToCustomer: number;
  };
  periodLabel: string;
}

export function ConversionFunnelCard({
  funnelData,
  conversionRates,
  periodLabel,
}: ConversionFunnelCardProps) {
  return (
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
            const conversionRate =
              prevValue > 0 ? ((item.value / prevValue) * 100).toFixed(1) : '100';
            const firstItem = funnelData[0];
            const widthPercent =
              firstItem && firstItem.value > 0 ? (item.value / firstItem.value) * 100 : 0;

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
            <span>Click → Signup: {conversionRates.clickToSignup}%</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-3 h-3 text-[#ab0013]" />
            <span>Signup → Customer: {conversionRates.signupToCustomer}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
