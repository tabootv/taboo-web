import Link from 'next/link';
import { Video, Film, MessageSquarePlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const QUICK_ACTIONS = [
  {
    href: '/studio/upload/video',
    icon: Video,
    title: 'Upload video',
    subtitle: 'Long-form drops',
  },
  {
    href: '/studio/upload/short',
    icon: Film,
    title: 'Upload short',
    subtitle: 'Vertical stories',
  },
  {
    href: '/studio/posts',
    icon: MessageSquarePlus,
    title: 'Create post',
    subtitle: 'Community updates',
  },
];

export function ContentPulseCard() {
  return (
    <Card className="hover:translate-y-0 hover:scale-100">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold text-white">Content pulse</h2>
            <p className="text-white/50 text-sm">Jump straight to creation.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-red-primary/15 flex items-center justify-center text-red-primary">
                <action.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-semibold leading-tight">{action.title}</p>
                <p className="text-xs text-white/50">{action.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
