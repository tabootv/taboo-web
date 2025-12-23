'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Home,
  PlayCircle,
  Film,
  Layers,
  GraduationCap,
  Users,
  Globe2,
  Bell,
  Search,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Bookmark,
  Clapperboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, Button } from '@/components/ui';
import { Logo } from '@/components/ui/logo';
import { useAuthStore } from '@/lib/stores';

const navigation = [
  { name: 'Home', href: '/home', icon: Home },
  { name: 'Shorts', href: '/shorts', icon: PlayCircle },
  { name: 'Videos', href: '/videos', icon: Film },
  { name: 'Series', href: '/series', icon: Layers },
  { name: 'Edu', href: '/courses', icon: GraduationCap },
  { name: 'Feed', href: '/community', icon: Users },
  { name: 'Globe', href: '/globe', icon: Globe2 },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Check if we're on the home page for transparent header
  const isHomePage = pathname === '/home' || pathname === '/';

  // Handle scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    router.push('/sign-in');
  };

  const handleSearchToggle = useCallback(() => {
    setIsSearchExpanded((prev) => !prev);
  }, []);

  const handleSearchClose = useCallback(() => {
    setIsSearchExpanded(false);
    setSearchQuery('');
  }, []);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/searches?q=${encodeURIComponent(searchQuery.trim())}`);
        handleSearchClose();
      } else {
        setIsSearchExpanded(true);
        searchInputRef.current?.focus();
      }
    },
    [searchQuery, router, handleSearchClose]
  );

  // Focus input when search expands
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Close search on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchExpanded) {
        handleSearchClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSearchExpanded, handleSearchClose]);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isHomePage && !isScrolled && !isMobileMenuOpen
          ? 'bg-gradient-to-b from-black/80 via-black/40 to-transparent border-transparent'
          : 'bg-black border-b border-border'
      )}
    >
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo - hide when search expanded on smaller screens */}
          <div
            className={cn(
              'transition-all duration-300 flex-shrink-0',
              isSearchExpanded ? 'lg:opacity-100 lg:w-auto opacity-0 w-0 overflow-hidden' : 'opacity-100'
            )}
          >
            <Logo size="md" linkTo="/home" />
          </div>

          {/* Desktop Navigation - Compact to icons when search is expanded */}
          <div
            className={cn(
              'hidden lg:flex items-center transition-all duration-300',
              isSearchExpanded ? 'gap-0' : 'gap-1'
            )}
          >
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={item.name}
                  className={cn(
                    'flex items-center justify-center rounded-[var(--radius-sm)] font-medium transition-all duration-300',
                    isActive
                      ? 'bg-red-primary/10 text-red-primary'
                      : 'text-text-secondary hover:bg-hover hover:text-text-primary',
                    isSearchExpanded
                      ? 'px-2 py-2 text-sm gap-0'
                      : 'px-3 py-2 text-sm gap-2'
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span
                    className={cn(
                      'transition-all duration-300 overflow-hidden whitespace-nowrap',
                      isSearchExpanded ? 'w-0 opacity-0' : 'w-auto opacity-100'
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right Side with collapsible search */}
          <div className="flex items-center gap-2">
            {/* Collapsible Search Bar */}
            <div
              className={cn(
                'relative flex items-center transition-all duration-300',
                isSearchExpanded
                  ? 'w-[180px] sm:w-[240px] md:w-[320px] lg:w-[400px] opacity-100'
                  : 'w-0 opacity-0 pointer-events-none'
              )}
            >
              <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
                <div className="relative w-full">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search videos, series, creators..."
                    className="w-full pl-4 pr-12 py-2 bg-[#0f0f10] border border-border rounded-full text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-red-primary transition-all shadow-[0_10px_40px_rgba(0,0,0,0.45)]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-9 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-red-primary hover:bg-red-hover text-white rounded-full p-1.5 transition-colors"
                    aria-label="Submit search"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Toggle Button */}
            <button
              onClick={isSearchExpanded ? handleSearchClose : handleSearchToggle}
              className={cn(
                'p-2 rounded-full transition-colors border border-border',
                isSearchExpanded
                  ? 'bg-red-primary/10 text-red-primary hover:bg-red-primary/20'
                  : 'bg-transparent text-text-secondary hover:bg-hover hover:text-text-primary'
              )}
              aria-label={isSearchExpanded ? 'Collapse search' : 'Expand search'}
            >
              {isSearchExpanded ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            {/* Rest of right side */}
            <div
              className={cn(
                'flex items-center gap-2 transition-all duration-300',
                isSearchExpanded ? 'w-0 opacity-0 overflow-hidden lg:opacity-100 lg:w-auto lg:overflow-visible' : 'opacity-100 w-auto'
              )}
            >
              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <Link
                    href="/notifications"
                    className="relative p-2 rounded-[var(--radius-sm)] text-text-secondary hover:bg-hover hover:text-text-primary transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                  </Link>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 p-1 rounded-[var(--radius-sm)] hover:bg-hover transition-colors"
                    >
                      <Avatar src={user?.dp} alt={user?.display_name} size="sm" fallback={user?.display_name} />
                    </button>

                    {/* Dropdown */}
                    {isUserMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                        <div className="absolute right-0 mt-2 w-56 bg-surface rounded-[var(--radius-md)] elevation-medium border border-border py-1 z-20">
                          <div className="px-4 py-2 border-b border-border">
                            <p className="font-medium text-text-primary truncate">{user?.display_name}</p>
                            <p className="text-sm text-text-secondary truncate">{user?.email}</p>
                          </div>
                          <Link
                            href="/studio"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-primary hover:bg-red-primary/10 transition-colors"
                          >
                            <Clapperboard className="w-4 h-4" />
                            Creator Studio
                          </Link>
                          <div className="border-b border-border" />
                          <Link
                            href="/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors"
                          >
                            <User className="w-4 h-4" />
                            Profile
                          </Link>
                          <Link
                            href="/watchlist"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors"
                          >
                            <Bookmark className="w-4 h-4" />
                            Watchlist
                          </Link>
                          <Link
                            href="/profile/settings"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-primary hover:bg-hover transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/sign-in">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                'lg:hidden p-2 rounded-[var(--radius-sm)] text-text-secondary hover:bg-hover transition-colors',
                isSearchExpanded && 'hidden'
              )}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && !isSearchExpanded && (
        <div className="lg:hidden border-t border-border bg-black">
          <div className="px-4 py-2 space-y-1">
            {/* Mobile Search */}
            <form
              onSubmit={handleSearchSubmit}
              className="py-2"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-[var(--radius-md)] text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-red-primary transition-colors"
                />
              </div>
            </form>

            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] text-base font-medium transition-colors',
                    isActive
                      ? 'bg-red-primary/10 text-red-primary'
                      : 'text-text-secondary hover:bg-hover hover:text-text-primary'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}

            {!isAuthenticated && (
              <div className="pt-4 pb-2 space-y-2">
                <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
