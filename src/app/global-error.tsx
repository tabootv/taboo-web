'use client';

/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-page-custom-font */

import { useState } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const correlationIds = [
    error.digest && `Request ID: ${error.digest}`,
    process.env.NEXT_PUBLIC_BUILD_ID && `Build: ${process.env.NEXT_PUBLIC_BUILD_ID}`,
  ].filter(Boolean);

  const handleCopy = async () => {
    const text = correlationIds.join('\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Something went wrong | TabooTV</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
              body {
                font-family: 'Figtree', system-ui, -apple-system, sans-serif;
                background: #000000;
                color: #e6e7ea;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 48px 16px;
                position: relative;
                overflow-x: hidden;
              }
              .glow {
                position: absolute;
                top: 33%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 600px;
                height: 400px;
                background: radial-gradient(ellipse at center, rgba(171, 0, 19, 0.08) 0%, transparent 70%);
                pointer-events: none;
              }
              .logo {
                position: relative;
                z-index: 1;
                margin-bottom: 32px;
                font-size: 28px;
                font-weight: 700;
                letter-spacing: -0.5px;
                color: #e6e7ea;
                text-decoration: none;
                display: inline-block;
              }
              .logo-tv { color: #ab0013; }
              .card {
                position: relative;
                z-index: 1;
                width: 100%;
                max-width: 448px;
                background: #0d0d0d;
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
              }
              @media (min-width: 640px) { .card { padding: 32px; } }
              .icon-wrap {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: rgba(171, 0, 19, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
              }
              .icon-wrap svg { width: 24px; height: 24px; color: #ab0013; }
              h1 {
                font-size: 20px;
                font-weight: 600;
                text-align: center;
                margin-bottom: 8px;
              }
              .desc {
                font-size: 14px;
                color: #9aa0a6;
                text-align: center;
                margin-bottom: 24px;
                line-height: 1.5;
              }
              .ids-box {
                background: #1a1a1a;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
              }
              .ids-text {
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                font-size: 12px;
                color: #6b7280;
                min-width: 0;
              }
              .ids-text div {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              .ids-text div + div { margin-top: 2px; }
              .copy-btn {
                flex-shrink: 0;
                background: none;
                border: none;
                padding: 6px;
                border-radius: 6px;
                color: #6b7280;
                cursor: pointer;
                transition: color 0.15s, background 0.15s;
                font-size: 12px;
                font-family: inherit;
              }
              .copy-btn:hover { color: #e6e7ea; background: rgba(255,255,255,0.05); }
              .copy-btn svg { width: 14px; height: 14px; }
              .actions {
                display: flex;
                gap: 12px;
              }
              .btn {
                flex: 1;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 0 16px;
                height: 36px;
                font-size: 14px;
                font-weight: 500;
                font-family: inherit;
                border-radius: 6px;
                cursor: pointer;
                transition: background 0.15s, opacity 0.15s;
                text-decoration: none;
                border: none;
              }
              .btn svg { width: 16px; height: 16px; }
              .btn-primary {
                background: #ab0013;
                color: #ffffff;
                border: none;
              }
              .btn-primary:hover { background: #8a0010; }
              .btn-outline {
                background: transparent;
                color: #e6e7ea;
                border: 1px solid rgba(255, 255, 255, 0.06);
              }
              .btn-outline:hover { background: rgba(255, 255, 255, 0.05); }
              .details-toggle {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-top: 20px;
                background: none;
                border: none;
                color: #6b7280;
                font-size: 12px;
                font-family: inherit;
                cursor: pointer;
                padding: 0;
                transition: color 0.15s;
              }
              .details-toggle:hover { color: #9aa0a6; }
              .details-toggle svg { width: 14px; height: 14px; transition: transform 0.2s; }
              .details-toggle[data-open="true"] svg { transform: rotate(180deg); }
              .details-content {
                margin-top: 8px;
                background: #1a1a1a;
                border-radius: 8px;
                padding: 12px;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                font-size: 12px;
                color: #6b7280;
                word-break: break-word;
                display: none;
              }
              .details-content.open { display: block; }
              .footnote {
                position: relative;
                z-index: 1;
                margin-top: 24px;
                font-size: 12px;
                color: #6b7280;
                text-align: center;
              }
              .footnote a {
                color: #9aa0a6;
                text-decoration: underline;
                text-underline-offset: 2px;
                transition: color 0.15s;
              }
              .footnote a:hover { color: #e6e7ea; }
            `,
          }}
        />
      </head>
      <body>
        <div className="glow" />

        {/* Text Logo */}
        <a href="/" className="logo">
          Taboo<span className="logo-tv">TV</span>
        </a>

        {/* Card */}
        <div className="card">
          {/* Icon */}
          <div className="icon-wrap">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>

          <h1>Something went wrong</h1>
          <p className="desc">
            We hit an unexpected error. You can try again or head back to the homepage.
          </p>

          {/* Correlation IDs */}
          {correlationIds.length > 0 && (
            <div className="ids-box">
              <div className="ids-text">
                {correlationIds.map((id) => (
                  <div key={id}>{id}</div>
                ))}
              </div>
              <button onClick={handleCopy} className="copy-btn" aria-label="Copy error IDs">
                {copied ? (
                  'Copied!'
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                )}
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="actions">
            <button onClick={reset} className="btn btn-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              Try Again
            </button>
            <a href="/" className="btn btn-outline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Back to Home
            </a>
          </div>

          {/* Collapsible details */}
          {error.message && <DetailsSection message={error.message} />}
        </div>

        <p className="footnote">
          If the issue persists, contact <a href="mailto:support@taboo.tv">support@taboo.tv</a>
        </p>
      </body>
    </html>
  );
}

function DetailsSection({ message }: { message: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="details-toggle" data-open={open} onClick={() => setOpen(!open)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
        Technical details
      </button>
      <div className={`details-content${open ? ' open' : ''}`}>{message}</div>
    </>
  );
}
