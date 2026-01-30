import { Users, UserPlus, UserMinus, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface BusinessMetrics {
  newCustomersThisPeriod: number;
  activeCustomers: number;
  churnedCustomers: number;
  churnRate: number;
}

interface SubscriptionMetricsCardProps {
  metrics: BusinessMetrics | null;
  periodLabel: string;
}

export function SubscriptionMetricsCard({ metrics, periodLabel }: SubscriptionMetricsCardProps) {
  const newCustomers = metrics?.newCustomersThisPeriod || 0;
  const activeCustomers = metrics?.activeCustomers || 0;
  const recurringCustomers = Math.max(0, activeCustomers - newCustomers);
  const churnedCustomers = metrics?.churnedCustomers || 0;
  const churnRate = metrics?.churnRate || 0;

  return (
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
            <p className="text-2xl font-bold text-white">{newCustomers}</p>
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
            <p className="text-2xl font-bold text-white">{recurringCustomers}</p>
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
            <p className="text-2xl font-bold text-[#ab0013]">{activeCustomers}</p>
            <p className="text-[10px] text-white/40 mt-1">
              {recurringCustomers} recurring + {newCustomers} new
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
            <p className="text-2xl font-bold text-white">{churnedCustomers}</p>
            <p className="text-[10px] text-white/40 mt-1">{churnRate}% churn rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
