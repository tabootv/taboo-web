'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Video, Film, MessageSquare, ChevronRight } from 'lucide-react';

interface StudioLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  {
    label: 'Dashboard',
    href: '/studio',
    icon: LayoutDashboard,
  },
  {
    label: 'Videos',
    href: '/studio/videos',
    icon: Video,
  },
  {
    label: 'Shorts',
    href: '/studio/shorts',
    icon: Film,
  },
  {
    label: 'Community',
    href: '/studio/community',
    icon: MessageSquare,
  },
];

export function StudioLayout({ children }: StudioLayoutProps) {
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Creator Studio', href: '/studio' }];

    if (segments.length > 1) {
      if (segments[1] === 'upload') {
        breadcrumbs.push({ label: 'Upload', href: '/studio' });
        if (segments[2] === 'video') {
          breadcrumbs.push({ label: 'Video', href: '/studio/upload/video' });
        } else if (segments[2] === 'short') {
          breadcrumbs.push({ label: 'Short', href: '/studio/upload/short' });
        }
      } else if (segments[1] === 'community') {
        breadcrumbs.push({ label: 'Community', href: '/studio/community' });
        if (segments[2] === 'post') {
          breadcrumbs.push({ label: 'New Post', href: '/studio/community/post' });
        }
      } else if (segments[1] === 'videos') {
        breadcrumbs.push({ label: 'Videos', href: '/studio/videos' });
      } else if (segments[1] === 'shorts') {
        breadcrumbs.push({ label: 'Shorts', href: '/studio/shorts' });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-background">
      {/* Studio Header */}
      <div className="border-b border-border bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-text-secondary" />}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-white font-medium">{crumb.label}</span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="text-text-secondary hover:text-white transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Quick Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/studio' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-red-primary/10 text-red-primary'
                        : 'text-text-secondary hover:text-white hover:bg-surface'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
    </div>
  );
}
