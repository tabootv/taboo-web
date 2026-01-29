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
      <Card className="bg-[#131315] border-white/6 transition-all hover:scale-[1.01] hover:border-white/10">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/5 group-hover:bg-[#ab0013]/20 transition-colors flex items-center justify-center">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 group-hover:text-[#ab0013] transition-colors" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">{title}</h3>
              <p className="text-xs sm:text-sm text-white/40">{description}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/30 group-hover:text-white/60 transition-colors" />
        </CardContent>
      </Card>
    </Link>
  );
}
