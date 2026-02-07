'use client';

import { ArrowLeft, CreditCard, Lock, Trash2, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export type ProfileTab = 'profile' | 'password' | 'danger' | 'subscription';

const tabs: { id: ProfileTab; label: string; icon: typeof UserIcon }[] = [
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'subscription', label: 'Manage Subscription', icon: CreditCard },
  { id: 'danger', label: 'Danger Zone', icon: Trash2 },
];

const TAB_ROUTES: Record<ProfileTab, string> = {
  profile: '/profile/edit',
  password: '/profile/edit?tab=password',
  danger: '/profile/edit?tab=danger',
  subscription: '/profile/subscription',
};

interface ProfileSidebarProps {
  activeTab: ProfileTab;
}

export function ProfileSidebar({ activeTab }: ProfileSidebarProps) {
  const router = useRouter();

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
