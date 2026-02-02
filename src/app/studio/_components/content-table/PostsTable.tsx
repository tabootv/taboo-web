'use client';

import { ChevronLeft, ChevronRight, Loader2, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostsTableRow, type PostItem } from './PostsTableRow';

interface PostsTableProps {
  items: PostItem[];
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
  onEdit: (item: PostItem) => void;
  onDelete: (item: PostItem) => Promise<void>;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <MessageSquareText className="w-8 h-8 text-text-tertiary" />
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-2">No posts yet</h3>
      <p className="text-sm text-text-secondary max-w-md">
        Create your first community post to engage with your audience. Posts will appear here once
        published.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-8 h-8 text-red-primary animate-spin" />
    </div>
  );
}

function TableHeader() {
  return (
    <thead>
      <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-text-tertiary">
        <th className="py-3 px-4 font-medium">Post</th>
        <th className="py-3 px-4 font-medium w-[120px]">Date</th>
        <th className="py-3 px-4 font-medium w-[100px]">Likes</th>
        <th className="py-3 px-4 font-medium w-[100px]">Comments</th>
        <th className="py-3 px-4 font-medium w-[60px]"></th>
      </tr>
    </thead>
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

export function PostsTable({
  items,
  isLoading,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
}: PostsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
        <LoadingState />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <TableHeader />
          <tbody>
            {items.map((item) => (
              <PostsTableRow key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
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

export type { PostItem };
