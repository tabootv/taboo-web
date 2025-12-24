import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

interface QuickLinkCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export function QuickLinkCard({ href, icon: Icon, title, description }: QuickLinkCardProps) {
  return (
    <Link href={href} className="group">
      <div className="bg-surface border border-border rounded-xl p-5 flex items-center justify-between transition-all hover:border-white/20">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/5 group-hover:bg-red-primary/10 transition-colors">
            <Icon className="w-5 h-5 text-text-secondary group-hover:text-red-primary transition-colors" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-text-secondary">{description}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-white transition-colors" />
      </div>
    </Link>
  );
}

