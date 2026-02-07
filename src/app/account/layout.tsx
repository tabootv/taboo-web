import { CleanLayout } from '@/components/layout';
import { AccessGate } from '@/shared/components/providers/access-gate';

export const dynamic = 'force-dynamic';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <CleanLayout>
      <AccessGate>{children}</AccessGate>
    </CleanLayout>
  );
}
