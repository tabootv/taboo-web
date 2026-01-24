'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface RailRowProps {
  title: string;
  href?: string;
  children: React.ReactNode;
  itemsPerRow?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
}

export function RailRow({
  title,
  href,
  children,
  itemsPerRow = {
    mobile: 2,
    tablet: 4,
    desktop: 6,
  },
  gap = 12,
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
    const scrollAmount = scrollRef.current.clientWidth;
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
          className={`absolute left-0 top-0 bottom-0 w-16 bg-linear-to-r from-background to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            showLeftArrow ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Right Gradient Fade */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-background to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            showRightArrow ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <button
          onClick={() => scroll('left')}
          className={cn(
            'absolute left-0 top-0 bottom-0 z-20',
            'w-12 lg:w-14 flex items-center justify-center',
            'bg-black/30 hover:bg-black/60',
            'text-white/60 hover:text-white',
            'transition-all duration-200',
            'hidden md:flex',
            showLeftArrow && isHovering ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-8 h-8 lg:w-10 lg:h-10" />
        </button>

        <button
          onClick={() => scroll('right')}
          className={cn(
            'absolute right-0 top-0 bottom-0 z-20',
            'w-12 lg:w-14 flex items-center justify-center',
            'bg-black/30 hover:bg-black/60',
            'text-white/60 hover:text-white',
            'transition-all duration-200',
            'hidden md:flex',
            showRightArrow && isHovering ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-8 h-8 lg:w-10 lg:h-10" />
        </button>

        {/* Scrollable Rail */}
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          className="rail-scroll flex overflow-x-auto overflow-y-visible scroll-smooth hide-scrollbar snap-x snap-mandatory"
          style={
            {
              gap: `${gap}px`,
              '--gap': `${gap}px`,
              '--items-mobile': itemsPerRow.mobile || 2,
              '--items-tablet': itemsPerRow.tablet || 4,
              '--items-desktop': itemsPerRow.desktop || 6,
            } as React.CSSProperties
          }
        >
          {React.Children.map(children, (child, index) => (
            <div key={index} className="rail-card shrink-0 snap-start">
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* CSS for hiding scrollbar and responsive card widths */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .rail-card {
          flex: 0 0 calc((100% - (var(--items-mobile) - 1) * var(--gap)) / var(--items-mobile));
        }
        @media (min-width: 768px) {
          .rail-card {
            flex: 0 0 calc((100% - (var(--items-tablet) - 1) * var(--gap)) / var(--items-tablet));
          }
        }
        @media (min-width: 1400px) {
          .rail-card {
            flex: 0 0 calc((100% - (var(--items-desktop) - 1) * var(--gap)) / var(--items-desktop));
          }
        }
      `}</style>
    </section>
  );
}
