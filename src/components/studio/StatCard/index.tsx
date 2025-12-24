import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/5">
          <Icon className="w-5 h-5 text-red-primary" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-white">{value}</p>
          <p className="text-sm text-text-secondary">{label}</p>
        </div>
      </div>
    </div>
  );
}

