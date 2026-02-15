'use client';

import dynamic from 'next/dynamic';

const UploadProvider = dynamic(
  () =>
    import('@/shared/components/providers/upload-provider').then((m) => ({
      default: m.UploadProvider,
    })),
  { ssr: false }
);
const GlobalUploadIndicator = dynamic(
  () =>
    import('@/shared/components/upload/GlobalUploadIndicator').then((m) => ({
      default: m.GlobalUploadIndicator,
    })),
  { ssr: false }
);

export function LazyUploadScope({ children }: { children: React.ReactNode }) {
  return (
    <UploadProvider>
      {children}
      <GlobalUploadIndicator />
    </UploadProvider>
  );
}
