'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Rss, Star } from 'lucide-react';

export function CommunitySidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/community') {
      return pathname === '/community';
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="left-div-community">
      <div className="w-full">
        {/* Posts */}
        <Link
          href="/community"
          className={`left-tabs mb-2 ${isActive('/community') ? 'active' : ''}`}
        >
          <span>
            <Rss className="w-[23px] h-[22px]" strokeWidth={2} />
          </span>
          <p className="fs-16 fw-400 lh-16">Posts</p>
        </Link>

        {/* Creators */}
        <Link
          href="/creator"
          className={`left-tabs mb-2 ${isActive('/creator') || isActive('/creators/creator-profile') ? 'active' : ''}`}
        >
          <span>
            <Star className="w-[25px] h-[24px]" strokeWidth={2} />
          </span>
          <p className="fs-16 fw-400 lh-16">Creators</p>
        </Link>
      </div>
    </div>
  );
}
