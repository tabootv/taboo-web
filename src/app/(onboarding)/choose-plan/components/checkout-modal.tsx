'use client';

import { WhopCheckoutEmbed } from '@whop/checkout/react';
import { X } from 'lucide-react';
import { MUTED_TEXT_LIGHT, MUTED_TEXT_LIGHTER, SURFACE_BG, TRANSITION_ALL } from '../utils';

interface CheckoutModalProps {
  planId: string;
  planLabel: string;
  returnUrl: string;
  affiliateCode?: string | undefined;
  email?: string | undefined;
  disableEmail: boolean;
  onClose: () => void;
  onComplete: (planId: string, receiptId: string) => void;
}

export function CheckoutModal({
  planId,
  planLabel,
  returnUrl,
  affiliateCode,
  email,
  disableEmail,
  onClose,
  onComplete,
}: CheckoutModalProps) {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}
      />
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          borderRadius: 16,
          border: `1px solid ${SURFACE_BG}`,
        }}
      >
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>Complete Your Purchase</h2>
            <p style={{ fontSize: 13, color: MUTED_TEXT_LIGHT }}>{planLabel} Plan</p>
          </div>
          <button
            onClick={onClose}
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
        <div className="p-4 min-h-[500px]">
          <WhopCheckoutEmbed
            planId={planId}
            returnUrl={returnUrl}
            theme="dark"
            themeOptions={{ accentColor: 'red' }}
            onComplete={(planId: string, receiptId?: string) => onComplete(planId, receiptId ?? '')}
            skipRedirect
            {...(affiliateCode ? { affiliateCode } : {})}
            {...(email
              ? { prefill: { email }, ...(disableEmail ? { disableEmail: true } : {}) }
              : {})}
            fallback={
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-elevated border-t-red-primary animate-spin" />
                  <p style={{ fontSize: 13, color: MUTED_TEXT_LIGHT }}>Loading checkout...</p>
                </div>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
