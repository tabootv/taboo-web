'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface DeleteAllConfirmationProps {
  onConfirm: () => void;
  disabled?: boolean;
}

export function DeleteAllConfirmation({ onConfirm, disabled }: DeleteAllConfirmationProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (showConfirmation) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-secondary">Delete all?</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowConfirmation(false)}
          className="text-text-secondary hover:text-text-primary"
        >
          Cancel
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onConfirm();
            setShowConfirmation(false);
          }}
          disabled={disabled}
          className="text-red-500 hover:text-red-400"
        >
          Confirm
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowConfirmation(true)}
      disabled={disabled}
      className="text-red-500 hover:text-red-400"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      Clear all
    </Button>
  );
}
