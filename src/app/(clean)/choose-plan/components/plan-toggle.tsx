'use client';

import { SURFACE_BG, MUTED_TEXT_LIGHT, TRANSITION_ALL } from '../utils';

interface PlanToggleProps {
  selectedPlan: 'monthly' | 'yearly';
  onSelect: (plan: 'monthly' | 'yearly') => void;
  yearlySavings: number;
}

export function PlanToggle({ selectedPlan, onSelect, yearlySavings }: PlanToggleProps) {
  return (
    <div className="flex items-center justify-center gap-2" style={{ marginBottom: 16 }}>
      <button
        onClick={() => onSelect('monthly')}
        style={{
          padding: '10px 20px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
          transition: TRANSITION_ALL,
          background: selectedPlan === 'monthly' ? '#fff' : SURFACE_BG,
          color: selectedPlan === 'monthly' ? '#000' : MUTED_TEXT_LIGHT,
        }}
      >
        Monthly
      </button>
      <button
        onClick={() => onSelect('yearly')}
        className="relative"
        style={{
          padding: '10px 20px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
          transition: TRANSITION_ALL,
          background: selectedPlan === 'yearly' ? '#fff' : SURFACE_BG,
          color: selectedPlan === 'yearly' ? '#000' : MUTED_TEXT_LIGHT,
        }}
      >
        Yearly
        <span
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            padding: '2px 6px',
            background: '#22c55e',
            color: '#fff',
            fontSize: 10,
            fontWeight: 600,
            borderRadius: 10,
          }}
        >
          -{yearlySavings}%
        </span>
      </button>
    </div>
  );
}
