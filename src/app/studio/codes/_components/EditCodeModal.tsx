'use client';

import { Button } from '@/components/ui/button';
import type { RedeemCode } from '@/api/client/redeem-codes.client';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface EditCodeModalProps {
  isOpen: boolean;
  code: RedeemCode | null;
  onClose: () => void;
  onSubmit: (code: string, payload: { code?: string; expiry_date?: string }) => Promise<void>;
}

export function EditCodeModal({ isOpen, code, onClose, onSubmit }: EditCodeModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeValue, setCodeValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (code && isOpen) {
      setCodeValue(code.code);
      setExpiryDate(code.expiry_date ? new Date(code.expiry_date).toISOString().slice(0, 16) : '');
    }
  }, [code, isOpen]);

  if (!isOpen || !mounted || !code) return null;

  const isExpiryValid = !expiryDate || new Date(expiryDate) > new Date();
  const hasChanges =
    codeValue !== code.code ||
    expiryDate !== (code.expiry_date ? new Date(code.expiry_date).toISOString().slice(0, 16) : '');
  const isFormValid = isExpiryValid && hasChanges && codeValue.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);

    const payload: { code?: string; expiry_date?: string } = {};
    if (codeValue !== code.code) payload.code = codeValue.toUpperCase();
    const originalExpiry = code.expiry_date
      ? new Date(code.expiry_date).toISOString().slice(0, 16)
      : '';
    if (expiryDate !== originalExpiry) {
      if (expiryDate) payload.expiry_date = expiryDate;
    }

    try {
      await onSubmit(code.code, payload);
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
      <div className="relative z-10 w-full max-w-md bg-surface border border-white/10 rounded-xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Edit Code</h2>

        {/* Read-only info */}
        <div className="grid grid-cols-3 gap-3 mb-4 bg-white/5 rounded-lg p-3">
          <div>
            <p className="text-xs text-text-tertiary">Type</p>
            <p className="text-sm text-text-primary capitalize">{code.type}</p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary">Value</p>
            <p className="text-sm text-text-primary">{code.value} days</p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary">Uses</p>
            <p className="text-sm text-text-primary">
              {code.uses_count}
              {code.max_uses !== null ? `/${code.max_uses}` : ''}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code string */}
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-1">Code</label>
            <input
              type="text"
              value={codeValue}
              onChange={(e) => setCodeValue(e.target.value.toUpperCase())}
              className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-red-primary"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-1">
              Expiry date
            </label>
            <input
              type="datetime-local"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-text-primary focus:outline-none focus:border-red-primary [color-scheme:dark]"
            />
            {expiryDate && !isExpiryValid && (
              <p className="text-xs text-red-400 mt-1">Must be a future date</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="bg-red-primary hover:bg-red-primary/90 min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}
