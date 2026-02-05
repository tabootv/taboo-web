'use client';

import { cn } from '@/shared/utils/formatting';
import { Check } from 'lucide-react';
import type { ModalStep } from '../types';

interface StepIndicatorProps {
  steps: { id: ModalStep; label: string }[];
  currentStep: ModalStep;
  onStepClick: (stepId: ModalStep) => void;
}

/**
 * Wizard step indicator with navigation
 */
export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: StepIndicatorProps): React.ReactNode {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="px-6 py-4 border-b border-white/10">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isPast = currentIndex > index;
          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => onStepClick(step.id)}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors',
                  isActive && 'border-red-primary bg-red-primary text-white',
                  isPast && 'border-red-primary bg-transparent text-red-primary',
                  !isActive && !isPast && 'border-white/20 text-text-tertiary'
                )}
              >
                {isPast ? <Check className="w-4 h-4" /> : index + 1}
              </button>
              <span
                className={cn(
                  'ml-2 text-sm',
                  isActive ? 'text-text-primary' : 'text-text-tertiary'
                )}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={cn('flex-1 h-0.5 mx-4', isPast ? 'bg-red-primary' : 'bg-white/10')}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
