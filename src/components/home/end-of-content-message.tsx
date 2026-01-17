'use client';

import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import Link from 'next/link';

interface EndOfContentMessageProps {
  onScrollToTop: () => void;
}

export function EndOfContentMessage({ onScrollToTop }: EndOfContentMessageProps) {
  return (
    <div className="flex justify-center py-12 animate-fade-in-up">
      <div className=" rounded-2xl px-8 py-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="animate-float">
            <Globe className="size-16 text-primary" strokeWidth={1.5} />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-text-primary mb-2">Tired of scrolling videos?</h2>

        <p className="text-text-secondary mb-8">Explore the globe instead!</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="btn-premium">
            <Link href="/globe">
              <Globe className="size-4 mr-2" />
              Explore Globe
            </Link>
          </Button>
          <Button variant="outline" onClick={onScrollToTop}>
            Back to Top
          </Button>
        </div>
      </div>
    </div>
  );
}
