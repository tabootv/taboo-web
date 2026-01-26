import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <Card className="group">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#ab0013]/20 flex items-center justify-center transition-shadow duration-300 group-hover:shadow-[0_0_30px_rgba(171,0,19,0.5)]">
            <Icon className="w-5 h-5 text-[#ab0013]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-white/40">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
