'use client';
import { useUpdateAvatar } from '@/api/mutations';
import { useBookmarkedVideos, useHistoryVideos } from '@/api/queries/video.queries';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/spinner';
import { useFeature } from '@/hooks/use-feature';
import { useAuthStore } from '@/shared/stores/auth-store';
import type { Video } from '@/types';
import { Bookmark, Camera, Clock, CreditCard, Lock, LogOut, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

type TabType = 'bookmarks' | 'history';

export default function ProfilePage() {
  const { user, logout, fetchUser } = useAuthStore();
  const bookmarksEnabled = useFeature('BOOKMARK_SYSTEM');
  const historyEnabled = useFeature('WATCH_HISTORY');
  const [activeTab, setActiveTab] = useState<TabType>(bookmarksEnabled ? 'bookmarks' : 'history');
  const updateAvatar = useUpdateAvatar();
  const [isUploadingDp, setIsUploadingDp] = useState(false);

  const { data: bookmarksData, isLoading: isLoadingBookmarks } = useBookmarkedVideos(1, 12, {
    enabled: bookmarksEnabled,
  });
  const { data: historyData, isLoading: isLoadingHistory } = useHistoryVideos(1, 12, {
    enabled: historyEnabled,
  });
  const isLoading = isLoadingBookmarks || isLoadingHistory;
  const bookmarks = bookmarksData?.data || [];
  const history = historyData?.data || [];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      window.location.replace('/sign-in');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const handleUploadAvatar = async (file?: File) => {
    if (!file) return;
    try {
      setIsUploadingDp(true);
      updateAvatar.mutate(file, {
        onSuccess: () => {
          fetchUser();
          toast.success('Profile picture updated');
        },
        onError: () => {
          toast.error('Failed to update profile picture');
        },
        onSettled: () => {
          setIsUploadingDp(false);
        },
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile picture');
      setIsUploadingDp(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  const tabs = [
    ...(bookmarksEnabled
      ? [{ id: 'bookmarks' as TabType, label: 'Saved', icon: Bookmark, count: bookmarks.length }]
      : []),
    ...(historyEnabled
      ? [{ id: 'history' as TabType, label: 'History', icon: Clock, count: history.length }]
      : []),
  ];

  const getActiveVideos = () => {
    switch (activeTab) {
      case 'bookmarks':
        return bookmarks;
      case 'history':
        return history;
      default:
        return [];
    }
  };

  return (
    <div className="page-px max-w-[1920px] mx-auto py-6 min-h-screen">
      {/* Profile Header */}
      <div className="bg-surface rounded-lg elevation-low border border-border overflow-hidden">
        {/* Cover */}
        <div className="h-32 md:h-48 bg-linear-to-r from-red-primary to-red-dark" />

        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-12">
            {/* Avatar */}
            <div className="relative">
              <Avatar
                src={user?.dp || null}
                alt={user?.display_name || 'User'}
                fallback={user?.display_name || 'U'}
                className="w-32 h-32 border-4 border-surface text-4xl"
              />
              <label className="absolute bottom-2 right-2 p-2 bg-surface/80 rounded-full text-text-primary hover:bg-hover transition-colors cursor-pointer">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUploadAvatar(e.target.files?.[0] || undefined)}
                  disabled={isUploadingDp}
                />
              </label>
            </div>

            {/* Info */}
            <div className="flex-1 sm:mb-2">
              <h1 className="text-2xl font-bold text-text-primary">{user?.display_name}</h1>
              {user?.handler && <p className="text-sm text-text-secondary">@{user.handler}</p>}
              <p className="text-text-secondary">{user?.email}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 sm:mb-2">
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <Link
          href="/account"
          className="flex items-center gap-3 p-4 bg-surface rounded-md border border-border hover:bg-hover transition-colors"
        >
          <div className="p-2 bg-red-primary/10 rounded-sm">
            <Settings className="w-5 h-5 text-red-primary" />
          </div>
          <div>
            <p className="font-medium text-text-primary">Settings</p>
            <p className="text-xs text-text-secondary">Account settings</p>
          </div>
        </Link>

        <Link
          href="/account/subscription"
          className="flex items-center gap-3 p-4 bg-surface rounded-md border border-border hover:bg-hover transition-colors"
        >
          <div className="p-2 bg-red-primary/10 rounded-sm">
            <CreditCard className="w-5 h-5 text-red-primary" />
          </div>
          <div>
            <p className="font-medium text-text-primary">Subscription</p>
            <p className="text-xs text-text-secondary">Manage plan</p>
          </div>
        </Link>

        <Link
          href="/account/security"
          className="flex items-center gap-3 p-4 bg-surface rounded-md border border-border hover:bg-hover transition-colors"
        >
          <div className="p-2 bg-red-primary/10 rounded-sm">
            <Lock className="w-5 h-5 text-red-primary" />
          </div>
          <div>
            <p className="font-medium text-text-primary">Security</p>
            <p className="text-xs text-text-secondary">Change password</p>
          </div>
        </Link>
      </div>

      {/* Tabs */}
      <div className="mt-8">
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'text-red-primary border-red-primary'
                  : 'text-text-secondary border-transparent hover:text-text-primary'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className="ml-1 px-2 py-0.5 text-xs bg-hover rounded-full">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {getActiveVideos().length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {getActiveVideos().map((video) => (
                <VideoCard key={video.uuid} video={video} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-secondary">No {activeTab} videos yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoCard({ video }: { video: Video }) {
  return (
    <Link href={`/videos/${video.id}`} className="group">
      <div className="relative aspect-video rounded-md overflow-hidden bg-surface">
        {video.thumbnail && (
          <Image
            src={video.thumbnail_webp || video.thumbnail}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>
      <div className="mt-2">
        <h3 className="font-medium text-text-primary line-clamp-2 group-hover:text-red-primary transition-colors">
          {video.title}
        </h3>
        <p className="text-sm text-text-secondary mt-1">{video.channel?.name}</p>
      </div>
    </Link>
  );
}
