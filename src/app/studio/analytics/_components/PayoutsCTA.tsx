import Link from 'next/link';
import { DollarSign, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function PayoutsCTA() {
  return (
    <Link href="/studio/payouts" className="block group">
      <Card className="bg-[#131315] border-white/6 hover:border-white/10 transition-colors">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ab0013]/20 flex items-center justify-center group-hover:bg-[#ab0013]/30 transition-colors">
                <DollarSign className="w-6 h-6 text-[#ab0013]" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-0.5">View Earnings & Payouts</h3>
                <p className="text-sm text-white/40">Track revenue, balance, and payout history</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
