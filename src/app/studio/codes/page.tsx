'use client';

import { useCreateRedeemCode } from '@/api/mutations/redeem-codes.mutations';
import { useRedeemCodes } from '@/api/queries/redeem-codes.queries';
import type { RedeemCodeLimits } from '@/api/client/redeem-codes.client';
import { Button } from '@/components/ui/button';
import { useFeature } from '@/hooks/use-feature';
import { AnalyticsEvent } from '@/shared/lib/analytics/events';
import { cn } from '@/shared/utils/formatting';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CodesTable } from './_components/CodesTable';
import { CreateCodeModal, type CreateCodeFormData } from './_components/CreateCodeModal';

type FilterTab = 'all' | 'single' | 'multi';

function LimitsBar({ limits }: { limits: RedeemCodeLimits | undefined }) {
  if (!limits) return null;

  const { singleUse, multiUse } = limits;
  const singlePercent =
    singleUse.max > 0 ? ((singleUse.max - singleUse.remaining) / singleUse.max) * 100 : 0;
  const multiPercent =
    multiUse.max > 0 ? ((multiUse.max - multiUse.remaining) / multiUse.max) * 100 : 0;

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2">
        <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-primary rounded-full transition-all"
            style={{ width: `${singlePercent}%` }}
          />
        </div>
        <span
          className={cn(
            'text-xs whitespace-nowrap',
            singleUse.remaining <= 2 ? 'text-amber-400' : 'text-text-secondary'
          )}
        >
          {singleUse.remaining} of {singleUse.max} single-use remaining this {singleUse.period}
        </span>
      </div>
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2">
        <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-primary rounded-full transition-all"
            style={{ width: `${multiPercent}%` }}
          />
        </div>
        <span
          className={cn(
            'text-xs whitespace-nowrap',
            multiUse.remaining <= 2 ? 'text-amber-400' : 'text-text-secondary'
          )}
        >
          {multiUse.remaining} of {multiUse.max} multi-use remaining this {multiUse.period}
        </span>
      </div>
    </div>
  );
}

function FilterTabs({
  activeTab,
  onTabChange,
  counts,
}: {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  counts: { all?: number | undefined; single?: number | undefined; multi?: number | undefined };
}) {
  const tabs: { id: FilterTab; label: string; count: number | undefined }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'single', label: 'Single-use', count: counts.single },
    { id: 'multi', label: 'Multi-use', count: counts.multi },
  ];

  return (
    <div className="flex gap-1 border-b border-white/10 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'px-4 py-3 text-sm font-medium transition-colors relative',
            activeTab === tab.id
              ? 'text-text-primary'
              : 'text-text-tertiary hover:text-text-secondary'
          )}
        >
          <span className="flex items-center gap-2">
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  activeTab === tab.id
                    ? 'bg-red-primary/20 text-red-primary'
                    : 'bg-white/10 text-text-tertiary'
                )}
              >
                {tab.count}
              </span>
            )}
          </span>
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-primary" />
          )}
        </button>
      ))}
    </div>
  );
}

function CodesPageInner() {
  const studioCodesEnabled = useFeature('STUDIO_CODES');
  const router = useRouter();

  useEffect(() => {
    if (!studioCodesEnabled) router.replace('/studio');
  }, [studioCodesEnabled, router]);

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = { page };
    if (activeTab !== 'all') params.type = activeTab;
    return params;
  }, [activeTab, page]);

  const { data, isLoading } = useRedeemCodes(
    queryParams as { page?: number; type?: 'single' | 'multi' }
  );

  const createMutation = useCreateRedeemCode();

  const codes = data?.codes ?? [];
  const pagination = data?.pagination;
  const limits = data?.limits;

  const handleCreate = useCallback(
    async (formData: CreateCodeFormData) => {
      const payload: Parameters<typeof createMutation.mutateAsync>[0] = {
        type: formData.type,
        value: formData.value,
      };
      if (formData.max_uses > 1) payload.max_uses = formData.max_uses;
      if (formData.max_uses === 1 && formData.quantity > 1) payload.quantity = formData.quantity;
      if (formData.description) payload.description = formData.description;
      if (formData.expiry_date) payload.expiry_date = new Date(formData.expiry_date).toISOString();
      if (formData.start_date) payload.start_date = new Date(formData.start_date).toISOString();
      if (formData.redirect_url) payload.redirect_url = formData.redirect_url;

      await createMutation.mutateAsync(payload);

      const count = formData.max_uses === 1 ? formData.quantity : 1;
      toast.success(`${count} code${count > 1 ? 's' : ''} created`);
      posthog.capture(AnalyticsEvent.STUDIO_CODE_CREATED, {
        type: formData.type,
        value: formData.value,
        max_uses: formData.max_uses,
        quantity: count,
      });
      setShowCreateModal(false);
    },
    [createMutation]
  );

  // TODO: re-enable edit, deactivate, and delete handlers

  if (!studioCodesEnabled) return null;

  return (
    <div>
      {/* Create Modal */}
      <CreateCodeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        limits={limits}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-text-tertiary">Creator studio</p>
          <h1 className="text-3xl font-bold text-text-primary">Redeem Codes</h1>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-red-primary hover:bg-red-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Code
        </Button>
      </div>

      {/* Limits Bar */}
      <LimitsBar limits={limits} />

      {/* Filter Tabs */}
      <FilterTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{
          all: pagination?.total,
        }}
      />

      {/* Table */}
      <CodesTable
        items={codes}
        isLoading={isLoading}
        pagination={
          pagination
            ? {
                currentPage: pagination.current_page,
                lastPage: pagination.last_page,
                total: pagination.total,
                perPage: pagination.per_page,
              }
            : undefined
        }
        onPageChange={setPage}
      />
    </div>
  );
}

export default function CodesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CodesPageInner />
    </Suspense>
  );
}
