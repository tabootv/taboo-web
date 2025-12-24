'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Menu,
  Upload,
  Video,
  Film,
  FileText,
  Bell,
  ChevronDown,
  User,
  LogOut,
  ExternalLink,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useAuthStore, useStudioSidebarStore } from '@/lib/stores';
import { Logo } from '@/components/ui/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function StudioHeader() {
  const { user, logout } = useAuthStore();
  const { toggleExpanded, toggleMobileOpen } = useStudioSidebarStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background border-b border-border">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Hamburger + Logo + Studio Badge */}
        <div className="flex items-center gap-2">
          {/* Hamburger - Desktop: toggle sidebar, Mobile: open drawer */}
          <button
            onClick={() => {
              if (window.innerWidth >= 1024) {
                toggleExpanded();
              } else {
                toggleMobileOpen();
              }
            }}
            className="p-2 rounded-full hover:bg-hover text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Logo size="md" linkTo="/home" />

          <span className="text-xs font-medium text-red-primary px-2 py-0.5 bg-red-primary/10 rounded ml-1">
            Studio
          </span>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-3">
          {/* Upload/Create Dropdown */}
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

          {/* View Channel */}
          {user?.channel && (
            <Link
              href={`/creators/creator-profile/${user.channel.id}`}
              target="_blank"
              className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Channel
            </Link>
          )}

          {/* Notifications */}
          <button className="p-2 text-text-secondary hover:text-text-primary transition-colors">
            <Bell className="w-5 h-5" />
          </button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 focus:outline-none">
                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-red-primary/50 transition-all">
                  {user?.dp ? (
                    <Image src={user.dp} alt={user.display_name} width={32} height={32} className="object-cover w-full h-full" />
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
              {/* User Info Header */}
              <div className="px-3 py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    {user?.dp ? (
                      <Image src={user.dp} alt={user.display_name} width={40} height={40} className="object-cover w-full h-full" />
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

              {/* Menu Items */}
              <div className="py-1">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-3">
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                {user?.channel && (
                  <DropdownMenuItem asChild>
                    <Link href={`/creators/creator-profile/${user.channel.id}`} target="_blank" className="flex items-center gap-3">
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

              {/* Sign Out */}
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
