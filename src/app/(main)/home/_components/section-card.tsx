'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface SectionCardProps {
  title: string;
  href?: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ title, href, children, className = '' }: SectionCardProps) {
  return (
    <section className={`w-full overflow-visible ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-text-primary">{title}</h2>
        {href && (
          <Link
            href={href}
            className="text-sm text-red-primary hover:text-red-hover flex items-center gap-1 transition-colors group"
          >
            View All
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
