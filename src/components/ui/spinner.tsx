import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <svg
      className={cn('animate-spin text-red-primary', sizes[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

type LoadingVariant = 'default' | 'feed' | 'video' | 'creator' | 'heavy' | 'minimal';

const messages: Record<LoadingVariant, string[]> = {
  default: [
    'Loading the real world…',
    'No filters. Just reality.',
    'Stories the algorithm won’t show you.',
    'Unedited. Uncomfortable. Human.',
    'Finding something worth watching…',
  ],
  feed: [
    'Digging deeper…',
    'More from the edges of the world.',
    'Nothing staged. Everything real.',
    'The next story is loading…',
    'Reality takes a second.',
  ],
  video: [
    'Entering the story…',
    'This is where it starts.',
    'You’re not supposed to see this.',
    'Footage ahead.',
    'Watch closely.',
  ],
  creator: [
    'Independent creators at work.',
    'Direct from the source.',
    'Filmed by people who were there.',
    'No studio. No script.',
  ],
  heavy: [
    'Viewer discretion advised.',
    'Some stories are hard to watch.',
    'What you’re about to see is real.',
    'This footage wasn’t meant to be easy.',
  ],
  minimal: ['Loading…', 'Please wait.', 'Almost there.'],
};

function pickMessage(variant: LoadingVariant, fallback?: string) {
  const pool = messages[variant] || messages.default;
  if (fallback && !/loading/i.test(fallback)) return fallback;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function LoadingScreen({
  message,
  variant = 'default',
}: {
  message?: string;
  variant?: LoadingVariant;
}) {
  const display = pickMessage(variant, message);
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Spinner size="lg" />
      <p className="text-text-secondary text-sm">{display}</p>
    </div>
  );
}
