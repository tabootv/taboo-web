'use client';

import { useFeature } from '@/hooks/use-feature';
import { ArrowLeft, CreditCard, Lock, User as UserIcon, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';

export type AccountTab = 'profile' | 'password' | 'subscription' | 'invite';

const BASE_TABS: { id: AccountTab; label: string; icon: typeof UserIcon }[] = [
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'subscription', label: 'Manage Subscription', icon: CreditCard },
];

const TAB_ROUTES: Record<AccountTab, string> = {
  profile: '/account',
  password: '/account/security',
  subscription: '/account/subscription',
  invite: '/account/invite',
};

function getActiveTabFromPath(pathname: string): AccountTab {
  if (pathname.endsWith('/security')) return 'password';
  if (pathname.includes('/subscription')) return 'subscription';
  if (pathname.includes('/invite')) return 'invite';
  return 'profile';
}

interface AccountSidebarProps {
  activeTab?: AccountTab;
}

export function AccountSidebar({ activeTab: activeTabProp }: AccountSidebarProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = activeTabProp ?? getActiveTabFromPath(pathname);
  const inviteEnabled = useFeature('INVITE_SYSTEM');

  const tabs = useMemo(() => {
    if (!inviteEnabled) return BASE_TABS;
    return [...BASE_TABS, { id: 'invite' as AccountTab, label: 'Invite a Friend', icon: UserPlus }];
  }, [inviteEnabled]);

  return (
    <>
      <div className="flex items-center gap-4 mb-2">
        <Link
          href="/profile"
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Profile</span>
        </Link>
      </div>

      <div className="md:sticky md:top-20 md:self-start w-full shrink-0">
        <nav className="py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => router.push(TAB_ROUTES[tab.id])}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-red-primary/10 text-red-primary'
                  : 'text-text-secondary hover:bg-hover hover:text-text-primary'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
