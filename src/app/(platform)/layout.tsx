import { MainLayout } from '@/components/layout';
import { AccessGate } from '@/shared/components/providers/access-gate';

export default async function MainGroupLayout({
  children,
  compose,
}: {
  children: React.ReactNode;
  compose: React.ReactNode;
}) {
  return (
    <MainLayout>
      {/* DNS prefetch for image CDN (preconnect unused since Next.js Image proxies) */}
      <link rel="dns-prefetch" href="https://drfohxq8ag37r.cloudfront.net" />

      <AccessGate>{children}</AccessGate>
      {compose}
    </MainLayout>
  );
}
