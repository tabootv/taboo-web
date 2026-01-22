'use client';

export interface ContentGlobeProps {
  creatorHandler?: string;
  maxMarkers?: number;
  height?: string;
  minHeight?: string;
  showOnlyShorts?: boolean;
  ariaLabel?: string;
}

export function ContentGlobe({
  height = '600px',
  minHeight = '400px',
  ariaLabel = 'Interactive world globe showing creator locations',
}: ContentGlobeProps) {
  return (
    <div
      className="w-full flex items-center justify-center bg-black/20 rounded-lg"
      style={{ height, minHeight }}
      aria-label={ariaLabel}
    >
      <div className="text-white/60 text-center">
        <p>Globe visualization coming soon</p>
        <p className="text-sm mt-2 text-white/40">
          Install d3 package to enable interactive globe
        </p>
      </div>
    </div>
  );
}
