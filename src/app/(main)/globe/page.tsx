'use client';

export default function GlobePage() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <iframe
        src="https://globe.taboo.tv/globe?hideOffers=true"
        className="w-full h-full border-0"
        title="Globe"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}
