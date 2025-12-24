import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Upload } from 'lucide-react';

interface ActionCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

export function ActionCard({ href, icon: Icon, title, description, gradient }: ActionCardProps) {
  return (
    <Link href={href} className="group">
      <div className="relative bg-surface border border-border rounded-xl overflow-hidden transition-all hover:border-white/20">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-white/10">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <Upload className="w-5 h-5 text-text-secondary group-hover:text-white transition-colors" />
          </div>
          <h3 className="font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>
      </div>
    </Link>
  );
}

