'use client';;
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Video, Film, Eye, Heart, MessageCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/spinner';
import { formatDuration, formatRelativeTime } from '@/lib/utils';
import type { Video as VideoType } from '@/types';

type ContentType = 'all' | 'videos' | 'shorts';

interface ContentItem extends VideoType {
  type: 'video' | 'short';
  created_at?: string;
}

export default function ContentDashboardPage() {
  const router = useRouter();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ContentType>('all');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch creator's content from API when endpoint is available
    // For now, show empty state
    setIsLoading(false);
    setContent([]);
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Loading your content..." />;
  }

  const filteredContent = content.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'videos') return item.type === 'video';
    if (activeTab === 'shorts') return item.type === 'short';
    return true;
  });

  const stats = {
    totalViews: content.reduce((acc, item) => acc + (item.views_count || 0), 0),
    totalLikes: content.reduce((acc, item) => acc + (item.likes_count || 0), 0),
    totalComments: content.reduce((acc, item) => acc + (item.comments_count || 0), 0),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Content Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your videos and shorts</p>
        </div>
        <Link href="/content/create">
          <Button className="btn-premium">
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.totalViews.toLocaleString()}</p>
              <p className="text-sm text-text-secondary">Total Views</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-primary/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.totalLikes.toLocaleString()}</p>
              <p className="text-sm text-text-secondary">Total Likes</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.totalComments.toLocaleString()}</p>
              <p className="text-sm text-text-secondary">Total Comments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-border">
        {(['all', 'videos', 'shorts'] as ContentType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'text-red-primary border-red-primary'
                : 'text-text-secondary border-transparent hover:text-text-primary'
            }`}
          >
            {tab === 'all' && 'All Content'}
            {tab === 'videos' && (
              <span className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Videos
              </span>
            )}
            {tab === 'shorts' && (
              <span className="flex items-center gap-2">
                <Film className="w-4 h-4" />
                Shorts
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content List */}
      {filteredContent.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <div className="w-16 h-16 rounded-full bg-border flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-text-secondary" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">No content yet</h2>
          <p className="text-text-secondary mb-6">Start creating to see your content here</p>
          <Link href="/content/create">
            <Button className="btn-premium">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Video
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContent.map((item) => (
            <ContentCard
              key={item.uuid}
              item={item}
              showMenu={showMenu === item.uuid}
              onToggleMenu={() => setShowMenu(showMenu === item.uuid ? null : item.uuid)}
              onEdit={() => router.push(`/content/edit/${item.uuid}`)}
              onDelete={() => {
                // TODO: Implement delete
                console.log('Delete', item.uuid);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ContentCard({
  item,
  showMenu,
  onToggleMenu,
  onEdit,
  onDelete,
}: {
  item: ContentItem;
  showMenu: boolean;
  onToggleMenu: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex gap-4 p-4 bg-surface rounded-xl border border-border hover:border-border-hover transition-colors">
      {/* Thumbnail */}
      <div className="relative w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0">
        {item.thumbnail && (
          <Image
            src={item.thumbnail_webp || item.thumbnail}
            alt={item.title}
            fill
            className="object-cover"
          />
        )}
        {item.duration && (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
            {formatDuration(item.duration)}
          </span>
        )}
        {item.type === 'short' && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-primary text-white text-xs font-semibold rounded">
            SHORT
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-text-primary line-clamp-2 mb-1">{item.title}</h3>
        {item.description && (
          <p className="text-sm text-text-secondary line-clamp-1 mb-2">{item.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {item.views_count?.toLocaleString() || 0}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            {item.likes_count?.toLocaleString() || 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {item.comments_count?.toLocaleString() || 0}
          </span>
          {item.created_at && (
            <span>{formatRelativeTime(item.created_at)}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="relative flex-shrink-0">
        <button
          onClick={onToggleMenu}
          className="p-2 hover:bg-hover rounded-lg transition-colors"
        >
          <MoreVertical className="w-5 h-5 text-text-secondary" />
        </button>
        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-40 bg-surface border border-border rounded-lg shadow-lg z-10">
            <button
              onClick={() => {
                onEdit();
                onToggleMenu();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-hover transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => {
                onDelete();
                onToggleMenu();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-hover transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
