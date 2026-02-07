'use client';

import { LoadingScreen } from '@/components/ui/spinner';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useEffect, useState } from 'react';
import { AccountSidebar } from '../_components/account-sidebar';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { fetchUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUser().finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return <LoadingScreen message="Loading settings..." />;

  return (
    <div className="account-container py-8">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <div className="w-full md:w-[calc(30%-2rem)] shrink-0">
          <AccountSidebar />
        </div>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
