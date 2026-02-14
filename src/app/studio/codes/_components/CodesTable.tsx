'use client';

import type { RedeemCode } from '@/api/client/redeem-codes.client';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AnalyticsEvent } from '@/shared/lib/analytics/events';
import { cn } from '@/shared/utils/formatting';
import { ChevronLeft, ChevronRight, Clipboard, Link2, Ticket } from 'lucide-react';
import posthog from 'posthog-js';
import { toast } from 'sonner';

type CodeStatus = 'active' | 'expired' | 'inactive' | 'depleted';

function getCodeStatus(code: RedeemCode): CodeStatus {
  if (!code.is_active) return 'inactive';
  if (code.max_uses !== null && code.uses_count >= code.max_uses) return 'depleted';
  if (code.expiry_date && new Date(code.expiry_date) < new Date()) return 'expired';
  return 'active';
}

const statusConfig: Record<CodeStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-green-500/20 text-green-400' },
  expired: { label: 'Expired', className: 'bg-amber-500/20 text-amber-400' },
  inactive: { label: 'Inactive', className: 'bg-red-500/20 text-red-400' },
  depleted: { label: 'Depleted', className: 'bg-white/10 text-text-tertiary' },
};

interface CodesTableProps {
  items: RedeemCode[];
  isLoading?: boolean | undefined;
  pagination?:
    | {
        currentPage: number;
        lastPage: number;
        total: number;
        perPage: number;
      }
    | undefined;
  onPageChange?: ((page: number) => void) | undefined;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Ticket className="w-8 h-8 text-text-tertiary" />
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-2">No redeem codes yet</h3>
      <p className="text-sm text-text-secondary max-w-md">
        Create your first code to start sharing.
      </p>
    </div>
  );
}

function TableHeader() {
  return (
    <thead>
      <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-text-tertiary">
        <th className="py-3 px-4 font-medium">Code</th>
        <th className="py-3 px-4 font-medium w-[140px]">Actions</th>
        <th className="py-3 px-4 font-medium w-[100px]">Value</th>
        <th className="py-3 px-4 font-medium w-[120px]">Uses</th>
        <th className="py-3 px-4 font-medium w-[100px]">Status</th>
        <th className="py-3 px-4 font-medium w-[120px]">Created</th>
      </tr>
    </thead>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="h-5 bg-white/5 rounded animate-pulse w-32" />
          <div className="h-5 bg-white/5 rounded-full animate-pulse w-14" />
        </div>
      </td>
      <td className="py-3 px-4 w-[140px]">
        <div className="h-8 bg-white/5 rounded animate-pulse w-24" />
      </td>
      <td className="py-3 px-4 w-[100px]">
        <div className="h-4 bg-white/5 rounded animate-pulse w-10" />
      </td>
      <td className="py-3 px-4 w-[120px]">
        <div className="h-4 bg-white/5 rounded animate-pulse w-16" />
      </td>
      <td className="py-3 px-4 w-[100px]">
        <div className="h-5 bg-white/5 rounded-full animate-pulse w-16" />
      </td>
      <td className="py-3 px-4 w-[120px]">
        <div className="h-4 bg-white/5 rounded animate-pulse w-20" />
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

function CodeRow({ code }: { code: RedeemCode }) {
  const status = getCodeStatus(code);
  const config = statusConfig[status];
  const usesDisplay =
    code.max_uses !== null ? `${code.uses_count}/${code.max_uses}` : `${code.uses_count}`;
  const usesPercent =
    code.max_uses !== null && code.max_uses > 0
      ? Math.min((code.uses_count / code.max_uses) * 100, 100)
      : 0;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code.code);
      toast.success('Code copied to clipboard');
      posthog.capture(AnalyticsEvent.STUDIO_CODE_SHARED, { code: code.code, method: 'copy_code' });
    } catch {
      toast.error('Failed to copy code');
    }
  };

  const handleCopyShareUrl = async () => {
    const url = `${window.location.origin}/redeem?code=${code.code}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Share URL copied to clipboard');
      posthog.capture(AnalyticsEvent.STUDIO_CODE_SHARED, { code: code.code, method: 'copy_url' });
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  return (
    <tr className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono text-text-primary">{code.code}</code>
          <span
            className={cn(
              'text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase',
              code.type === 'gift'
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-blue-500/20 text-blue-400'
            )}
          >
            {code.type}
          </span>
        </div>
        {code.description && (
          <p className="text-xs text-text-tertiary mt-0.5 truncate max-w-[250px]">
            {code.description}
          </p>
        )}
      </td>
      <td className="py-3 px-4 w-[140px]">
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCopyCode}
                className="text-text-secondary hover:text-primary"
              >
                <Clipboard className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy code</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCopyShareUrl}
                className="text-text-secondary hover:text-primary"
              >
                <Link2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy share URL</TooltipContent>
          </Tooltip>

          {/* TODO: re-enable Edit, Deactivate, Delete actions */}
        </div>
      </td>
      <td className="py-3 px-4 w-[100px]">
        <span className="text-sm text-text-secondary">{code.value}d</span>
      </td>
      <td className="py-3 px-4 w-[120px]">
        <div className="space-y-1">
          <span className="text-sm text-text-secondary">{usesDisplay}</span>
          {code.max_uses !== null && (
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-primary rounded-full transition-all"
                style={{ width: `${usesPercent}%` }}
              />
            </div>
          )}
        </div>
      </td>
      <td className="py-3 px-4 w-[100px]">
        <span className={cn('text-xs px-2 py-1 rounded-full font-medium', config.className)}>
          {config.label}
        </span>
      </td>
      <td className="py-3 px-4 w-[120px]">
        <span className="text-sm text-text-secondary">
          {new Date(code.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </td>
    </tr>
  );
}

export function CodesTable({ items, isLoading, pagination, onPageChange }: CodesTableProps) {
  if (isLoading) {
    return (
      <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <TableHeader />
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} />
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
            {items.map((code) => (
              <CodeRow key={code.id} code={code} />
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
