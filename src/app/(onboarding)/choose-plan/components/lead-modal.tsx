'use client';

import { useState } from 'react';
import { Loader2, Mail, X } from 'lucide-react';
import { MUTED_TEXT_LIGHT, MUTED_TEXT_LIGHTER, SURFACE_BG, TRANSITION_ALL } from '../utils';

interface LeadModalProps {
  onSubmit: (email: string) => void;
  onClose: () => void;
  isLoading: boolean;
}

export function LeadModal({ onSubmit, onClose, isLoading }: LeadModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError('Please enter your email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }

    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          borderRadius: 16,
          border: `1px solid ${SURFACE_BG}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>Enter your email</h2>
            <p style={{ fontSize: 13, color: MUTED_TEXT_LIGHT }}>to continue to checkout</p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex items-center justify-center"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer',
              transition: TRANSITION_ALL,
            }}
          >
            <X style={{ width: 18, height: 18, color: MUTED_TEXT_LIGHTER }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-4">
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ width: 18, height: 18, color: MUTED_TEXT_LIGHT }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="you@example.com"
                disabled={isLoading}
                autoFocus
                className="w-full pl-10 pr-4 py-3 rounded-xl text-base text-white placeholder:text-text-secondary transition-all outline-none focus:[background:rgba(255,255,255,0.08)] focus:[border-color:var(--red-primary)] focus:[box-shadow:0_0_0_2px_rgba(171,0,19,0.2)]"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </div>
            {error && <p className="mt-2 text-xs text-red-primary">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
            style={{
              padding: '12px 24px',
              background: '#ab0013',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 8,
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            {isLoading ? (
              <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" />
            ) : (
              <span>Continue to checkout</span>
            )}
          </button>

          <p
            className="text-center"
            style={{ color: MUTED_TEXT_LIGHT, fontSize: 12, marginTop: 12 }}
          >
            We&apos;ll create your account after payment.
          </p>
        </form>
      </div>
    </div>
  );
}
