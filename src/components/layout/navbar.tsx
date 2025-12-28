'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';
import { useSearchExpansion } from '@/components/search/hooks/use-search-expansion';
import { useMobileMenu } from './hooks/use-mobile-menu';
import { NavbarDesktopNavigation } from './components/NavbarDesktopNavigation';
import { NavbarSearchBar } from './components/NavbarSearchBar';
import { NavbarUserMenu } from './components/NavbarUserMenu';
import { NavbarMobileMenu } from './components/NavbarMobileMenu';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { isExpanded: isSearchExpanded, inputRef: searchInputRef, toggle: handleSearchToggle, collapse: handleSearchClose } = useSearchExpansion();
  const { isMobileMenuOpen, toggleMenu: toggleMobileMenu, closeMenu: closeMobileMenu } = useMobileMenu();

  // Check if we're on the home page for transparent header
  const isHomePage = pathname === '/home' || pathname === '/';

  // Handle scroll for navbar background (throttled to 100ms)
  const lastScrollTime = useRef(0);
  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollTime.current < 100) return;
      lastScrollTime.current = now;
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/searches?q=${encodeURIComponent(searchQuery.trim())}`);
        handleSearchClose();
        setSearchQuery('');
      } else {
        handleSearchToggle();
      }
    },
    [searchQuery, router, handleSearchClose, handleSearchToggle]
  );

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-black',
        isHomePage && !isScrolled && !isMobileMenuOpen
          ? 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
          : 'bg-black'
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

          {/* Desktop Navigation */}
          <NavbarDesktopNavigation isSearchExpanded={isSearchExpanded} />

          {/* Right Side with collapsible search */}
          <div className="flex items-center gap-2">
            <NavbarSearchBar
              isSearchExpanded={isSearchExpanded}
              searchQuery={searchQuery}
              searchInputRef={searchInputRef}
              onQueryChange={setSearchQuery}
              onSubmit={handleSearchSubmit}
              onToggle={handleSearchToggle}
              onClose={handleSearchClose}
            />

            <NavbarUserMenu isSearchExpanded={isSearchExpanded} />

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className={cn(
                'lg:hidden p-2 rounded-sm text-text-secondary hover:bg-hover transition-colors',
                isSearchExpanded && 'hidden'
              )}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <NavbarMobileMenu
        isOpen={isMobileMenuOpen}
        isSearchExpanded={isSearchExpanded}
        searchQuery={searchQuery}
        onQueryChange={setSearchQuery}
        onSubmit={handleSearchSubmit}
        onClose={closeMobileMenu}
      />
    </nav>
  );
}
