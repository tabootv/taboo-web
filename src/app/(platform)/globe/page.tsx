'use client';

export default function GlobePage() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1">
        <iframe
          src="https://globe.taboo.tv/globe?hideOffers=true"
          className="w-full h-full border-0"
          title="Globe"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
          allow="clipboard-write; web-share"
        />
      </div>
    </div>
  );
}
