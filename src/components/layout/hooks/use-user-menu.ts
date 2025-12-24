/**
 * Hook for managing user menu dropdown state
 */

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook for managing user menu open/close state
 */
export function useUserMenu() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const openMenu = useCallback(() => {
    setIsUserMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsUserMenuOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsUserMenuOpen((prev) => !prev);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen, closeMenu]);

  // Close menu on escape key
  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isUserMenuOpen, closeMenu]);

  return {
    isUserMenuOpen,
    openMenu,
    closeMenu,
    toggleMenu,
    menuRef,
  };
}

