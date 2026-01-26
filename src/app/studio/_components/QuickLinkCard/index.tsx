import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface QuickLinkCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export function QuickLinkCard({ href, icon: Icon, title, description }: QuickLinkCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="transition-all hover:scale-[1.01] hover:border-white/20">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-white/5 group-hover:bg-[#ab0013]/20 transition-colors flex items-center justify-center">
              <Icon className="w-5 h-5 text-white/40 group-hover:text-[#ab0013] transition-colors" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="text-sm text-white/40">{description}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
        </CardContent>
      </Card>
    </Link>
  );
}
