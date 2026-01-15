import { MainLayout } from '@/components/layout';
import { CreatorsProvider } from '@/components/providers/creators-provider';

export default async function MainGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <CreatorsProvider>
      <MainLayout>{children}</MainLayout>
    </CreatorsProvider>
  );
}
