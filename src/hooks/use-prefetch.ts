import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function usePrefetch() {
  const router = useRouter();

  const prefetchRoute = useCallback(
    (href: string) => {
      router.prefetch(href);
    },
    [router]
  );

  return { prefetchRoute };
}
