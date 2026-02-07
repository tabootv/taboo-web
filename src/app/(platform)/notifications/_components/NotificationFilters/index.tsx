'use client';

import type { FilterTab } from '../../_hooks/useNotificationFilters';

interface NotificationFiltersProps {
  filterTab: FilterTab;
  onFilterChange: (tab: FilterTab) => void;
  allCount: number;
  unreadCount: number;
  readCount: number;
}

export function NotificationFilters({
  filterTab,
  onFilterChange,
  allCount,
  unreadCount,
  readCount,
}: NotificationFiltersProps) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => onFilterChange('all')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          filterTab === 'all'
            ? 'bg-red-primary text-white'
            : 'bg-surface text-text-secondary hover:bg-hover'
        }`}
      >
        Todas
        {allCount > 0 && <span className="ml-2 text-xs">({allCount})</span>}
      </button>
      <button
        onClick={() => onFilterChange('unread')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          filterTab === 'unread'
            ? 'bg-red-primary text-white'
            : 'bg-surface text-text-secondary hover:bg-hover'
        }`}
      >
        Não Lidas
        {unreadCount > 0 && (
          <span
            className={`ml-2 text-xs px-1.5 rounded ${
              filterTab === 'unread' ? 'bg-white/20' : 'bg-red-primary/20'
            }`}
          >
            {unreadCount}
          </span>
        )}
      </button>
      <button
        onClick={() => onFilterChange('read')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          filterTab === 'read'
            ? 'bg-red-primary text-white'
            : 'bg-surface text-text-secondary hover:bg-hover'
        }`}
      >
        Lidas
        {readCount > 0 && <span className="ml-2 text-xs">({readCount})</span>}
      </button>
    </div>
  );
}
