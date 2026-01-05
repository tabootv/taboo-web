'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RailRowProps {
  title: string;
  href?: string;
  children: React.ReactNode;
  cardWidth?: number; // Width of each card in pixels (desktop)
  cardWidthMobile?: number; // Width of each card in pixels (mobile)
  gap?: number; // Gap between cards in pixels
  fullBleed?: boolean; // Allow rail to stretch edge-to-edge
  onEndReached?: () => void; // Fetch more when near the end
  loadingMore?: boolean;
}

/**
 * Simple Netflix-style horizontal rail with reliable arrow controls.
 * - Arrows scroll by ~90% of the viewport width (or 3 cards) for predictable paging.
 * - No looping/duplication; scroll state is derived from the real content.
 */
export function RailRow({
  title,
  href,
  children,
  cardWidth = 280,
  cardWidthMobile = 200,
  gap = 16,
  fullBleed = false,
  onEndReached,
  loadingMore = false,
}: RailRowProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [cardPixelWidth, setCardPixelWidth] = useState<number | null>(null);
  const [endRequested, setEndRequested] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const childArray = React.Children.toArray(children);
  const endSpacer = Math.max(16, gap * 2);
  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    setContainerWidth(viewport.clientWidth);

    const first = track.firstElementChild as HTMLElement | null;
    if (first) {
      const width = first.getBoundingClientRect().width;
      setCardPixelWidth(width || null);
    }
  }, []);

  useEffect(() => {
    measure();
    const viewport = viewportRef.current;
    if (!viewport) return;
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(viewport);
    return () => resizeObserver.disconnect();
  }, [measure]);

  // Re-measure when children change (after data load)
  useEffect(() => {
    requestAnimationFrame(measure);
  }, [childArray.length, measure]);

  const unitWidth = React.useMemo(() => {
    const width = cardPixelWidth ?? Math.max(cardWidth, cardWidthMobile);
    return width + gap;
  }, [cardPixelWidth, cardWidth, cardWidthMobile, gap]);

  const totalWidth = React.useMemo(() => {
    if (!unitWidth || childArray.length === 0) return 0;
    return childArray.length * unitWidth - gap; // subtract trailing gap
  }, [childArray.length, unitWidth, gap]);

  const maxOffset = React.useMemo(() => {
    if (!containerWidth) return 0;
    return Math.max(0, totalWidth - containerWidth);
  }, [containerWidth, totalWidth]);

  // Move 2 cards at a time; respect maxOffset
  const stepCards = 2;
  const maxPageIndex = React.useMemo(() => {
    if (!unitWidth) return 0;
    return Math.max(0, Math.ceil(maxOffset / (stepCards * unitWidth)));
  }, [maxOffset, unitWidth]);

  useEffect(() => {
    setPageIndex((prev) => Math.min(prev, maxPageIndex));
  }, [maxPageIndex]);

  const offset = React.useMemo(() => {
    if (!unitWidth) return 0;
    const target = pageIndex * stepCards * unitWidth;
    return Math.min(target, Math.max(0, maxOffset));
  }, [pageIndex, stepCards, unitWidth, maxOffset]);

  useEffect(() => {
    setCanScrollLeft(offset > 4);
    setCanScrollRight(offset < maxOffset - 4);
  }, [offset, maxOffset]);

  // Trigger fetch-more when approaching the end (last page)
  useEffect(() => {
    if (!onEndReached || endRequested || loadingMore) return;

    const nearEndByPage = maxPageIndex > 0 && pageIndex >= maxPageIndex - 1;
    const nearEndByOffset = maxOffset > 0 && offset >= maxOffset - (unitWidth || 0);
    if (nearEndByPage || nearEndByOffset) {
      setEndRequested(true);
      onEndReached();
    }
  }, [onEndReached, pageIndex, maxPageIndex, offset, maxOffset, unitWidth, endRequested, loadingMore]);

  // Reset end request flag when new items arrive
  useEffect(() => {
    setEndRequested(false);
  }, [childArray.length]);

  const scrollByPage = useCallback((direction: 'left' | 'right') => {
    setPageIndex((prev) => {
      const next = direction === 'left' ? prev - 1 : prev + 1;
      return Math.max(0, Math.min(maxPageIndex, next));
    });
  }, [maxPageIndex]);

  const clampOffset = useCallback((value: number) => {
    return Math.max(0, Math.min(value, maxOffset));
  }, [maxOffset]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!unitWidth) return;
    e.preventDefault();
    const clientX = e.clientX;
    dragStartX.current = clientX;
    dragStartOffset.current = dragOffset ?? offset;
    setIsDragging(true);
    setDragOffset(dragStartOffset.current);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [offset, dragOffset, unitWidth]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging) return;
    const clientX = e.clientX;
    const delta = clientX - dragStartX.current;
    const next = clampOffset(dragStartOffset.current - delta);
    setDragOffset(next);
  }, [isDragging, clampOffset]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    const effectiveOffset = dragOffset ?? offset;
    const stepSize = stepCards * (unitWidth || 1);
    const nextPage = Math.round(effectiveOffset / stepSize);
    setPageIndex(Math.max(0, Math.min(maxPageIndex, nextPage)));
    setIsDragging(false);
    setDragOffset(null);
  }, [dragOffset, offset, stepCards, unitWidth, maxPageIndex, isDragging]);

  useEffect(() => {
    if (!isDragging) return;
    const move = (e: PointerEvent) => handlePointerMove(e);
    const up = () => handlePointerUp();
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up, { passive: true });
    window.addEventListener('pointercancel', up, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  return (
    <section className={`relative ${fullBleed ? '-mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {href ? (
          <a
            href={href}
            className="group flex items-center gap-2 text-lg md:text-xl font-semibold text-white hover:text-red-primary transition-colors"
          >
            {title}
            <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </a>
        ) : (
          <h2 className="text-lg md:text-xl font-semibold text-white">{title}</h2>
        )}
      </div>

      {/* Rail Container */}
      <div className="relative">
        {/* Gradient fades removed to avoid dark edge overlay */}

        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => scrollByPage('left')}
          className={`absolute left-0 top-0 bottom-0 w-10 sm:w-12 z-20 flex items-center justify-start pl-2 sm:pl-3 bg-black/40 hover:bg-black/60 text-white transition-all duration-200 ${
            canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll left"
          tabIndex={0}
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" />
        </button>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => scrollByPage('right')}
          className={`absolute right-0 top-0 bottom-0 w-10 sm:w-12 z-20 flex items-center justify-end pr-2 sm:pr-3 bg-black/40 hover:bg-black/60 text-white transition-all duration-200 ${
            canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll right"
          tabIndex={0}
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" />
        </button>

        {/* Scrollable Rail */}
        <div
          ref={viewportRef}
          className="w-full overflow-hidden px-2 sm:px-3"
          aria-label="Scrollable rail"
          role="group"
          onPointerDown={handlePointerDown}
          style={{ touchAction: 'pan-y' }}
        >
          <div
            ref={trackRef}
            className={`flex flex-nowrap ${isDragging ? '' : 'transition-transform duration-400 ease-out'}`}
            style={{
              gap: `${gap}px`,
              transform: `translateX(-${dragOffset ?? offset}px)`,
              willChange: 'transform',
              paddingRight: `${endSpacer}px`,
              ['--card-width' as string]: `${cardWidth}px`,
              ['--card-width-mobile' as string]: `${cardWidthMobile}px`,
            }}
          >
            {children}
            {loadingMore && (
              <div className="flex-shrink-0 flex items-center justify-center w-[var(--card-width-mobile)] md:w-[var(--card-width)] text-sm text-text-secondary">
                Loading...
              </div>
            )}
            <div style={{ minWidth: `${endSpacer}px`, flexShrink: 0 }} />
          </div>
        </div>
      </div>

      {/* CSS for hiding scrollbar */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
