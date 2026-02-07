'use client';

import { useState } from 'react';
import { Gift, ChevronDown, Loader2 } from 'lucide-react';
import { subscriptionsClient as subscriptionsApi } from '@/api/client/subscriptions.client';
import type { Plan } from '@/types';

interface RedeemCodeCardProps {
  onSubscribed?: () => void;
  onStartVerifying?: () => void;
  /** When true, renders as a standalone card. When false, renders inline. */
  variant?: 'card' | 'inline';
}

export function RedeemCodeCard({
  onSubscribed,
  onStartVerifying,
  variant = 'inline',
}: RedeemCodeCardProps) {
  const [showRedeemCode, setShowRedeemCode] = useState(variant === 'card');
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemValidated, setRedeemValidated] = useState<Plan | null>(null);

  const handleValidate = async () => {
    if (!redeemCode.trim()) return;
    setRedeemLoading(true);
    setRedeemError(null);
    setRedeemValidated(null);
    try {
      const result = await subscriptionsApi.validateRedeemCode(redeemCode.trim());
      if (result.valid && result.plan) {
        setRedeemValidated(result.plan);
      } else {
        setRedeemError(result.message || 'Invalid redeem code');
      }
    } catch {
      setRedeemError('Failed to validate code. Please try again.');
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleApply = async () => {
    if (!redeemCode.trim()) return;
    setRedeemLoading(true);
    setRedeemError(null);
    try {
      const result = await subscriptionsApi.applyRedeemCode(redeemCode.trim());
      if (result.subscribed) {
        onSubscribed?.();
      } else {
        onStartVerifying?.();
      }
    } catch {
      setRedeemError('Failed to apply code. Please try again.');
    } finally {
      setRedeemLoading(false);
    }
  };

  if (variant === 'card') {
    return (
      <div
        className="rounded-2xl p-6 backdrop-blur-xl"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-primary/10 rounded-lg">
            <Gift className="w-5 h-5 text-red-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Redeem Code</h3>
            <p className="text-xs text-text-secondary">Have a code? Activate your subscription.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={redeemCode}
            onChange={(e) => {
              setRedeemCode(e.target.value);
              setRedeemError(null);
              setRedeemValidated(null);
            }}
            placeholder="Enter redeem code"
            className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder:text-text-secondary outline-none transition-all focus:[border-color:var(--red-primary)]"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          />
          {!redeemValidated ? (
            <button
              onClick={handleValidate}
              disabled={redeemLoading || !redeemCode.trim()}
              className="px-5 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-colors"
              style={{
                background: redeemCode.trim() ? 'var(--red-primary)' : 'rgba(255,255,255,0.1)',
              }}
            >
              {redeemLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Validate'}
            </button>
          ) : (
            <button
              onClick={handleApply}
              disabled={redeemLoading}
              className="px-5 py-3 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: '#22c55e' }}
            >
              {redeemLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
            </button>
          )}
        </div>

        {redeemError && <p className="mt-2 text-xs text-red-primary">{redeemError}</p>}
        {redeemValidated && (
          <p className="mt-2 text-xs text-green-500">
            Valid code for: {redeemValidated.name}. Click Apply to activate.
          </p>
        )}
      </div>
    );
  }

  // Inline variant (for choose-plan page)
  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={() => setShowRedeemCode(!showRedeemCode)}
        className="flex items-center gap-2 mx-auto text-sm"
        style={{
          color: 'rgba(255,255,255,0.5)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <Gift style={{ width: 14, height: 14 }} />
        <span>Have a redeem code?</span>
        <ChevronDown
          style={{
            width: 14,
            height: 14,
            transition: 'transform 0.2s',
            transform: showRedeemCode ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      {showRedeemCode && (
        <div style={{ marginTop: 12 }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={redeemCode}
              onChange={(e) => {
                setRedeemCode(e.target.value);
                setRedeemError(null);
                setRedeemValidated(null);
              }}
              placeholder="Enter code"
              className="flex-1 px-3 py-2 rounded-lg text-sm"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                outline: 'none',
              }}
            />
            {!redeemValidated ? (
              <button
                onClick={handleValidate}
                disabled={redeemLoading || !redeemCode.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: 'none',
                  cursor: redeemCode.trim() ? 'pointer' : 'not-allowed',
                  opacity: redeemCode.trim() ? 1 : 0.5,
                }}
              >
                {redeemLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Validate'}
              </button>
            ) : (
              <button
                onClick={handleApply}
                disabled={redeemLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  background: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {redeemLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
              </button>
            )}
          </div>
          {redeemError && (
            <p style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>{redeemError}</p>
          )}
          {redeemValidated && (
            <p style={{ color: '#22c55e', fontSize: 12, marginTop: 8 }}>
              Valid code for: {redeemValidated.name}. Click Apply to activate.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
