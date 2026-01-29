import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ActionCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: string;
}

export function ActionCard({ href, icon: Icon, title, description }: ActionCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="bg-[#131315] border-white/6 transition-all hover:scale-[1.02] hover:border-white/10">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#ab0013]/20 flex items-center justify-center group-hover:bg-[#ab0013]/30 transition-colors">
              <Icon className="w-6 h-6 text-[#ab0013]" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
          </div>
          <h3 className="font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-white/40">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
