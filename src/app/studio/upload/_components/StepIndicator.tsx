'use client';

import { Check } from 'lucide-react';
import { cn } from '@/shared/utils/formatting';
import type { StepConfig } from '../_config/types';

interface StepIndicatorProps {
  steps: StepConfig[];
  currentStep: number;
  completedSteps: Set<string>;
  onStepClick?: (stepIndex: number) => void;
}

/**
 * Progress indicator showing all steps with current/completed state
 * Supports clickable navigation for completed steps
 */
export function StepIndicator({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.has(step.id);
        const isCurrent = index === currentStep;
        const isClickable = onStepClick && (isCompleted || index < currentStep);

        return (
          <div key={step.id} className="flex items-center">
            <button
              type="button"
              onClick={() => isClickable && onStepClick?.(index)}
              disabled={!isClickable}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all',
                isCompleted && 'bg-red-primary text-white',
                isCurrent &&
                  !isCompleted &&
                  'bg-red-primary/20 text-red-primary border-2 border-red-primary',
                !isCurrent && !isCompleted && 'bg-surface border border-border text-text-tertiary',
                isClickable && 'cursor-pointer hover:scale-105',
                !isClickable && 'cursor-default'
              )}
              title={step.title}
              aria-label={`Step ${index + 1}: ${step.title}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
            </button>

            {/* Connector line between steps */}
            {index < steps.length - 1 && (
              <div className={cn('w-8 h-0.5 mx-1', isCompleted ? 'bg-red-primary' : 'bg-border')} />
            )}
          </div>
        );
      })}
    </div>
  );
}
