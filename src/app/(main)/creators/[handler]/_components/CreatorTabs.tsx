'use client';

import type { CreatorTabsProps } from './types';
import { cn } from '@/shared/utils/formatting';

export function CreatorTabs({ activeTab, onTabChange, tabs }: CreatorTabsProps) {
  return (
    <section className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-t border-white/6 border-b border-white/6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex justify-center gap-4 sm:gap-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'bg-transparent border-none shrink-0',
              'text-sm sm:text-base font-semibold',
              'px-2 py-2',
              'border-b-2 border-transparent',
              'transition-all duration-200',
              'hover:text-white/80',
              activeTab === tab.key
                ? 'text-white border-b-2 border-[#AB0113]'
                : 'text-white/50'
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1.5 text-xs text-white/40">({tab.count})</span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
