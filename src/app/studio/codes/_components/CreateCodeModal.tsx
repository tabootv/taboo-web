'use client';

import { Button } from '@/components/ui/button';
import type { RedeemCodeLimits } from '@/api/client/redeem-codes.client';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface CreateCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCodeFormData) => Promise<void>;
  limits: RedeemCodeLimits | undefined;
}

export interface CreateCodeFormData {
  type: 'gift' | 'invite';
  value: number;
  max_uses: number;
  quantity: number;
  description: string;
  expiry_date: string;
  start_date: string;
  redirect_url: string;
}

export function CreateCodeModal({ isOpen, onClose, onSubmit, limits }: CreateCodeModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<CreateCodeFormData>({
    type: 'gift',
    value: 30,
    max_uses: 1,
    quantity: 1,
    description: '',
    expiry_date: '',
    start_date: '',
    redirect_url: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setForm({
        type: 'gift',
        value: 30,
        max_uses: 1,
        quantity: 1,
        description: '',
        expiry_date: '',
        start_date: '',
        redirect_url: '',
      });
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const isMultiUse = form.max_uses > 1;
  const isSingleUse = form.max_uses === 1;

  const singleRemaining = limits?.singleUse.remaining ?? 0;
  const multiRemaining = limits?.multiUse.remaining ?? 0;
  const currentRemaining = isMultiUse ? multiRemaining : singleRemaining;

  const isValueValid = form.value >= 1 && form.value <= 365;
  const isMaxUsesValid = form.max_uses >= 1 && form.max_uses <= 100;
  const isQuantityValid = !isSingleUse || (form.quantity >= 1 && form.quantity <= 10);
  const isExpiryValid = !form.expiry_date || new Date(form.expiry_date) > new Date();
  const isStartValid =
    !form.start_date || new Date(form.start_date) >= new Date(Date.now() - 60000);
  const isDescValid = form.description.length <= 255;
  const isUrlValid = form.redirect_url.length <= 255;

  const hasQuota = !limits || currentRemaining > 0;

  const isFormValid =
    isValueValid &&
    isMaxUsesValid &&
    isQuantityValid &&
    isExpiryValid &&
    isStartValid &&
    isDescValid &&
    isUrlValid &&
    hasQuota;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const dialogContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-lg bg-surface border border-white/10 rounded-xl shadow-2xl flex flex-col max-h-[85vh]">
        <h2 className="text-lg font-semibold text-text-primary p-6 pb-0">Create Redeem Code</h2>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-6 pt-4">
          {/* Type */}
          <fieldset>
            <legend className="text-sm font-medium text-text-secondary mb-2">Code Type</legend>
            <div className="flex gap-3">
              {(['gift', 'invite'] as const).map((t) => (
                <label
                  key={t}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                    form.type === t
                      ? 'border-red-primary bg-red-primary/10 text-text-primary'
                      : 'border-white/10 text-text-secondary hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={form.type === t}
                    onChange={() => setForm((f) => ({ ...f, type: t }))}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium capitalize">{t}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Value */}
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-1">
              Value (days)
            </label>
            <input
              type="number"
              min={1}
              max={365}
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: parseInt(e.target.value) || 0 }))}
              className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-red-primary"
            />
            {!isValueValid && (
              <p className="text-xs text-red-400 mt-1">Must be between 1 and 365</p>
            )}
          </div>

          {/* Max Uses */}
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-1">
              Max uses <span className="text-text-tertiary">(1 = single-use, 2+ = multi-use)</span>
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={form.max_uses}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  max_uses: parseInt(e.target.value) || 1,
                  quantity: parseInt(e.target.value) > 1 ? 1 : f.quantity,
                }))
              }
              className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-red-primary"
            />
          </div>

          {/* Quantity (single-use only) */}
          {isSingleUse && (
            <div>
              <label className="text-sm font-medium text-text-secondary block mb-1">
                Quantity <span className="text-text-tertiary">(batch create 1-10 codes)</span>
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.quantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantity: parseInt(e.target.value) || 1 }))
                }
                className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-red-primary"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-1">
              Description <span className="text-text-tertiary">(optional)</span>
            </label>
            <input
              type="text"
              maxLength={255}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Giveaway code for Twitter"
              className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-red-primary"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-1">
              Expiry date <span className="text-text-tertiary">(optional)</span>
            </label>
            <input
              type="datetime-local"
              value={form.expiry_date}
              onChange={(e) => setForm((f) => ({ ...f, expiry_date: e.target.value }))}
              className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-text-primary focus:outline-none focus:border-red-primary [color-scheme:dark]"
            />
            {form.expiry_date && !isExpiryValid && (
              <p className="text-xs text-red-400 mt-1">Must be a future date</p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-1">
              Start date <span className="text-text-tertiary">(optional)</span>
            </label>
            <input
              type="datetime-local"
              value={form.start_date}
              onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-text-primary focus:outline-none focus:border-red-primary [color-scheme:dark]"
            />
          </div>

          {/* Redirect URL */}
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-1">
              Redirect URL <span className="text-text-tertiary">(optional)</span>
            </label>
            <input
              type="url"
              maxLength={255}
              value={form.redirect_url}
              onChange={(e) => setForm((f) => ({ ...f, redirect_url: e.target.value }))}
              placeholder="https://..."
              className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-red-primary"
            />
          </div>

          {/* Remaining quota */}
          <p
            className={`text-xs ${currentRemaining <= 2 ? 'text-amber-400' : 'text-text-tertiary'}`}
          >
            {currentRemaining} {isMultiUse ? 'multi-use' : 'single-use'} code
            {currentRemaining !== 1 ? 's' : ''} remaining
            {isMultiUse
              ? ` this ${limits?.multiUse.period ?? 'month'}`
              : ` this ${limits?.singleUse.period ?? 'week'}`}
          </p>
        </form>

        {/* Sticky footer */}
        <div className="flex justify-end gap-3 p-6 pt-4 border-t border-white/10 shrink-0">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="bg-red-primary hover:bg-red-primary/90 min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              'Create Code'
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}
