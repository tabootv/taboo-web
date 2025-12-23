'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RailRowProps {
  title: string;
  href?: string;
  children: React.ReactNode;
  cardWidth?: number; // Width of each card in pixels (desktop)
  cardWidthMobile?: number; // Width of each card in pixels (mobile)
  gap?: number; // Gap between cards in pixels
}

export function RailRow({
  title,
  href,
  children,
  cardWidth = 280,
  cardWidthMobile = 200,
  gap = 16,
}: RailRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const updateArrows = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateArrows, { passive: true });
    updateArrows();

    // Update on resize
    const resizeObserver = new ResizeObserver(updateArrows);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', updateArrows);
      resizeObserver.disconnect();
    };
  }, [updateArrows]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const containerWidth = scrollRef.current.clientWidth;
    // Scroll by ~85% of container width for a "page" feel
    const scrollAmount = containerWidth * 0.85;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  // Handle horizontal scroll with shift+wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!scrollRef.current) return;

    // Only horizontal scroll with Shift key
    if (e.shiftKey) {
      e.preventDefault();
      scrollRef.current.scrollBy({
        left: e.deltaY,
        behavior: 'auto',
      });
    }
    // Otherwise, let vertical scroll happen naturally (do nothing)
  }, []);

  return (
    <section
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
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
      <div className="relative group/rail">
        {/* Left Gradient Fade */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            showLeftArrow ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Right Gradient Fade */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            showRightArrow ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Left Arrow Button */}
        <button
          onClick={() => scroll('left')}
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/80 hover:bg-black rounded-full border border-white/20 hover:border-white/50 transition-all duration-200 ${
            showLeftArrow && isHovering ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
          }`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll('right')}
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/80 hover:bg-black rounded-full border border-white/20 hover:border-white/50 transition-all duration-200 ${
            showRightArrow && isHovering ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
          }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Scrollable Rail */}
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          className="flex overflow-x-auto overflow-y-visible scroll-smooth hide-scrollbar snap-x snap-mandatory"
          style={{
            gap: `${gap}px`,
            scrollPaddingLeft: '0px',
            scrollPaddingRight: '0px',
            // CSS variables for child cards to use
            ['--card-width' as string]: `${cardWidth}px`,
            ['--card-width-mobile' as string]: `${cardWidthMobile}px`,
          }}
        >
          {children}
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
