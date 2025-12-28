'use client';

import { useContentProtection, handleProtectedContextMenu } from '@/lib/hooks/use-content-protection';

interface ContentProtectionWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that adds content protection to the entire app.
 * Prevents right-click on videos/images and blocks common download shortcuts.
 */
export function ContentProtectionWrapper({ children }: ContentProtectionWrapperProps) {
  // Enable keyboard shortcut protection
  useContentProtection();

  return (
    <div
      onContextMenu={handleProtectedContextMenu}
      className="contents"
    >
      {children}
    </div>
  );
}
