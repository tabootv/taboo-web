'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Video,
  Film,
  MessageSquarePlus,
  Eye,
  Users,
  Heart,
  ChevronRight,
  Upload,
  Sparkles,
  BarChart3,
  DollarSign,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores';

export default function StudioDashboard() {
  const { user } = useAuthStore();
  const channel = user?.channel;

  if (!channel) {
    return null;
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-red-primary/50">
          {channel.dp ? (
            <Image src={channel.dp} alt={channel.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {channel.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">Welcome back, {channel.name}</h1>
          <p className="text-text-secondary">Here's what's happening with your channel</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Eye}
          label="Total Views"
          value={formatNumber(channel.views_count || 0)}
        />
        <StatCard
          icon={Users}
          label="Subscribers"
          value={formatNumber(channel.followers_count || 0)}
        />
        <StatCard
          icon={Video}
          label="Videos"
          value={formatNumber(channel.videos_count || 0)}
        />
        <StatCard
          icon={Heart}
          label="Total Likes"
          value={formatNumber(channel.likes_count || 0)}
        />
      </div>

      {/* Create Content */}
      <h2 className="text-lg font-semibold text-white mb-4">Create Content</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <ActionCard
          href="/studio/upload/video"
          icon={Video}
          title="Upload Video"
          description="Share your content with your audience"
          gradient="from-blue-600 to-blue-800"
        />
        <ActionCard
          href="/studio/upload/short"
          icon={Film}
          title="Upload Short"
          description="Create quick, engaging short videos"
          gradient="from-purple-600 to-purple-800"
        />
        <ActionCard
          href="/studio/posts"
          icon={MessageSquarePlus}
          title="Create Post"
          description="Share updates with your community"
          gradient="from-red-600 to-red-800"
        />
      </div>

      {/* Quick Links */}
      <h2 className="text-lg font-semibold text-white mb-4">Quick Links</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        <QuickLinkCard
          href="/studio/analytics"
          icon={BarChart3}
          title="Analytics"
          description="View your channel performance"
        />
        <QuickLinkCard
          href="/studio/payouts"
          icon={DollarSign}
          title="Payouts"
          description="Manage your earnings"
        />
      </div>

      {/* Coming Soon */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-yellow-500/10">
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>
          <h2 className="text-lg font-semibold text-white">Coming Soon</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <ComingSoonItem title="Live Streaming" description="Go live with your audience" />
          <ComingSoonItem title="Series & Courses" description="Create premium content" />
          <ComingSoonItem title="Advanced Analytics" description="Detailed performance insights" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/5">
          <Icon className="w-5 h-5 text-red-primary" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-white">{value}</p>
          <p className="text-sm text-text-secondary">{label}</p>
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  description,
  gradient,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <Link href={href} className="group">
      <div className="relative bg-surface border border-border rounded-xl overflow-hidden transition-all hover:border-white/20">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-white/10">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <Upload className="w-5 h-5 text-text-secondary group-hover:text-white transition-colors" />
          </div>
          <h3 className="font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>
      </div>
    </Link>
  );
}

function QuickLinkCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="group">
      <div className="bg-surface border border-border rounded-xl p-5 flex items-center justify-between transition-all hover:border-white/20">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/5 group-hover:bg-red-primary/10 transition-colors">
            <Icon className="w-5 h-5 text-text-secondary group-hover:text-red-primary transition-colors" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-text-secondary">{description}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-white transition-colors" />
      </div>
    </Link>
  );
}

function ComingSoonItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-dashed border-white/10">
      <h4 className="font-medium text-white/60 mb-1">{title}</h4>
      <p className="text-sm text-text-secondary">{description}</p>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
