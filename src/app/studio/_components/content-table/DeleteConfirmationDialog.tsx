'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  type: 'video' | 'short' | 'post';
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  type,
}: DeleteConfirmationDialogProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!isChecked) return;
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
      setIsChecked(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setIsChecked(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md bg-surface border border-white/10 rounded-xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Delete {type === 'video' ? 'video' : 'short'} permanently?
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              &quot;{title}&quot; will be permanently deleted along with all of its analytics data,
              comments, and likes.
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-400">This action cannot be undone.</p>
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 mb-6 cursor-pointer group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              disabled={isDeleting}
              className="sr-only peer"
            />
            <div className="w-5 h-5 border-2 border-white/30 rounded peer-checked:bg-red-primary peer-checked:border-red-primary transition-colors">
              {isChecked && (
                <svg
                  className="w-full h-full text-white p-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
            I understand that deleting this {type} is permanent and cannot be recovered
          </span>
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isChecked || isDeleting}
            className="min-w-[100px]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Inline delete confirmation for table row dropdown
interface InlineDeleteConfirmProps {
  trigger: React.ReactNode;
  title: string;
  type: 'video' | 'short' | 'post';
  onConfirm: () => Promise<void>;
}

export function InlineDeleteConfirm({ trigger, title, type, onConfirm }: InlineDeleteConfirmProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'trigger' | 'confirm'>('trigger');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      setIsOpen(false);
      setStep('trigger');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setStep('trigger');
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-3">
        {step === 'trigger' ? (
          <div className="space-y-3">
            <p className="text-sm text-text-primary font-medium">Delete this {type}?</p>
            <p className="text-xs text-text-secondary line-clamp-2">&quot;{title}&quot;</p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setStep('confirm')}>
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-400 font-medium">Are you sure?</p>
            <p className="text-xs text-text-secondary">
              This will permanently delete the {type} and all associated data.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setStep('trigger')}>
                Go back
              </Button>
              <Button variant="destructive" size="sm" onClick={handleConfirm} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm delete'}
              </Button>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
