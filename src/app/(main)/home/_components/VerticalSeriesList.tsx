/**
 * Vertical series list component
 */

import { useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn, getSeriesRoute } from '@/shared/utils/formatting';
import { SeriesCard } from './SeriesCard';
import type { Series } from '@/types';

interface VerticalSeriesListProps {
  series: Series[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function VerticalSeriesList({ series, selectedIndex, onSelect }: VerticalSeriesListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const selectedItem = list.children[selectedIndex] as HTMLElement;
    if (!selectedItem) return;

    const listRect = list.getBoundingClientRect();
    const itemRect = selectedItem.getBoundingClientRect();
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

    if (isDesktop) {
      const fullyVisible = itemRect.top >= listRect.top && itemRect.bottom <= listRect.bottom;
      if (!fullyVisible) {
        const targetTop = selectedItem.offsetTop - list.clientHeight / 2 + selectedItem.clientHeight / 2;
        list.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' });
      }
    } else {
      const fullyVisible = itemRect.left >= listRect.left && itemRect.right <= listRect.right;
      if (!fullyVisible) {
        const targetLeft =
          selectedItem.offsetLeft - list.clientWidth / 2 + selectedItem.clientWidth / 2;
        list.scrollTo({ left: Math.max(targetLeft, 0), behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const handleItemClick = useCallback(
    (index: number, item: Series) => {
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        router.push(getSeriesRoute(item.id, item.title));
      } else {
        onSelect(index);
      }
    },
    [onSelect, router]
  );

  return (
    <div className="lg:w-[320px] xl:w-[340px] flex-shrink-0 relative lg:h-full">
      <div className="hidden lg:flex items-center justify-between text-xs text-white/40 mb-2 px-1">
        <span>{series.length} series</span>
        <div className="flex items-center gap-1">
          <ChevronUp className="w-3 h-3" />
          <ChevronDown className="w-3 h-3" />
          <span>to navigate</span>
        </div>
      </div>

      <div
        ref={listRef}
        className="flex lg:flex-col gap-3 lg:gap-1.5 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:h-full lg:max-h-full pb-2 lg:pb-0 lg:pr-3 scroll-smooth series-list-scroll"
      >
        {series.map((item, index) => (
          <SeriesCard
            key={item.uuid || item.id}
            item={item}
            index={index}
            isSelected={index === selectedIndex}
            onClick={() => handleItemClick(index, item)}
          />
        ))}
      </div>

      <div className="lg:hidden flex justify-center mt-3">
        <div className="flex gap-1">
          {series.slice(0, Math.min(series.length, 8)).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-colors',
                i === selectedIndex ? 'bg-white' : 'bg-white/20'
              )}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .series-list-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
        .series-list-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .series-list-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .series-list-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .series-list-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        @media (max-width: 1023px) {
          .series-list-scroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .series-list-scroll::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

