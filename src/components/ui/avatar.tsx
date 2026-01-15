import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import Image from 'next/image';

interface AvatarProps {
  src?: string | null | undefined;
  alt?: string | undefined;
  size?: 'sm' | 'md' | 'lg' | 'xl' | undefined;
  className?: string | undefined;
  fallback?: string | undefined;
}

const sizes = {
  sm: 'h-6 w-6',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const imageSizes = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

export function Avatar({ src, alt = 'Avatar', size = 'md', className, fallback }: AvatarProps) {
  const initials = fallback
    ?.split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center',
        sizes[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="object-cover w-full h-full"
        />
      ) : initials ? (
        <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">{initials}</span>
      ) : (
        <User className="w-1/2 h-1/2 text-gray-400 dark:text-gray-500" />
      )}
    </div>
  );
}
