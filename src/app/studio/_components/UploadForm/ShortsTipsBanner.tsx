import { Clock, Smartphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function ShortsTipsBanner() {
  return (
    <Card className="mb-6 border border-white/10 bg-gradient-to-r from-black via-[#120508] to-[#1a0b0c] shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
      <CardContent className="p-4">
        <div className="flex gap-4 items-center">
          <div className="p-3 rounded-xl bg-red-primary/15 border border-red-primary/30 h-fit">
            <Smartphone className="w-5 h-5 text-red-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Shorts that pop</h3>
            <ul className="text-sm text-white/60 space-y-1">
              <li className="flex items-center gap-2">
                <Clock className="w-3 h-3" /> Aim for 15-45 seconds
              </li>
              <li className="flex items-center gap-2">
                <Smartphone className="w-3 h-3" /> 9:16 vertical, crisp thumbnail
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
