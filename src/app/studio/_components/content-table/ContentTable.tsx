'use client';

import { ChevronLeft, ChevronRight, Film, Clapperboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/shared/utils/formatting';
import { ContentTableRow, type ContentItem } from './ContentTableRow';
import type { Visibility } from './VisibilityDropdown';

interface ContentTableProps {
  items: ContentItem[];
  isShort: boolean;
  isLoading?: boolean;
  pagination:
    | {
        currentPage: number;
        lastPage: number;
        total: number;
        perPage: number;
      }
    | undefined;
  onPageChange?: (page: number) => void;
  onEdit: (item: ContentItem) => void;
  onDelete: (item: ContentItem) => Promise<void>;
  onVisibilityChange: (item: ContentItem, visibility: Visibility) => Promise<void>;
}

function EmptyState({ isShort }: { isShort: boolean }) {
  const Icon = isShort ? Clapperboard : Film;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-text-tertiary" />
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-2">
        No {isShort ? 'shorts' : 'videos'} yet
      </h3>
      <p className="text-sm text-text-secondary max-w-md">
        Upload your first {isShort ? 'short' : 'video'} to get started. Your content will appear
        here once it&apos;s uploaded.
      </p>
    </div>
  );
}

function TableHeader({ isShort }: { isShort: boolean }) {
  return (
    <thead>
      <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-text-tertiary">
        <th className="py-3 px-4 font-medium">{isShort ? 'Short' : 'Video'}</th>
        <th className="py-3 px-4 font-medium w-[140px]">Visibility</th>
        <th className="py-3 px-4 font-medium w-[120px]">Restrictions</th>
        <th className="py-3 px-4 font-medium w-[120px]">Date</th>
        <th className="py-3 px-4 font-medium w-[80px] text-right">Comments</th>
        <th className="py-3 px-4 font-medium w-[80px] text-right">Likes</th>
      </tr>
    </thead>
  );
}

function SkeletonRow({ isShort }: { isShort: boolean }) {
  return (
    <tr className="border-b border-white/5">
      <td className="py-3 px-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'shrink-0 rounded-md bg-white/5 animate-pulse',
              isShort ? 'w-14 h-[78px]' : 'w-28 h-16'
            )}
          />
          <div className="min-w-0 flex-1 py-1">
            <div className="h-4 bg-white/5 rounded animate-pulse w-3/4 mb-2" />
            <div className="h-3 bg-white/5 rounded animate-pulse w-1/2" />
          </div>
        </div>
      </td>
      <td className="py-3 px-4 w-[140px]">
        <div className="h-8 bg-white/5 rounded animate-pulse w-24" />
      </td>
      <td className="py-3 px-4 w-[120px]">
        <div className="h-4 bg-white/5 rounded animate-pulse w-16" />
      </td>
      <td className="py-3 px-4 w-[120px]">
        <div className="h-4 bg-white/5 rounded animate-pulse w-20" />
      </td>
      <td className="py-3 px-4 w-[80px] text-right">
        <div className="h-4 bg-white/5 rounded animate-pulse w-10 ml-auto" />
      </td>
      <td className="py-3 px-4 w-[80px] text-right">
        <div className="h-4 bg-white/5 rounded animate-pulse w-10 ml-auto" />
      </td>
    </tr>
  );
}

function Pagination({
  currentPage,
  lastPage,
  total,
  perPage,
  onPageChange,
}: {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}) {
  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
      <p className="text-sm text-text-secondary">
        Showing {startItem}-{endItem} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="text-text-tertiary hover:text-text-primary disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-text-secondary">
          Page {currentPage} of {lastPage}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="text-text-tertiary hover:text-text-primary disabled:opacity-50"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function ContentTable({
  items,
  isShort,
  isLoading,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  onVisibilityChange,
}: ContentTableProps) {
  if (isLoading) {
    return (
      <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <TableHeader isShort={isShort} />
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} isShort={isShort} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
        <EmptyState isShort={isShort} />
      </div>
    );
  }

  return (
    <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <TableHeader isShort={isShort} />
          <tbody>
            {items.map((item) => (
              <ContentTableRow
                key={item.id}
                item={item}
                isShort={isShort}
                onEdit={onEdit}
                onDelete={onDelete}
                onVisibilityChange={onVisibilityChange}
              />
            ))}
          </tbody>
        </table>
      </div>
      {pagination && pagination.lastPage > 1 && onPageChange && (
        <Pagination
          currentPage={pagination.currentPage}
          lastPage={pagination.lastPage}
          total={pagination.total}
          perPage={pagination.perPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

export type { ContentItem };
