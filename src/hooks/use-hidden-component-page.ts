'use client';

import { usePathname } from 'next/navigation';

export function useHiddenComponentByPage(pageNames: string[]) {
  const pathname = usePathname();
  return pageNames.some((name) => pathname.startsWith(name));
}
