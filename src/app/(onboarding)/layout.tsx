import { CleanLayout } from '@/components/layout';
import { AccessGate } from '@/shared/components/providers/access-gate';

export default function CleanGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <CleanLayout>
      <AccessGate>{children}</AccessGate>
    </CleanLayout>
  );
}
