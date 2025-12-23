import React from 'react';

interface HighlightOptions {
  className?: string;
  caseSensitive?: boolean;
}

/**
 * Highlights matching substrings in text with <mark> elements
 * Returns React nodes with highlighted portions
 */
export function highlightMatch(
  text: string,
  query: string,
  options: HighlightOptions = {}
): React.ReactNode {
  const { className = 'bg-red-primary/30 text-text-primary rounded px-0.5', caseSensitive = false } =
    options;

  if (!query.trim()) {
    return text;
  }

  const flags = caseSensitive ? 'g' : 'gi';
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, flags);
  const parts = text.split(regex);

  if (parts.length === 1) {
    return text;
  }

  return (
    <>
      {parts.map((part, index) => {
        const isMatch = caseSensitive
          ? part === query
          : part.toLowerCase() === query.toLowerCase();

        if (isMatch) {
          return (
            <mark key={index} className={className}>
              {part}
            </mark>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

/**
 * Simple version that returns HTML string (for dangerouslySetInnerHTML)
 */
export function highlightMatchHTML(
  text: string,
  query: string,
  highlightClass: string = 'bg-red-primary/30 rounded px-0.5'
): string {
  if (!query.trim()) {
    return text;
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');

  return text.replace(regex, `<mark class="${highlightClass}">$1</mark>`);
}
