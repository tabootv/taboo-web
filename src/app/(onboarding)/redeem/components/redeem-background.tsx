import Image from 'next/image';

export function RedeemBackground() {
  return (
    <div className="fixed inset-0" aria-hidden="true">
      {/* Movies grid image */}
      <Image
        src="/movies-grid.webp"
        alt=""
        fill
        priority={false}
        className="object-cover"
        style={{ opacity: 0.15 }}
      />

      {/* Dark gradient overlay for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.85) 100%)',
        }}
      />

      {/* Red accent radial glow at top */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center top, rgba(171, 0, 19, 0.15) 0%, transparent 60%)',
        }}
      />
    </div>
  );
}
