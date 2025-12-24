/**
 * Navigation constants shared across layout components
 */

import {
  Bookmark,
  Film,
  Globe2,
  GraduationCap,
  History,
  Home,
  Layers,
  PlayCircle,
  Users,
} from 'lucide-react';

export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const mainNavigation: NavigationItem[] = [
  { name: 'Home', href: '/home', icon: Home },
  { name: 'Shorts', href: '/shorts', icon: PlayCircle },
  { name: 'Videos', href: '/videos', icon: Film },
  { name: 'Series', href: '/series', icon: Layers },
  { name: 'Edu', href: '/courses', icon: GraduationCap },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Globe', href: '/globe', icon: Globe2 },
];

export const userNavigation: NavigationItem[] = [
  { name: 'History', href: '/profile?tab=history', icon: History },
  { name: 'Watchlist', href: '/watchlist', icon: Bookmark },
];
