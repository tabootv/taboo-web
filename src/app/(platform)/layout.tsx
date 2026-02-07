import { MainLayout } from '@/components/layout';
import { CreatorsProvider } from '@/components/providers/creators-provider';
import { AccessGate } from '@/shared/components/providers/access-gate';

export default async function MainGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <CreatorsProvider>
      <MainLayout>
        <AccessGate>{children}</AccessGate>
      </MainLayout>
    </CreatorsProvider>
  );
}
