import { Card, CardContent } from '@/components/ui/card';
import { Clock, CreditCard, Info, Wallet } from 'lucide-react';
import { formatCurrency } from './utils';

interface EarningsData {
  balance?: {
    pending?: number;
    current?: number;
  };
  promoter?: {
    payoutMethod?: string | null;
    name?: string | null;
  };
  summary?: {
    earnings?: number;
  };
  allTimeStats?: {
    earnings?: number;
  };
}

interface EarningsCardProps {
  data: EarningsData | undefined;
  periodLabel?: string;
  showPeriodEarnings?: boolean;
  showAllTimeEarnings?: boolean;
}

export function EarningsCard({
  data,
  periodLabel = 'Last 30 days',
  showPeriodEarnings = true,
  showAllTimeEarnings = true,
}: EarningsCardProps) {
  return (
    <Card className="bg-[#131315] border-white/6">
      <CardContent className="p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  <span className="text-white/60 font-medium">
                    {formatCurrency(data?.balance?.current || 0)}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/40">
                <CreditCard className="w-4 h-4" />
                <span>
                  Payout via:{' '}
                  <span className="text-white/60 font-medium capitalize">
                    {data?.promoter?.payoutMethod || 'Not set'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="border-t lg:border-t-0 lg:border-l border-white/6 pt-6 lg:pt-0 lg:pl-8">
            {showPeriodEarnings && (
              <>
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
              </>
            )}

            {showAllTimeEarnings && (
              <div className={showPeriodEarnings ? 'mt-4 pt-4 border-t border-white/6' : ''}>
                <p className="text-xs text-white/40 mb-1 flex items-center gap-1">
                  {showPeriodEarnings ? 'All-time earnings' : 'All-time'}
                  <span title="Total commissions earned since you started, including paid out amounts">
                    <Info className="w-3 h-3 text-white/30 cursor-help" />
                  </span>
                </p>
                <p
                  className={`font-semibold text-white ${showPeriodEarnings ? 'text-lg' : 'text-3xl text-[#ab0013]'}`}
                >
                  {formatCurrency(data?.allTimeStats?.earnings || 0)}
                </p>
                {!showPeriodEarnings && <p className="text-sm text-white/40">total earned</p>}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
