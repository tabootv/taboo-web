'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Logo } from '@/components/ui/logo';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuthStore } from '@/lib/stores';
import { getCreatorRoute } from '@/lib/utils';
import {
  Bell,
  ChevronDown,
  ExternalLink,
  FileText,
  Film,
  HelpCircle,
  LogOut,
  Menu,
  Settings,
  Upload,
  User,
  Video,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function StudioHeader() {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useSidebar();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-black border-b border-black z-[999]">
      <div className="flex items-center justify-between h-full pr-4">
        <div className="flex items-center">
          <div className="w-12 h-14 flex items-center justify-center shrink-0">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-hover text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <Logo size="md" linkTo="/home" />

          <span className="text-xs font-medium text-red-primary px-2 py-0.5 bg-red-primary/10 rounded ml-1">
            Studio
          </span>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-primary hover:bg-red-hover text-white rounded-lg font-medium text-sm transition-colors">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/studio/upload/video" className="flex items-center gap-3">
                  <Video className="w-4 h-4" />
                  Upload Video
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/studio/upload/short" className="flex items-center gap-3">
                  <Film className="w-4 h-4" />
                  Upload Short
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/studio/posts" className="flex items-center gap-3">
                  <FileText className="w-4 h-4" />
                  Create Post
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user?.channel && (
            <Link
              href={getCreatorRoute(user.channel.handler)}
              target="_blank"
              className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Channel
            </Link>
          )}

          <button className="p-2 text-text-secondary hover:text-text-primary transition-colors">
            <Bell className="w-5 h-5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 focus:outline-none">
                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-red-primary/50 transition-all">
                  {user?.dp ? (
                    <Image
                      src={user.dp}
                      alt={user.display_name}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {user?.display_name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    {user?.dp ? (
                      <Image
                        src={user.dp}
                        alt={user.display_name}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {user?.display_name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{user?.display_name}</p>
                    <p className="text-xs text-white/50 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="py-1">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-3">
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                {user?.channel && (
                  <DropdownMenuItem asChild>
                    <Link
                      href={getCreatorRoute(user.channel.handler)}
                      target="_blank"
                      className="flex items-center gap-3"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Channel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-3">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/help" className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4" />
                    Help & Support
                  </Link>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
