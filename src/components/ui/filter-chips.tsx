'use client';

import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface FilterOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface FilterChipsProps {
  /** Array of filter options */
  options: FilterOption[];
  /** Currently selected filter ID */
  selected: string;
  /** Callback when a filter is selected */
  onSelect: (id: string) => void;
  /** Visual style variant */
  variant?: 'default' | 'pills' | 'underline';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Enable horizontal scrolling on mobile */
  scrollable?: boolean;
  /** Show navigation arrows when scrollable */
  showArrows?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Unified filter chips component for consistent filtering across pages.
 *
 * @example
 * // Basic usage
 * <FilterChips
 *   options={[
 *     { id: 'all', label: 'All' },
 *     { id: 'popular', label: 'Popular' },
 *     { id: 'recent', label: 'Recent' },
 *   ]}
 *   selected="all"
 *   onSelect={(id) => setFilter(id)}
 * />
 *
 * @example
 * // With icons and counts
 * <FilterChips
 *   options={[
 *     { id: 'videos', label: 'Videos', icon: <Video />, count: 42 },
 *     { id: 'shorts', label: 'Shorts', icon: <Film />, count: 18 },
 *   ]}
 *   selected="videos"
 *   onSelect={handleSelect}
 *   variant="pills"
 * />
 */
export function FilterChips({
  options,
  selected,
  onSelect,
  variant = 'default',
  size = 'md',
  scrollable = true,
  showArrows = true,
  className = '',
}: FilterChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [options]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.5;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  // Variant classes
  const getChipClasses = (isSelected: boolean) => {
    const base = `
      flex items-center gap-2 font-medium whitespace-nowrap
      transition-all duration-200 cursor-pointer
      ${sizeClasses[size]}
    `;

    switch (variant) {
      case 'pills':
        return `
          ${base}
          rounded-full
          ${isSelected
            ? 'bg-red-primary text-white shadow-glow-medium'
            : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white'
          }
        `;
      case 'underline':
        return `
          ${base}
          border-b-2 rounded-none
          ${isSelected
            ? 'border-red-primary text-white'
            : 'border-transparent text-text-secondary hover:text-white hover:border-white/20'
          }
        `;
      default:
        return `
          ${base}
          rounded-xl
          ${isSelected
            ? 'bg-red-primary text-white shadow-glow-medium'
            : 'bg-transparent text-text-secondary hover:bg-white/5 hover:text-white'
          }
        `;
    }
  };

  // Container classes based on variant
  const containerClasses = {
    default: 'p-2 bg-surface/70 backdrop-blur-xl border border-red-primary/20 rounded-2xl',
    pills: 'gap-2',
    underline: 'border-b border-white/10',
  };

  return (
    <div className={`relative ${className}`}>
      {/* Left Arrow */}
      {scrollable && showArrows && canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-surface/90 backdrop-blur border border-white/10 shadow-lg hover:bg-white/10 transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
      )}

      {/* Filter Container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className={`
          flex items-center
          ${containerClasses[variant]}
          ${scrollable ? 'overflow-x-auto hide-scrollbar' : 'flex-wrap'}
        `}
      >
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={getChipClasses(selected === option.id)}
          >
            {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
            <span>{option.label}</span>
            {option.count !== undefined && (
              <span
                className={`
                  text-xs px-1.5 py-0.5 rounded-full
                  ${selected === option.id
                    ? 'bg-white/20'
                    : 'bg-white/10'
                  }
                `}
              >
                {option.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Right Arrow */}
      {scrollable && showArrows && canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-surface/90 backdrop-blur border border-white/10 shadow-lg hover:bg-white/10 transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      )}
    </div>
  );
}

export default FilterChips;
